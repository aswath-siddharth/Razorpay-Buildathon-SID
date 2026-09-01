import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PromptStudio from './components/PromptStudio';
import ConfirmationCard from './components/ConfirmationCard';
import AuditTrailTimeline from './components/AuditTrailTimeline';
import MerchantCatalogModal from './components/MerchantCatalogModal';
import ArchitectureModal from './components/ArchitectureModal';
import SessionHistoryDrawer from './components/SessionHistoryDrawer';

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

  // Modals state
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

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
      />

      {/* Main Grid: Left = Studio & Receipt, Right = Live Timeline */}
      <div className="grid-main">
        
        {/* Left Column: Prompt Studio & Confirmation Receipt */}
        <div>
          <PromptStudio
            onRunAgent={handleRunAgent}
            isRunning={isRunning}
            currentStage={currentStage}
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
