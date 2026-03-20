import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, ShieldAlert, CheckCircle2, Users, Info } from 'lucide-react';
import type { Alert, SafeCircle } from '../types';
import { circlesAPI } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  alert: Alert;
}

export default function ShareAlertModal({ isOpen, onClose, alert }: Props) {
  const [circles, setCircles] = useState<SafeCircle[]>([]);
  const [loading, setLoading] = useState(false);
  const [sharingTo, setSharingTo] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setLoading(true);
      circlesAPI.getAll()
        .then(res => setCircles(res.data.circles))
        .catch(() => setError('Failed to load your Safe Circles. Please try again.'))
        .finally(() => setLoading(false));
    } else {
      document.body.style.overflow = '';
      setSuccess(null);
      setError(null);
      setSharingTo(null);
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = async (circleId: string) => {
    setSharingTo(circleId);
    setError(null);
    try {
      const content = `[Shared Alert] ${alert.title}\nSeverity: ${alert.severity.toUpperCase()}\nLocation: ${alert.location}\nLink: ${window.location.origin}/alerts/${alert._id}`;
      
      await circlesAPI.sendMessage(circleId, { 
        content, 
        isEmergency: alert.severity === 'critical' || alert.severity === 'high' 
      });
      
      setSuccess(`Alert shared!`);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Failed to share alert.');
    } finally {
      setSharingTo(null);
    }
  };

  return createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content glass-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-accent" />
          <div className="modal-title">
            <ShieldAlert size={18} className="modal-title-icon" />
            <span>Forward to Circle</span>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {success ? (
            <div className="share-success-v2">
              <div className="success-lottie-replacement">
                <CheckCircle2 size={56} className="success-icon-anim" />
              </div>
              <h3>Securely Shared</h3>
              <p>The alert details have been encrypted and sent to your circle.</p>
            </div>
          ) : (
            <>
              {/* Alert Preview Box */}
              <div className="share-preview-box">
                <div className="preview-label">Sharable Content</div>
                <div className="preview-content">
                  <div className={`preview-severity-dot severity-${alert.severity}`} />
                  <div className="preview-info">
                    <span className="preview-title">{alert.title}</span>
                    <span className="preview-meta">{alert.location} • {alert.severity.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="share-prompt-v2">
                <Users size={16} />
                <span>Select a Safe Circle to notify:</span>
              </div>

              {error && (
                <div className="modal-error">
                  <Info size={14} />
                  <span>{error}</span>
                </div>
              )}

              <div className="circle-scroll-area">
                {loading ? (
                  <div className="modal-loading-state">
                    <div className="spinner-glow" />
                    <p>Fetching your circles...</p>
                  </div>
                ) : circles.length === 0 ? (
                  <div className="modal-empty-state">
                    <Users size={32} className="empty-icon" />
                    <p>No Safe Circles found</p>
                    <button className="btn btn-secondary btn-sm" onClick={() => window.location.href='/circles'}>
                      Create Circle
                    </button>
                  </div>
                ) : (
                  <div className="circle-grid-v2">
                    {circles.map(circle => (
                      <button 
                        key={circle._id} 
                        className={`circle-entry ${sharingTo === circle._id ? 'is-sharing' : ''}`}
                        onClick={() => handleShare(circle._id)}
                        disabled={sharingTo !== null}
                      >
                        <div className="circle-entry-icon">
                          <Users size={18} />
                        </div>
                        <div className="circle-entry-details">
                          <span className="name">{circle.name}</span>
                          <span className="members">{circle.members.length} Members</span>
                        </div>
                        <div className="circle-entry-action">
                          {sharingTo === circle._id ? (
                            <div className="spinner-mini" />
                          ) : (
                            <Send size={16} className="send-arrow" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        {!success && (
          <div className="modal-footer-hint">
            <Info size={12} />
            <span>Encrypted end-to-end within your Safe Circle</span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
