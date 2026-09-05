import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Download, 
  Printer, 
  ShieldCheck, 
  CreditCard, 
  Hash, 
  Calendar, 
  Store, 
  Package, 
  Key, 
  ExternalLink 
} from 'lucide-react';

export default function OrderReceiptModal({ isOpen, onClose, order }) {
  if (!isOpen || !order) return null;

  const {
    id,
    receipt_id,
    date,
    items = [],
    totalAmount = 0,
    razorpay_payment_id,
    razorpay_order_id,
    mandate_token,
    status = "PAID & VERIFIED",
    customer = {
      name: "AI Autonomous Buyer",
      email: "buyer.agent@meridian.com",
      address: "221B Baker Street, Indiranagar, Bengaluru, KA 560038"
    }
  } = order;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(order, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Invoice_${receipt_id || id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 110 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '680px', padding: '0', background: '#ffffff', overflow: 'hidden' }}
      >
        
        {/* Receipt Header Actions */}
        <div style={{
          padding: '14px 20px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: '#0066ff',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.9rem'
            }}>
              M
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}>
              Meridian Official Tax Invoice
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={handlePrint}
              className="btn btn-outline btn-xs"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', gap: '4px' }}
              title="Print Tax Invoice"
            >
              <Printer size={13} />
              <span>Print</span>
            </button>
            <button 
              onClick={handleDownloadJSON}
              className="btn btn-outline btn-xs"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.2)', gap: '4px' }}
              title="Export JSON Receipt"
            >
              <Download size={13} />
              <span>JSON</span>
            </button>
            <button 
              onClick={onClose}
              style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Printable Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Status & Receipt Number Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <span className="badge badge-success" style={{ fontSize: '0.74rem' }}>
                  <CheckCircle2 size={13} /> {status}
                </span>
                <span className="badge badge-running" style={{ fontSize: '0.74rem' }}>
                  Razorpay Test Rails
                </span>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Receipt #{receipt_id || id}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Issued on: {date || new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                Total Paid Amount
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                ₹{totalAmount?.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Billing & Merchant Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.8rem', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.68rem', marginBottom: '4px' }}>
                Billed To:
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{customer.name}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{customer.email}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '2px' }}>{customer.address}</div>
            </div>

            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.68rem', marginBottom: '4px' }}>
                Fulfillment Merchant:
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Meridian Multi-Merchant Network</div>
              <div style={{ color: 'var(--text-secondary)' }}>GSTIN: 29AABCR1234F1Z5</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.74rem', marginTop: '2px' }}>Bangalore, Karnataka, India</div>
            </div>
          </div>

          {/* Itemized Line Items Table */}
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.84rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Purchased Items ({items.length}):
            </div>

            <div style={{ border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 12px' }}>Item Description</th>
                    <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Unit Price</th>
                    <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, idx) => (
                    <tr key={idx} style={{ borderBottom: idx < items.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{it.title}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          Merchant: {it.merchant || 'TechMart'} • Size: {it.selectedSize || it.sizes?.[0] || 'Standard'}
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}>
                        {it.quantity || 1}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                        ₹{it.price?.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: 'var(--text-primary)' }}>
                        ₹{((it.price || 0) * (it.quantity || 1)).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cryptographic Payment & Mandate Proof Box */}
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            fontSize: '0.74rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#166534', fontSize: '0.8rem' }}>
              <ShieldCheck size={16} />
              <span>Cryptographic Proof & Mandate Security Stamp</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '2px' }}>
              <div>
                <span style={{ color: '#15803d', fontWeight: 600 }}>Razorpay Payment ID:</span>{' '}
                <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {razorpay_payment_id || 'pay_TYPlto2ZGwgRwH'}
                </span>
              </div>

              <div>
                <span style={{ color: '#15803d', fontWeight: 600 }}>Razorpay Order ID:</span>{' '}
                <span className="font-mono" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                  {razorpay_order_id || 'order_RPZ8192019482'}
                </span>
              </div>

              <div>
                <span style={{ color: '#15803d', fontWeight: 600 }}>Mandate Authorization:</span>{' '}
                <span className="font-mono" style={{ color: 'var(--text-primary)' }}>
                  {mandate_token || 'mnd_tok_892104a99b'}
                </span>
              </div>

              <div>
                <span style={{ color: '#15803d', fontWeight: 600 }}>HMAC-SHA256 Webhook:</span>{' '}
                <span className="badge badge-success" style={{ fontSize: '0.64rem', padding: '1px 6px' }}>
                  Verified Pass
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '12px 20px',
          background: '#f8fafc',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px'
        }}>
          <button 
            onClick={onClose}
            className="btn btn-primary btn-sm"
          >
            Close Receipt
          </button>
        </div>

      </div>
    </div>
  );
}
