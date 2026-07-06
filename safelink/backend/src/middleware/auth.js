const { verifyToken } = require('../utils/jwt');
const db = require('../config/db');

/**
 * Requires a valid Bearer JWT. Attaches req.user = { id, email, role }.
 */
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  try {
    const decoded = verifyToken(token);

    // Confirm the user still exists and is active, in case they were
    // deactivated after the token was issued.
    const result = await db.query(
      'SELECT id, email, role, is_active FROM users WHERE id = $1',
      [decoded.sub]
    );
    const user = result.rows[0];

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Account not found or deactivated.' });
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Requires req.user.role to be 'admin'. Must run after requireAuth.
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };
