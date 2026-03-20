import type { AlertStats } from '../types';
import { ShieldCheck, CheckCircle2, AlertTriangle, AlertCircle, ShieldAlert } from 'lucide-react';

interface Props {
  stats: AlertStats;
  location: string;
}

/**
 * Calculates a 0-100 safety score based on alert data.
 * Higher = safer. Algorithm:
 * - Start at 100
 * - Deduct for active alerts (weighted by severity)
 * - Bonus for high resolution rate
 * - Heavy penalty for critical active alerts
 */
function calculateScore(stats: AlertStats): number {
  const { active, resolved, critical, total, bySeverity } = stats;

  if (total === 0) return 100; // No data = all clear

  let score = 100;

  // Deduct for active alerts by severity
  const highCount = bySeverity?.high || 0;
  const medCount = bySeverity?.medium || 0;
  const lowCount = bySeverity?.low || 0;

  score -= critical * 15;  // Critical hits hard
  score -= highCount * 8;
  score -= medCount * 4;
  score -= lowCount * 2;

  // Bonus for resolution rate
  if (total > 0) {
    const resolutionRate = resolved / total;
    score += resolutionRate * 15; // Up to +15 for 100% resolved
  }

  // Penalty for too many active without resolution
  if (active > 5) {
    score -= (active - 5) * 3;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

function getScoreInfo(score: number): { label: string; color: string; icon: React.ReactNode; message: string } {
  if (score >= 85) return {
    label: 'Excellent', color: '#22c55e', icon: <ShieldCheck size={18} />,
    message: 'Your neighborhood is very safe right now.'
  };
  if (score >= 70) return {
    label: 'Good', color: '#3b82f6', icon: <CheckCircle2 size={18} />,
    message: 'Things are mostly calm. Stay aware.'
  };
  if (score >= 50) return {
    label: 'Moderate', color: '#f59e0b', icon: <AlertTriangle size={18} />,
    message: 'Some activity in your area. Stay informed.'
  };
  if (score >= 30) return {
    label: 'Elevated', color: '#f97316', icon: <AlertCircle size={18} />,
    message: 'Increased activity. Review active alerts.'
  };
  return {
    label: 'High Alert', color: '#ef4444', icon: <ShieldAlert size={18} />,
    message: 'Multiple active concerns. Stay vigilant and check alerts.'
  };
}

export default function SafetyScore({ stats, location }: Props) {
  const score = calculateScore(stats);
  const info = getScoreInfo(score);

  // SVG arc gauge parameters
  const size = 160;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = Math.PI * radius; // semicircle
  const progress = (score / 100) * circumference;

  return (
    <div className="safety-score-card">
      <div className="safety-score-gauge">
        <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2 + 10}`}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2 + 10}`}
            fill="none"
            stroke={info.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            className="score-arc"
          />
        </svg>
        <div className="safety-score-value" style={{ color: info.color }}>
          {score}
        </div>
      </div>

      <div className="safety-score-info">
        <div className="safety-score-label" style={{ color: info.color, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {info.icon} {info.label}
        </div>
        <div className="safety-score-location">
          Shield Strength • {location}
        </div>
        <div className="safety-score-message">
          {info.message}
        </div>
      </div>
    </div>
  );
}
