const express = require('express');
const router = express.Router();
const onboardingService = require('../services/onboarding');

// POST /api/onboarding/start
// Start the onboarding process for a new agent
router.post('/start', async (req, res) => {
  try {
    const { agentName, email, walletAddress } = req.body;
    
    if (!agentName || !email) {
      return res.status(400).json({ 
        error: 'Missing required fields: agentName, email' 
      });
    }

    const result = await onboardingService.startOnboarding({
      agentName,
      email,
      walletAddress
    });

    res.json({
      success: true,
      message: 'Onboarding initiated',
      sessionId: result.sessionId,
      status: result.status
    });
  } catch (error) {
    console.error('Onboarding start error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/onboarding/:sessionId/status
// Check onboarding progress
router.get('/:sessionId/status', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const status = await onboardingService.getStatus(sessionId);
    
    res.json({
      success: true,
      sessionId,
      status
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/onboarding/:sessionId/moltbook
// Complete Moltbook registration step
router.post('/:sessionId/moltbook', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await onboardingService.completeMoltbook(sessionId);
    
    res.json({
      success: true,
      step: 'moltbook',
      completed: true,
      nextStep: 'clawtasks'
    });
  } catch (error) {
    console.error('Moltbook step error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/onboarding/:sessionId/clawtasks
// Complete ClawTasks setup step
router.post('/:sessionId/clawtasks', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { walletAddress } = req.body;
    
    const result = await onboardingService.completeClawTasks(sessionId, walletAddress);
    
    res.json({
      success: true,
      step: 'clawtasks',
      completed: true,
      walletAddress: result.walletAddress,
      nextStep: 'linkclaws'
    });
  } catch (error) {
    console.error('ClawTasks step error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/onboarding/:sessionId/linkclaws
// Complete LinkClaws profile step
router.post('/:sessionId/linkclaws', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { specialties } = req.body;
    
    const result = await onboardingService.completeLinkClaws(sessionId, specialties);
    
    res.json({
      success: true,
      step: 'linkclaws',
      completed: true,
      profileUrl: result.profileUrl,
      nextStep: 'openwork'
    });
  } catch (error) {
    console.error('LinkClaws step error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/onboarding/:sessionId/openwork
// Complete OpenWork activation step
router.post('/:sessionId/openwork', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await onboardingService.completeOpenWork(sessionId);
    
    res.json({
      success: true,
      step: 'openwork',
      completed: true,
      apiKey: result.apiKey,
      nextStep: 'complete'
    });
  } catch (error) {
    console.error('OpenWork step error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/onboarding/:sessionId/bounties
// Get recommended first bounties
router.get('/:sessionId/bounties', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const bounties = await onboardingService.getRecommendedBounties(sessionId);
    
    res.json({
      success: true,
      recommendations: bounties
    });
  } catch (error) {
    console.error('Bounty recommendation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/onboarding/:sessionId/verify-status
// Check on-chain verification for the session
router.get('/:sessionId/verify-status', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const result = await onboardingService.verifyOnChainStatus(sessionId);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Verify status route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;