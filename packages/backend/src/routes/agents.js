const express = require('express');
const router = express.Router();
const agentService = require('../services/agents');

// GET /api/agents
// List all registered agents
router.get('/', async (req, res) => {
  try {
    const agents = await agentService.getAllAgents();
    res.json({ success: true, agents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/:address
// Get specific agent details
router.get('/:address', async (req, res) => {
  try {
    const agent = await agentService.getAgent(req.params.address);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/agents/:address/sync
// Manually trigger a sync with on-chain data
router.post('/:address/sync', async (req, res) => {
  try {
    const agent = await agentService.syncAgent(req.params.address);
    res.json({ success: true, agent });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/agents/events/stream
// SSE endpoint for real-time events
router.get('/events/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onEvent = (event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  };

  agentService.on('event', onEvent);

  req.on('close', () => {
    agentService.removeListener('event', onEvent);
  });
});

// POST /api/agents/verify-metadata
// Verify agent metadata before on-chain registration
router.post('/verify-metadata', async (req, res) => {
  try {
    const { address, metadata } = req.body;
    await agentService.verifyMetadata(address, metadata);
    res.json({ success: true, message: 'Metadata verified' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
