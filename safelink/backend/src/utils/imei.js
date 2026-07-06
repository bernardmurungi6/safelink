/**
 * IMEI numbers are 15 digits and the last digit is a Luhn check digit,
 * exactly like a credit card number. Validating this client- and server-side
 * catches typos immediately, before a bad IMEI ever reaches the database.
 */
function isValidImeiFormat(imei) {
  return /^\d{15}$/.test(imei);
}

function luhnCheck(imei) {
  let sum = 0;
  let shouldDouble = false;

  for (let i = imei.length - 1; i >= 0; i--) {
    let digit = parseInt(imei.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function isValidImei(imei) {
  if (!isValidImeiFormat(imei)) return false;
  return luhnCheck(imei);
}

function normalizeImei(rawImei) {
  return String(rawImei || '').replace(/[\s-]/g, '').trim();
}

module.exports = { isValidImei, isValidImeiFormat, normalizeImei };
