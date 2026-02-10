import { useState, useEffect } from 'react';

export default function AgentDashboard() {
  const [metrics, setMetrics] = useState({
    activeAgents: 0,
    tasksCompleted: 0,
    errorRate: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    // Simulated real-time data
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        activeAgents: Math.floor(Math.random() * 100),
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 10),
        errorRate: (Math.random() * 5).toFixed(2),
        memoryUsage: (Math.random() * 80).toFixed(2)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Metrics Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(metrics).map(([key, value]) => (
          <div key={key} className="p-4 bg-gray-100 rounded-lg">
            <h2 className="text-sm font-medium text-gray-500">{key.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}