import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { digestAPI } from '../services/api';
import type { DigestResponse } from '../types';

export default function Digest() {
  const { user } = useAuth();
  const [digest, setDigest] = useState<DigestResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateDigest = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await digestAPI.generate();
      setDigest(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate digest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page container">
      <div className="page-header">
        <h1>📋 Your Safety Digest</h1>
        <p>
          A personalized, AI-generated summary of safety alerts in{' '}
          <strong>{user?.selectedArea || 'your area'}</strong>, tailored to your preferences.
        </p>
      </div>

      {!digest && !loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛡️</div>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Ready to see your safety summary?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Our AI will analyze active alerts in {user?.selectedArea} and create a calm, personalized digest for you.
          </p>
          <button className="btn btn-primary btn-lg" onClick={generateDigest}>
            ✨ Generate My Digest
          </button>
        </div>
      )}

      {loading && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading" style={{ justifyContent: 'center' }}>
            <div className="spinner" /> Analyzing alerts and generating your safety digest...
          </div>
        </div>
      )}

      {error && <div className="error-banner">{error}</div>}

      {digest && (
        <>
          <div className="digest-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h2 style={{ margin: 0 }}>🛡️ Safety Digest for {digest.meta.location}</h2>
              <span className={`badge ${digest.source === 'ai' ? 'badge-ai' : 'badge-rule'}`}>
                {digest.source === 'ai' ? '✨ AI-Generated' : '📋 Rule-Based'}
              </span>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              {digest.meta.alertCount} alert(s) analyzed • Generated {new Date(digest.meta.generatedAt).toLocaleString()}
            </div>

            <div className="digest-content">{digest.digest}</div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-primary" onClick={generateDigest}>
              🔄 Refresh Digest
            </button>
          </div>
        </>
      )}
    </div>
  );
}
