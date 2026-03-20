import { useEffect, useState, useCallback } from 'react';
import { alertsAPI } from '../services/api';
import AlertCard from '../components/AlertCard';
import SearchFilter from '../components/SearchFilter';
import { useInterval } from '../hooks/useInterval';
import { ShieldAlert, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Alert, AlertCategory, Location, Severity } from '../types';

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: '', category: '' as AlertCategory | '', location: '' as Location | '', severity: '' as Severity | '', sort: 'date_desc'
  });

  const fetchAlerts = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
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
      setLastSync(new Date());
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // Smart Polling: Sync feed every 30 seconds
  useInterval(() => {
    fetchAlerts(true);
  }, 30000);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [filters]);

  return (
    <div className="page container">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert size={32} />
          Safety Alerts
        </h1>
        <p>Browse and search all community safety alerts. Filter by category, location, or severity.</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          <span className="pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          Live Sync Active | Last updated: {lastSync.toLocaleTimeString()}
        </div>
      </div>

      <SearchFilter filters={filters} onFilterChange={setFilters} />

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Search size={48} /></div>
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
              <button className="btn btn-secondary btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Page {page} of {totalPages}
              </span>
              <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
