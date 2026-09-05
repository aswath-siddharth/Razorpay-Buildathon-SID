import React, { useState } from 'react';
import { 
  Compass, 
  ListFilter, 
  ShieldCheck, 
  ShoppingBag, 
  CreditCard, 
  Key, 
  CheckCircle2, 
  AlertOctagon, 
  ChevronDown, 
  ChevronUp, 
  RotateCw, 
  Check, 
  Clock, 
  Lock, 
  ArrowRight,
  ExternalLink,
  Code2,
  Copy,
  AlertTriangle
} from 'lucide-react';

export default function AgentExecutionTrace({
  traceState, // current active steps array or state machine
  isExecuting,
  currentStepIndex,
  onRetryStep,
  onResetTrace,
  failureMode = 'none', // 'none' | 'mandate_breach' | 'bad_signature' | 'stockout'
}) {
  const [expandedSteps, setExpandedSteps] = useState({ 2: true }); // Step 3 (Mandate Authorized) expanded by default for bounded proof
  const [copiedStep, setCopiedStep] = useState(null);

  const toggleExpand = (stepId) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleCopyRaw = (stepId, data) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedStep(stepId);
    setTimeout(() => setCopiedStep(null), 1800);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running':
        return <RotateCw size={15} className="spin-icon" />;
      case 'done':
        return <Check size={16} strokeWidth={2.5} />;
      case 'failed':
        return <AlertOctagon size={16} strokeWidth={2.5} />;
      case 'mitigated':
        return <ArrowRight size={15} strokeWidth={2.5} />;
      default:
        return <Clock size={14} />;
    }
  };

  const getStepBaseIcon = (stepKey) => {
    switch (stepKey) {
      case 'INTENT_PARSED':
        return <Compass size={15} />;
      case 'CANDIDATES_SCORED':
        return <ListFilter size={15} />;
      case 'MANDATE_AUTHORIZED':
        return <ShieldCheck size={15} />;
      case 'ORDER_CREATED':
        return <ShoppingBag size={15} />;
      case 'PAYMENT_INITIATED':
        return <CreditCard size={15} />;
      case 'WEBHOOK_VERIFIED':
        return <Key size={15} />;
      case 'CONFIRMED':
        return <CheckCircle2 size={15} />;
      case 'AGENT_MITIGATION':
        return <AlertTriangle size={15} />;
      default:
        return <ShieldCheck size={15} />;
    }
  };

  return (
    <div className="trace-container">
      
      {/* Header bar of trace */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Execution Trace & Pipeline
            </span>
            {isExecuting ? (
              <span className="badge badge-running">
                <RotateCw size={11} className="spin-icon" /> Live Stepping
              </span>
            ) : (
              <span className="badge badge-success">
                <Check size={11} /> Trace Active
              </span>
            )}
          </div>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Every stage cryptographically bound, gated & explainable
          </p>
        </div>

        <button 
          onClick={onResetTrace}
          className="btn btn-outline btn-xs"
          title="Reset and replay trace"
        >
          Replay
        </button>
      </div>

      {/* Stepper list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {traceState.map((step, idx) => {
          const isExpanded = !!expandedSteps[step.id];
          const isRunning = step.status === 'running';
          const isDone = step.status === 'done';
          const isFailed = step.status === 'failed';
          const isPending = step.status === 'pending';
          const isMitigation = step.id === 'AGENT_MITIGATION';

          return (
            <div 
              key={step.id || idx} 
              className={`trace-step-card ${step.status} fade-in-node`}
              style={isMitigation ? { background: '#fffbeb', borderColor: '#fde68a' } : {}}
            >
              
              {/* Step Summary Header */}
              <div 
                className="trace-step-header"
                onClick={() => toggleExpand(step.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  
                  {/* Left Icon Pill */}
                  <div className={`trace-icon-box ${step.status} ${isPending ? 'step-pulsing' : ''}`}>
                    {getStatusIcon(step.status)}
                  </div>

                  {/* Title & Human description */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: isFailed ? 'var(--status-fail)' : 'var(--text-primary)' }}>
                        {step.title}
                      </span>

                      {/* Stage status pills */}
                      {isDone && (
                        <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          Verified
                        </span>
                      )}
                      {isRunning && (
                        <span className="badge badge-running" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          Evaluating...
                        </span>
                      )}
                      {isFailed && (
                        <span className="badge badge-fail" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          REJECTED / FAILED
                        </span>
                      )}
                      {isMitigation && (
                        <span className="badge badge-warn" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          MITIGATION ENGAGED
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '0.74rem', color: isFailed ? '#b91c1c' : 'var(--text-secondary)', lineHeight: 1.35, marginTop: '2px' }}>
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Right Timestamp & Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                  {step.timestamp && (
                    <span className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {step.timestamp}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                </div>

              </div>

              {/* Bounded Proof Special Highlight Box for Step 3 */}
              {step.id === 'MANDATE_AUTHORIZED' && step.boundedProof && (
                <div style={{
                  padding: '8px 12px',
                  background: isFailed ? '#fef2f2' : '#f0fdf4',
                  borderTop: `1px solid ${isFailed ? '#fecaca' : '#bbf7d0'}`,
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Lock size={12} color={isFailed ? '#dc2626' : '#16a34a'} />
                    <span style={{ fontWeight: 600, color: isFailed ? '#991b1b' : '#166534' }}>
                      Bounded Proof:
                    </span>
                    <span className="font-mono" style={{ fontWeight: 700, color: isFailed ? '#dc2626' : '#15803d' }}>
                      {step.boundedProof.amountStr} ≤ {step.boundedProof.ceilingStr}
                    </span>
                  </div>

                  <span className={`badge ${isFailed ? 'badge-fail' : 'badge-success'}`} style={{ fontSize: '0.66rem' }}>
                    {isFailed ? 'CEILING BREACH' : 'BOUND VERIFIED'}
                  </span>
                </div>
              )}

              {/* Webhook Signature Verification Badge for Step 6 */}
              {step.id === 'WEBHOOK_VERIFIED' && step.signatureDetails && (
                <div style={{
                  padding: '8px 12px',
                  background: isFailed ? '#fef2f2' : '#f0fdf4',
                  borderTop: `1px solid ${isFailed ? '#fecaca' : '#bbf7d0'}`,
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={12} color={isFailed ? '#dc2626' : '#16a34a'} />
                    <span style={{ fontWeight: 600, color: isFailed ? '#991b1b' : '#166534' }}>
                      Crypto Signature:
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.68rem', color: isFailed ? '#b91c1c' : '#166534' }}>
                      {step.signatureDetails.algorithm} ({step.signatureDetails.status})
                    </span>
                  </div>

                  <span className={`badge ${isFailed ? 'badge-fail' : 'badge-success'}`} style={{ fontSize: '0.66rem' }}>
                    {isFailed ? 'SIGNATURE MISMATCH (400)' : 'HMAC-SHA256 PASS'}
                  </span>
                </div>
              )}

              {/* Expandable Raw Payload View */}
              {isExpanded && step.rawPayload && (
                <div className="raw-payload-viewer">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', color: '#94a3b8', fontSize: '0.68rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <Code2 size={12} color="#38bdf8" /> RAW STRUCTURED PAYLOAD
                    </span>
                    <button
                      onClick={() => handleCopyRaw(step.id, step.rawPayload)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: copiedStep === step.id ? '#4ade80' : '#94a3b8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '0.66rem'
                      }}
                    >
                      {copiedStep === step.id ? <Check size={11} /> : <Copy size={11} />}
                      <span>{copiedStep === step.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#38bdf8' }}>
                    {JSON.stringify(step.rawPayload, null, 2)}
                  </pre>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
