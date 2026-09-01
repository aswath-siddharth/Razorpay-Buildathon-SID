import React, { useState, useEffect } from 'react';
import { X, Database, Search, RefreshCw, Star, Tag, Truck, Box } from 'lucide-react';

export default function MerchantCatalogModal({ isOpen, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCatalog();
    }
  }, [isOpen]);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/products');
      if (resp.ok) {
        const data = await resp.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Failed to load catalog", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const filtered = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.merchant?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(3, 7, 18, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '20px',
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '900px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
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
            <Database size={20} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                Synthetic Multi-Merchant Catalog
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Agent-readable structured inventory across test merchants
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

        {/* Search & Refresh */}
        <div style={{ padding: '14px 24px', display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search products or merchants..."
              className="input-text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
          <button onClick={fetchCatalog} className="btn btn-outline" title="Refresh Live Database">
            <RefreshCw size={16} className={loading ? "spinner" : ""} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Product Grid */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <RefreshCw size={24} className="spinner" color="var(--accent-cyan)" />
              <p style={{ marginTop: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Loading catalog...</p>
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>No products match your search.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '14px' }}>
              {filtered.map((item) => (
                <div key={item.id} className="glass-panel" style={{ padding: '14px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>
                      ID #{item.id}
                    </span>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>
                      ₹{item.price?.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                    {item.title}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-cyan)', marginBottom: '10px' }}>
                    Merchant ID: {item.merchant_id}
                  </div>

                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Box size={13} color={item.stock > 0 ? "#10b981" : "#ef4444"} />
                      <span>Stock: <strong style={{ color: item.stock > 0 ? "#10b981" : "#ef4444" }}>{item.stock} units</strong></span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Truck size={13} color="#38bdf8" />
                      <span>ETA: {item.delivery_eta}</span>
                    </div>
                    {item.attributes?.size && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Tag size={13} color="#c084fc" />
                        <span>Size: {item.attributes.size}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
