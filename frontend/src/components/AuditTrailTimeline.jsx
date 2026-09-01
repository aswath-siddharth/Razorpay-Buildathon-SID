import React, { useState } from 'react';
import { 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Filter, 
  ShieldCheck, 
  Bot, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw,
  Clock,
  Code
} from 'lucide-react';

export default function AuditTrailTimeline({ events = [], sessionId }) {
  const [filterActor, setFilterActor] = useState('ALL');
  const [expandedIds, setExpandedIds] = useState({});
  const [copied, setCopied] = useState(false);

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredEvents = events.filter(ev => {
    if (filterActor === 'ALL') return true;
    if (filterActor === 'AGENT') return ev.actor === 'buyer_agent';
    if (filterActor === 'RAZORPAY') return ev.actor === 'razorpay';
    if (filterActor === 'RETRY') return ev.status === 'RETRYING' || ev.status === 'FAILED';
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <span className="badge badge-success">SUCCESS</span>;
      case 'RETRYING':
        return <span className="badge badge-retry">BOUNDED RETRY</span>;
      case 'FAILED':
        return <span className="badge badge-fail">FAILURE / ABORT</span>;
      default:
        return <span className="badge badge-info">INFO</span>;
    }
  };

  const getActorIcon = (actor) => {
    switch (actor) {
      case 'razorpay':
        return <CreditCard size={14} color="var(--accent-cyan)" />;
      case 'webhook':
        return <ShieldCheck size={14} color="#10b981" />;
      default:
        return <Bot size={14} color="#38bdf8" />;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      
      {/* Section Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FileText size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
              Append-Only Audit Trail
            </h2>
            <span className="badge badge-mandate" style={{ fontSize: '0.72rem' }}>
              {events.length} Events Logged
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Every tool call, candidate scoring, budget check and webhook signature verified before execution.
          </p>
        </div>

        {/* Copy & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={handleCopyJSON}
            disabled={events.length === 0}
            className="btn btn-outline btn-sm"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied JSON' : 'Export Trail JSON'}</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={12} /> Filter:
        </span>
        {['ALL', 'AGENT', 'RAZORPAY', 'RETRY'].map(f => (
          <button
            key={f}
            onClick={() => setFilterActor(f)}
            style={{
              background: filterActor === f ? 'rgba(0, 186, 242, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: filterActor === f ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: filterActor === f ? '#ffffff' : 'var(--text-secondary)',
              borderRadius: '9999px',
              padding: '4px 10px',
              fontSize: '0.72rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {f === 'ALL' ? 'All Steps' : f === 'AGENT' ? 'Agent Decisions' : f === 'RAZORPAY' ? 'Razorpay API' : 'Retries & Failures'}
          </button>
        ))}
      </div>

      {/* Timeline Content */}
      {filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <Clock size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
          <p style={{ fontSize: '0.9rem' }}>No audit events logged yet. Execute a prompt above to start the pipeline.</p>
        </div>
      ) : (
        <div className="timeline-container">
          <div className="timeline-line" />
          
          {filteredEvents.map((ev, index) => {
            const isExpanded = !!expandedIds[ev.id || index];
            const hasData = ev.input_data || ev.output_data;

            return (
              <div key={ev.id || index} className="timeline-node">
                
                {/* Timeline Dot */}
                <div 
                  className="timeline-dot"
                  style={{
                    borderColor: ev.status === 'SUCCESS' ? '#10b981' : ev.status === 'RETRYING' ? '#f59e0b' : ev.status === 'FAILED' ? '#ef4444' : 'var(--accent-cyan)',
                    boxShadow: ev.status === 'SUCCESS' ? '0 0 8px rgba(16, 185, 129, 0.4)' : '0 0 8px rgba(0, 186, 242, 0.3)'
                  }}
                >
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#ffffff' }}>
                    {index + 1}
                  </span>
                </div>

                {/* Event Card */}
                <div className="glass-panel" style={{
                  padding: '14px 18px',
                  border: ev.status === 'RETRYING' 
                    ? '1px solid var(--status-retry-border)' 
                    : ev.status === 'FAILED' 
                    ? '1px solid var(--status-fail-border)' 
                    : '1px solid var(--border-subtle)',
                  background: ev.status === 'RETRYING'
                    ? 'rgba(245, 158, 11, 0.05)'
                    : 'rgba(13, 21, 39, 0.7)',
                }}>
                  
                  {/* Event Meta Line */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 7px', borderRadius: '4px' }}>
                        {getActorIcon(ev.actor)}
                        <span>{ev.actor}</span>
                      </div>
                      <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>
                        {ev.action}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {ev.mandate_ref && (
                        <span className="font-mono" style={{ fontSize: '0.68rem', color: '#c084fc', background: 'rgba(139, 92, 246, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                          Ref: {ev.mandate_ref.substring(0, 14)}...
                        </span>
                      )}
                      {getStatusBadge(ev.status)}
                    </div>
                  </div>

                  {/* Decision Reasoning / Explanation */}
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.45 }}>
                    {ev.reasoning}
                  </p>

                  {/* Timestamp & Expand Data Trigger */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <span>{ev.timestamp ? new Date(ev.timestamp).toLocaleTimeString() : 'Just now'}</span>
                    
                    {hasData && (
                      <button
                        onClick={() => toggleExpand(ev.id || index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Code size={12} />
                        <span>{isExpanded ? 'Hide Payload' : 'View Payload (JSON)'}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>
                    )}
                  </div>

                  {/* Expanded JSON Inspector */}
                  {isExpanded && hasData && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px',
                      background: 'rgba(5, 9, 18, 0.95)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.72rem',
                    }}>
                      {ev.input_data && (
                        <div style={{ marginBottom: '8px' }}>
                          <span style={{ color: 'var(--text-cyan)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Input Data:</span>
                          <pre className="font-mono" style={{ color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(ev.input_data, null, 2)}
                          </pre>
                        </div>
                      )}
                      {ev.output_data && (
                        <div>
                          <span style={{ color: '#10b981', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Output Data:</span>
                          <pre className="font-mono" style={{ color: '#94a3b8', whiteSpace: 'pre-wrap' }}>
                            {JSON.stringify(ev.output_data, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
