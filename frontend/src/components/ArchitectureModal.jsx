import React from 'react';
import { X, ShieldCheck, Check, Layers, Lock, Cpu, Server, Key, Award, ExternalLink } from 'lucide-react';

export default function ArchitectureModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '980px',
        maxHeight: '88vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid var(--border-medium)'
      }}>
        
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                AI Buyer Architecture & Pitch Reference
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Razorpay AI Buildathon — Track 01: Bounded Autonomous Commerce
              </p>
            </div>
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

        {/* Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          {/* Architecture Pipeline Diagram */}
          <div className="glass-panel" style={{ padding: '18px', border: '1px solid var(--border-medium)' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cpu size={16} />
              <span>Mandate-Gated State Machine Pipeline</span>
            </h4>
            <div style={{
              background: '#070a12',
              padding: '16px',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.78rem',
              color: '#94a3b8',
              lineHeight: 1.65,
              overflowX: 'auto',
              border: '1px solid var(--border-subtle)'
            }}>
{`User Query (Natural Language)
   │
   ▼
[Intent Mandate] (Set once: budget ceiling ₹3000, size 9, ETA, max_retries)
   │ (Bounds all downstream actions)
   ▼
[Buyer Agent Orchestrator] ──► Multi-Merchant Catalog Query & Deterministic Scoring
   │
   ▼
[Inventory Check & Bounded Retry] (Graceful stockout/surge fallback)
   │
   ▼ Log before write
[Payment Mandate] (Scoped, amount-bound, single-use, 10-min expiry)
   │
   ▼ Amount strictly inherited from mandate
[Razorpay Orders API & Hosted Checkout Link]
   │
   ▼ Webhook received & HMAC-SHA256 signature verified server-side
[Order Confirmed & Append-Only Immutable Audit Trail]`}
            </div>
          </div>

          {/* Core Differentiation Pillars */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
            
            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#10b981', fontWeight: 700, fontSize: '0.92rem' }}>
                <Lock size={16} />
                <span>1. Scoped Mandate Layer</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                The agent cannot execute arbitrary transactions. Every payment inherits its amount directly from a scoped <code>PaymentMandate</code> created and validated before the Orders API call.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#f59e0b', fontWeight: 700, fontSize: '0.92rem' }}>
                <ShieldCheck size={16} />
                <span>2. Bounded Retries & Fallback</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                When mid-flow stockouts or price surges occur, the agent retries up to <code>max_retries</code> to find the next-best candidate, or safely aborts charging ₹0.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.92rem' }}>
                <Key size={16} />
                <span>3. Server Webhook Verification</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                Payments are only marked authentic when Razorpay's cryptographic <code>HMAC-SHA256</code> signature is verified server-side.
              </p>
            </div>

          </div>

          {/* Pitch Narrative / Convergence Context */}
          <div className="glass-panel" style={{ padding: '18px', background: 'rgba(12, 17, 30, 0.75)', border: '1px solid var(--border-medium)' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} color="#c084fc" />
              <span>Global Industry Convergence & India's Rails (Pitch Context)</span>
            </h4>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              This architecture converges with standard protocols emerging worldwide: <strong>NPCI's Unified Agent Protocol (UAP)</strong> for delegated UPI, <strong>OpenAI/Stripe's Agentic Commerce Protocol</strong> (Shared Payment Tokens), and <strong>Google's AP2</strong>. We implement this exact scoped authorization model on Razorpay's test rails for the Indian market.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
