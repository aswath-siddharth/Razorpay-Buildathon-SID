import React, { useState } from 'react';
import { 
  Send, 
  Zap, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  Settings, 
  Play, 
  Check, 
  ChevronDown, 
  ChevronUp,
  Sliders,
  Cpu,
  Sparkles
} from 'lucide-react';

export default function PromptStudio({ 
  onRunAgent, 
  isRunning, 
  currentStage,
  customInitialPrompt
}) {
  const [prompt, setPrompt] = useState(
    customInitialPrompt || "Buy me running shoes under Rs 3,000, size 9, that can arrive by Friday."
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxRetries, setMaxRetries] = useState(2);
  const [simulateFailure, setSimulateFailure] = useState("none");

  // Keep synced if user clicked a product in the storefront
  React.useEffect(() => {
    if (customInitialPrompt) {
      setPrompt(customInitialPrompt);
    }
  }, [customInitialPrompt]);

  const scenarios = [
    {
      id: "happy-path",
      title: "Happy Path (End-to-End)",
      desc: "Full automated purchase within budget, size & ETA bounds",
      query: "Buy me running shoes under Rs 3000, size 9, arrive by Friday",
      failure: "none",
      retries: 2,
    },
    {
      id: "stockout-recovery",
      title: "Mid-Flow Stockout Recovery",
      desc: "Rank #1 goes out of stock; agent falls back to Rank #2 seamlessly",
      query: "Buy me running shoes under Rs 3000, size 9, arrive by Friday",
      failure: "out_of_stock",
      retries: 2,
    },
    {
      id: "price-mismatch",
      title: "Price Surge Protection",
      desc: "Checkout price jumps above budget; mandate rejects & retries",
      query: "Buy me running shoes under Rs 3000, size 9, arrive by Friday",
      failure: "price_mismatch",
      retries: 2,
    },
    {
      id: "retries-exhausted",
      title: "Retries Exhausted (Safe Abort)",
      desc: "Max retries = 0; aborts gracefully with Rs 0 charged",
      query: "Buy me running shoes under Rs 3000, size 9, arrive by Friday",
      failure: "out_of_stock",
      retries: 0,
    },
  ];

  const handleApplyScenario = (sc) => {
    setPrompt(sc.query);
    setSimulateFailure(sc.failure);
    setMaxRetries(sc.retries);
    onRunAgent(sc.query, sc.failure === "none" ? null : sc.failure, sc.retries);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isRunning) return;
    onRunAgent(prompt, simulateFailure === "none" ? null : simulateFailure, maxRetries);
  };

  // State Machine Step Definitions
  const stages = [
    { id: 'PARSE_INTENT', label: '1. Parse Intent' },
    { id: 'DISCOVER_PRODUCTS', label: '2. Discover & Score' },
    { id: 'INVENTORY_CHECK', label: '3. Inventory / Retry' },
    { id: 'ISSUE_PAYMENT_MANDATE', label: '4. Issue Mandate' },
    { id: 'CREATE_RAZORPAY_ORDER', label: '5. Razorpay Order' },
    { id: 'PURCHASE_COMPLETED', label: '6. Webhook Verified' },
  ];

  const getStageIndex = (stage) => {
    if (!stage) return -1;
    if (stage.includes('INTENT')) return 0;
    if (stage.includes('DISCOVER') || stage.includes('SCORE')) return 1;
    if (stage.includes('INVENTORY') || stage.includes('RETRY') || stage.includes('FAILURE')) return 2;
    if (stage.includes('MANDATE')) return 3;
    if (stage.includes('ORDER') || stage.includes('PAYMENT_LINK')) return 4;
    if (stage.includes('COMPLETED') || stage.includes('CONFIRMED')) return 5;
    return 0;
  };

  const activeStageIdx = getStageIndex(currentStage);

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
      
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(0, 186, 242, 0.15)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Zap size={18} color="var(--accent-cyan)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Buyer Agent Prompt Studio
            </h2>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Natural language intent converted into mandate-bound Razorpay transactions
            </p>
          </div>
        </div>
        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
          Natural Language to Bounded Action
        </span>
      </div>

      {/* Preset Scenarios for Fast Evaluation */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Interactive Judge / Pitch Scenarios (1-Click Run):
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '10px' }}>
          {scenarios.map((sc) => (
            <button
              key={sc.id}
              onClick={() => handleApplyScenario(sc)}
              disabled={isRunning}
              className="glass-panel"
              style={{
                textAlign: 'left',
                padding: '12px',
                cursor: isRunning ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                border: '1px solid var(--border-subtle)',
                background: '#ffffff',
                opacity: isRunning ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isRunning) {
                  e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isRunning) {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                {sc.title}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleCustomSubmit} style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
          Natural Language Shopping Intent:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input-text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Buy me running shoes under Rs 3000, size 9, arrive by Friday..."
            disabled={isRunning}
          />
          <button
            type="submit"
            disabled={isRunning || !prompt.trim()}
            className="btn btn-cyan"
            style={{ whiteSpace: 'nowrap', minWidth: '150px' }}
          >
            {isRunning ? (
              <>
                <RefreshCw size={16} className="spinner" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Run Agent</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Advanced Toggle */}
      <div style={{ marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.76rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          <Sliders size={13} color="var(--accent-cyan)" />
          <span>Advanced Mandate & Failure Simulation Controls</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAdvanced && (
          <div className="glass-panel" style={{ marginTop: '12px', padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', border: '1px solid var(--border-medium)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Simulate Mid-Flow Failure Mode:
              </label>
              <select
                value={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.value)}
                className="input-text"
                style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                disabled={isRunning}
              >
                <option value="none">None (Happy Path Normal)</option>
                <option value="out_of_stock">Mid-Flow Stockout (Trigger Graceful Fallback)</option>
                <option value="price_mismatch">Price Surge Mismatch (Mandate Bound Rejection)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                Max Retries Allowed by Mandate:
              </label>
              <select
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="input-text"
                style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                disabled={isRunning}
              >
                <option value={2}>2 Retries (Standard Bounded Recovery)</option>
                <option value={1}>1 Retry (Strict Recovery)</option>
                <option value={0}>0 Retries (Immediate Safe Abort)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Real-Time State Machine Progression */}
      <div style={{
        marginTop: '20px',
        paddingTop: '16px',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Cpu size={14} color="var(--accent-cyan)" /> State Machine Execution Pipeline:
          </span>
          {isRunning && (
            <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>
              <RefreshCw size={11} className="spinner" /> Agent Active
            </span>
          )}
        </div>

        <div className="pipeline-bar">
          {stages.map((st, idx) => {
            const isCompleted = activeStageIdx > idx || (!isRunning && activeStageIdx === 5);
            const isActive = isRunning && activeStageIdx === idx;

            return (
              <div
                key={st.id}
                className={`pipeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              >
                <div className="pipeline-node">
                  {isCompleted ? <Check size={15} /> : idx + 1}
                </div>
                <div className="pipeline-label">
                  {st.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
