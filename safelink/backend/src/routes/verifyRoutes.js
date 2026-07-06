const express = require('express');
const rateLimit = require('express-rate-limit');
const { verifyImei } = require('../controllers/verifyController');

const router = express.Router();

// Public endpoint - no auth, so rate limit by IP to prevent scraping/abuse.
const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Too many lookups. Please wait a moment and try again.' },
});

router.get('/', verifyLimiter, verifyImei);

module.exports = router;
