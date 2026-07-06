const express = require('express');
const { requireAuth } = require('../middleware/auth');
const {
  registerPhone,
  listMyPhones,
  getMyPhone,
  deletePhone,
} = require('../controllers/phoneController');

const router = express.Router();

router.use(requireAuth);

router.post('/', registerPhone);
router.get('/', listMyPhones);
router.get('/:id', getMyPhone);
router.delete('/:id', deletePhone);

module.exports = router;
