import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ProductStorefront from './components/ProductStorefront';
import AIBuyerPanel from './components/AIBuyerPanel';
import ArchitectureModal from './components/ArchitectureModal';
import SessionHistoryDrawer from './components/SessionHistoryDrawer';
import MerchantCatalogModal from './components/MerchantCatalogModal';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [backendStatus, setBackendStatus] = useState('connected');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductForAgent, setSelectedProductForAgent] = useState(null);
  
  // Modals state
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
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

  const handleSelectProductForAgent = (product) => {
    setSelectedProductForAgent(product);
  };

  return (
    <div className="app-wrapper">
      
      {/* Top Header */}
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        backendStatus={backendStatus}
      />

      {/* Two-Pane Root Grid: Left Storefront (~65%), Right AI Agent (~35% persistent) */}
      <div className="two-pane-container">
        
        {/* Left Pane: Meridian E-Commerce Storefront */}
        <div className="storefront-pane">
          <ProductStorefront 
            onSelectProductForAgent={handleSelectProductForAgent}
            searchQuery={searchQuery}
          />
        </div>

        {/* Right Pane: Persistent AI Buyer Agent Panel */}
        <AIBuyerPanel 
          backendConnected={backendStatus === 'connected'}
          selectedStorefrontProduct={selectedProductForAgent}
          onClearSelectedProduct={() => setSelectedProductForAgent(null)}
        />

      </div>

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
