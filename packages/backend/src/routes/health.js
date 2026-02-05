const express = require('express');
const router = express.Router();

// GET /api/health
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '0.1.0'
  });
});

// GET /api/health/ready
router.get('/ready', (req, res) => {
  // TODO: Check database connection, external services
  res.json({ ready: true });
});

module.exports = router;