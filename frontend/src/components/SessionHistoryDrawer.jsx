import React from 'react';
import { X, History, Clock, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';

export default function SessionHistoryDrawer({ isOpen, onClose, sessions = [], onSelectSession, currentSessionId }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      justifyContent: 'flex-end',
      zIndex: 100,
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '420px',
        height: '100vh',
        borderRadius: 0,
        borderLeft: '1px solid var(--border-medium)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        
        {/* Drawer Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <History size={18} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
              Session History
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
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
            <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No recorded sessions yet.
            </p>
          ) : (
            sessions.map((s) => {
              const isSelected = s.session_id === currentSessionId;
              return (
                <div
                  key={s.session_id}
                  onClick={() => {
                    onSelectSession(s.session_id);
                    onClose();
                  }}
                  className="glass-panel"
                  style={{
                    padding: '12px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'rgba(0, 186, 242, 0.12)' : 'rgba(15, 23, 42, 0.6)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="font-mono" style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: 700 }}>
                      {s.session_id}
                    </span>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                      {s.event_count} events
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-cyan)', marginBottom: '4px' }}>
                    Latest: {s.latest_action}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    <span>{new Date(s.latest_timestamp).toLocaleTimeString()}</span>
                    <ChevronRight size={14} color="var(--text-muted)" />
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
