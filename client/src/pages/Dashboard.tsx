import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { alertsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AlertCard from '../components/AlertCard';
import SafetyScore from '../components/SafetyScore';
import CommunityWins from '../components/CommunityWins';
import type { Alert, AlertStats } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const location = user?.selectedArea || '';
        const params: Record<string, string> = { limit: '10', sort: 'date', order: 'desc' };
        if (location) params.location = location;

        const resolvedParams = { ...params, status: 'resolved', limit: '3' };

        const [alertsRes, resolvedRes, statsRes] = await Promise.all([
          alertsAPI.getAll(params),
          alertsAPI.getAll(resolvedParams),
          alertsAPI.getStats(location || undefined),
        ]);

        setAlerts(alertsRes.data.alerts);
        setResolvedAlerts(resolvedRes.data.alerts);
        setStats(statsRes.data.stats);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user?.selectedArea]);

  if (loading) {
    return (
      <div className="page container">
        <div className="loading"><div className="spinner" /> Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="page container">
      {/* Hero */}
      <div className="page-header">
        <h1>🛡️ {user ? `Welcome back, ${user.name}` : 'Community Guardian'}</h1>
        <p>
          {user
            ? `Your safety dashboard for ${user.selectedArea}. Stay informed, stay empowered.`
            : 'Stay informed about safety in your community. Sign in to personalize your experience.'}
        </p>
      </div>

      {/* Safety Score Gauge */}
      {stats && (
        <SafetyScore stats={stats} location={user?.selectedArea || 'All Areas'} />
      )}

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Alerts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.resolved}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value" style={{ color: stats.critical > 0 ? '#f97316' : 'var(--accent)' }}>
              {stats.critical}
            </div>
            <div className="stat-label">Critical</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>
      )}

      {/* Community Wins */}
      <CommunityWins alerts={resolvedAlerts} />

      {/* Recent Alerts */}
      <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>
          Recent Alerts {user ? `in ${user.selectedArea}` : ''}
        </h2>
        <Link to="/alerts" className="btn btn-secondary btn-sm">View All →</Link>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>All Clear!</h3>
          <p>No active alerts in {user?.selectedArea || 'your area'} right now. Stay safe!</p>
        </div>
      ) : (
        <div className="alert-grid">
          {alerts.map(alert => (
            <AlertCard key={alert._id} alert={alert} />
          ))}
        </div>
      )}
    </div>
  );
}
