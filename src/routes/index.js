const express = require('express');
const taskRoutes = require('./taskRoutes');
const projectRoutes = require('./projectRoutes');
const reportRoutes = require('./reportRoutes');

const router = express.Router();

router.use('/tasks', taskRoutes);
router.use('/projects', projectRoutes);
router.use('/reports', reportRoutes);

module.exports = router;
