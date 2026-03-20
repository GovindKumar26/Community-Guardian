import { useEffect, useState, useCallback } from 'react';
import { alertsAPI } from '../services/api';
import AlertCard from '../components/AlertCard';
import SearchFilter from '../components/SearchFilter';
import type { Alert, AlertCategory, Location, Severity } from '../types';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '', category: '' as AlertCategory | '', location: '' as Location | '', severity: '' as Severity | '', sort: 'date_desc'
  });

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page), limit: '15' };
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.location) params.location = filters.location;
      if (filters.severity) params.severity = filters.severity;
      if (filters.sort) {
        const [sortStr, orderStr] = filters.sort.split('_');
        params.sort = sortStr;
        params.order = orderStr;
      }

      const res = await alertsAPI.getAll(params);
      setAlerts(res.data.alerts);
      setTotalPages(res.data.pagination.pages);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filters]);

  return (
    <div className="page container">
      <div className="page-header">
        <h1>🚨 Safety Alerts</h1>
        <p>Browse and search all community safety alerts. Filter by category, location, or severity.</p>
      </div>

      <SearchFilter filters={filters} onFilterChange={setFilters} />

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No alerts found</h3>
          <p>Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <>
          <div className="alert-grid">
            {alerts.map(alert => (
              <AlertCard key={alert._id} alert={alert} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                ← Previous
              </button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
