import { CATEGORIES, LOCATIONS, SEVERITIES } from '../types';
import type { AlertCategory, Location, Severity } from '../types';
import { X } from 'lucide-react';

interface Props {
  filters: {
    search: string;
    category: AlertCategory | '';
    location: Location | '';
    severity: Severity | '';
    sort: string;
  };
  onFilterChange: (filters: Props['filters']) => void;
}

export default function SearchFilter({ filters, onFilterChange }: Props) {
  const update = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="filter-bar">
      <input
        type="text"
        placeholder="Search alerts..."
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
      />
      <select value={filters.category} onChange={(e) => update('category', e.target.value)}>
        <option value="">All Categories</option>
        {CATEGORIES.map(c => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>
      <select value={filters.location} onChange={(e) => update('location', e.target.value)}>
        <option value="">All Locations</option>
        {LOCATIONS.map(loc => (
          <option key={loc} value={loc}>{loc}</option>
        ))}
      </select>
      <select value={filters.severity} onChange={(e) => update('severity', e.target.value)}>
        <option value="">All Severities</option>
        {SEVERITIES.map(s => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
      <select value={filters.sort} onChange={(e) => update('sort', e.target.value)} style={{ borderLeft: '1px solid var(--border)', paddingLeft: '0.75rem' }}>
        <option value="date_desc">Newest First</option>
        <option value="date_asc">Oldest First</option>
        <option value="severity_desc">Highest Severity</option>
        <option value="severity_asc">Lowest Severity</option>
        <option value="category_asc">Category (A-Z)</option>
      </select>
      {(filters.search || filters.category || filters.location || filters.severity || filters.sort !== 'date_desc') && (
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onFilterChange({ search: '', category: '', location: '', severity: '', sort: 'date_desc' })}
          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}
