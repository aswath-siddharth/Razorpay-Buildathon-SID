import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Lock 
} from 'lucide-react';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutCart,
  isCheckingOut = false
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const delivery = subtotal > 0 ? 0 : 0; // Free delivery
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + tax;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 105 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '460px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-panel)',
          background: '#ffffff'
        }}
      >
        
        {/* Cart Drawer Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={20} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Your Shopping Cart
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ready for consolidated checkout
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {cartItems.length > 0 && (
              <button 
                onClick={onClearCart}
                className="btn btn-outline btn-xs"
                style={{ fontSize: '0.72rem', color: '#dc2626', borderColor: '#fca5a5' }}
                title="Empty Cart"
              >
                Clear
              </button>
            )}
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {cartItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ShoppingBag size={42} style={{ marginBottom: '10px', opacity: 0.3 }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Your cart is empty
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Add products from the storefront or use the AI Buyer Agent to build your cart.
              </p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div 
                key={`${item.id}-${item.selectedSize || 'std'}`} 
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center'
                }}
              >
                <img 
                  src={item.image || item.image_url} 
                  alt={item.title} 
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px', background: '#ffffff', border: '1px solid var(--border-subtle)' }}
                />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '6px', marginTop: '1px' }}>
                    <span>{item.brand || item.merchant}</span>
                    <span>•</span>
                    <span>Size: {item.selectedSize || item.sizes?.[0] || 'Standard'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', border: '1px solid var(--border-medium)', borderRadius: '6px', padding: '2px 4px' }}>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px', color: 'var(--text-primary)' }}
                      >
                        <Minus size={11} />
                      </button>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                        {item.quantity || 1}
                      </span>
                      <button 
                        onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 4px', color: 'var(--text-primary)' }}
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => onRemoveItem(item.id)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                  title="Remove item"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & AI Mandate Checkout */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: '#ffffff'
          }}>
            
            {/* Price breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal ({cartItems.length} items)</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Estimated GST (5%)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery</span>
                <span style={{ color: '#059669', fontWeight: 700 }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px', marginTop: '2px' }}>
                <span>Single Invoice Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Bounded Mandate Proof Notice */}
            <div style={{
              background: '#eff5ff',
              border: '1px solid #bfdbfe',
              borderRadius: '8px',
              padding: '10px 12px',
              fontSize: '0.74rem',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px'
            }}>
              <Lock size={14} color="#0066ff" flexShrink={0} />
              <span>Consolidated Cart Mandate: 1 Razorpay Order & Single Tax Invoice generated for all items.</span>
            </div>

            {/* Proceed Button */}
            <button
              onClick={() => {
                onClose();
                onCheckoutCart();
              }}
              disabled={isCheckingOut}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.92rem', gap: '8px' }}
            >
              <Zap size={16} />
              <span>Checkout Whole Cart with AI Mandate (₹{total.toLocaleString('en-IN')})</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
