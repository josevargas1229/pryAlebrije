// utils/coupons.js
const crypto = require('crypto');

/** Código único, URL-safe y no predecible */
function generateCouponCode(len = 16) {
  return crypto.randomBytes(Math.ceil(len * 0.75))
    .toString('base64url')
    .slice(0, len)
    .toUpperCase();
}

module.exports = { generateCouponCode };
