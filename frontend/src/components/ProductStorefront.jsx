import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Zap, 
  Star, 
  Truck, 
  Box, 
  Filter, 
  RefreshCw, 
  Plus, 
  Minus, 
  AlertCircle,
  Tag,
  ShieldCheck,
  Check
} from 'lucide-react';

export default function ProductStorefront({ onSelectProductForAgent, isAgentRunning }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [stockUpdatingId, setStockUpdatingId] = useState(null);
  const [stockSuccessId, setStockSuccessId] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/products');
      if (resp.ok) {
        const data = await resp.json();
        setProducts(data);
      }
    } catch (e) {
      console.error("Failed to load storefront products", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    setStockUpdatingId(productId);
    try {
      const resp = await fetch(`http://localhost:8000/products/${productId}/stock?stock=${Math.max(0, newStock)}`, {
        method: 'PATCH',
      });
      if (resp.ok) {
        const updated = await resp.json();
        setProducts(prev => prev.map(p => p.id === productId ? updated : p));
        setStockSuccessId(productId);
        setTimeout(() => setStockSuccessId(null), 1800);
      }
    } catch (e) {
      console.error("Failed to update stock", e);
    } finally {
      setStockUpdatingId(null);
    }
  };

  const categories = [
    { id: 'ALL', label: '🔥 All Drops' },
    { id: 'running_shoes', label: '👟 Running Shoes' },
    { id: 'headphones', label: '🎧 Wireless Audio' },
    { id: 'smartwatch', label: '⌚ Smartwatches' },
  ];

  const filteredProducts = products.filter(item => {
    const itemCat = item.attributes?.category || 'running_shoes';
    const matchesCat = activeCategory === 'ALL' || itemCat === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.attributes?.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '28px' }}>
      
      {/* Storefront Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.2) 0%, rgba(0, 186, 242, 0.2) 100%)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <ShoppingBag size={22} color="var(--accent-cyan)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }}>
                Live Autonomous Storefront
              </h2>
              <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
                {products.length} Verified Products
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Real-time multi-merchant inventory with instant AI agent dispatch & stock test controls
            </p>
          </div>
        </div>

        {/* Search Bar & Refresh */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative', width: '240px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search products or brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-text"
              style={{ paddingLeft: '34px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '8px', fontSize: '0.82rem' }}
            />
          </div>
          <button 
            onClick={fetchProducts} 
            className="btn btn-outline btn-sm"
            title="Refresh Live DB Catalog"
          >
            <RefreshCw size={14} className={loading ? "spinner" : ""} />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`quick-chip ${activeCategory === cat.id ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <RefreshCw size={32} className="spinner" color="var(--accent-cyan)" />
          <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Loading merchant catalogs & product images...
          </p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <AlertCircle size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
          <p>No products match your search or filter criteria.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '18px',
        }}>
          {filteredProducts.map((item) => {
            const itemImage = item.image_url || item.attributes?.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80';
            const brand = item.attributes?.brand || 'Brand';
            const rating = item.attributes?.rating || 4.7;
            const reviewCount = item.attributes?.review_count || 320;
            const sizes = item.attributes?.size || [8, 9, 10];
            const isOutOfStock = item.stock <= 0;
            const isUpdating = stockUpdatingId === item.id;
            const isSuccess = stockSuccessId === item.id;

            return (
              <div key={item.id} className="product-card">
                
                {/* Product Image Box */}
                <div className="product-image-container">
                  <img 
                    src={itemImage} 
                    alt={item.title} 
                    className="product-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80';
                    }}
                  />
                  <div className="product-image-overlay" />
                  
                  {/* Floating Brand & ID Badge */}
                  <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                    <span style={{
                      background: 'rgba(8, 12, 22, 0.85)',
                      backdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 9px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255, 255, 255, 0.12)'
                    }}>
                      {brand}
                    </span>
                    <span style={{
                      background: 'rgba(0, 186, 242, 0.2)',
                      backdropFilter: 'blur(8px)',
                      color: 'var(--accent-cyan)',
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      padding: '3px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(0, 186, 242, 0.3)'
                    }}>
                      #{item.id}
                    </span>
                  </div>

                  {/* Stock Status Pill */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                    <span className={`badge ${isOutOfStock ? 'badge-fail' : item.stock < 5 ? 'badge-retry' : 'badge-success'}`} style={{ fontSize: '0.68rem' }}>
                      {isOutOfStock ? 'Out of Stock' : `${item.stock} in stock`}
                    </span>
                  </div>

                  {/* Price Banner Overlay */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '12px', right: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>
                        ₹{item.price?.toLocaleString('en-IN')}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                        ₹{(item.price * 1.35).toFixed(0)}
                      </span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                      26% OFF
                    </span>
                  </div>
                </div>

                {/* Product Content */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                  
                  <div>
                    {/* Title */}
                    <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', marginBottom: '8px', lineHeight: 1.35 }}>
                      {item.title}
                    </h3>

                    {/* Meta Rating & ETA */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        <span style={{ color: '#ffffff', fontWeight: 700 }}>{rating}</span>
                        <span style={{ color: 'var(--text-muted)' }}>({reviewCount})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
                        <Truck size={13} />
                        <span>ETA: {item.delivery_eta}</span>
                      </div>
                    </div>

                    {/* Sizes / Specs */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sizes:</span>
                      {Array.isArray(sizes) && sizes.slice(0, 4).map((s, idx) => (
                        <span key={idx} style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '4px',
                          padding: '1px 6px',
                          fontSize: '0.7rem',
                          color: 'var(--text-primary)',
                          fontWeight: 600,
                        }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar: Buy with AI + Live Stock Adjuster */}
                  <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* AI Agent Purchase CTA */}
                    <button
                      onClick={() => onSelectProductForAgent(item)}
                      disabled={isAgentRunning}
                      className="btn btn-cyan btn-sm"
                      style={{ width: '100%', gap: '6px' }}
                      title="Dispatch AI Agent to purchase this product with mandate bounds"
                    >
                      <Zap size={14} />
                      <span>Buy with AI Agent</span>
                    </button>

                    {/* Live Stock Testing Controls for Judges */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(10, 14, 26, 0.6)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.72rem',
                    }}>
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Box size={12} /> Test Stock:
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleUpdateStock(item.id, item.stock - 1)}
                          disabled={item.stock <= 0 || isUpdating}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: 'none',
                            borderRadius: '4px',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            cursor: 'pointer',
                          }}
                          title="Decrease Stock (Test Failure)"
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{ fontWeight: 700, minWidth: '18px', textAlign: 'center', color: isSuccess ? '#10b981' : '#ffffff' }}>
                          {item.stock}
                        </span>
                        <button
                          onClick={() => handleUpdateStock(item.id, item.stock + 5)}
                          disabled={isUpdating}
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: 'none',
                            borderRadius: '4px',
                            width: '20px',
                            height: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            cursor: 'pointer',
                          }}
                          title="Increase Stock (+5)"
                        >
                          <Plus size={11} />
                        </button>
                        <button
                          onClick={() => handleUpdateStock(item.id, 0)}
                          disabled={item.stock === 0 || isUpdating}
                          style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '4px',
                            padding: '1px 6px',
                            fontSize: '0.68rem',
                            color: '#f87171',
                            fontWeight: 600,
                            cursor: 'pointer',
                            marginLeft: '4px',
                          }}
                          title="Set stock to 0 to simulate real out-of-stock mid-flow"
                        >
                          Make 0
                        </button>
                      </div>
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
