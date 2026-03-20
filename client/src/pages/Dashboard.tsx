import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { alertsAPI } from '../services/api';
import { useAuth } from '../context/useAuth';
import AlertCard from '../components/AlertCard';
import SafetyScore from '../components/SafetyScore';
import CommunityWins from '../components/CommunityWins';
import { useInterval } from '../hooks/useInterval';
import { Shield, ShieldCheck, ArrowRight } from 'lucide-react';
import type { Alert, AlertStats } from '../types';

export default function Dashboard() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resolvedAlerts, setResolvedAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const fetchData = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
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
      setLastSync(new Date());
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [user?.selectedArea]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Smart Polling: Sync every 30 seconds
  useInterval(() => {
    fetchData(true);
  }, 30000);

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
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={32} className="brand-icon" />
          {user ? `Welcome back, ${user.name}` : 'Community Guardian'}
        </h1>
        <p>
          {user
            ? `Your safety dashboard for ${user.selectedArea}. Stay informed, stay empowered.`
            : 'Stay informed about safety in your community. Sign in to personalize your experience.'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          Live Sync Active | Last updated: {lastSync.toLocaleTimeString()}
        </div>
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
        <Link to="/alerts" className="btn btn-secondary btn-sm">
          View All <ArrowRight size={14} />
        </Link>
      </div>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><ShieldCheck size={48} /></div>
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
