const { doubleCsrf } = require('csrf-csrf');
const IS_PROD = process.env.NODE_ENV === 'production';

const doubleCsrfOptions = {
  getSecret: () => process.env.CSRF_SECRET || 'dev-secret',
  cookieName: 'csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: IS_PROD,                     // false en dev
    sameSite: IS_PROD ? 'None' : 'Lax',  // Lax en dev
    path: '/',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
  getTokenFromRequest: (req) =>
    req.headers['x-csrf-token'] || req.headers['csrf-token'],
};

const {
  invalidCsrfTokenError,
  generateToken,
  doubleCsrfProtection,
} = doubleCsrf(doubleCsrfOptions);

module.exports = { invalidCsrfTokenError, generateToken, doubleCsrfProtection };
