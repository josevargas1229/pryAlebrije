const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Account, PassHistory, IntentoFallido, ConfiguracionSistema, HistorialBloqueos,AuthorizationCode } = require('../models/associations');
const { Op } = require('sequelize');
require('dotenv').config();
const { RecaptchaEnterpriseServiceClient } = require('@google-cloud/recaptcha-enterprise');
const EmailTemplate = require('../models/EmailTemplate');
const transporter = require('../config/emailConfig');
const { v4: uuidv4 } = require('uuid');
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
async function checkAccountLock(account, tiempoBloqueoMinutos) {
    if (account.bloqueada) {
        const tiempoDesbloqueo = new Date(account.bloqueada_desde);
        tiempoDesbloqueo.setMinutes(tiempoDesbloqueo.getMinutes() + tiempoBloqueoMinutos);

        if (new Date() < tiempoDesbloqueo) {
            return { locked: true, tiempoDesbloqueo };
        } else {
            await account.update({ bloqueada: false, bloqueada_desde: null });
            await IntentoFallido.destroy({ where: { account_id: account.id } });
        }
    }
    return { locked: false };
}

async function handleFailedLogin(accountId, ip) {
    await IntentoFallido.create({ account_id: accountId, ip, fecha: new Date() });
}

exports.login = async (req, res, next) => {
  try {
    const { email, contraseña } = req.body.credenciales;
    const { captchaToken, client_id, redirect_uri, state } = req.body;
    let ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    if (ip === "::1") ip = "127.0.0.1";
    console.log(captchaToken, client_id, redirect_uri, state, ip);
    const [configuracion, user] = await Promise.all([
      ConfiguracionSistema.findOne(),
      User.findOne({
        where: { email },
        include: [{ model: Account, attributes: ["id", "contraseña_hash", "bloqueada", "bloqueada_desde", "verified"] }]
      })
    ]);

    if (!configuracion) {
      return res.status(500).json({ message: "Error en la configuración del sistema." });
    }

    if (!user) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const { max_intentos_login, tiempo_bloqueo_minutos } = configuracion;

    const { locked, tiempoDesbloqueo } = await checkAccountLock(user.Account, tiempo_bloqueo_minutos);
    if (locked) {
      return res.status(403).json({ message: `Cuenta bloqueada hasta ${tiempoDesbloqueo.toLocaleTimeString()}` });
    }

    const [intentosFallidos, score] = await Promise.all([
      IntentoFallido.count({ where: { account_id: user.Account.id } }),
      createAssessment({
        projectID: process.env.PROJECT_ID,
        recaptchaKey: process.env.RECAPTCHA_KEY,
        token: captchaToken,
        recaptchaAction: "LOGIN"
      })
    ]);

    if (score === null || score < 0.5) {
      return res.status(400).json({ message: "Fallo en reCAPTCHA. Intente nuevamente." });
    }

    if (intentosFallidos >= max_intentos_login) {
      await user.Account.update({ bloqueada: true, bloqueada_desde: new Date() });
      await HistorialBloqueos.create({ account_id: user.Account.id, intentos: intentosFallidos, fechaBloqueo: new Date() });
      return res.status(403).json({ message: "Cuenta bloqueada por intentos fallidos." });
    }

    const isMatch = await bcrypt.compare(contraseña, user.Account.contraseña_hash);
    if (!isMatch) {
      await handleFailedLogin(user.Account.id, ip);
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    await Promise.all([
      IntentoFallido.destroy({ where: { account_id: user.Account.id } }),
      user.Account.update({ ultimo_acceso: new Date() })
    ]);

    // Si es una solicitud de Alexa (Account Linking)
    if (client_id && redirect_uri && state) {
      // Validar Client ID
      if (client_id !== process.env.ALEXA_CLIENT_ID) {
        return res.status(401).json({ message: "Client ID inválido" });
      }

      // Generar código de autorización
      const authCode = uuidv4();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expira en 10 minutos
      await AuthorizationCode.create({
        code: authCode,
        user_id: user.id,
        client_id,
        expires_at: expiresAt
      });

      // Redirigir al redirect_uri de Alexa
      const redirectUrl = `${redirect_uri}?code=${authCode}&state=${state}`;
    console.log('Redirigiendo a:', redirectUrl);

    // En vez de redirigir, RESPONDE con la URL
    return res.status(200).json({ redirect_to: redirectUrl });
    }

    // Login normal
    const token = jwt.sign(
      { userId: user.id, tipo: user.rol_id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
      maxAge: 3600000
    });

    res.json({ userId: user.id, tipo: user.rol_id, verified: user.Account.verified });
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
        // El middleware authenticateToken ya validó el token y pobló req.user
        const decoded = req.user;

        // Verificar inactividad desde el token (si se incluye ultimaActividad)
        const tiempoMaximoInactividad = 15 * 60 * 1000; // 15 minutos
        if (decoded.ultimaActividad) {
            const tiempoInactivo = Date.now() - new Date(decoded.ultimaActividad).getTime();
            if (tiempoInactivo > tiempoMaximoInactividad) {
                res.clearCookie('token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict'
                });
                return res.status(401).json({ message: 'Sesión cerrada por inactividad' });
            }
        }

        // Consultar la base de datos solo si es necesario (por ejemplo, para verificar bloqueo o verificación)
        const user = await User.findOne({
            where: { id: decoded.userId },
            include: [{ model: Account, attributes: ['bloqueada', 'verified', 'nombre_usuario'] }]
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (user.Account.bloqueada) {
            return res.status(403).json({ message: 'Cuenta bloqueada' });
        }

        if (!user.Account.verified) {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict'
            });
            return res.status(403).json({ isVerified: false });
        }

        // Renovar token si está cerca de expirar
        const expirationThreshold = 15 * 60; // 15 minutos en segundos
        if (decoded.exp - (Date.now() / 1000) < expirationThreshold) {
            const newToken = jwt.sign(
                {
                    userId: user.id,
                    tipo: user.rol_id,
                    nombreUsuario: user.Account.nombre_usuario,
                    ultimaActividad: new Date().toISOString(), // Actualizar en el token
                    verified: user.Account.verified,
                    bloqueada: user.Account.bloqueada
                },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.cookie('token', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict',
                maxAge: 3600000
            });
        }

        res.json({
            userId: user.id,
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
            sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Strict'
        });

        res.status(200).json({ message: 'Logout exitoso' });
    } catch (error) {
        next(error);
    }
};

// Función para enviar el enlace de verificación
exports.sendVerificationLink = async (req, res) => {
    const { email, tipo_id = 2 } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
    }

    try {
        // 1. Encontrar el usuario
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'El email no está registrado' });
        }

        // 2. Encontrar la cuenta asociada
        const account = await Account.findOne({ where: { user_id: user.id } });
        if (!account) {
            return res.status(404).json({ error: 'No se encontró una cuenta asociada' });
        }

        // 3. Buscar la plantilla de correo según el tipo de correo (tipo_id)
        const emailTemplate = await EmailTemplate.findOne({ where: { tipo_id } });
        if (!emailTemplate) {
            return res.status(404).json({ error: 'No se encontró una plantilla de correo para este tipo' });
        }

        // 4. Generar un token JWT para la verificación
        const token = jwt.sign({ userId: user.id, tipo: user.rol_id }, process.env.JWT_SECRET, { expiresIn: '30m' });

        // 5. Crear el enlace de verificación
        const verificationLink = `${process.env.URL_DOMAIN}/verificacion?token=${token}`;

        // 6. Preparar el contenido del correo
        const variables = { verificationLink }; // Puedes agregar más variables si es necesario
        let contenidoHtml = emailTemplate.contenido_html;
        let contenidoTexto = emailTemplate.contenido_texto;

        // Reemplazar las variables en el contenido HTML y Texto
        for (const [key, value] of Object.entries(variables)) {
            const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
            contenidoHtml = contenidoHtml.replace(regex, value);
            contenidoTexto = contenidoTexto.replace(regex, value);
        }

        // 7. Enviar el correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: emailTemplate.asunto,
            text: contenidoTexto,
            html: contenidoHtml,
        };

        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                console.error('Error al enviar el correo:', error);
                return res.status(500).json({ error: 'Error al enviar el correo' });
            }
            res.json({ message: 'Enlace de verificación enviado' });
        });
    } catch (error) {
        console.error('Error al generar y enviar el enlace de verificación:', error);
        return res.status(500).json({ error: 'Error interno al procesar la solicitud' });
    }
};
exports.completeEmailVerification = async (req, res, next) => {
    const decoded = req.user; // Obteniendo el id de la cuenta del middleware

    try {
        const user = await User.findOne({
            where: { id: decoded.userId },
            include: [{
                model: Account,
                attributes: ['id', 'bloqueada']
            }],
            attributes: ['id', 'email', 'rol_id']
        });
        if (!user || !user.Account) {
            return res.status(404).json({ error: 'Usuario o cuenta no encontrada' });
        }

        // Marcar la cuenta como verificada
        await user.Account.update({ verified: true });

        return res.json({ message: 'Correo verificado con éxito' });
    } catch (error) {
        console.error('Error al verificar el correo:', error);
        return res.status(500).json({ error: 'Error interno al verificar el correo' });
    }
};
exports.generateAccessToken = async (req, res) => {
  console.log('Solicitud de token recibida desde Alexa:', req.body);
  const { code, client_id, grant_type } = req.body;

  if (client_id !== process.env.ALEXA_CLIENT_ID) {
    return res.status(401).json({ error: 'Credenciales de cliente inválidas' });
  }

  if (grant_type !== 'authorization_code') {
    return res.status(400).json({ error: 'Grant type no soportado' });
  }

  const authCode = await AuthorizationCode.findOne({ where: { code, client_id } });
  if (!authCode || authCode.expires_at < new Date()) {
    return res.status(400).json({ error: 'Código de autorización inválido o expirado' });
  }

  const user = await User.findByPk(authCode.user_id);
  const accessToken = jwt.sign({ userId: user.id, tipo: user.rol_id, scope: 'sales:read' }, process.env.JWT_SECRET, { expiresIn: '30d' });
  await authCode.destroy(); // Evitar reutilización
  return res.status(200).json({ access_token: accessToken, token_type: 'Bearer', expires_in: 3600 });

};  