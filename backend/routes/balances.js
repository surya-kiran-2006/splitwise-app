const express = require('express');
const { getGroupBalances } = require('../controllers/balanceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.get('/group/:groupId', getGroupBalances);

module.exports = router;
