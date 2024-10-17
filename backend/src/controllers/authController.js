const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Account, PassHistory, IntentoFallido } = require('../models/associations');
const { Op } = require('sequelize');
require('dotenv').config();
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');

/**
 * The `createAssessment` function uses the Google reCAPTCHA Enterprise API to assess the validity of 
 * a CAPTCHA token provided by the client during a user action (e.g., login). It returns the score 
 * based on the likelihood that the action is legitimate. If the token is invalid or the action does 
 * not match, it returns `null`.
 * 
 * @param {Object} options - The options for the reCAPTCHA assessment.
 * @param {string} options.projectID - The Google Cloud project ID.
 * @param {string} options.recaptchaKey - The site key for the reCAPTCHA.
 * @param {string} options.token - The token from the client to validate.
 * @param {string} options.recaptchaAction - The expected action associated with the reCAPTCHA.
 * 
 * @returns {Promise<number|null>} - The reCAPTCHA score or null if invalid.
 */
async function createAssessment({ projectID, recaptchaKey, token, recaptchaAction }) {
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectID);
    const request = {
        assessment: {
            event: {
                token: token,
                siteKey: recaptchaKey,
            },
        },
        parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    if (!response.tokenProperties.valid) {
        console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties.invalidReason}`);
        return null;
    }

    if (response.tokenProperties.action === recaptchaAction) {
        console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
        return response.riskAnalysis.score;
    } else {
        console.log("The action attribute in your reCAPTCHA tag does not match the action you are expecting to score");
        console.log(response.tokenProperties.action)
        return null;
    }
}

/**
 * The `login` function handles the authentication process for a user attempting to log in.
 * 
 * 1. It first validates the reCAPTCHA token using `createAssessment` to ensure that the login attempt is
 * legitimate.
 * 2. If reCAPTCHA validation fails, it sends an error response.
 * 3. If the CAPTCHA is valid, it checks the user credentials:
 *    - It searches for a user by email and includes the associated account details.
 *    - If the account is found and not locked, it verifies the password using bcrypt.
 *    - If the password is correct, it resets the failed login attempts and generates a JWT token, which
 *      is sent as an HTTP-only cookie to the client.
 * 
 * @param {Object} req - The request object, containing user credentials and reCAPTCHA token.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * 
 * @returns {void}
 */
exports.login = async (req, res, next) => {
    try {
        const { email, contraseña } = req.body.credenciales;
        const { captchaToken } = req.body
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        // Verificar el token de reCAPTCHA antes de proceder
        const projectID = process.env.PROJECT_ID;
        const recaptchaKey = process.env.RECAPTCHA_KEY;
        const recaptchaAction = "LOGIN";

        const score = await createAssessment({ projectID, recaptchaKey, token: captchaToken, recaptchaAction });
        console.log(score)
        if (score === null || score < 0.5) {
            return res.status(400).json({ message: 'Fallo en la verificación de reCAPTCHA. Por favor, intente nuevamente.' });
        }

        // Busca al usuario y su cuenta asociada
        const user = await User.findOne({
            where: { email },
            include: [{ model: Account, attributes: ['id', 'nombre_usuario', 'contraseña_hash', 'bloqueada'] }]
        });
        // Si no se encuentra el usuario, responde con un error
        if (!user) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Verifica si la cuenta está bloqueada
        if (user.Account.bloqueada) {
            return res.status(403).json({ message: 'Cuenta bloqueada debido a demasiados intentos fallidos.' });
        }

        const maxIntentosFallidos = 5;
        const intentosFallidos = await IntentoFallido.count({
            where: {
                user_id: user.id,
                fecha: {
                    [Op.gte]: new Date(Date.now() - 60 * 60 * 1000) // Contar intentos en la última hora
                }
            }
        });

        if (intentosFallidos >= maxIntentosFallidos) {
            // Bloquear la cuenta si supera el límite de intentos fallidos
            await user.Account.update({ bloqueada: true });
            return res.status(403).json({ message: 'Cuenta bloqueada debido a demasiados intentos fallidos.' });
        }

        // Compara la contraseña ingresada con la contraseña almacenada
        const isMatch = await bcrypt.compare(contraseña, user.Account.contraseña_hash);
        if (!isMatch) {
            await IntentoFallido.create({
                user_id: user.id,
                ip: ip,
                fecha: new Date()
            });
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        // Si el inicio de sesión es exitoso, puedes restablecer intentos fallidos
        await IntentoFallido.destroy({ where: { user_id: user.id } }); // Limpiar intentos fallidos

        // Actualizar el último acceso
        await user.Account.update({ ultimo_acceso: new Date() });

        // Generar el token de autenticación
        const token = jwt.sign(
            { userId: user.id, tipo: user.rol_id },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000
        });

        // Responder con los datos del usuario (sin el token)
        res.json({ userId: user.id, tipo: user.rol_id });
    } catch (error) {
        next(error);
    }
};

/**
 * The `changePassword` function allows an authenticated user to change their account password.
 * 
 * 1. The function verifies the current password before allowing the change.
 * 2. If the current password is correct, it hashes the new password using bcrypt and updates the
 *    account in the database.
 * 3. It also logs the password change in a separate password history table.
 * 
 * @param {Object} req - The request object, containing the current and new password.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * 
 * @returns {void}
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { contraseña_actual, nueva_contraseña } = req.body;
        const account = await Account.findOne({ where: { usuario_id: req.user.userId } });

        if (!account) {
            return res.status(404).json({ message: 'Cuenta no encontrada' });
        }

        const isMatch = await bcrypt.compare(contraseña_actual, account.contraseña_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña actual incorrecta' });
        }

        const hashedPassword = await bcrypt.hash(nueva_contraseña, 10);
        await account.update({ contraseña_hash: hashedPassword });

        await PassHistory.create({
            cuenta_id: account.id,
            contraseña_hash: hashedPassword
        });

        res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        next(error);
    }
};

/**
 * The `checkAuth` function checks whether a user is authenticated by verifying the JWT token stored in
 * the cookies. 
 * 
 * 1. If the token is valid and not expired, it retrieves the user's details and returns them in the
 *    response.
 * 2. If the token is close to expiration, it issues a new token and updates the client's cookie.
 * 
 * @param {Object} req - The request object, containing the authentication cookie.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * 
 * @returns {void}
 */
exports.checkAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        if (!token) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }

        const user = await User.findOne({
            where: { id: decoded.userId },
            include: [{
                model: Account,
                attributes: ['id', 'nombre_usuario', 'bloqueada']
            }],
            attributes: ['id', 'email', 'rol_id']
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.Account.bloqueada) {
            return res.status(403).json({ message: 'Cuenta bloqueada' });
        }

        // Renovar el token si está cerca de expirar 
        const expirationThreshold = 15 * 60; // 15 minutos en segundos
        if (decoded.exp - (Date.now() / 1000) < expirationThreshold) {
            const newToken = jwt.sign(
                { userId: user.id, tipo: user.rol_id },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Strict',
                maxAge: 3600000
            });
        }

        res.json({
            userId: user.id,
            email: user.email,
            tipo: user.rol_id,
            nombreUsuario: user.Account.nombre_usuario
        });
    } catch (error) {
        next(error);
    }
};

/**
 * The `logout` function handles user logout by clearing the authentication token stored as an HTTP-only 
 * cookie. 
 * 
 * 1. This effectively ends the user's session.
 * 2. It sends a success response indicating that the logout was successful.
 * 
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 * 
 * @returns {void}
 */
exports.logout = (req, res, next) => {
    try {
        // Limpiar la cookie del token para cerrar la sesión del usuario
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict'
        });

        res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        next(error);
    }
};
