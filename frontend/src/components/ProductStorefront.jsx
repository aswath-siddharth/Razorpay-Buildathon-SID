import React, { useState } from 'react';
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
  // RUNNING
  {
    id: 1,
    title: "Velocity Run 3 Neutral Trainer",
    brand: "STRIDELINE",
    category: "Running",
    merchant: "TechMart",
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
    merchant: "QuickBuy",
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
    merchant: "ShopSphere",
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
    merchant: "QuickBuy",
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
    id: 17,
    title: "ZoomX Marathon Elite VaporFly",
    brand: "STRIDELINE",
    category: "Running",
    merchant: "TechMart",
    price: 3899,
    originalPrice: 4999,
    discount: "22% off",
    rating: 4.9,
    reviews: "3,210",
    stock: 7,
    eta: "Tomorrow",
    sizes: [8, 9, 10, 11],
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 18,
    title: "Infinity React Lightweight Racer",
    brand: "AEROSTEP",
    category: "Running",
    merchant: "PulseGadgets",
    price: 2299,
    originalPrice: 3199,
    discount: "28% off",
    rating: 4.5,
    reviews: "820",
    stock: 14,
    eta: "in 2 days",
    sizes: [7, 8, 9, 10],
    image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=600&q=80"
  },

  // SNEAKERS
  {
    id: 5,
    title: "Apex Street Classic Low Sneakers",
    brand: "URBANCRAFT",
    category: "Sneakers",
    merchant: "ShopSphere",
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
    id: 9,
    title: "Air Retro High Top Street Sneaker",
    brand: "AEROSTEP",
    category: "Sneakers",
    merchant: "TechMart",
    price: 3199,
    originalPrice: 4199,
    discount: "23% off",
    rating: 4.6,
    reviews: "1,290",
    stock: 8,
    eta: "in 2 days",
    sizes: [8, 9, 10],
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 19,
    title: "Urban Canvas Low Court Kicks",
    brand: "URBANCRAFT",
    category: "Sneakers",
    merchant: "QuickBuy",
    price: 1999,
    originalPrice: 2799,
    discount: "28% off",
    rating: 4.5,
    reviews: "1,850",
    stock: 11,
    eta: "Tomorrow",
    sizes: [7, 8, 9, 10, 11],
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 20,
    title: "Vintage Suede Minimalist Classic",
    brand: "STRIDELINE",
    category: "Sneakers",
    merchant: "ShopSphere",
    price: 2899,
    originalPrice: 3699,
    discount: "21% off",
    rating: 4.8,
    reviews: "940",
    stock: 6,
    eta: "Tomorrow",
    sizes: [8, 9, 10],
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80"
  },

  // AUDIO
  {
    id: 6,
    title: "SoundCore Pro ANC Wireless Audio",
    brand: "SONICPRO",
    category: "Audio",
    merchant: "ShopSphere",
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
    id: 10,
    title: "boAt Airdopes 141 ANC True Wireless",
    brand: "boAt",
    category: "Audio",
    merchant: "PulseGadgets",
    price: 1699,
    originalPrice: 2499,
    discount: "32% off",
    rating: 4.5,
    reviews: "3,400",
    stock: 20,
    eta: "Tomorrow",
    sizes: ["Universal"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 11,
    title: "JBL Tune 510BT Pure Bass On-Ear",
    brand: "JBL",
    category: "Audio",
    merchant: "PulseGadgets",
    price: 2499,
    originalPrice: 3499,
    discount: "28% off",
    rating: 4.6,
    reviews: "1,820",
    stock: 16,
    eta: "in 2 days",
    sizes: ["Standard"],
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 12,
    title: "Sony WH-CH520 Wireless Bluetooth",
    brand: "Sony",
    category: "Audio",
    merchant: "TechMart",
    price: 2999,
    originalPrice: 4499,
    discount: "33% off",
    rating: 4.8,
    reviews: "2,100",
    stock: 10,
    eta: "Tomorrow",
    sizes: ["Standard"],
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 21,
    title: "StudioBeat Studio Pro High-Res Headset",
    brand: "SONICPRO",
    category: "Audio",
    merchant: "ShopSphere",
    price: 3699,
    originalPrice: 5299,
    discount: "30% off",
    rating: 4.9,
    reviews: "1,150",
    stock: 8,
    eta: "Tomorrow",
    sizes: ["Standard"],
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=600&q=80"
  },

  // WATCHES
  {
    id: 8,
    title: "Chronos GPS Smart Performance Watch",
    brand: "HOROLOGE",
    category: "Watches",
    merchant: "PulseGadgets",
    price: 2999,
    originalPrice: 4299,
    discount: "30% off",
    rating: 4.7,
    reviews: "1,890",
    stock: 6,
    eta: "Tomorrow",
    sizes: ["44mm"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 13,
    title: "Noise ColorFit Pro 5 AMOLED Smartwatch",
    brand: "Noise",
    category: "Watches",
    merchant: "PulseGadgets",
    price: 2799,
    originalPrice: 4199,
    discount: "33% off",
    rating: 4.7,
    reviews: "1,490",
    stock: 18,
    eta: "Tomorrow",
    sizes: ["45mm"],
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 14,
    title: "Fire-Boltt Gladiator BT Calling Watch",
    brand: "Fire-Boltt",
    category: "Watches",
    merchant: "TechMart",
    price: 2199,
    originalPrice: 3299,
    discount: "33% off",
    rating: 4.4,
    reviews: "980",
    stock: 12,
    eta: "Tomorrow",
    sizes: ["1.96 Inch"],
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 22,
    title: "Amazfit Bip 5 Ultra Smartwatch",
    brand: "Amazfit",
    category: "Watches",
    merchant: "PulseGadgets",
    price: 3499,
    originalPrice: 4699,
    discount: "25% off",
    rating: 4.7,
    reviews: "720",
    stock: 9,
    eta: "in 2 days",
    sizes: ["1.91 Inch"],
    image: "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 23,
    title: "Titan Apex Rugged Outdoor Smartwatch",
    brand: "HOROLOGE",
    category: "Watches",
    merchant: "ShopSphere",
    price: 3799,
    originalPrice: 5499,
    discount: "31% off",
    rating: 4.8,
    reviews: "1,630",
    stock: 5,
    eta: "Tomorrow",
    sizes: ["46mm"],
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80"
  },

  // BAGS
  {
    id: 7,
    title: "AeroSport Lightweight Hydration Pack",
    brand: "URBANCRAFT",
    category: "Bags",
    merchant: "QuickBuy",
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
    id: 15,
    title: "UrbanShield Commuter Tech Backpack",
    brand: "URBANCRAFT",
    category: "Bags",
    merchant: "ShopSphere",
    price: 2499,
    originalPrice: 3499,
    discount: "28% off",
    rating: 4.7,
    reviews: "1,120",
    stock: 14,
    eta: "Tomorrow",
    sizes: ["28L"],
    image: "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 16,
    title: "Apex Explorer 45L Travel Duffel",
    brand: "STRIDELINE",
    category: "Bags",
    merchant: "TechMart",
    price: 2899,
    originalPrice: 3999,
    discount: "27% off",
    rating: 4.6,
    reviews: "890",
    stock: 9,
    eta: "Tomorrow",
    sizes: ["45L"],
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: 24,
    title: "CityVibe Urban Crossbody Sling Pack",
    brand: "URBANCRAFT",
    category: "Bags",
    merchant: "QuickBuy",
    price: 1499,
    originalPrice: 2199,
    discount: "31% off",
    rating: 4.4,
    reviews: "640",
    stock: 16,
    eta: "Tomorrow",
    sizes: ["10L"],
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&q=80"
  }
];

export default function ProductStorefront({ 
  onSelectProductForAgent,
  onAddToCart = () => {},
  isAgentRunning = false,
  searchQuery = '',
}) {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState('All products');
  const [selectedPriceRange, setSelectedPriceRange] = useState('all');
  const [addedItemIds, setAddedItemIds] = useState({});

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
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const newStock = Math.max(0, p.stock + delta);
        return { ...p, stock: newStock };
      }
      return p;
    }));
  };

  const handleSetZeroStock = (productId) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: 0 } : p));
  };

  const handleAddWithFeedback = (product) => {
    onAddToCart(product);
    setAddedItemIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
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
              const isAdded = !!addedItemIds[product.id];

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

                    {/* Actions: Add to Cart + Buy with AI Agent */}
                    <div style={{ marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleAddWithFeedback(product)}
                          disabled={isOutOfStock}
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, gap: '4px', fontSize: '0.78rem' }}
                          title="Add item to shopping cart"
                        >
                          {isAdded ? <Check size={14} color="#10b981" /> : <ShoppingBag size={14} />}
                          <span>{isAdded ? 'Added!' : 'Add to Cart'}</span>
                        </button>

                        <button
                          onClick={() => onSelectProductForAgent(product)}
                          disabled={isAgentRunning || isOutOfStock}
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1, gap: '4px', fontSize: '0.78rem' }}
                          title="Dispatch AI Agent with bounded mandate for this item"
                        >
                          <Zap size={14} />
                          <span>Buy with AI</span>
                        </button>
                      </div>

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
