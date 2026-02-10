const { createPublicClient, http } = require('viem');
const { base, baseSepolia } = require('viem/chains');

// Registry Contract Details
const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000'; // Placeholder
const REGISTRY_ABI = [
  {
    inputs: [{ name: '', type: 'address' }],
    name: 'agents',
    outputs: [
      { name: 'profileURI', type: 'string' },
      { name: 'isVerified', type: 'bool' },
      { name: 'owner', type: 'address' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

class VerificationService {
  constructor() {
    const network = process.env.NETWORK || 'base-sepolia';
    const chain = network === 'base' ? base : baseSepolia;
    
    this.publicClient = createPublicClient({
      chain,
      transport: http()
    });
  }

  async checkOnChainVerification(walletAddress) {
    if (!walletAddress || walletAddress === '0x0000000000000000000000000000000000000000') {
      return { verified: false, reason: 'Invalid wallet address' };
    }

    try {
      const agentData = await this.publicClient.readContract({
        address: REGISTRY_ADDRESS,
        abi: REGISTRY_ABI,
        functionName: 'agents',
        args: [walletAddress]
      });

      const [profileURI, isVerified, owner] = agentData;

      return {
        verified: isVerified,
        profileURI,
        owner,
        onChain: owner !== '0x0000000000000000000000000000000000000000'
      };
    } catch (error) {
      console.error('Error checking on-chain verification:', error);
      return { verified: false, error: error.message };
    }
  }
}

module.exports = new VerificationService();
