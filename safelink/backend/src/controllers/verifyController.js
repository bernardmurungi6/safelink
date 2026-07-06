const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { isValidImei, normalizeImei } = require('../utils/imei');

/**
 * Public endpoint: anyone (not just registered users) can check an IMEI
 * before buying a used phone. This is intentionally the lowest-friction
 * feature on the platform since it's what drives most first-time traffic.
 */
const verifyImei = asyncHandler(async (req, res) => {
  const cleanImei = normalizeImei(req.query.imei || req.body.imei);

  if (!isValidImei(cleanImei)) {
    return res.status(400).json({ error: 'That does not look like a valid 15-digit IMEI.' });
  }

  const result = await db.query(
    `SELECT status, brand, model, created_at
     FROM phones WHERE imei = $1`,
    [cleanImei]
  );

  const phone = result.rows[0];
  const resultStatus = phone ? phone.status : 'not_found';

  // Log the lookup for the future analytics dashboard. Never store more
  // than a truncated IP; this is aggregate-usage data, not surveillance.
  await db.query(
    `INSERT INTO imei_lookups (imei, result_status, ip_address) VALUES ($1, $2, $3)`,
    [cleanImei, resultStatus, req.ip]
  );

  if (!phone) {
    return res.json({
      imei: cleanImei,
      status: 'not_found',
      message: 'This IMEI is not registered on SafeLink. That does not guarantee the device is clean — check with the seller and local authorities too.',
    });
  }

  const messages = {
    active: 'This device is registered and not reported lost or stolen.',
    lost: 'This device has been reported LOST by its registered owner.',
    stolen: 'This device has been reported STOLEN. We recommend not proceeding with this purchase.',
    recovered: 'This device was previously reported missing and has since been marked recovered.',
  };

  res.json({
    imei: cleanImei,
    status: phone.status,
    brand: phone.brand,
    model: phone.model,
    message: messages[phone.status],
  });
});

module.exports = { verifyImei };
