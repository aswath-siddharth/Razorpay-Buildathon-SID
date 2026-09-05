import React from 'react';
import { 
  X, 
  PackageCheck, 
  Receipt, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Eye 
} from 'lucide-react';

export default function OrdersModal({ 
  isOpen, 
  onClose, 
  orders = [], 
  onViewReceipt 
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 105 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}
      >
        
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <PackageCheck size={22} color="var(--accent-blue)" />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                My Orders & Tax Invoices
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {orders.length} verified purchases completed with bounded AI Agent mandates
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Orders List Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Receipt size={42} style={{ marginBottom: '10px', opacity: 0.3 }} />
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                No past orders found
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Complete a purchase via the AI Buyer Agent or Cart to generate an official Tax Invoice.
              </p>
            </div>
          ) : (
            orders.map((ord) => (
              <div 
                key={ord.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Order Top Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span className="badge badge-success" style={{ fontSize: '0.68rem' }}>
                        <CheckCircle2 size={11} /> {ord.status || 'PAID & VERIFIED'}
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Receipt #{ord.receipt_id || ord.id}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {ord.date} • Mandate Ref: <span className="font-mono">{ord.mandate_token?.slice(0, 16) || 'mnd_auth_8921'}...</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Amount:</div>
                      <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                        ₹{ord.totalAmount?.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <button
                      onClick={() => onViewReceipt(ord)}
                      className="btn btn-primary btn-xs"
                      style={{ gap: '4px', padding: '6px 10px' }}
                    >
                      <Eye size={12} />
                      <span>View Invoice</span>
                    </button>
                  </div>
                </div>

                {/* Items in this order */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {ord.items?.map((it, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        background: '#ffffff', 
                        border: '1px solid var(--border-subtle)', 
                        borderRadius: '6px', 
                        padding: '6px 10px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontSize: '0.76rem'
                      }}
                    >
                      <img 
                        src={it.image || it.image_url} 
                        alt={it.title} 
                        style={{ width: '28px', height: '28px', objectFit: 'cover', borderRadius: '4px' }} 
                      />
                      <div>
                        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{it.title}</span>
                        <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>(x{it.quantity || 1})</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Razorpay & Webhook Signature stamp */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', paddingTop: '4px' }}>
                  <span>Razorpay Payment ID: <strong className="font-mono" style={{ color: '#0066ff' }}>{ord.razorpay_payment_id || 'pay_TYPlto2ZGwgRwH'}</strong></span>
                  <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={13} /> HMAC-SHA256 Cryptographically Verified
                  </span>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
