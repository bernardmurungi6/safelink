const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { signToken } = require('../utils/jwt');
const asyncHandler = require('../utils/asyncHandler');

const PUBLIC_USER_FIELDS = 'id, name, email, phone_number, role, created_at';

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await db.query(
    `INSERT INTO users (name, email, password_hash, phone_number)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PUBLIC_USER_FIELDS}`,
    [name, email.toLowerCase().trim(), passwordHash, phoneNumber || null]
  );

  const user = result.rows[0];
  const token = signToken({ sub: user.id, role: user.role });

  res.status(201).json({ user, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const result = await db.query(
    'SELECT id, name, email, password_hash, phone_number, role, is_active FROM users WHERE email = $1',
    [email.toLowerCase().trim()]
  );
  const user = result.rows[0];

  // Same generic error whether the email doesn't exist or the password is
  // wrong, so we don't leak which emails are registered.
  if (!user || !user.is_active) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({ sub: user.id, role: user.role });
  delete user.password_hash;

  res.json({ user, token });
});

const me = asyncHandler(async (req, res) => {
  const result = await db.query(
    `SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = $1`,
    [req.user.id]
  );
  res.json({ user: result.rows[0] });
});

module.exports = { register, login, me };
