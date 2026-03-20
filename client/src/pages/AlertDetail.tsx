import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { alertsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES } from '../types';
import type { Alert } from '../types';
import { Share2 } from 'lucide-react';
import ShareAlertModal from '../components/ShareAlertModal';

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Vouch state
  const [verifyCount, setVerifyCount] = useState(0);
  const [flagCount, setFlagCount] = useState(0);
  const [userVerified, setUserVerified] = useState(false);
  const [userFlagged, setUserFlagged] = useState(false);
  const [vouching, setVouching] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const fetchAlert = async () => {
      try {
        const res = await alertsAPI.getById(id!);
        const a = res.data.alert;
        setAlert(a);
        setVerifyCount(a.verifyCount || 0);
        setFlagCount(a.flagCount || 0);
        if (user) {
          setUserVerified((a.verifiedBy || []).includes(user.id));
          setUserFlagged((a.flaggedBy || []).includes(user.id));
        }
      } catch {
        setError('Alert not found.');
      } finally {
        setLoading(false);
      }
    };
    fetchAlert();
  }, [id, user]);

  const handleStatusUpdate = async (status: string) => {
    if (!alert) return;
    setUpdating(true);
    try {
      const res = await alertsAPI.update(alert._id, { status });
      setAlert(res.data.alert);
      setSuccess(`Alert marked as ${status}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to update alert.');
    } finally {
      setUpdating(false);
    }
  };

  const handleVerify = async () => {
    if (!alert || vouching) return;
    setVouching(true);
    try {
      const res = await alertsAPI.verify(alert._id);
      setVerifyCount(res.data.verifyCount);
      setFlagCount(res.data.flagCount);
      setUserVerified(res.data.userVerified);
      setUserFlagged(res.data.userFlagged);
      if (res.data.verified && alert) setAlert({ ...alert, verified: true });
    } catch { /* silent */ }
    finally { setVouching(false); }
  };

  const handleFlag = async () => {
    if (!alert || vouching) return;
    setVouching(true);
    try {
      const res = await alertsAPI.flag(alert._id);
      setVerifyCount(res.data.verifyCount);
      setFlagCount(res.data.flagCount);
      setUserVerified(res.data.userVerified);
      setUserFlagged(res.data.userFlagged);
    } catch { /* silent */ }
    finally { setVouching(false); }
  };

  if (loading) return <div className="page container"><div className="loading"><div className="spinner" /> Loading alert...</div></div>;
  if (!alert) return <div className="page container"><div className="error-banner">{error || 'Alert not found.'}</div><button className="btn btn-secondary" onClick={() => navigate('/alerts')}>← Back to Alerts</button></div>;

  const category = CATEGORIES.find(c => c.value === alert.category);
  const isOwner = user && alert.submittedBy?._id === user.id;

  return (
    <div className="page container">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/alerts')} style={{ marginBottom: '1.5rem' }}>
        ← Back to Alerts
      </button>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className={`badge badge-severity-${alert.severity}`}>
            {alert.severity === 'critical' ? '🔴' : alert.severity === 'high' ? '🟠' : alert.severity === 'medium' ? '🟡' : '🟢'} {alert.severity}
          </span>
          <span className={`badge badge-cat-${alert.category}`}>{category?.icon} {category?.label}</span>
          {alert.verified ? <span className="badge badge-verified">✅ Verified</span> : <span className="badge badge-community">👤 Community Report</span>}
          <span className={`badge ${alert.aiSource === 'ai' ? 'badge-ai' : 'badge-rule'}`}>
            {alert.aiSource === 'ai' ? '✨ AI-Generated' : '📋 Rule-Based'}
          </span>
          <span className={`badge ${alert.status === 'resolved' ? 'badge-verified' : 'badge-community'}`}>
            {alert.status === 'resolved' ? '✓ Resolved' : alert.status === 'under_review' ? '🔍 Under Review' : '● Active'}
          </span>
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>{alert.title}</h1>

        <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <span>📍 {alert.location}</span>
          <span>📅 {new Date(alert.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          {alert.submittedBy && <span>👤 Reported by {alert.submittedBy.name}</span>}
        </div>

        {alert.aiSummary && (
          <div style={{ background: 'var(--primary-bg)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
            <strong style={{ fontSize: '0.8125rem', color: 'var(--primary)' }}>
              {alert.aiSource === 'ai' ? '✨ AI Summary' : '📋 Summary'}
            </strong>
            <p style={{ marginTop: '0.375rem', fontSize: '0.9375rem' }}>{alert.aiSummary}</p>
          </div>
        )}

        <p style={{ fontSize: '0.9375rem', lineHeight: 1.7, color: 'var(--text)' }}>{alert.description}</p>

        {/* Community Vouching & Share */}
        {user && (
          <div className="vouch-bar" style={{ marginTop: '1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`vouch-btn vouch-verify ${userVerified ? 'active' : ''}`}
                onClick={handleVerify} disabled={vouching}
                title={userVerified ? 'Remove verification' : 'I can confirm this is real'}
              >
                <span className="vouch-icon">✓</span>
                <span className="vouch-label">Verify</span>
                {verifyCount > 0 && <span className="vouch-count">{verifyCount}</span>}
              </button>
              <button
                className={`vouch-btn vouch-flag ${userFlagged ? 'active' : ''}`}
                onClick={handleFlag} disabled={vouching}
                title={userFlagged ? 'Remove flag' : 'Flag as inaccurate or resolved'}
              >
                <span className="vouch-icon">⚑</span>
                <span className="vouch-label">Flag</span>
                {flagCount > 0 && <span className="vouch-count">{flagCount}</span>}
              </button>
            </div>
            
            {verifyCount >= 3 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--accent)', marginLeft: '0.5rem' }}>
                ✅ Community verified
              </span>
            )}

            <button
              className="vouch-btn"
              onClick={() => setIsShareOpen(true)}
              title="Share to Safe Circle"
              style={{ marginLeft: 'auto' }}
            >
              <Share2 size={16} />
              <span className="vouch-label">Share</span>
            </button>
          </div>
        )}

        {/* Owner actions */}
        {isOwner && alert.status !== 'resolved' && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-success btn-sm" disabled={updating} onClick={() => handleStatusUpdate('resolved')}>
              ✓ Mark Resolved
            </button>
            <button className="btn btn-secondary btn-sm" disabled={updating} onClick={() => handleStatusUpdate('under_review')}>
              🔍 Under Review
            </button>
          </div>
        )}
      </div>

      {/* Actionable Steps */}
      {alert.actionableSteps && alert.actionableSteps.length > 0 && (
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>
            🛡️ Recommended Actions
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Here's what you can do to stay safe and in control:
          </p>
          <ul className="checklist">
            {alert.actionableSteps.map((step, i) => (
              <li key={i} className="checklist-item">
                <span className="checklist-number">{i + 1}</span>
                <span className="checklist-text">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Share Modal */}
      {user && alert && (
        <ShareAlertModal 
          isOpen={isShareOpen} 
          onClose={() => setIsShareOpen(false)} 
          alert={alert} 
        />
      )}
    </div>
  );
}
