const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  // Idle client errors should never crash the whole process.
  console.error('Unexpected PostgreSQL error on idle client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
