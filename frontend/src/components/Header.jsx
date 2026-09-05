import React from 'react';
import { ShieldCheck, Database, FileText, History, Sparkles, CheckCircle2, AlertCircle, ShoppingBag, ExternalLink, Lock } from 'lucide-react';

export default function Header({ 
  backendStatus, 
  onOpenCatalog, 
  onOpenArchitecture, 
  onOpenHistory,
  sessionCount = 0,
  onScrollToStorefront,
  onScrollToStudio,
}) {
  return (
    <header className="glass-panel" style={{ 
      padding: '14px 24px', 
      marginBottom: '24px', 
      position: 'sticky', 
      top: '12px', 
      zIndex: 50,
      border: '1px solid var(--border-medium)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 186, 242, 0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Track Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0066FF 0%, #00BAF2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(0, 186, 242, 0.45)',
            position: 'relative'
          }}>
            <ShieldCheck size={26} color="#ffffff" />
            <span style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid #08090d',
              boxShadow: '0 0 8px #10b981'
            }} className="live-dot" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em', fontFamily: 'var(--font-brand)' }}>
                Razorpay <span style={{ color: 'var(--accent-cyan)' }}>AI Buyer</span>
              </h1>
              <span className="badge badge-razorpay" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                BUILDATHON 2026
              </span>
              <span className="badge badge-mandate" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                TRACK 01: AGENTIC COMMERCE
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Explainable, Mandate-Bound Autonomous Purchasing on Razorpay Rails
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          
          {/* Backend Status Pill */}
          <div className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            fontSize: '0.78rem',
            borderRadius: '9999px',
            border: backendStatus === 'connected' ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
            background: 'rgba(10, 14, 26, 0.7)'
          }}>
            {backendStatus === 'connected' ? (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981' }} className="live-dot" />
                <span style={{ color: '#10b981', fontWeight: 600 }}>Razorpay Rails Connected</span>
              </>
            ) : (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
                <span style={{ color: '#ef4444', fontWeight: 600 }}>Connecting API (Port 8000)...</span>
              </>
            )}
          </div>

          {/* Architecture & Pitch Modal Button */}
          <button 
            className="btn btn-outline btn-sm"
            onClick={onOpenArchitecture}
            title="View Pitch Architecture & State Machine"
          >
            <FileText size={15} color="var(--accent-cyan)" />
            <span>Architecture & Pitch</span>
          </button>

          {/* Merchant Catalog Modal Button */}
          <button 
            className="btn btn-outline btn-sm"
            onClick={onOpenCatalog}
            title="Inspect Live Merchant Catalogs"
          >
            <Database size={15} color="#38bdf8" />
            <span>DB Catalog</span>
          </button>

          {/* Past Sessions Drawer */}
          <button 
            className="btn btn-outline btn-sm"
            onClick={onOpenHistory}
            title="Inspect Past Audit Sessions"
          >
            <History size={15} color="#c084fc" />
            <span>Audit Sessions ({sessionCount})</span>
          </button>
        </div>

      </div>
    </header>
  );
}
