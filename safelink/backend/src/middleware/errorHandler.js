// Centralized error handler. Keeps error shape consistent across the API
// and avoids leaking stack traces / internals in production.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Postgres unique_violation (e.g. duplicate IMEI or email)
  if (err.code === '23505') {
    return res.status(409).json({ error: 'A record with that value already exists.' });
  }

  const status = err.status || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Something went wrong. Please try again.'
      : err.message;

  res.status(status).json({ error: message });
}

function notFound(req, res) {
  res.status(404).json({ error: 'Route not found.' });
}

module.exports = { errorHandler, notFound };
