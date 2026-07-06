const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const VALID_TYPES = ['lost', 'stolen'];

const createReport = asyncHandler(async (req, res) => {
  const { phoneId, type, description, lastKnownLocation, policeReportNumber } = req.body;

  if (!phoneId || !VALID_TYPES.includes(type)) {
    return res.status(400).json({ error: 'phoneId and a valid type (lost | stolen) are required.' });
  }

  const phoneResult = await db.query(
    'SELECT id, owner_id, status FROM phones WHERE id = $1 AND owner_id = $2',
    [phoneId, req.user.id]
  );
  const phone = phoneResult.rows[0];

  if (!phone) {
    return res.status(404).json({ error: 'Phone not found or not owned by you.' });
  }
  if (phone.status === type) {
    return res.status(409).json({ error: `This phone is already marked as ${type}.` });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    const reportResult = await client.query(
      `INSERT INTO reports (phone_id, reporter_id, type, description, last_known_location, police_report_number)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [phoneId, req.user.id, type, description || null, lastKnownLocation || null, policeReportNumber || null]
    );

    await client.query('UPDATE phones SET status = $1 WHERE id = $2', [type, phoneId]);

    await client.query('COMMIT');
    res.status(201).json({ report: reportResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

const markRecovered = asyncHandler(async (req, res) => {
  const { phoneId } = req.body;

  const phoneResult = await db.query(
    'SELECT id, status FROM phones WHERE id = $1 AND owner_id = $2',
    [phoneId, req.user.id]
  );
  const phone = phoneResult.rows[0];

  if (!phone) {
    return res.status(404).json({ error: 'Phone not found or not owned by you.' });
  }
  if (!['lost', 'stolen'].includes(phone.status)) {
    return res.status(409).json({ error: 'This phone does not have an active lost/stolen report.' });
  }

  const client = await db.pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE reports SET status = 'resolved', resolved_at = NOW()
       WHERE phone_id = $1 AND status = 'open'`,
      [phoneId]
    );
    await client.query("UPDATE phones SET status = 'recovered' WHERE id = $1", [phoneId]);

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
});

const listMyReports = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT r.*, p.imei, p.brand, p.model
     FROM reports r
     JOIN phones p ON p.id = r.phone_id
     WHERE r.reporter_id = $1
     ORDER BY r.created_at DESC`,
    [req.user.id]
  );
  res.json({ reports: result.rows });
});

module.exports = { createReport, markRecovered, listMyReports };
