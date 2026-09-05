import React from 'react';
import { 
  Search, 
  ShieldCheck, 
  Layers, 
  History, 
  Database,
  ExternalLink,
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function Header({ 
  searchQuery, 
  onSearchChange,
  onOpenArchitecture,
  onOpenCatalog,
  onOpenHistory,
  backendStatus = 'connected'
}) {
  return (
    <header style={{
      height: '64px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
    }}>
      
      {/* Left: Brand Logo & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* Meridian Logo (matching reference image: black rounded box + 'M' + Meridian) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <div style={{
            width: '32px',
            height: '32px',
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            fontSize: '1.05rem',
            fontFamily: 'var(--font-heading)'
          }}>
            M
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            fontFamily: 'var(--font-heading)'
          }}>
            Meridian
          </span>
        </div>

        {/* Razorpay Track Badge */}
        <span className="badge badge-black" style={{ fontSize: '0.68rem', display: 'none' }}>
          TRACK 01
        </span>
      </div>

      {/* Center: Global Search Bar */}
      <div style={{ flex: 1, maxWidth: '540px', margin: '0 24px' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            size={16} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input
            type="text"
            placeholder="Search shoes, audio, bags..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-text"
            style={{
              paddingLeft: '38px',
              paddingRight: '14px',
              paddingTop: '8px',
              paddingBottom: '8px',
              fontSize: '0.86rem',
              borderRadius: 'var(--radius-pill)',
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)'
            }}
          />
        </div>
      </div>

      {/* Right: Actions & Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Architecture Diagram Modal */}
        <button
          onClick={onOpenArchitecture}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.78rem', gap: '5px' }}
          title="Inspect End-to-End System Architecture"
        >
          <Layers size={14} color="var(--accent-blue)" />
          <span style={{ display: 'inline' }}>Architecture</span>
        </button>

        {/* Audit Sessions History */}
        <button
          onClick={onOpenHistory}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.78rem', gap: '5px' }}
          title="View Historical Audit Logs"
        >
          <History size={14} />
          <span>Audit Logs</span>
        </button>

        {/* Currency & Test Mode Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'var(--bg-subtle)',
          padding: '5px 10px',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.74rem',
          fontWeight: 700,
          color: 'var(--text-secondary)'
        }}>
          <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <CheckCircle2 size={12} /> Test Mode
          </span>
          <span>•</span>
          <span>₹ INR</span>
        </div>

      </div>

    </header>
  );
}
