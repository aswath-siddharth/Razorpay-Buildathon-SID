import React from 'react';
import { ShieldCheck, Database, FileText, History, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Header({ 
  backendStatus, 
  onOpenCatalog, 
  onOpenArchitecture, 
  onOpenHistory,
  sessionCount = 0 
}) {
  return (
    <header className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', position: 'sticky', top: '12px', zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Track Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0066FF 0%, #00BAF2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0, 186, 242, 0.4)'
          }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
                AI Buyer
              </h1>
              <span className="badge badge-mandate" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                Track 01 — Bounded Autonomous Commerce
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Explainable, Mandate-Bound Purchasing on Razorpay Rails
            </p>
          </div>
        </div>

        {/* Action Buttons & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Backend Status Indicator */}
          <div className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            fontSize: '0.8rem',
            borderRadius: '9999px',
            border: backendStatus === 'connected' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            {backendStatus === 'connected' ? (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                <span style={{ color: '#10b981', fontWeight: 600 }}>API Online (Port 8000)</span>
              </>
            ) : (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Connecting...</span>
              </>
            )}
          </div>

          {/* Architecture Pitch Modal */}
          <button 
            className="btn btn-outline btn-sm"
            onClick={onOpenArchitecture}
            title="View Pitch Architecture & State Machine"
          >
            <FileText size={15} color="var(--accent-cyan)" />
            <span>Architecture & Pitch</span>
          </button>

          {/* Merchant Catalog Modal */}
          <button 
            className="btn btn-outline btn-sm"
            onClick={onOpenCatalog}
            title="Inspect Live Merchant Catalogs"
          >
            <Database size={15} color="#38bdf8" />
            <span>Merchant Catalog</span>
          </button>

          {/* Past Sessions Drawer */}
          <button 
            className="btn btn-outline btn-sm"
            onClick={onOpenHistory}
            title="Inspect Past Audit Sessions"
          >
            <History size={15} color="#c084fc" />
            <span>Sessions ({sessionCount})</span>
          </button>
        </div>

      </div>
    </header>
  );
}
