const express = require('express');
const router = express.Router();
const verificationService = require('../services/verification');

// GET /api/verify/:walletAddress
// Check on-chain verification status
router.get('/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;
    const result = await verificationService.checkOnChainVerification(walletAddress);
    
    res.json({
      success: true,
      walletAddress,
      ...result
    });
  } catch (error) {
    console.error('Verification route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
