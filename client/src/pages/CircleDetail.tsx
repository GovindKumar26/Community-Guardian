import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { circlesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { SafeCircle, CircleMessage } from '../types';

export default function CircleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [circle, setCircle] = useState<SafeCircle | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchCircle = async () => {
    try {
      const res = await circlesAPI.getById(id!);
      setCircle(res.data.circle);
    } catch { setError('Circle not found or access denied.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCircle(); }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [circle?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await circlesAPI.sendMessage(id!, { content: message.trim(), isEmergency });
      // Add message to local state
      if (circle) {
        const newMsg: CircleMessage = {
          _id: Date.now().toString(),
          sender: { _id: user!.id, name: user!.name },
          content: message.trim(),
          isEmergency,
          createdAt: new Date().toISOString()
        };
        setCircle({ ...circle, messages: [...(circle.messages || []), newMsg] });
      }
      setMessage('');
      setIsEmergency(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message.');
    } finally { setSending(false); }
  };

  if (loading) return <div className="page container"><div className="loading"><div className="spinner" /> Loading circle...</div></div>;
  if (!circle) return <div className="page container"><div className="error-banner">{error}</div><button className="btn btn-secondary" onClick={() => navigate('/circles')}>← Back</button></div>;

  return (
    <div className="page container">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/circles')} style={{ marginBottom: '1.5rem' }}>
        ← Back to Circles
      </button>

      {error && <div className="error-banner">{error}</div>}

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>🔒 {circle.name}</h1>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Created by {circle.createdBy.name} • Encrypted communication
        </div>
        <div className="circle-members">
          {circle.members.map(m => (
            <span key={m._id} className="member-chip">
              👤 {m.name} {m._id === user?.id ? '(You)' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.75rem' }}>💬 Encrypted Messages</h3>

        <div className="messages-container">
          {(!circle.messages || circle.messages.length === 0) ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p>No messages yet. Send the first encrypted message to your circle.</p>
            </div>
          ) : (
            circle.messages.map(msg => {
              const isOwn = msg.sender._id === user?.id;
              return (
                <div key={msg._id} className={`message ${isOwn ? 'message-own' : 'message-other'} ${msg.isEmergency ? 'message-emergency' : ''}`}>
                  {!isOwn && <div className="message-sender">{msg.sender.name}</div>}
                  {msg.isEmergency && <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>🚨 EMERGENCY</div>}
                  <div>{msg.content}</div>
                  <div className="message-time">{new Date(msg.createdAt).toLocaleTimeString()}</div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Send message */}
        <form onSubmit={handleSend}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', cursor: 'pointer', color: isEmergency ? 'var(--severity-critical)' : 'var(--text-secondary)' }}>
              <input type="checkbox" checked={isEmergency} onChange={(e) => setIsEmergency(e.target.checked)} />
              🚨 Emergency
            </label>
          </div>
          <div className="message-input">
            <input type="text" placeholder="Type an encrypted message..." value={message}
              onChange={(e) => setMessage(e.target.value)} disabled={sending} />
            <button type="submit" className={`btn ${isEmergency ? 'btn-danger' : 'btn-primary'}`} disabled={sending || !message.trim()}>
              {sending ? '...' : isEmergency ? '🚨 Send' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
