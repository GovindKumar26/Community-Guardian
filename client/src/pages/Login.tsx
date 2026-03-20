import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, LOCATIONS } from '../types';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>🛡️ Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your Community Guardian account</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" placeholder="your@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" placeholder="••••••••" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    selectedArea: '', 
    preferences: ['crime', 'scam', 'digital_threat'] as string[],
    confirm_password_real: '' // Honeypot field
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.includes('@')) errs.email = 'Valid email required';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) errs.password = 'Password must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) errs.password = 'Password must contain a number';
    if (!form.selectedArea) errs.selectedArea = 'Please select your neighborhood';
    if (form.preferences.length === 0) errs.preferences = 'Select at least one category';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const togglePref = (cat: string) => {
    setForm(f => ({
      ...f,
      preferences: f.preferences.includes(cat)
        ? f.preferences.filter(p => p !== cat)
        : [...f.preferences, cat]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError('');
    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setApiError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h1>🛡️ Join Community Guardian</h1>
        <p className="auth-subtitle">Create an account to personalize your safety experience</p>

        {apiError && <div className="error-banner">{apiError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="r-name">Full Name</label>
            <input id="r-name" type="text" placeholder="John Doe" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="r-email">Email</label>
            <input id="r-email" type="email" placeholder="your@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="r-password">Password</label>
            <input id="r-password" type="password" placeholder="Min 8 chars, uppercase + number" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          {/* Honeypot Field (Bot Protection) */}
          <div style={{ opacity: 0, position: 'absolute', top: 0, left: 0, height: 0, width: 0, zIndex: -1, overflow: 'hidden' }}>
            <label htmlFor="confirm_password_real">Confirm Password</label>
            <input 
              id="confirm_password_real" 
              autoComplete="off" 
              type="text" 
              placeholder="Confirm your password" 
              value={form.confirm_password_real}
              onChange={(e) => setForm({ ...form, confirm_password_real: e.target.value })} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="r-area">Your Neighborhood</label>
            <select id="r-area" value={form.selectedArea} onChange={(e) => setForm({ ...form, selectedArea: e.target.value })}>
              <option value="">Select your area</option>
              {LOCATIONS.map(loc => (<option key={loc} value={loc}>📍 {loc}</option>))}
            </select>
            {errors.selectedArea && <div className="form-error">{errors.selectedArea}</div>}
          </div>
          <div className="form-group">
            <label>Alert Preferences</label>
            <div className="pref-grid">
              {CATEGORIES.map(c => (
                <div key={c.value} className={`pref-item ${form.preferences.includes(c.value) ? 'selected' : ''}`}
                  onClick={() => togglePref(c.value)}>
                  {c.icon} {c.label}
                </div>
              ))}
            </div>
            {errors.preferences && <div className="form-error">{errors.preferences}</div>}
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? 'Creating account...' : '🛡️ Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
