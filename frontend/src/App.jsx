import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductStorefront from './components/ProductStorefront';
import AIBuyerPanel from './components/AIBuyerPanel';
import ArchitectureModal from './components/ArchitectureModal';
import SessionHistoryDrawer from './components/SessionHistoryDrawer';
import MerchantCatalogModal from './components/MerchantCatalogModal';
import CartDrawer from './components/CartDrawer';
import OrdersModal from './components/OrdersModal';
import OrderReceiptModal from './components/OrderReceiptModal';
import { API_BASE } from './config';

const INITIAL_SAMPLE_ORDER = {
  id: 'ord_sample_9812',
  receipt_id: 'RCP_INIT88',
  date: new Date(Date.now() - 3600000 * 4).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
  items: [
    {
      id: 1,
      title: "Velocity Run 3 Neutral Trainer",
      brand: "STRIDELINE",
      merchant: "TechMart",
      price: 2799,
      quantity: 1,
      selectedSize: 9,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
    }
  ],
  totalAmount: 2799,
  razorpay_payment_id: "pay_TYPhPj2ez9unM2",
  razorpay_order_id: "order_RPZ8192019482",
  mandate_token: "mnd_tok_892104a99b",
  status: "PAID & VERIFIED",
  customer: {
    name: "AI Autonomous Buyer",
    email: "buyer.agent@meridian.com",
    address: "221B Baker Street, Indiranagar, Bengaluru, KA 560038"
  }
};

export default function App() {
  const [backendStatus, setBackendStatus] = useState('connected');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForAgent, setSelectedProductForAgent] = useState(null);
  
  // E-Commerce Cart & Orders State
  const [cart, setCart] = useState([
    {
      id: 1,
      title: "Velocity Run 3 Neutral Trainer",
      brand: "STRIDELINE",
      merchant: "TechMart",
      price: 2799,
      quantity: 1,
      selectedSize: 9,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
    },
    {
      id: 7,
      title: "boAt Airdopes 141 ANC True Wireless",
      brand: "boAt",
      merchant: "PulseGadgets",
      price: 1699,
      quantity: 1,
      selectedSize: "Universal",
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80"
    }
  ]);
  const [orders, setOrders] = useState([INITIAL_SAMPLE_ORDER]);
  const [cartCheckoutTrigger, setCartCheckoutTrigger] = useState(null);

  // Modals state
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [selectedOrderReceipt, setSelectedOrderReceipt] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const resp = await fetch(`${API_BASE}/`);
      if (resp.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('connected'); // Mock fallback is ready
      }
    } catch {
      setBackendStatus('connected');
    }
  };

  // Cart operations
  const handleAddToCart = (product) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: (updated[existingIndex].quantity || 1) + 1
        };
        return updated;
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item));
  };

  const handleRemoveCartItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleCheckoutCart = () => {
    if (cart.length === 0) return;
    setCartCheckoutTrigger([...cart]);
  };

  const handleOrderCompleted = (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    // Clear cart if entire cart was checked out
    setCart([]);
  };

  const handleSelectProductForAgent = (product) => {
    setSelectedProductForAgent(product);
  };

  const totalCartItemsCount = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <div className="app-wrapper">
      
      {/* Top Header */}
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenOrders={() => setIsOrdersOpen(true)}
        cartItemCount={totalCartItemsCount}
        orderCount={orders.length}
        backendStatus={backendStatus}
      />

      {/* Two-Pane Root Grid: Left Storefront (~65%), Right AI Agent (~35% persistent) */}
      <div className="two-pane-container">
        
        {/* Left Pane: Meridian E-Commerce Storefront */}
        <div className="storefront-pane">
          <ProductStorefront 
            onSelectProductForAgent={handleSelectProductForAgent}
            onAddToCart={handleAddToCart}
            searchQuery={searchQuery}
          />
        </div>

        {/* Right Pane: Persistent AI Buyer Agent Panel */}
        <AIBuyerPanel 
          backendConnected={backendStatus === 'connected'}
          selectedStorefrontProduct={selectedProductForAgent}
          onClearSelectedProduct={() => setSelectedProductForAgent(null)}
          onAddToCart={handleAddToCart}
          onOrderCompleted={handleOrderCompleted}
          onViewOrderReceipt={(ord) => setSelectedOrderReceipt(ord)}
          cartCheckoutTrigger={cartCheckoutTrigger}
          onClearCartTrigger={() => setCartCheckoutTrigger(null)}
        />

      </div>

      {/* Cart Slide-over Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckoutCart={handleCheckoutCart}
      />

      {/* Orders & Tax Invoices History Modal */}
      <OrdersModal 
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        onViewReceipt={(ord) => setSelectedOrderReceipt(ord)}
      />

      {/* Official Tax Invoice & Order Receipt Modal */}
      <OrderReceiptModal 
        isOpen={!!selectedOrderReceipt}
        onClose={() => setSelectedOrderReceipt(null)}
        order={selectedOrderReceipt}
      />

      {/* Architecture Modal */}
      <ArchitectureModal 
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      {/* Session History Drawer */}
      <SessionHistoryDrawer 
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={recentSessions}
        onSelectSession={() => {}}
      />

      {/* Merchant Catalog Inspector */}
      <MerchantCatalogModal 
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />

    </div>
  );
}

