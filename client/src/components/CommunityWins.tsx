import { Link } from 'react-router-dom';
import type { Alert } from '../types';
import { CheckCircle, ShieldCheck } from 'lucide-react';

interface Props {
  alerts: Alert[];
}

export default function CommunityWins({ alerts }: Props) {
  if (alerts.length === 0) return null;

  return (
    <div className="wins-section">
      <div className="wins-header">
        <h2 className="wins-title">
          <ShieldCheck className="wins-title-icon" />
          Community Wins
        </h2>
        <p className="wins-subtitle">Recently resolved safety concerns in your area.</p>
      </div>

      <div className="wins-grid">
        {alerts.map((alert, index) => (
          <Link key={alert._id} to={`/alerts/${alert._id}`} className="win-card" style={{ animationDelay: `${index * 80}ms` }}>
            <div className="win-icon">
              <CheckCircle size={20} />
            </div>
            <div className="win-content">
              <h4 className="win-alert-title">{alert.title}</h4>
              <p className="win-meta">
                Resolved {new Date(alert.updatedAt || alert.date).toLocaleDateString()} • {alert.location}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
