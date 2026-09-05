import React, { useState, useEffect } from 'react';
import { X, Database, Search, RefreshCw, Star, Tag, Truck, Box, Plus, Minus, Check } from 'lucide-react';

export default function MerchantCatalogModal({ isOpen, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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

  const handleUpdateStock = async (productId, newStock) => {
    setUpdatingId(productId);
    try {
      const resp = await fetch(`http://localhost:8000/products/${productId}/stock?stock=${Math.max(0, newStock)}`, {
        method: 'PATCH',
      });
      if (resp.ok) {
        const updated = await resp.json();
        setProducts(prev => prev.map(p => p.id === productId ? updated : p));
      }
    } catch (e) {
      console.error("Failed to update stock", e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isOpen) return null;

  const filtered = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    (p.attributes?.brand || '').toLowerCase().includes(search.toLowerCase())
  );

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
        maxWidth: '1020px',
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
            <Database size={22} color="var(--accent-cyan)" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Multi-Merchant Database Catalog ({products.length} Items)
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Live structured database inventory accessible to AI Buyer Agent with real-time stock simulation
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

        {/* Search & Refresh Bar */}
        <div style={{ padding: '14px 24px', display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search by title, brand, or category..."
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
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <RefreshCw size={28} className="spinner" color="var(--accent-cyan)" />
              <p style={{ marginTop: '10px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Loading catalog images and records...</p>
            </div>
          ) : filtered.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No products match your search.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {filtered.map((item) => {
                const img = item.image_url || item.attributes?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80';
                const isUpdating = updatingId === item.id;

                return (
                  <div key={item.id} className="glass-panel" style={{ padding: '14px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* Thumbnail & Badges */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <div style={{ width: '80px', height: '70px', borderRadius: '8px', overflow: 'hidden', background: '#eef4ff', flexShrink: 0 }}>
                        <img src={img} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <span className="badge badge-info" style={{ fontSize: '0.68rem', padding: '1px 6px' }}>
                            ID #{item.id}
                          </span>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            Rs {item.price?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.title}
                        </h4>
                        <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)' }}>
                          Merchant ID: {item.merchant_id}
                        </div>
                      </div>
                    </div>

                    {/* Stock & ETA Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(0, 102, 255, 0.04)', padding: '6px 10px', borderRadius: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Truck size={13} color="var(--accent-cyan)" />
                        <span>ETA: {item.delivery_eta}</span>
                      </div>
                      
                      {/* Stock Adjuster */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <button
                          onClick={() => handleUpdateStock(item.id, item.stock - 1)}
                          disabled={item.stock <= 0 || isUpdating}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '4px',
                            width: '18px',
                            height: '18px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          <Minus size={10} />
                        </button>
                        <span style={{ fontWeight: 700, color: item.stock > 0 ? '#10b981' : '#ef4444' }}>
                          {item.stock}
                        </span>
                        <button
                          onClick={() => handleUpdateStock(item.id, item.stock + 5)}
                          disabled={isUpdating}
                          style={{
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: 'none',
                            borderRadius: '4px',
                            width: '18px',
                            height: '18px',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={10} />
                        </button>
                        <button
                          onClick={() => handleUpdateStock(item.id, 0)}
                          disabled={item.stock === 0 || isUpdating}
                          style={{
                            background: 'rgba(239, 68, 68, 0.2)',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0 5px',
                            fontSize: '0.65rem',
                            color: '#f87171',
                            cursor: 'pointer',
                          }}
                        >
                          0
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
