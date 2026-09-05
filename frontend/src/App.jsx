import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ProductStorefront from './components/ProductStorefront';
import PromptStudio from './components/PromptStudio';
import ConfirmationCard from './components/ConfirmationCard';
import AuditTrailTimeline from './components/AuditTrailTimeline';
import MerchantCatalogModal from './components/MerchantCatalogModal';
import ArchitectureModal from './components/ArchitectureModal';
import SessionHistoryDrawer from './components/SessionHistoryDrawer';
import { 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  ShoppingBag, 
  Lock, 
  Layers, 
  ArrowDown, 
  Flame, 
  CheckCircle2, 
  Key, 
  CreditCard 
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

export default function App() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [buyerResult, setBuyerResult] = useState(null);
  const [auditEvents, setAuditEvents] = useState([]);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState(false);
  const [recentSessions, setRecentSessions] = useState([]);
  const [customPrompt, setCustomPrompt] = useState(null);

  // Modals state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const promptStudioRef = useRef(null);
  const storefrontRef = useRef(null);

  useEffect(() => {
    checkBackendHealth();
    fetchRecentSessions();
    const interval = setInterval(checkBackendHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  const checkBackendHealth = async () => {
    try {
      const resp = await fetch(`${API_BASE}/`);
      if (resp.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  const fetchRecentSessions = async () => {
    try {
      const resp = await fetch(`${API_BASE}/buyer/audit?limit=25`);
      if (resp.ok) {
        const data = await resp.json();
        setRecentSessions(data);
      }
    } catch (e) {
      console.error("Failed to fetch sessions", e);
    }
  };

  const handleRunAgent = async (message, simulateFailure, maxRetries) => {
    setIsRunning(true);
    setWebhookSuccess(false);
    setCurrentStage('PARSE_INTENT');

    // Smooth stage stepping simulation for visual feedback
    const stepTimer1 = setTimeout(() => setCurrentStage('DISCOVER_PRODUCTS'), 350);
    const stepTimer2 = setTimeout(() => setCurrentStage('INVENTORY_CHECK'), 700);

    try {
      const resp = await fetch(`${API_BASE}/buyer/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          simulate_failure: simulateFailure,
          max_retries: maxRetries,
        }),
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }

      const data = await resp.json();
      setCurrentStage('PURCHASE_COMPLETED');
      setBuyerResult(data);
      setAuditEvents(data.audit_trail || []);
      fetchRecentSessions();
    } catch (err) {
      console.error("Agent execution failed", err);
      setCurrentStage('');
      alert(`Agent execution error: ${err.message}. Ensure backend is running on port 8000.`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSelectProductForAgent = (product) => {
    const category = product.attributes?.category || 'running shoes';
    const categoryLabel = category === 'running_shoes' ? 'running shoes' : category;
    const promptText = `Buy me ${product.title} (${categoryLabel}) under ₹${Math.ceil(product.price + 200)}, size 9, that can arrive by Friday.`;
    setCustomPrompt(promptText);
    
    // Scroll smoothly to the prompt studio
    if (promptStudioRef.current) {
      promptStudioRef.current.scrollIntoView({ behavior: 'smooth' });
    }

    // Automatically trigger agent execution
    handleRunAgent(promptText, null, 2);
  };

  const handleSimulateWebhook = async () => {
    if (!buyerResult?.session_id) return;
    setIsSimulatingWebhook(true);

    try {
      const resp = await fetch(`${API_BASE}/payments/simulate-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: buyerResult.session_id,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json();
        throw new Error(errData.detail || 'Webhook signature verification failed');
      }

      const simResult = await resp.json();
      setWebhookSuccess(true);

      // Refresh chronological audit events to show PAYMENT_CONFIRMED
      const auditResp = await fetch(`${API_BASE}/buyer/audit/${buyerResult.session_id}`);
      if (auditResp.ok) {
        const events = await auditResp.json();
        setAuditEvents(events);
      }
      fetchRecentSessions();
    } catch (err) {
      console.error("Webhook simulation failed", err);
      alert(`Webhook simulation error: ${err.message}`);
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  const handleSelectSession = async (sessionId) => {
    try {
      const resp = await fetch(`${API_BASE}/buyer/audit/${sessionId}`);
      if (resp.ok) {
        const events = await resp.json();
        setAuditEvents(events);
        
        // Find if this session has a mandate
        const lastEvent = events[events.length - 1];
        setBuyerResult({
          session_id: sessionId,
          status: lastEvent?.status || 'COMPLETED',
          message: lastEvent?.reasoning || 'Session loaded from history.',
          mandate: {},
          audit_trail: events,
        });

        if (promptStudioRef.current) {
          promptStudioRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch (e) {
      console.error("Failed to load session audit trail", e);
    }
  };

  return (
    <div className="app-container">
      
      {/* Header */}
      <Header
        backendStatus={backendStatus}
        onOpenCatalog={() => setIsCatalogOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        sessionCount={recentSessions.length}
        onScrollToStorefront={() => storefrontRef.current?.scrollIntoView({ behavior: 'smooth' })}
        onScrollToStudio={() => promptStudioRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Cyber Hero Banner */}
      <section className="hero-banner">
        <div style={{ maxWidth: '820px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span className="badge badge-razorpay" style={{ fontSize: '0.75rem', padding: '3px 12px' }}>
              ⚡ RAZORPAY AI BUILDATHON
            </span>
            <span className="badge badge-mandate" style={{ fontSize: '0.75rem', padding: '3px 12px' }}>
              TRACK 01 — AGENTIC COMMERCE
            </span>
            <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '3px 12px' }}>
              <CheckCircle2 size={13} /> TEST MODE ACTIVE
            </span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, color: '#ffffff', lineHeight: 1.15, marginBottom: '14px', letterSpacing: '-0.035em' }}>
            Autonomous Agentic Commerce <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #00BAF2 0%, #38bdf8 50%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Bound, Gated & Explainable
            </span>
          </h1>

          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '22px' }}>
            Browse verified multi-merchant catalogs, issue natural-language buying mandates, and watch the AI Buyer Agent autonomously discover items, resolve stockouts, issue scoped single-use payment mandates, and verify Razorpay HMAC-SHA256 signatures in real time.
          </p>

          {/* Quick Metrics & Highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '20px' }}>
            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>MANDATE SECURITY</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>Single-Use Token</div>
            </div>
            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>FAILURE HANDLING</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981' }}>Bounded Retries</div>
            </div>
            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>CRYPTO VERIFIED</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#c084fc' }}>HMAC-SHA256</div>
            </div>
            <div className="glass-panel" style={{ padding: '12px 14px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>UNAUTHORIZED SPEND</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#38bdf8' }}>₹0 Guaranteed</div>
            </div>
          </div>

          {/* Quick Test Prompt Chips */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>Quick Demos:</span>
            <button 
              className="quick-chip"
              onClick={() => handleRunAgent("Buy me running shoes under ₹3000, size 9, arrive by Friday", null, 2)}
            >
              🏃 Running Shoes &lt; ₹3000
            </button>
            <button 
              className="quick-chip"
              onClick={() => handleRunAgent("Buy me running shoes under ₹3000, size 9, arrive by Friday", "out_of_stock", 2)}
            >
              🛡️ Stockout Recovery
            </button>
            <button 
              className="quick-chip"
              onClick={() => handleRunAgent("Buy me running shoes under ₹3000, size 9, arrive by Friday", "price_mismatch", 2)}
            >
              ⚠️ Price Surge Protection
            </button>
          </div>

        </div>
      </section>

      {/* Live Storefront Showcase with Real Images */}
      <div ref={storefrontRef}>
        <ProductStorefront 
          onSelectProductForAgent={handleSelectProductForAgent}
          isAgentRunning={isRunning}
        />
      </div>

      {/* Main Grid: Left = Studio & Receipt, Right = Live Timeline */}
      <div className="grid-main" ref={promptStudioRef}>
        
        {/* Left Column: Prompt Studio & Confirmation Receipt */}
        <div>
          <PromptStudio
            onRunAgent={handleRunAgent}
            isRunning={isRunning}
            currentStage={currentStage}
            customInitialPrompt={customPrompt}
          />

          <ConfirmationCard
            result={buyerResult}
            onSimulateWebhook={handleSimulateWebhook}
            isSimulatingWebhook={isSimulatingWebhook}
            webhookSuccess={webhookSuccess}
          />
        </div>

        {/* Right Column: Interactive Audit Trail Timeline */}
        <div>
          <AuditTrailTimeline
            events={auditEvents}
            sessionId={buyerResult?.session_id}
          />
        </div>

      </div>

      {/* Supporting Modals */}
      <MerchantCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />

      <SessionHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={recentSessions}
        onSelectSession={handleSelectSession}
        currentSessionId={buyerResult?.session_id}
      />

    </div>
  );
}
