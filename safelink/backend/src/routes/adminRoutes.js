const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  listAllReports,
  updateReportStatus,
  listAllUsers,
  setUserActive,
  dashboardStats,
} = require('../controllers/adminController');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/stats', dashboardStats);
router.get('/reports', listAllReports);
router.patch('/reports/:id', updateReportStatus);
router.get('/users', listAllUsers);
router.patch('/users/:id/active', setUserActive);

module.exports = router;
