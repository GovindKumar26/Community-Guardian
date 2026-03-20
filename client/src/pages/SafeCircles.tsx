import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { circlesAPI } from '../services/api';
import type { SafeCircle } from '../types';

export default function SafeCircles() {
  const navigate = useNavigate();
  const [circles, setCircles] = useState<SafeCircle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', memberEmails: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCircles = async () => {
      try {
        const res = await circlesAPI.getAll();
        setCircles(res.data.circles);
      } catch { setError('Failed to load circles.'); }
      finally { setLoading(false); }
    };
    fetchCircles();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.memberEmails.trim()) { setError('Name and at least one email required.'); return; }
    setCreating(true);
    setError('');
    try {
      const emails = form.memberEmails.split(',').map(e => e.trim()).filter(e => e);
      const res = await circlesAPI.create({ name: form.name.trim(), memberEmails: emails });
      setCircles(prev => [res.data.circle, ...prev]);
      setShowCreate(false);
      setForm({ name: '', memberEmails: '' });
      setSuccess('Safe Circle created!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create circle.');
    } finally { setCreating(false); }
  };

  return (
    <div className="page container">
      <div className="page-header">
        <h1>🔒 Safe Circles</h1>
        <p>Create a trusted group of guardians for encrypted emergency communication.</p>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {success && <div className="success-banner">{success}</div>}

      <div style={{ marginBottom: '1.5rem' }}>
        <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
          {showCreate ? '✕ Cancel' : '+ Create New Circle'}
        </button>
      </div>

      {showCreate && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.125rem' }}>Create a Safe Circle</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label htmlFor="circle-name">Circle Name</label>
              <input id="circle-name" type="text" placeholder="e.g., Family Guardians" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="circle-emails">Member Emails (comma-separated)</label>
              <input id="circle-emails" type="text" placeholder="friend@email.com, family@email.com" value={form.memberEmails}
                onChange={(e) => setForm({ ...form, memberEmails: e.target.value })} />
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Members must have a Community Guardian account.
              </div>
            </div>
            <button type="submit" className="btn btn-success" disabled={creating}>
              {creating ? 'Creating...' : '🔒 Create Circle'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /> Loading circles...</div>
      ) : circles.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h3>No Safe Circles Yet</h3>
          <p>Create your first circle and add trusted guardians for emergency communication.</p>
        </div>
      ) : (
        <div className="alert-grid">
          {circles.map(circle => (
            <div key={circle._id} className="circle-card" onClick={() => navigate(`/circles/${circle._id}`)} style={{ cursor: 'pointer' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>🔒 {circle.name}</h3>
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Created by {circle.createdBy.name} • {circle.members.length} member(s)
              </div>
              <div className="circle-members">
                {circle.members.map(m => (
                  <span key={m._id} className="member-chip">👤 {m.name}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
