const { ethers } = require('ethers');
const { registry } = require('../config/contracts');
const EventEmitter = require('events');

class AgentService extends EventEmitter {
  constructor() {
    super();
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://localhost:8545');
    this.contract = new ethers.Contract(registry.address, registry.abi, this.provider);
    
    // In-memory cache for agent metadata (sync with on-chain)
    this.agents = new Map();
    
    // Start listening to contract events
    this.setupEventListeners();
  }

  setupEventListeners() {
    console.log('📡 Setting up contract event listeners...');
    
    this.contract.on('AgentRegistered', (agentOwner, profileURI) => {
      console.log(`🦞 Agent Registered: ${agentOwner} -> ${profileURI}`);
      this.syncAgent(agentOwner);
      this.emit('event', { type: 'AgentRegistered', data: { agentOwner, profileURI } });
    });

    this.contract.on('AgentVerified', (agentOwner) => {
      console.log(`✅ Agent Verified: ${agentOwner}`);
      this.syncAgent(agentOwner);
      this.emit('event', { type: 'AgentVerified', data: { agentOwner } });
    });

    this.contract.on('ProfileUpdated', (agentOwner, newProfileURI) => {
      console.log(`📝 Profile Updated: ${agentOwner} -> ${newProfileURI}`);
      this.syncAgent(agentOwner);
      this.emit('event', { type: 'ProfileUpdated', data: { agentOwner, newProfileURI } });
    });
  }

  async syncAgent(address) {
    try {
      const agentData = await this.contract.agents(address);
      const agent = {
        owner: address,
        profileURI: agentData.profileURI,
        isVerified: agentData.isVerified,
        lastSynced: new Date().toISOString()
      };
      
      this.agents.set(address.toLowerCase(), agent);
      return agent;
    } catch (error) {
      console.error(`Error syncing agent ${address}:`, error);
      return null;
    }
  }

  async getAgent(address) {
    const cachedAgent = this.agents.get(address.toLowerCase());
    if (cachedAgent) return cachedAgent;
    
    return await this.syncAgent(address);
  }

  async getAllAgents() {
    // In a real app, we'd fetch all from a subgraph or indexer
    // For now, return the cached agents
    return Array.from(this.agents.values());
  }

  async verifyMetadata(address, metadata) {
    // Logic to verify if metadata matches expectations
    // e.g., check if profileURI contains valid JSON
    if (!metadata.name || !metadata.description) {
      throw new Error('Invalid metadata: name and description are required');
    }
    return true;
  }
}

module.exports = new AgentService();
