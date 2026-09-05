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
  AlertTriangle,
  Zap,
  RefreshCw,
  XCircle
} from 'lucide-react';

export default function AgentExecutionTrace({
  traceState,
  isExecuting,
  onResetTrace,
  onOpenRazorpayModal,
  onSimulateCompletePayment,
  selectedProduct,
  actualAmount = 2799,
  paymentStatus = 'idle'
}) {
  const [expandedSteps, setExpandedSteps] = useState({ 2: true, 4: true });
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
            ) : paymentStatus === 'cancelled' ? (
              <span className="badge badge-fail">
                <XCircle size={11} /> Payment Cancelled
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
                          {step.id === 'PAYMENT_INITIATED' ? 'Awaiting Razorpay...' : 'Evaluating...'}
                        </span>
                      )}
                      {isFailed && (
                        <span className="badge badge-fail" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                          {step.id === 'PAYMENT_INITIATED' ? 'PAYMENT CANCELLED' : 'REJECTED / FAILED'}
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

              {/* Step 5: Payment Initiated with Razorpay Checkout Action Buttons */}
              {step.id === 'PAYMENT_INITIATED' && (
                <div style={{
                  padding: '10px 12px',
                  background: isFailed ? '#fef2f2' : isDone ? '#f0fdf4' : '#eff5ff',
                  borderTop: `1px solid ${isFailed ? '#fecaca' : isDone ? '#bbf7d0' : '#bfdbfe'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: isFailed ? '#991b1b' : isDone ? '#166534' : '#1e40af', fontWeight: 600 }}>
                      <CreditCard size={14} color={isFailed ? '#dc2626' : isDone ? '#16a34a' : '#0066ff'} />
                      <span>Razorpay Order ID: <strong>{step.rawPayload?.razorpay_order_id || 'order_RPZ819201'}</strong></span>
                    </div>

                    <span className={`badge ${isFailed ? 'badge-fail' : isDone ? 'badge-success' : 'badge-running'}`} style={{ fontSize: '0.66rem' }}>
                      {isFailed ? 'Payment Dismissed' : isDone ? 'Payment Captured' : 'Awaiting Checkout'}
                    </span>
                  </div>

                  {/* Render payment details when completed, or action buttons when pending / cancelled */}
                  {isDone ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px', fontSize: '0.74rem', color: '#166534' }}>
                      <span>Payment ID: <strong className="font-mono">{step.rawPayload?.razorpay_payment_id || 'pay_TYPhPj2ez9unM2'}</strong></span>
                      <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Check size={12} /> Authorized & Charged
                      </span>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenRazorpayModal) onOpenRazorpayModal();
                        }}
                        className={`btn ${isFailed ? 'btn-danger' : 'btn-primary'} btn-xs`}
                        style={{ flex: 1, padding: '6px 10px', fontSize: '0.76rem', gap: '5px', minWidth: '160px' }}
                        title="Open Razorpay Standard Checkout popup (enter any dummy details)"
                      >
                        <Zap size={12} />
                        <span>{isFailed ? 'Retry Razorpay Checkout' : 'Open Razorpay Checkout Modal'}</span>
                      </button>

                      {isRunning && onSimulateCompletePayment && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSimulateCompletePayment();
                          }}
                          className="btn btn-success btn-xs"
                          style={{ padding: '6px 8px', fontSize: '0.74rem', gap: '4px' }}
                          title="Simulate successful dummy payment completion"
                        >
                          <Check size={12} />
                          <span>Simulate Success</span>
                        </button>
                      )}

                      <a
                        href={`https://rzp.io/rzp/${(step.rawPayload?.razorpay_order_id || 'test').slice(-6)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="btn btn-outline btn-xs"
                        style={{ padding: '6px 8px', fontSize: '0.74rem', gap: '4px', background: '#ffffff' }}
                        title="Open Razorpay Hosted Checkout in new tab"
                      >
                        <ExternalLink size={12} />
                        <span>rzp.io</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Webhook Signature Verification Badge for Step 6 */}
              {step.id === 'WEBHOOK_VERIFIED' && step.signatureDetails && (
                <div style={{
                  padding: '8px 12px',
                  background: isFailed ? '#fef2f2' : isDone ? '#f0fdf4' : '#f8fafc',
                  borderTop: `1px solid ${isFailed ? '#fecaca' : isDone ? '#bbf7d0' : '#e2e8f0'}`,
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Key size={12} color={isFailed ? '#dc2626' : isDone ? '#16a34a' : '#94a3b8'} />
                    <span style={{ fontWeight: 600, color: isFailed ? '#991b1b' : isDone ? '#166534' : '#64748b' }}>
                      Crypto Signature:
                    </span>
                    <span className="font-mono" style={{ fontSize: '0.68rem', color: isFailed ? '#b91c1c' : isDone ? '#166534' : '#64748b' }}>
                      {step.signatureDetails.algorithm} ({step.signatureDetails.status})
                    </span>
                  </div>

                  <span className={`badge ${isFailed ? 'badge-fail' : isDone ? 'badge-success' : 'badge-pending'}`} style={{ fontSize: '0.66rem' }}>
                    {isFailed ? 'SIGNATURE MISMATCH (400)' : isDone ? 'HMAC-SHA256 PASS' : 'AWAITING CAPTURE'}
                  </span>
                </div>
              )}

              {/* Step 7 Confirmed: Receipt Summary & Status Badge */}
              {step.id === 'CONFIRMED' && (
                <div style={{
                  padding: '10px 12px',
                  background: isDone ? '#f0fdf4' : '#f8fafc',
                  borderTop: `1px solid ${isDone ? '#bbf7d0' : '#e2e8f0'}`,
                  fontSize: '0.76rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ color: isDone ? '#166534' : 'var(--text-muted)', fontWeight: 600 }}>
                    Receipt: <strong className="font-mono">{isDone ? (step.rawPayload?.receipt_id || 'RCP_MERIDIAN_88921a') : 'Pending Completion'}</strong>
                  </span>

                  {isDone && (
                    <span className="badge badge-success" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      <Check size={11} /> Order Confirmed
                    </span>
                  )}
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
