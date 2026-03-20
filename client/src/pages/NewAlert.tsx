import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alertsAPI } from '../services/api';
import { CATEGORIES, LOCATIONS, SEVERITIES } from '../types';
import type { ActionableReport } from '../types';

export default function NewAlert() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: '', severity: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [report, setReport] = useState<ActionableReport | null>(null);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.title.trim().length < 5) errs.title = 'Title must be at least 5 characters';
    if (form.description.trim().length < 20) errs.description = 'Description must be at least 20 characters';
    if (!form.category) errs.category = 'Please select a category';
    if (!form.location) errs.location = 'Please select a location';
    if (!form.severity) errs.severity = 'Please select severity level';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    setApiError('');

    try {
      const res = await alertsAPI.create(form);
      setReport(res.data.actionableReport);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.details?.[0]?.message || 'Failed to submit alert.';
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Show the actionable report after submission
  if (report) {
    return (
      <div className="page container">
        <div className="success-banner" style={{ fontSize: '1rem' }}>
          ✅ Your incident has been submitted and shared with the community.
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            🛡️ Your Actionable Safety Report
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9375rem' }}>
            {report.summary}
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span className={`badge ${report.source === 'ai' ? 'badge-ai' : 'badge-rule'}`}>
              {report.source === 'ai' ? '✨ AI-Generated Report' : '📋 Rule-Based Report'}
            </span>
            <span className={`badge badge-cat-${report.categorization.category}`}>
              {CATEGORIES.find(c => c.value === report.categorization.category)?.icon}{' '}
              {CATEGORIES.find(c => c.value === report.categorization.category)?.label}
            </span>
          </div>

          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem' }}>Here's what you can do:</h3>
          <ul className="checklist">
            {report.steps.map((step, i) => (
              <li key={i} className="checklist-item">
                <span className="checklist-number">{i + 1}</span>
                <span className="checklist-text">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => navigate('/alerts')}>View All Alerts</button>
          <button className="btn btn-secondary" onClick={() => { setReport(null); setForm({ title: '', description: '', category: '', location: '', severity: '' }); }}>
            Report Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <div className="page-header">
        <h1>📝 Report an Incident</h1>
        <p>Submit a safety concern. Our AI will analyze it and provide you with actionable steps.</p>
      </div>

      {apiError && <div className="error-banner">{apiError}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Incident Title *</label>
            <input id="title" type="text" placeholder="Brief description of the incident" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Detailed Description *</label>
            <textarea id="description" rows={5} placeholder="Provide as much detail as possible — what happened, when, and any other relevant information"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => (<option key={c.value} value={c.value}>{c.icon} {c.label}</option>))}
              </select>
              {errors.category && <div className="form-error">{errors.category}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <select id="location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                <option value="">Select neighborhood</option>
                {LOCATIONS.map(loc => (<option key={loc} value={loc}>📍 {loc}</option>))}
              </select>
              {errors.location && <div className="form-error">{errors.location}</div>}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="severity">Severity *</label>
            <select id="severity" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              <option value="">Select severity</option>
              {SEVERITIES.map(s => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>
            {errors.severity && <div className="form-error">{errors.severity}</div>}
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
            {submitting ? 'Analyzing with AI...' : '🛡️ Submit & Get Safety Report'}
          </button>
        </form>
      </div>
    </div>
  );
}
