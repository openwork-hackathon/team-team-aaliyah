const express = require('express');
const cors = require('cors');
require('dotenv').config();

const onboardingRoutes = require('./routes/onboarding');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/health', healthRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'OMYai Backend',
    version: '0.1.0',
    status: 'operational',
    endpoints: {
      onboarding: '/api/onboarding',
      health: '/api/health'
    }
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🦞 OMYai server running on port ${PORT}`);
});

module.exports = app;