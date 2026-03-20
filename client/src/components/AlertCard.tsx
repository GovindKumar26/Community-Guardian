import { useState } from 'react';
import type { Alert } from '../types';
import { CATEGORIES } from '../types';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { alertsAPI } from '../services/api';
import { Share2 } from 'lucide-react';
import ShareAlertModal from './ShareAlertModal';

interface Props {
  alert: Alert;
  onVouchUpdate?: (id: string, verifyCount: number, flagCount: number, verified: boolean) => void;
}

export default function AlertCard({ alert, onVouchUpdate }: Props) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const category = CATEGORIES.find(c => c.value === alert.category);

  const [verifyCount, setVerifyCount] = useState(alert.verifyCount || 0);
  const [flagCount, setFlagCount] = useState(alert.flagCount || 0);
  const [userVerified, setUserVerified] = useState(
    user ? (alert.verifiedBy || []).includes(user.id) : false
  );
  const [userFlagged, setUserFlagged] = useState(
    user ? (alert.flaggedBy || []).includes(user.id) : false
  );
  const [loading, setLoading] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleVerify = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || loading) return;
    setLoading(true);
    try {
      const res = await alertsAPI.verify(alert._id);
      setVerifyCount(res.data.verifyCount);
      setFlagCount(res.data.flagCount);
      setUserVerified(res.data.userVerified);
      setUserFlagged(res.data.userFlagged);
      onVouchUpdate?.(alert._id, res.data.verifyCount, res.data.flagCount, res.data.verified);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  const handleFlag = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || loading) return;
    setLoading(true);
    try {
      const res = await alertsAPI.flag(alert._id);
      setVerifyCount(res.data.verifyCount);
      setFlagCount(res.data.flagCount);
      setUserVerified(res.data.userVerified);
      setUserFlagged(res.data.userFlagged);
      onVouchUpdate?.(alert._id, res.data.verifyCount, res.data.flagCount, res.data.verified);
    } catch { /* silently fail */ }
    finally { setLoading(false); }
  };

  return (
    <div className="alert-card" onClick={() => navigate(`/alerts/${alert._id}`)}>
      <div className="alert-card-header">
        <h3>{alert.title}</h3>
      </div>

      <div className="alert-card-badges">
        <span className={`badge badge-severity-${alert.severity}`}>
          {alert.severity === 'critical' ? '🔴' :
           alert.severity === 'high' ? '🟠' :
           alert.severity === 'medium' ? '🟡' : '🟢'}
          {' '}{alert.severity}
        </span>
        <span className={`badge badge-cat-${alert.category}`}>
          {category?.icon} {category?.label}
        </span>
        {alert.verified ? (
          <span className="badge badge-verified">✅ Verified</span>
        ) : (
          <span className="badge badge-community">👤 Community</span>
        )}
        <span className={`badge ${alert.aiSource === 'ai' ? 'badge-ai' : 'badge-rule'}`}>
          {alert.aiSource === 'ai' ? '✨ AI' : '📋 Rule-based'}
        </span>
      </div>

      <div className="alert-card-body">
        {alert.aiSummary || alert.description}
      </div>

      <div className="alert-card-footer">
        <div className="alert-card-meta">
          <span>📍 {alert.location}</span>
          <span>{formatDate(alert.date)}</span>
        </div>
        {alert.status === 'resolved' && (
          <span className="badge badge-verified">✓ Resolved</span>
        )}
      </div>

      {/* Community Vouching & Share */}
      {user && (
        <div className="vouch-bar" onClick={(e) => e.stopPropagation()}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className={`vouch-btn vouch-verify ${userVerified ? 'active' : ''}`}
              onClick={handleVerify}
              disabled={loading}
              title={userVerified ? 'Remove verification' : 'Verify this alert'}
            >
              <span className="vouch-icon">✓</span>
              <span className="vouch-label">Verify</span>
              {verifyCount > 0 && <span className="vouch-count">{verifyCount}</span>}
            </button>
            <button
              className={`vouch-btn vouch-flag ${userFlagged ? 'active' : ''}`}
              onClick={handleFlag}
              disabled={loading}
              title={userFlagged ? 'Remove flag' : 'Flag as inaccurate'}
            >
              <span className="vouch-icon">⚑</span>
              <span className="vouch-label">Flag</span>
              {flagCount > 0 && <span className="vouch-count">{flagCount}</span>}
            </button>
          </div>
          <button
            className="vouch-btn"
            onClick={(e) => { e.stopPropagation(); setIsShareOpen(true); }}
            title="Share to Safe Circle"
            style={{ marginLeft: 'auto' }}
          >
            <Share2 size={16} />
            <span className="vouch-label">Share</span>
          </button>
        </div>
      )}

      {/* Share Modal */}
      {user && (
        <ShareAlertModal 
          isOpen={isShareOpen} 
          onClose={() => setIsShareOpen(false)} 
          alert={alert} 
        />
      )}
    </div>
  );
}
