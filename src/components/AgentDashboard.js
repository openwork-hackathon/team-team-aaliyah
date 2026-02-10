import { useState, useEffect, useMemo, memo } from 'react';

const MetricCard = memo(function MetricCard({ label, value }) {
  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h2 className="text-sm font-medium text-gray-500">{label}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
});

const formatLabel = (key) => key.replace(/([A-Z])/g, ' $1').trim();

export default function AgentDashboard() {
  const [metrics, setMetrics] = useState({
    activeAgents: 0,
    tasksCompleted: 0,
    errorRate: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        activeAgents: Math.floor(Math.random() * 100),
        tasksCompleted: prev.tasksCompleted + Math.floor(Math.random() * 10),
        errorRate: Number((Math.random() * 5).toFixed(2)),
        memoryUsage: Number((Math.random() * 80).toFixed(2))
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const metricEntries = useMemo(() => {
    return Object.entries(metrics).map(([key, value]) => ({
      key,
      label: formatLabel(key),
      value
    }));
  }, [metrics]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Agent Metrics Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricEntries.map(({ key, label, value }) => (
          <MetricCard key={key} label={label} value={value} />
        ))}
      </div>
    </div>
  );
}
