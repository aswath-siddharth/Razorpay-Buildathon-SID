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
  Code,
  Download
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

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit_trail_${sessionId || 'session'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredEvents = events.filter(ev => {
    if (filterActor === 'ALL') return true;
    if (filterActor === 'AGENT') return ev.actor === 'buyer_agent';
    if (filterActor === 'RAZORPAY') return ev.actor === 'razorpay' || ev.actor === 'webhook';
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
        return <span className="badge badge-fail">MANDATE REJECT / FAIL</span>;
      default:
        return <span className="badge badge-info">INFO</span>;
    }
  };

  const getActorIcon = (actor) => {
    switch (actor) {
      case 'razorpay':
        return <CreditCard size={15} color="var(--accent-cyan)" />;
      case 'webhook':
        return <ShieldCheck size={15} color="#10b981" />;
      default:
        return <Bot size={15} color="#38bdf8" />;
    }
  };

  return (
    <div className="glass-card" style={{ padding: '24px' }}>
      
      {/* Section Header & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FileText size={20} color="var(--accent-cyan)" />
            <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Append-Only Audit Trail
            </h2>
            <span className="badge badge-mandate" style={{ fontSize: '0.72rem' }}>
              {events.length} Events
            </span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Every tool call, candidate score, budget check and webhook signature cryptographically verified
          </p>
        </div>

        {/* Copy & Download Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={handleCopyJSON}
            disabled={events.length === 0}
            className="btn btn-outline btn-sm"
          >
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>
          <button 
            onClick={handleDownloadJSON}
            disabled={events.length === 0}
            className="btn btn-outline btn-sm"
            title="Download full JSON audit log"
          >
            <Download size={14} />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Filter size={12} /> Filter:
        </span>
        {[
          { id: 'ALL', label: 'All Steps' },
          { id: 'AGENT', label: 'Agent Decisions' },
          { id: 'RAZORPAY', label: 'Razorpay API' },
          { id: 'RETRY', label: 'Retries & Failures' },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilterActor(f.id)}
            style={{
              background: filterActor === f.id ? 'rgba(0, 186, 242, 0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: filterActor === f.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
              color: filterActor === f.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.18s'
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline Content */}
      {filteredEvents.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <Clock size={36} style={{ marginBottom: '10px', opacity: 0.4 }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            No audit events logged yet.
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Execute a prompt in the studio or click "Buy with AI" from the storefront.
          </p>
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
                    boxShadow: ev.status === 'SUCCESS' ? '0 0 10px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(0, 186, 242, 0.3)'
                  }}
                >
                  <div style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: ev.status === 'SUCCESS' ? '#10b981' : ev.status === 'RETRYING' ? '#f59e0b' : ev.status === 'FAILED' ? '#ef4444' : 'var(--accent-cyan)'
                  }} />
                </div>

                {/* Event Card */}
                <div className="glass-panel" style={{
                  padding: '14px 16px',
                  border: ev.status === 'RETRYING' ? '1px solid rgba(245, 158, 11, 0.35)' : ev.status === 'FAILED' ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid var(--border-subtle)',
                  background: '#ffffff',
                }}>
                  
                  {/* Node Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getActorIcon(ev.actor)}
                      <span className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {ev.action}
                      </span>
                      {getStatusBadge(ev.status)}
                    </div>
                    
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {ev.timestamp ? ev.timestamp.replace('T', ' ').substring(0, 19) : ''}
                    </span>
                  </div>

                  {/* Reasoning Text */}
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: hasData ? '8px' : '0' }}>
                    {ev.reasoning}
                  </p>

                  {/* Mandate Ref if present */}
                  {ev.mandate_ref && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      Ref: <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{ev.mandate_ref}</span>
                    </div>
                  )}

                  {/* Expandable Data Toggle */}
                  {hasData && (
                    <div>
                      <button
                        onClick={() => toggleExpand(ev.id || index)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-cyan)',
                          fontSize: '0.72rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: 0,
                          marginTop: '4px',
                        }}
                      >
                        <Code size={12} />
                        <span>{isExpanded ? 'Hide Payload' : 'Inspect JSON Payload'}</span>
                        {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {isExpanded && (
                        <div style={{
                          marginTop: '8px',
                          background: '#07142f',
                          borderRadius: '8px',
                          padding: '10px 12px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.74rem',
                          overflowX: 'auto',
                          maxHeight: '260px',
                        }}>
                          {ev.input_data && (
                            <div style={{ marginBottom: ev.output_data ? '8px' : '0' }}>
                              <div style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px', fontSize: '0.68rem' }}>INPUT:</div>
                              <pre className="font-mono" style={{ color: '#93c5fd', margin: 0, whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(ev.input_data, null, 2)}
                              </pre>
                            </div>
                          )}
                          {ev.output_data && (
                            <div>
                              <div style={{ color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px', fontSize: '0.68rem' }}>OUTPUT:</div>
                              <pre className="font-mono" style={{ color: '#86efac', margin: 0, whiteSpace: 'pre-wrap' }}>
                                {JSON.stringify(ev.output_data, null, 2)}
                              </pre>
                            </div>
                          )}
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
