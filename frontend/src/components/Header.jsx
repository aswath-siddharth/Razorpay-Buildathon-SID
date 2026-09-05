import React from 'react';
import { 
  Search, 
  ShieldCheck, 
  Layers, 
  History, 
  ShoppingBag,
  PackageCheck,
  CheckCircle2,
  Lock,
  Receipt
} from 'lucide-react';

export default function Header({ 
  searchQuery, 
  onSearchChange,
  onOpenArchitecture,
  onOpenCart,
  onOpenOrders,
  cartItemCount = 0,
  orderCount = 0,
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
      </div>

      {/* Center: Global Search Bar */}
      <div style={{ flex: 1, maxWidth: '500px', margin: '0 20px' }}>
        <div style={{ position: 'relative' }}>
          <Search 
            size={16} 
            color="var(--text-muted)" 
            style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} 
          />
          <input
            type="text"
            placeholder="Search shoes, audio, bags, smartwatches..."
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

      {/* Right: Actions (Cart, Orders, Architecture, Status) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        
        {/* Shopping Cart Button */}
        <button
          onClick={onOpenCart}
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.8rem', gap: '6px', position: 'relative' }}
          title="Open Shopping Cart"
        >
          <ShoppingBag size={15} />
          <span>Cart</span>
          {cartItemCount > 0 && (
            <span style={{
              background: '#ffffff',
              color: '#0066ff',
              borderRadius: '9999px',
              padding: '1px 6px',
              fontSize: '0.68rem',
              fontWeight: 800,
              marginLeft: '2px'
            }}>
              {cartItemCount}
            </span>
          )}
        </button>

        {/* My Orders / Invoices Button */}
        <button
          onClick={onOpenOrders}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.8rem', gap: '5px' }}
          title="View Past Orders & Tax Invoices"
        >
          <Receipt size={14} color="var(--accent-blue)" />
          <span>My Orders</span>
          {orderCount > 0 && (
            <span className="badge badge-running" style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
              {orderCount}
            </span>
          )}
        </button>

        {/* Architecture Modal */}
        <button
          onClick={onOpenArchitecture}
          className="btn btn-outline btn-sm"
          style={{ fontSize: '0.78rem', gap: '4px' }}
          title="Inspect End-to-End System Architecture"
        >
          <Layers size={14} />
          <span>Architecture</span>
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
