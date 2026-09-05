import React from 'react';
import { X, History, Clock, ChevronRight, ShieldCheck, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export default function SessionHistoryDrawer({ 
  isOpen, 
  onClose, 
  sessions = [], 
  onSelectSession, 
  currentSessionId 
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '420px',
        height: '100%',
        borderRadius: '0',
        borderLeft: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <History size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              Past Audit Sessions
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Sessions List */}
        <div style={{ padding: '16px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <Clock size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p style={{ fontSize: '0.88rem' }}>No past sessions found yet.</p>
            </div>
          ) : (
            sessions.map((sess) => {
              const isSelected = sess.session_id === currentSessionId;
              const isSuccess = sess.status === 'SUCCESS' || sess.status === 'PAYMENT_READY';

              return (
                <div
                  key={sess.session_id}
                  onClick={() => {
                    onSelectSession(sess.session_id);
                    onClose();
                  }}
                  className="glass-panel"
                  style={{
                    padding: '14px',
                    cursor: 'pointer',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(0, 186, 242, 0.12)' : 'rgba(12, 17, 30, 0.7)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-medium)';
                      e.currentTarget.style.transform = 'translateX(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      {sess.session_id}
                    </span>
                    <span className={`badge ${isSuccess ? 'badge-success' : 'badge-info'}`} style={{ fontSize: '0.65rem' }}>
                      {sess.status || 'LOGGED'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.35, marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {sess.last_reasoning || sess.message || 'Session audit events logged.'}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{sess.timestamp ? sess.timestamp.replace('T', ' ').substring(0, 16) : 'Recent'}</span>
                    <span style={{ color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', gap: '2px', fontWeight: 600 }}>
                      View Trail <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
