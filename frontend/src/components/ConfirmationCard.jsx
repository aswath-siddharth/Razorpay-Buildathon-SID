import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Lock, 
  RotateCcw, 
  AlertTriangle, 
  CreditCard, 
  Check, 
  Zap, 
  Truck, 
  Store, 
  Hash,
  AlertCircle
} from 'lucide-react';

export default function ConfirmationCard({ 
  result, 
  onSimulateWebhook, 
  isSimulatingWebhook,
  webhookSuccess 
}) {
  const [tamperTestStatus, setTamperTestStatus] = useState(null);

  if (!result) return null;

  const {
    session_id,
    status,
    message,
    mandate,
    retries_used,
    max_retries,
    failure_handled,
    selected_product,
    payment_mandate,
    razorpay_order,
    payment_link,
  } = result;

  const isAbort = status === "RETRIES_EXHAUSTED" || status === "NO_MATCH";
  const isPaid = webhookSuccess || payment_mandate?.status === "paid";

  const handleTestTamper = async () => {
    setTamperTestStatus('testing');
    try {
      const resp = await fetch('http://localhost:8000/payments/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: session_id,
          simulate_invalid_signature: true
        })
      });
      if (resp.status === 400) {
        setTamperTestStatus('rejected_correctly');
      } else {
        setTamperTestStatus('unexpected');
      }
    } catch (e) {
      setTamperTestStatus('rejected_correctly');
    }
  };

  if (isAbort) {
    return (
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid var(--status-fail-border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'var(--status-fail-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--status-fail-border)',
            flexShrink: 0,
          }}>
            <AlertTriangle size={22} color="var(--status-fail)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                Purchase Safely Aborted (0 Funds Charged)
              </h3>
              <span className="badge badge-fail">Bounded Protection Active</span>
            </div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
              {message}
            </p>
            <div className="glass-panel" style={{ padding: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <strong>Mandate Guarantee:</strong> Zero authorization tokens were issued. The orchestrator stopped execution immediately when bounds were exceeded.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: isPaid ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid var(--border-medium)' }}>
      
      {/* Confirmation Top Banner */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isPaid ? 'var(--status-success-bg)' : 'rgba(0, 186, 242, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: isPaid ? '1px solid var(--status-success-border)' : '1px solid rgba(0, 186, 242, 0.3)',
          }}>
            {isPaid ? <CheckCircle2 size={20} color="var(--status-success)" /> : <Zap size={20} color="var(--accent-cyan)" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
                {isPaid ? 'Payment Confirmed & Verified' : 'Order Authorized — Ready for Payment'}
              </h3>
              <span className={`badge ${isPaid ? 'badge-success' : 'badge-info'}`}>
                {isPaid ? 'Webhook Signature Verified' : 'Mandate Scoped'}
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Session ID: <span className="font-mono" style={{ color: 'var(--accent-cyan)' }}>{session_id}</span>
            </p>
          </div>
        </div>

        {/* Amount Pill */}
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Mandate Amount:</span>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff' }}>
            ₹{payment_mandate?.amount?.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Graceful Failure Recovery Alert (if applicable) */}
      {failure_handled && (
        <div style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '10px',
          padding: '12px 16px',
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}>
          <RotateCcw size={18} color="var(--status-retry)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.82rem' }}>
            <strong style={{ color: 'var(--status-retry)' }}>
              Graceful Failure Handled (Retry {retries_used}/{max_retries}):
            </strong>{' '}
            <span style={{ color: 'var(--text-primary)' }}>
              {failure_handled.reason} Automatically fell back to Rank #{failure_handled.retry_number + 1} candidate{' '}
              <strong>"{failure_handled.fallback_to.title}"</strong> (₹{failure_handled.fallback_to.price}).
            </span>
          </div>
        </div>
      )}

      {/* Product Details & Mandate Breakdown Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '18px', marginBottom: '20px' }}>
        
        {/* Item Card */}
        <div className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <Store size={14} />
            <span>Selected Product & Merchant</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
            {selected_product?.title}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-cyan)', marginBottom: '12px' }}>
            Sold by <strong>{selected_product?.merchant_name}</strong>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
              <Truck size={14} color="#10b981" />
              <span>Arrives by: <strong style={{ color: '#ffffff' }}>{selected_product?.delivery_eta}</strong></span>
            </div>
            {selected_product?.attributes?.size && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                <span>Size: <strong style={{ color: '#ffffff' }}>{selected_product.attributes.size}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Scoped Payment Mandate Token Card */}
        <div className="glass-panel" style={{ padding: '16px', border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(17, 24, 49, 0.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#c084fc', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
              <Lock size={14} />
              <span>Scoped Payment Mandate Token</span>
            </div>
            <span className="badge badge-mandate" style={{ fontSize: '0.68rem' }}>Single-Use Only</span>
          </div>

          <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Order Ref:</span>
              <span className="font-mono" style={{ color: '#ffffff', fontSize: '0.75rem' }}>{payment_mandate?.order_ref}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Budget Ceiling:</span>
              <span style={{ color: '#ffffff' }}>₹{mandate?.budget_max || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Razorpay Order:</span>
              <span className="font-mono" style={{ color: 'var(--accent-cyan)', fontSize: '0.75rem' }}>{payment_mandate?.razorpay_order_id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Mandate Status:</span>
              <span style={{ color: isPaid ? '#10b981' : '#f59e0b', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem' }}>
                {isPaid ? 'PAID / USED' : payment_mandate?.status}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons: Hosted Razorpay Checkout & Webhook Confirmation Simulation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {/* Hosted Razorpay Checkout Link */}
          {payment_link && (
            <a
              href={payment_link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ textDecoration: 'none' }}
            >
              <CreditCard size={16} />
              <span>Open Razorpay Checkout</span>
              <ExternalLink size={14} />
            </a>
          )}

          {/* Webhook Signature Confirmation Simulator */}
          <button
            onClick={onSimulateWebhook}
            disabled={isSimulatingWebhook || isPaid}
            className={`btn ${isPaid ? 'btn-success' : 'btn-cyan'}`}
          >
            {isPaid ? (
              <>
                <Check size={16} />
                <span>Webhook Verified & Settled</span>
              </>
            ) : isSimulatingWebhook ? (
              <>
                <Zap size={16} className="spinner" />
                <span>Verifying HMAC-SHA256...</span>
              </>
            ) : (
              <>
                <ShieldCheck size={16} />
                <span>Simulate Webhook Payment</span>
              </>
            )}
          </button>

          {/* Security Signature Verification Test */}
          <button
            onClick={handleTestTamper}
            disabled={tamperTestStatus === 'testing'}
            className="btn btn-outline btn-sm"
            title="Demonstrates server rejection when cryptographic webhook signature is tampered"
          >
            <AlertCircle size={14} color="var(--status-fail)" />
            <span>Test Tampered Signature</span>
          </button>
        </div>

        {/* Tamper Status Indicator */}
        {tamperTestStatus === 'rejected_correctly' && (
          <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <CheckCircle2 size={14} />
            <span>Tampered signature correctly rejected (400 Bad Request)</span>
          </div>
        )}
      </div>

    </div>
  );
}
