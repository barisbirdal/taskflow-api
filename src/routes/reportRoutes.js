const express = require('express');
const controller = require('../controllers/reportController');

const router = express.Router();

router.get('/completed', controller.getCompletedReport);
router.get('/pending', controller.getPendingReport);
router.get('/summary', controller.getSummaryReport);

module.exports = router;
