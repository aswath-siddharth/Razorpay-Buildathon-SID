import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Zap, 
  Star, 
  Truck, 
  Box, 
  RefreshCw, 
  Plus, 
  Minus, 
  Tag, 
  Check, 
  AlertCircle 
} from 'lucide-react';

const INITIAL_PRODUCTS = [
  {
    id: 1,
    title: "Velocity Run 3 Neutral Trainer",
    brand: "STRIDELINE",
    category: "Running",
    price: 2799,
    originalPrice: 3999,
    discount: "30% off",
    rating: 4.4,
    reviews: "2,184",
    stock: 12,
    eta: "Tomorrow",
    sizes: [7, 8, 9, 10, 11],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 2,
    title: "TrailGrip Pro Off-Road Runner",
    brand: "STRIDELINE",
    category: "Running",
    price: 3499,
    originalPrice: 4599,
    discount: "24% off",
    rating: 4.6,
    reviews: "908",
    stock: 5,
    eta: "in 2 days",
    sizes: [8, 9, 10],
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 3,
    title: "CloudGlide Ultra Sprint Shoes",
    brand: "AEROSTEP",
    category: "Running",
    price: 2899,
    originalPrice: 3499,
    discount: "17% off",
    rating: 4.5,
    reviews: "1,420",
    stock: 9,
    eta: "Tomorrow",
    sizes: [7, 8, 9, 10],
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 4,
    title: "AirMatrix Flow Road Runner",
    brand: "AEROSTEP",
    category: "Running",
    price: 2599,
    originalPrice: 3699,
    discount: "29% off",
    rating: 4.3,
    reviews: "640",
    stock: 8,
    eta: "Tomorrow",
    sizes: [8, 9, 10, 11],
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 5,
    title: "Apex Street Classic Low Sneakers",
    brand: "URBANCRAFT",
    category: "Sneakers",
    price: 2499,
    originalPrice: 3299,
    discount: "24% off",
    rating: 4.7,
    reviews: "3,110",
    stock: 15,
    eta: "Tomorrow",
    sizes: [7, 8, 9, 10],
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 6,
    title: "SoundCore Pro ANC Wireless Audio",
    brand: "SONICPRO",
    category: "Audio",
    price: 2999,
    originalPrice: 4999,
    discount: "40% off",
    rating: 4.8,
    reviews: "4,502",
    stock: 14,
    eta: "Tomorrow",
    sizes: ["Standard"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 7,
    title: "AeroSport Lightweight Hydration Pack",
    brand: "URBANCRAFT",
    category: "Bags",
    price: 1899,
    originalPrice: 2499,
    discount: "24% off",
    rating: 4.5,
    reviews: "780",
    stock: 11,
    eta: "in 2 days",
    sizes: ["20L"],
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 8,
    title: "Chronos GPS Smart Performance Watch",
    brand: "HOROLOGE",
    category: "Watches",
    price: 2999,
    originalPrice: 4299,
    discount: "30% off",
    rating: 4.7,
    reviews: "1,890",
    stock: 6,
    eta: "Tomorrow",
    sizes: ["44mm"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  }
];

export default function ProductStorefront({ 
  onSelectProductForAgent,
  isAgentRunning = false,
  searchQuery = '',
}) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All products');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [stockUpdatingId, setStockUpdatingId] = useState(null);

  const categories = [
    { id: 'All products', label: 'All products' },
    { id: 'Running', label: 'Running' },
    { id: 'Sneakers', label: 'Sneakers' },
    { id: 'Audio', label: 'Audio' },
    { id: 'Bags', label: 'Bags' },
    { id: 'Watches', label: 'Watches' },
  ];

  const priceRanges = [
    { id: 'all', label: 'All prices' },
    { id: 'under_2000', label: 'Under ₹2,000' },
    { id: '2000_3000', label: '₹2,000 – ₹3,000' },
    { id: '3000_5000', label: '₹3,000 – ₹5,000' },
  ];

  const handleStockAdjust = (productId, delta) => {
    setStockUpdatingId(productId);
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    }));
    setTimeout(() => setStockUpdatingId(null), 300);
  };

  const handleSetZeroStock = (productId) => {
    setStockUpdatingId(productId);
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: 0 } : p));
    setTimeout(() => setStockUpdatingId(null), 300);
  };

  const filteredProducts = products.filter(item => {
    const matchesCategory = selectedCategory === 'All products' || item.category === selectedCategory;
    
    let matchesPrice = true;
    if (selectedPriceRange === 'under_2000') {
      matchesPrice = item.price < 2000;
    } else if (selectedPriceRange === '2000_3000') {
      matchesPrice = item.price >= 2000 && item.price <= 3000;
    } else if (selectedPriceRange === '3000_5000') {
      matchesPrice = item.price > 3000 && item.price <= 5000;
    }

    const matchesSearch = !searchQuery.trim() || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesPrice && matchesSearch;
  });

  return (
    <div className="storefront-layout">
      
      {/* Left Sidebar: Categories & Price Filters */}
      <aside>
        
        {/* Categories Section */}
        <div className="sidebar-section">
          <div className="sidebar-title">Categories</div>
          <div className="sidebar-menu">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`sidebar-item ${selectedCategory === cat.id ? 'active' : ''}`}
              >
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Section */}
        <div className="sidebar-section">
          <div className="sidebar-title">Price</div>
          <div className="sidebar-menu">
            {priceRanges.map(pr => (
              <button
                key={pr.id}
                onClick={() => setSelectedPriceRange(pr.id)}
                className={`sidebar-item ${selectedPriceRange === pr.id ? 'active' : ''}`}
              >
                <span>{pr.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bounded Agent Indicator info card */}
        <div style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          marginTop: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '4px' }}>
            <Sparkles size={13} />
            <span>Agent-Ready Catalog</span>
          </div>
          Every product exposes structured machine-readable constraints and single-use payment bounds.
        </div>

      </aside>

      {/* Main Product Grid Area */}
      <main>
        
        {/* Header Title & Subtitle matching Meridian reference image */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {selectedCategory}
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            {filteredProducts.length} items · agent-ready checkout enabled on every listing
          </p>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <AlertCircle size={36} style={{ marginBottom: '10px', opacity: 0.4 }} />
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)' }}>No items match your filter.</p>
            <button 
              onClick={() => { setSelectedCategory('All products'); setSelectedPriceRange('all'); }}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '12px' }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= 5;

              return (
                <div key={product.id} className="meridian-product-card">
                  
                  {/* Top Image Box */}
                  <div className="product-img-wrapper">
                    <span className="discount-badge">
                      {product.discount}
                    </span>

                    <img 
                      src={product.image} 
                      alt={product.title} 
                      className="product-img"
                      loading="lazy"
                    />
                  </div>

                  {/* Product Details & Actions */}
                  <div className="product-info-box">
                    
                    <div>
                      <div className="product-brand">{product.brand}</div>
                      <h3 className="product-title">{product.title}</h3>

                      {/* Rating row */}
                      <div className="rating-row">
                        <span className="rating-stars">
                          {product.rating} <Star size={12} fill="#f59e0b" />
                        </span>
                        <span className="rating-count">
                          {product.reviews} ratings
                        </span>
                      </div>

                      {/* Price row */}
                      <div className="price-row">
                        <span className="price-current">
                          ₹{product.price.toLocaleString('en-IN')}
                        </span>
                        <span className="price-original">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Stock & ETA Status */}
                      <div className="meta-status-row">
                        <span className={isOutOfStock ? 'stock-out' : isLowStock ? 'stock-low' : 'stock-in'}>
                          {isOutOfStock ? 'OUT OF STOCK' : isLowStock ? `ONLY ${product.stock} LEFT` : 'IN STOCK'}
                        </span>
                        <span className="delivery-eta">
                          <Truck size={13} /> {product.eta}
                        </span>
                      </div>

                      {/* Sizes Row */}
                      <div className="sizes-row">
                        {Array.isArray(product.sizes) && product.sizes.map((s, idx) => (
                          <span key={idx} className="size-pill">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Action: Buy with AI Agent */}
                    <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      <button
                        onClick={() => onSelectProductForAgent(product)}
                        disabled={isAgentRunning || isOutOfStock}
                        className="btn btn-primary btn-sm"
                        style={{ width: '100%', gap: '6px' }}
                        title="Dispatch AI Agent with bounded mandate for this item"
                      >
                        <Zap size={14} />
                        <span>Buy with AI Agent</span>
                      </button>

                      {/* Live Stock Testing Controls for Judges */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        background: 'var(--bg-subtle)',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Box size={11} /> Stock ({product.stock}):
                        </span>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <button
                            onClick={() => handleStockAdjust(product.id, -1)}
                            disabled={product.stock <= 0}
                            className="btn btn-outline btn-xs"
                            style={{ padding: '2px 5px', fontSize: '0.68rem' }}
                            title="Decrease Stock"
                          >
                            <Minus size={10} />
                          </button>
                          <button
                            onClick={() => handleStockAdjust(product.id, 5)}
                            className="btn btn-outline btn-xs"
                            style={{ padding: '2px 5px', fontSize: '0.68rem' }}
                            title="Add 5 items"
                          >
                            <Plus size={10} />
                          </button>
                          <button
                            onClick={() => handleSetZeroStock(product.id)}
                            disabled={product.stock === 0}
                            className="btn btn-outline btn-xs"
                            style={{ padding: '2px 5px', fontSize: '0.68rem', color: '#dc2626' }}
                            title="Simulate stockout failure live"
                          >
                            Zero
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

      </main>

    </div>
  );
}
