// ─── Alert Types ─────────────────────────────────────────────────────────────

export interface Alert {
  _id: string;
  title: string;
  description: string;
  category: AlertCategory;
  subcategory: string | null;
  severity: Severity;
  location: Location;
  source: 'system' | 'community';
  verified: boolean;
  status: AlertStatus;
  submittedBy: { _id: string; name: string } | null;
  aiSummary: string | null;
  aiCategory: string | null;
  actionableSteps: string[];
  aiSource: 'ai' | 'rule-based';
  verifiedBy: string[];
  flaggedBy: string[];
  verifyCount: number;
  flagCount: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export type AlertCategory = 'crime' | 'scam' | 'digital_threat' | 'hazard' | 'weather' | 'health';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type Location = 'Downtown' | 'Riverside' | 'Oakwood' | 'Hilltop' | 'Lakeview' | 'Greenfield';
export type AlertStatus = 'active' | 'resolved' | 'under_review';

export interface ActionableReport {
  steps: string[];
  source: 'ai' | 'rule-based';
  summary: string;
  categorization: {
    category: string;
    subcategory: string | null;
    confidence: number;
    source: 'ai' | 'rule-based';
  };
}

export interface AlertsResponse {
  alerts: Alert[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AlertCreateResponse {
  message: string;
  alert: Alert;
  actionableReport: ActionableReport;
}

export interface AlertStats {
  total: number;
  active: number;
  resolved: number;
  critical: number;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  location: string;
}

export interface VouchResponse {
  message: string;
  verifyCount: number;
  flagCount: number;
  verified: boolean;
  userVerified: boolean;
  userFlagged: boolean;
}

// ─── User Types ──────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  selectedArea: Location;
  preferences: AlertCategory[];
  createdAt?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// ─── Safe Circle Types ───────────────────────────────────────────────────────

export interface SafeCircle {
  _id: string;
  name: string;
  createdBy: { _id: string; name: string };
  members: { _id: string; name: string; email: string }[];
  messages?: CircleMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CircleMessage {
  _id: string;
  sender: { _id: string; name: string };
  content: string;
  isEmergency: boolean;
  createdAt: string;
}

export interface SentCircleMessage {
  _id?: string;
  sender: { _id: string; name: string };
  content: string;
  isEmergency: boolean;
  createdAt: string;
}

export interface CircleMember {
  id: string;
  name: string;
  email: string;
}

// ─── Digest Types ────────────────────────────────────────────────────────────

export interface DigestResponse {
  digest: string;
  actionableSteps: DigestActionableStep[];
  source: 'ai' | 'rule-based';
  meta: {
    location: string;
    preferences: string[];
    alertCount: number;
    generatedAt: string;
  };
}

export interface DigestActionableStep {
  alertId: string;
  title: string;
  category: AlertCategory;
  steps: string[];
  source: 'ai' | 'rule-based';
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const CATEGORIES: { value: AlertCategory; label: string; icon: string }[] = [
  { value: 'crime', label: 'Crime & Safety', icon: 'ShieldAlert' },
  { value: 'scam', label: 'Scam Alert', icon: 'AlertTriangle' },
  { value: 'digital_threat', label: 'Digital Threat', icon: 'GlobeLock' },
  { value: 'hazard', label: 'Hazard', icon: 'Construction' },
  { value: 'weather', label: 'Weather', icon: 'CloudRain' },
  { value: 'health', label: 'Health', icon: 'Stethoscope' },
];

export const LOCATIONS: Location[] = [
  'Downtown', 'Riverside', 'Oakwood', 'Hilltop', 'Lakeview', 'Greenfield'
];

export const SEVERITIES: { value: Severity; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: '#4ade80' },
  { value: 'medium', label: 'Medium', color: '#facc15' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'critical', label: 'Critical', color: '#ef4444' },
];
