const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { isValidImei, normalizeImei } = require('../utils/imei');

const registerPhone = asyncHandler(async (req, res) => {
  const { imei, brand, model, color, purchaseDate } = req.body;
  const cleanImei = normalizeImei(imei);

  if (!brand || !model) {
    return res.status(400).json({ error: 'Brand and model are required.' });
  }
  if (!isValidImei(cleanImei)) {
    return res.status(400).json({ error: 'That IMEI is not valid. Double-check the 15-digit number.' });
  }

  const existing = await db.query('SELECT id FROM phones WHERE imei = $1', [cleanImei]);
  if (existing.rows.length > 0) {
    return res.status(409).json({ error: 'This IMEI is already registered on SafeLink.' });
  }

  const result = await db.query(
    `INSERT INTO phones (owner_id, imei, brand, model, color, purchase_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [req.user.id, cleanImei, brand, model, color || null, purchaseDate || null]
  );

  res.status(201).json({ phone: result.rows[0] });
});

const listMyPhones = asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT * FROM phones WHERE owner_id = $1 ORDER BY created_at DESC',
    [req.user.id]
  );
  res.json({ phones: result.rows });
});

const getMyPhone = asyncHandler(async (req, res) => {
  const result = await db.query(
    'SELECT * FROM phones WHERE id = $1 AND owner_id = $2',
    [req.params.id, req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Phone not found.' });
  }
  res.json({ phone: result.rows[0] });
});

const deletePhone = asyncHandler(async (req, res) => {
  const result = await db.query(
    'DELETE FROM phones WHERE id = $1 AND owner_id = $2 RETURNING id',
    [req.params.id, req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Phone not found.' });
  }
  res.json({ success: true });
});

module.exports = { registerPhone, listMyPhones, getMyPhone, deletePhone };
