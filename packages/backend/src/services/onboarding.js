const { v4: uuidv4 } = require('uuid');

// In-memory storage for sessions (replace with Redis/DB in production)
const sessions = new Map();

class OnboardingService {
  async startOnboarding({ agentName, email, walletAddress }) {
    const sessionId = uuidv4();
    const session = {
      id: sessionId,
      agentName,
      email,
      walletAddress,
      status: 'in_progress',
      steps: {
        moltbook: { completed: false },
        clawtasks: { completed: false },
        linkclaws: { completed: false },
        openwork: { completed: false }
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    sessions.set(sessionId, session);
    
    return {
      sessionId,
      status: session.status
    };
  }
  
  async getStatus(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    const completedSteps = Object.entries(session.steps)
      .filter(([_, step]) => step.completed)
      .map(([name, _]) => name);
    
    const pendingSteps = Object.entries(session.steps)
      .filter(([_, step]) => !step.completed)
      .map(([name, _]) => name);
    
    return {
      ...session,
      progress: {
        completed: completedSteps.length,
        total: Object.keys(session.steps).length,
        completedSteps,
        pendingSteps,
        percentComplete: Math.round((completedSteps.length / Object.keys(session.steps).length) * 100)
      }
    };
  }
  
  async completeMoltbook(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    // TODO: Integrate with Moltbook API
    // POST to /api/v1/posts to create verification post
    
    session.steps.moltbook = {
      completed: true,
      completedAt: new Date().toISOString(),
      username: session.agentName
    };
    session.updatedAt = new Date().toISOString();
    
    return session;
  }
  
  async completeClawTasks(sessionId, walletAddress) {
    const session = sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    // TODO: Integrate with ClawTasks API
    // POST to /api/agents to register
    // Generate wallet if not provided
    
    const finalWalletAddress = walletAddress || `0x${uuidv4().replace(/-/g, '')}`;
    
    session.steps.clawtasks = {
      completed: true,
      completedAt: new Date().toISOString(),
      walletAddress: finalWalletAddress
    };
    session.updatedAt = new Date().toISOString();
    
    return {
      ...session,
      walletAddress: finalWalletAddress
    };
  }
  
  async completeLinkClaws(sessionId, specialties) {
    const session = sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    // TODO: Integrate with LinkClaws API
    // Create professional profile
    
    const defaultSpecialties = ['research', 'writing', 'coding'];
    const finalSpecialties = specialties || defaultSpecialties;
    
    session.steps.linkclaws = {
      completed: true,
      completedAt: new Date().toISOString(),
      specialties: finalSpecialties,
      profileUrl: `https://linkclaws.com/agents/${session.agentName}`
    };
    session.updatedAt = new Date().toISOString();
    
    return {
      ...session,
      profileUrl: session.steps.linkclaws.profileUrl
    };
  }
  
  async completeOpenWork(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    // TODO: Integrate with OpenWork API
    // POST to /api/agents/register
    
    const apiKey = `ow_${uuidv4().replace(/-/g, '')}`;
    
    session.steps.openwork = {
      completed: true,
      completedAt: new Date().toISOString(),
      apiKey
    };
    session.status = 'completed';
    session.updatedAt = new Date().toISOString();
    
    return {
      ...session,
      apiKey
    };
  }
  
  async getRecommendedBounties(sessionId) {
    const session = sessions.get(sessionId);
    if (!session) throw new Error('Session not found');
    
    // TODO: Fetch from ClawTasks API based on agent specialties
    // GET /api/bounties?status=open
    
    // Mock recommendations for now
    return [
      {
        id: 'bounty-1',
        title: 'Write a product review',
        description: 'Write a 200-word review of an AI tool',
        reward: 5,
        difficulty: 'beginner',
        tags: ['writing', 'review']
      },
      {
        id: 'bounty-2', 
        title: 'Research API documentation',
        description: 'Find and summarize 3 API endpoints',
        reward: 10,
        difficulty: 'beginner',
        tags: ['research', 'documentation']
      },
      {
        id: 'bounty-3',
        title: 'Debug a Python script',
        description: 'Fix errors in a data processing script',
        reward: 15,
        difficulty: 'intermediate',
        tags: ['coding', 'python', 'debugging']
      }
    ];
  }
}

module.exports = new OnboardingService();