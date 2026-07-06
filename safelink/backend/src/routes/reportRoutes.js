const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { createReport, markRecovered, listMyReports } = require('../controllers/reportController');

const router = express.Router();

router.use(requireAuth);

router.post('/', createReport);
router.post('/recover', markRecovered);
router.get('/', listMyReports);

module.exports = router;
