import React, { useState } from 'react';
import { Send, Zap, RefreshCw, AlertTriangle, ShieldCheck, Settings, Play, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function PromptStudio({ onRunAgent, isRunning, currentStage }) {
  const [prompt, setPrompt] = useState("Buy me running shoes under ₹3,000, size 9, that can arrive by Friday.");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [maxRetries, setMaxRetries] = useState(2);
  const [simulateFailure, setSimulateFailure] = useState("none");

  const scenarios = [
    {
      id: "happy-path",
      title: "🏃‍♂️ Happy Path (End-to-End)",
      desc: "Full automated purchase within budget, size & ETA bounds",
      query: "Buy me running shoes under ₹3000, size 9, arrive by Friday",
      failure: "none",
      retries: 2,
    },
    {
      id: "stockout-recovery",
      title: "🛡️ Mid-Flow Stockout Recovery",
      desc: "Rank #1 goes out of stock; agent falls back to Rank #2 seamlessly",
      query: "Buy me running shoes under ₹3000, size 9, arrive by Friday",
      failure: "out_of_stock",
      retries: 2,
    },
    {
      id: "price-mismatch",
      title: "⚠️ Price Surge Protection",
      desc: "Checkout price jumps above budget; mandate rejects & retries",
      query: "Buy me running shoes under ₹3000, size 9, arrive by Friday",
      failure: "price_mismatch",
      retries: 2,
    },
    {
      id: "retries-exhausted",
      title: "🛑 Retries Exhausted (Safe Abort)",
      desc: "Max retries = 0; aborts gracefully with ₹0 charged",
      query: "Buy me running shoes under ₹3000, size 9, arrive by Friday",
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
    { id: 'PURCHASE_COMPLETED', label: '6. User Confirmed' },
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={20} color="var(--accent-cyan)" />
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff' }}>
            Buyer Agent Prompt Studio
          </h2>
        </div>
        <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
          Natural Language → Bounded Action
        </span>
      </div>

      {/* Preset Scenarios for Fast Evaluation */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Pitch Demo Scenarios (1-Click Execution):
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
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
                background: 'rgba(15, 23, 42, 0.65)',
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
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                {sc.title}
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                {sc.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Query Form */}
      <form onSubmit={handleCustomSubmit} style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
          Natural Language Intent Query:
        </label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="input-text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. Buy me running shoes under ₹3000, size 9, arrive by Friday..."
            disabled={isRunning}
            style={{ flex: 1 }}
          />
          <button
            type="submit"
            disabled={isRunning || !prompt.trim()}
            className="btn btn-primary"
            style={{ minWidth: '130px' }}
          >
            {isRunning ? (
              <>
                <RefreshCw size={16} className="spinner" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="#ffffff" />
                <span>Execute</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Advanced Parameters Accordion */}
      <div style={{ marginBottom: '20px' }}>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          <Settings size={14} />
          <span>Advanced Mandate Bounds & Failure Simulator</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showAdvanced && (
          <div className="glass-panel" style={{ marginTop: '10px', padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Failure Simulation Mode:
              </label>
              <select
                className="select-custom"
                value={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.value)}
                disabled={isRunning}
              >
                <option value="none">None (Real Catalog State)</option>
                <option value="out_of_stock">Mid-Flow Stockout (Rank #1)</option>
                <option value="price_mismatch">Price Surge Exceeding Budget</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Max Bounded Retries: <strong style={{ color: 'var(--accent-cyan)' }}>{maxRetries}</strong>
              </label>
              <input
                type="range"
                min="0"
                max="4"
                value={maxRetries}
                onChange={(e) => setMaxRetries(parseInt(e.target.value))}
                disabled={isRunning}
                style={{ width: '100%', accentColor: 'var(--accent-cyan)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                <span>0 (No fallback)</span>
                <span>2 (Standard)</span>
                <span>4 (Extended)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* State Machine Step Progress */}
      <div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Autonomous Execution State Machine:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
          {stages.map((stage, idx) => {
            const isCompleted = activeStageIdx > idx;
            const isCurrent = activeStageIdx === idx;
            return (
              <div
                key={stage.id}
                style={{
                  padding: '8px 4px',
                  textAlign: 'center',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  transition: 'all 0.3s ease',
                  background: isCurrent 
                    ? 'rgba(0, 186, 242, 0.2)' 
                    : isCompleted 
                    ? 'rgba(16, 185, 129, 0.15)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  border: isCurrent 
                    ? '1px solid var(--accent-cyan)' 
                    : isCompleted 
                    ? '1px solid rgba(16, 185, 129, 0.4)' 
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  color: isCurrent 
                    ? '#ffffff' 
                    : isCompleted 
                    ? '#10b981' 
                    : 'var(--text-muted)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginBottom: '2px' }}>
                  {isCompleted ? <Check size={12} color="#10b981" /> : isCurrent ? <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00baf2' }} /> : null}
                  <span>Step {idx + 1}</span>
                </div>
                <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stage.label.split('. ')[1]}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
