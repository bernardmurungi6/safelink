const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const listAllReports = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const params = [];
  let where = '';

  if (status) {
    params.push(status);
    where = 'WHERE r.status = $1';
  }

  const result = await db.query(
    `SELECT r.*, p.imei, p.brand, p.model, u.name AS reporter_name, u.email AS reporter_email
     FROM reports r
     JOIN phones p ON p.id = r.phone_id
     JOIN users u ON u.id = r.reporter_id
     ${where}
     ORDER BY r.created_at DESC`,
    params
  );
  res.json({ reports: result.rows });
});

const updateReportStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;
  if (!['open', 'resolved', 'disputed'].includes(status)) {
    return res.status(400).json({ error: 'status must be open, resolved, or disputed.' });
  }

  const result = await db.query(
    `UPDATE reports
     SET status = $1,
         admin_notes = COALESCE($2, admin_notes),
         resolved_at = CASE WHEN $1 = 'resolved' THEN NOW() ELSE resolved_at END
     WHERE id = $3
     RETURNING *`,
    [status, adminNotes || null, req.params.id]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'Report not found.' });
  }

  // If a report is disputed/dismissed, restore the phone to active status.
  if (status === 'disputed') {
    await db.query(
      "UPDATE phones SET status = 'active' WHERE id = $1",
      [result.rows[0].phone_id]
    );
  }

  res.json({ report: result.rows[0] });
});

const listAllUsers = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT id, name, email, phone_number, role, is_active, created_at FROM users ORDER BY created_at DESC`
  );
  res.json({ users: result.rows });
});

const setUserActive = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const result = await db.query(
    'UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, name, email, is_active',
    [!!isActive, req.params.id]
  );
  if (result.rows.length === 0) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user: result.rows[0] });
});

const dashboardStats = asyncHandler(async (req, res) => {
  const [users, phones, reports, lookups] = await Promise.all([
    db.query('SELECT COUNT(*)::int AS count FROM users'),
    db.query(
      `SELECT status, COUNT(*)::int AS count FROM phones GROUP BY status`
    ),
    db.query(
      `SELECT status, COUNT(*)::int AS count FROM reports GROUP BY status`
    ),
    db.query(
      `SELECT COUNT(*)::int AS count FROM imei_lookups WHERE created_at > NOW() - INTERVAL '30 days'`
    ),
  ]);

  const phonesByStatus = Object.fromEntries(phones.rows.map((r) => [r.status, r.count]));
  const reportsByStatus = Object.fromEntries(reports.rows.map((r) => [r.status, r.count]));

  res.json({
    totalUsers: users.rows[0].count,
    phonesByStatus,
    reportsByStatus,
    lookupsLast30Days: lookups.rows[0].count,
  });
});

module.exports = {
  listAllReports,
  updateReportStatus,
  listAllUsers,
  setUserActive,
  dashboardStats,
};
