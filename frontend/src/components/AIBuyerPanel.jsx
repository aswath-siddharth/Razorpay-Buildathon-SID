import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Zap, 
  RotateCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Sliders, 
  Lock, 
  ExternalLink,
  ChevronDown,
  Info,
  XCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import AgentExecutionTrace from './AgentExecutionTrace';

export default function AIBuyerPanel({
  onRunAgentBackend,
  backendConnected = false,
  selectedStorefrontProduct = null,
  onClearSelectedProduct = () => {},
}) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'agent',
      text: "👋 Hi! I am your AI Buyer Agent. Tell me what you'd like to purchase with natural constraints (e.g., 'running shoes under ₹3,000, size 9, arrive by Friday').",
      time: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmationPrompt, setShowConfirmationPrompt] = useState(false);
  const [candidateList, setCandidateList] = useState([]);
  const [finalPick, setFinalPick] = useState(null);
  const [explainabilityReason, setExplainabilityReason] = useState('');
  const [mandateConstraints, setMandateConstraints] = useState(null);

  // Execution Trace state machine
  const [isExecutingTrace, setIsExecutingTrace] = useState(false);
  const [traceSteps, setTraceSteps] = useState([]);
  const [activeFailureScenario, setActiveFailureScenario] = useState('none'); // 'none' | 'mandate_breach' | 'bad_signature' | 'stockout'
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, candidateList, finalPick, traceSteps, showConfirmationPrompt]);

  // If user clicked "Buy with AI Agent" on a storefront card
  useEffect(() => {
    if (selectedStorefrontProduct) {
      const category = selectedStorefrontProduct.attributes?.category || 'running shoes';
      const catClean = category.replace('_', ' ');
      const budgetCeiling = Math.ceil(selectedStorefrontProduct.price + 200);
      const promptQuery = `Buy me ${selectedStorefrontProduct.title} (${catClean}) under ₹${budgetCeiling}, size 9, arrive by Friday`;
      setInputValue(promptQuery);
      handleSendQuery(promptQuery, 'none', selectedStorefrontProduct);
      onClearSelectedProduct();
    }
  }, [selectedStorefrontProduct]);

  // Handle user sending shopping intent
  const handleSendQuery = async (queryText = inputValue, scenario = 'none', targetProduct = null) => {
    if (!queryText.trim() || isProcessing) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsProcessing(true);
    setShowConfirmationPrompt(false);
    setCandidateList([]);
    setFinalPick(null);
    setTraceSteps([]);
    setActiveFailureScenario(scenario);

    // 1. Agent conversational response: What it understood & what it's searching for
    setTimeout(() => {
      const budgetMatch = queryText.match(/(\d+[\d,]*)/);
      const extractedBudget = budgetMatch ? parseInt(budgetMatch[0].replace(/,/g, ''), 10) : 3000;
      const sizeMatch = queryText.match(/size\s*(\d+)/i);
      const extractedSize = sizeMatch ? parseInt(sizeMatch[1], 10) : 9;

      const constraints = {
        category: "running_shoes",
        budget_max: extractedBudget,
        size: extractedSize,
        delivery_deadline: "2026-08-29 (Friday)",
        max_retries: 2,
        auth_mode: "pre_approved_intent"
      };
      setMandateConstraints(constraints);

      const agentAckMsg = {
        id: `agent-ack-${Date.now()}`,
        sender: 'agent',
        text: `Understood! I parsed your intent mandate: Looking for running shoes under ₹${extractedBudget.toLocaleString('en-IN')}, size ${extractedSize}, arriving before Friday. Scanning multi-merchant catalogs...`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentAckMsg]);

      // 2. Stream inline candidate cards being evaluated
      setTimeout(() => {
        const mockCandidates = [
          {
            id: 1,
            title: targetProduct ? targetProduct.title : "Velocity Run 3 Neutral Trainer",
            brand: "STRIDELINE",
            merchant: "TechMart",
            price: targetProduct ? targetProduct.price : 2799,
            rating: 4.6,
            eta: "Tomorrow",
            sizeAvailable: true,
            status: scenario === 'mandate_breach' ? 'rejected' : scenario === 'stockout' ? 'stockout_first' : 'winner',
            reason: scenario === 'mandate_breach' 
              ? "Exceeds modified budget constraint (₹3,499 > ₹3,000 ceiling)"
              : scenario === 'stockout'
              ? "Stockout mid-flow during live checkout reservation"
              : "Best candidate: Lowest price (₹2,799) with 4.6★ rating, size 9 in stock & delivers Tomorrow",
            image: targetProduct?.image_url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
          },
          {
            id: 2,
            title: "Duramo SL Responsive Trainer",
            brand: "AEROSTEP",
            merchant: "ShopSphere",
            price: 2899,
            rating: 4.5,
            eta: "in 2 days",
            sizeAvailable: true,
            status: scenario === 'stockout' ? 'winner' : 'candidate',
            reason: scenario === 'stockout' 
              ? "Secured as Rank #2 fallback within mandate bounds (₹2,899 ≤ ₹3,000)" 
              : "Viable candidate, but price is ₹100 higher than Rank #1",
            image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=300&q=80"
          },
          {
            id: 3,
            title: "TrailGrip Pro Off-Road Runner",
            brand: "STRIDELINE",
            merchant: "QuickBuy",
            price: 3499,
            rating: 4.8,
            eta: "Tomorrow",
            sizeAvailable: true,
            status: 'rejected',
            reason: "Rejected: Price ₹3,499 exceeds budget ceiling ₹3,000",
            image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=300&q=80"
          }
        ];

        setCandidateList(mockCandidates);

        // 3. Explainability statement & Final Pick
        const chosen = scenario === 'stockout' ? mockCandidates[1] : scenario === 'mandate_breach' ? mockCandidates[2] : mockCandidates[0];
        setFinalPick(chosen);

        const explainText = scenario === 'mandate_breach'
          ? `Selected candidate ₹3,499 exceeds your budget ceiling of ₹${extractedBudget}. Mandate boundary validation will trigger.`
          : scenario === 'stockout'
          ? `Final Pick: **${chosen.title}** at ₹${chosen.price} (Fallback candidate from ShopSphere after Rank #1 stockout).`
          : `Final Pick: **${chosen.title}** at ₹${chosen.price.toLocaleString('en-IN')} (Saved ₹${(extractedBudget - chosen.price)} vs ₹${extractedBudget} ceiling, arrives ${chosen.eta}, size ${extractedSize} verified in stock).`;
        
        setExplainabilityReason(explainText);
        setShowConfirmationPrompt(true);
        setIsProcessing(false);

      }, 700);

    }, 500);
  };

  // Start the Live 7-Stage Execution Trace
  const handleConfirmAndExecute = () => {
    setShowConfirmationPrompt(false);
    setIsExecutingTrace(true);

    const isBreach = activeFailureScenario === 'mandate_breach';
    const isBadSig = activeFailureScenario === 'bad_signature';
    const isStockout = activeFailureScenario === 'stockout';

    const chosen = finalPick || {
      title: "Velocity Run 3 Neutral Trainer",
      price: 2799,
      merchant: "TechMart",
      eta: "Tomorrow"
    };

    const budgetCeiling = mandateConstraints?.budget_max || 3000;
    const actualPrice = isBreach ? 3499 : chosen.price;

    const initialSteps = [
      {
        id: 'INTENT_PARSED',
        title: '1. Intent Parsed',
        description: 'Extracted structured constraints: Category, Budget Ceiling, Size & ETA',
        status: 'running',
        timestamp: '+0.00s',
        rawPayload: {
          intent: "bounded_purchase",
          category: "running_shoes",
          budget_max_inr: budgetCeiling,
          size_uk: mandateConstraints?.size || 9,
          delivery_deadline: "2026-08-29",
          max_retries: 2,
          auth_context: "pre_approved_mandate_bound"
        }
      },
      {
        id: 'CANDIDATES_SCORED',
        title: '2. Candidates Scored',
        description: 'Multi-merchant discovery evaluated 5 candidates; winner ranked #1',
        status: 'pending',
        timestamp: '',
        rawPayload: {
          candidates_evaluated_count: 5,
          filtered_out_count: 2,
          winner: {
            title: chosen.title,
            merchant: chosen.merchant,
            price_inr: actualPrice,
            score: 0.94,
            in_stock: !isStockout
          }
        }
      },
      {
        id: 'MANDATE_AUTHORIZED',
        title: '3. Mandate Authorized',
        description: isBreach
          ? `MANDATE REJECT: Amount ₹${actualPrice} exceeds budget ceiling ₹${budgetCeiling}`
          : `Bounded Proof: Amount ₹${actualPrice} ≤ Ceiling ₹${budgetCeiling} (Margin: ₹${budgetCeiling - actualPrice} left)`,
        status: 'pending',
        timestamp: '',
        boundedProof: {
          amountStr: `₹${actualPrice}`,
          ceilingStr: `₹${budgetCeiling}`,
          passed: !isBreach
        },
        rawPayload: {
          mandate_token: "mnd_tok_892104a99b",
          amount: actualPrice,
          budget_ceiling: budgetCeiling,
          bounded_proof_condition: `amount (${actualPrice}) <= budget_ceiling (${budgetCeiling})`,
          bounded_proof_result: isBreach ? "FAILED_CEILING_BREACH" : "PASS",
          single_use: true,
          expires_in_seconds: 600
        }
      },
      {
        id: 'ORDER_CREATED',
        title: '4. Order Created',
        description: 'Merchant TechMart order created with single-use authorization token',
        status: 'pending',
        timestamp: '',
        rawPayload: {
          merchant_order_id: "ord_merch_techmart_78291a",
          merchant_id: "m_techmart_01",
          sku: "SKU-VELO3-SZ9",
          currency: "INR",
          total: actualPrice
        }
      },
      {
        id: 'PAYMENT_INITIATED',
        title: '5. Payment Initiated',
        description: 'Razorpay test Orders API dispatched with mandate bound',
        status: 'pending',
        timestamp: '',
        rawPayload: {
          razorpay_order_id: "order_RPZ8192019482",
          amount_paisa: actualPrice * 100,
          currency: "INR",
          receipt: "rcpt_mnd_892104a99b",
          status: "created"
        }
      },
      {
        id: 'WEBHOOK_VERIFIED',
        title: '6. Webhook Verified',
        description: isBadSig
          ? 'SECURITY REJECT: HMAC-SHA256 signature verification failed (tamper detected)'
          : 'Server-side HMAC-SHA256 signature verified against webhook payload',
        status: 'pending',
        timestamp: '',
        signatureDetails: {
          algorithm: "HMAC-SHA256",
          status: isBadSig ? "INVALID_SIGNATURE" : "VALID_SIGNATURE"
        },
        rawPayload: {
          event: "payment.captured",
          signature_received: isBadSig ? "invalid_tampered_signature_9901" : "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          computed_hmac_sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
          verification_match: !isBadSig,
          server_side_check: isBadSig ? "FAIL_400" : "PASS_200"
        }
      },
      {
        id: 'CONFIRMED',
        title: '7. Confirmed',
        description: 'Order receipt generated, audit trail finalized and locked',
        status: 'pending',
        timestamp: '',
        rawPayload: {
          receipt_id: "RCP_MERIDIAN_88921a",
          item: chosen.title,
          amount_paid: actualPrice,
          delivery_eta: chosen.eta || "Tomorrow",
          audit_event_id: "evt_aud_998124_sealed"
        }
      }
    ];

    setTraceSteps(initialSteps);

    // Live Step Execution Sequencer (smooth pacing ~700ms per step)
    const runSequencer = async () => {
      // Step 1: Intent Parsed -> Done
      await new Promise(r => setTimeout(r, 600));
      setTraceSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'done', timestamp: '+0.12s' } : i === 1 ? { ...s, status: 'running' } : s));

      // Step 2: Candidates Scored -> Done
      await new Promise(r => setTimeout(r, 700));
      setTraceSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'done', timestamp: '+0.38s' } : i === 2 ? { ...s, status: 'running' } : s));

      // Step 3: Mandate Authorized
      await new Promise(r => setTimeout(r, 750));
      if (isBreach) {
        // Fails on Mandate Breach
        setTraceSteps(prev => [
          ...prev.map((s, i) => i === 2 ? { ...s, status: 'failed', timestamp: '+0.62s' } : s),
          {
            id: 'AGENT_MITIGATION',
            title: '⚡ Agent Mitigation',
            description: `Ceiling breach handled: Bounded search activated. Reverted to next candidate within ₹${budgetCeiling} (Retry 1 of 2). Zero funds spent.`,
            status: 'mitigated',
            timestamp: '+0.88s',
            rawPayload: {
              action: "FALLBACK_RECOVERY",
              reason: "Amount 3499 exceeds mandate ceiling 3000",
              mitigation_strategy: "retry_next_ranked_candidate",
              retries_remaining: 1,
              funds_charged: 0
            }
          }
        ]);
        setIsExecutingTrace(false);
        return;
      }

      setTraceSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'done', timestamp: '+0.62s' } : i === 3 ? { ...s, status: 'running' } : s));

      // Step 4: Order Created -> Done
      await new Promise(r => setTimeout(r, 700));
      setTraceSteps(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'done', timestamp: '+0.89s' } : i === 4 ? { ...s, status: 'running' } : s));

      // Step 5: Payment Initiated -> Done
      await new Promise(r => setTimeout(r, 750));
      setTraceSteps(prev => prev.map((s, i) => i === 4 ? { ...s, status: 'done', timestamp: '+1.15s' } : i === 5 ? { ...s, status: 'running' } : s));

      // Step 6: Webhook Verified
      await new Promise(r => setTimeout(r, 800));
      if (isBadSig) {
        // Fails on bad signature
        setTraceSteps(prev => [
          ...prev.map((s, i) => i === 5 ? { ...s, status: 'failed', timestamp: '+1.42s' } : s),
          {
            id: 'AGENT_MITIGATION',
            title: '🛑 Agent Mitigation: Security Abort',
            description: 'Tamper detected: HMAC signature mismatch rejected by server. Payment marked untrusted; ₹0 unauthorized spend recorded.',
            status: 'mitigated',
            timestamp: '+1.65s',
            rawPayload: {
              action: "SECURITY_ABORT",
              security_alert: "HMAC_SHA256_MISMATCH",
              status_code: 400,
              funds_captured: false,
              user_alerted: true
            }
          }
        ]);
        setIsExecutingTrace(false);
        return;
      }

      setTraceSteps(prev => prev.map((s, i) => i === 5 ? { ...s, status: 'done', timestamp: '+1.42s' } : i === 6 ? { ...s, status: 'running' } : s));

      // Step 7: Confirmed -> Done
      await new Promise(r => setTimeout(r, 650));
      setTraceSteps(prev => prev.map((s, i) => i === 6 ? { ...s, status: 'done', timestamp: '+1.78s' } : s));
      setIsExecutingTrace(false);
    };

    runSequencer();
  };

  const handleReset = () => {
    setIsExecutingTrace(false);
    setShowConfirmationPrompt(false);
    setCandidateList([]);
    setFinalPick(null);
    setTraceSteps([]);
    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: "👋 AI Buyer Agent ready! Select a quick demo prompt or type your own shopping query below.",
        time: 'Just now'
      }
    ]);
  };

  return (
    <div className="agent-pane">
      
      {/* Panel Top Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--accent-blue)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                AI Buyer Agent
              </span>
              <span className="badge badge-success" style={{ fontSize: '0.66rem' }}>
                Active
              </span>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Bounded Agentic Commerce · Razorpay Rails
            </span>
          </div>
        </div>

        <button 
          onClick={handleReset}
          className="btn btn-outline btn-xs"
          title="Reset conversation and trace"
        >
          Reset
        </button>
      </div>

      {/* Demo Scenario Quick Bar (1-Click Pitch Demonstrations) */}
      <div style={{
        padding: '8px 14px',
        background: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        overflowX: 'auto'
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, flexShrink: 0 }}>
          Demos:
        </span>
        
        <button
          onClick={() => handleSendQuery("Buy me running shoes under ₹3000, size 9, arrive by Friday", "none")}
          className="btn btn-secondary btn-xs"
          style={{ whiteSpace: 'nowrap', fontSize: '0.72rem' }}
          title="Happy Path: Full automated bounded purchase"
        >
          ⚡ Happy Path
        </button>

        <button
          onClick={() => handleSendQuery("Buy me running shoes under ₹3000, size 9, arrive by Friday", "mandate_breach")}
          className="btn btn-secondary btn-xs"
          style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', color: '#b91c1c' }}
          title="Failure Demo: Exceeds mandate budget ceiling"
        >
          ⚠️ Mandate Breach
        </button>

        <button
          onClick={() => handleSendQuery("Buy me running shoes under ₹3000, size 9, arrive by Friday", "bad_signature")}
          className="btn btn-secondary btn-xs"
          style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', color: '#b91c1c' }}
          title="Failure Demo: Simulates bad cryptographic signature rejection"
        >
          🔒 Webhook Tamper
        </button>

        <button
          onClick={() => handleSendQuery("Buy me running shoes under ₹3000, size 9, arrive by Friday", "stockout")}
          className="btn btn-secondary btn-xs"
          style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', color: '#b45309' }}
          title="Failure Demo: Mid-flow stockout recovery to rank 2"
        >
          🔄 Stockout Fallback
        </button>
      </div>

      {/* Chat Messages / Candidates / Stepper Area */}
      <div className="agent-chat-messages">
        
        {messages.map((m) => (
          <div 
            key={m.id} 
            className={m.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-agent'}
          >
            {m.sender === 'agent' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px', fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-blue)' }}>
                <Sparkles size={12} /> AI AGENT
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
            <div style={{ fontSize: '0.66rem', color: m.sender === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', marginTop: '4px', textAlign: 'right' }}>
              {m.time}
            </div>
          </div>
        ))}

        {/* Inline Candidate Comparison Cards */}
        {candidateList.length > 0 && (
          <div className="candidate-cards-container fade-in-node">
            <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
              Candidates Evaluated ({candidateList.length}):
            </div>

            {candidateList.map((c) => {
              const isWin = c.status === 'winner';
              const isRej = c.status === 'rejected';
              const isStockout1 = c.status === 'stockout_first';

              return (
                <div 
                  key={c.id} 
                  className={`candidate-card-inline ${isWin ? 'winner' : ''}`}
                >
                  <img src={c.image} alt={c.title} className="candidate-img" />
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {c.title}
                      </span>
                      <span style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ₹{c.price.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                      <span>{c.merchant}</span>
                      <span>•</span>
                      <span>ETA: {c.eta}</span>
                    </div>

                    <div style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      marginTop: '4px',
                      color: isWin ? '#059669' : isRej ? '#dc2626' : isStockout1 ? '#d97706' : 'var(--text-secondary)'
                    }}>
                      {isWin ? '✓ ' : isRej ? '✕ ' : isStockout1 ? '⚠ ' : '○ '}
                      {c.reason}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Explainability Statement Callout */}
        {explainabilityReason && (
          <div className="fade-in-node" style={{
            background: 'var(--accent-blue-light)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            lineHeight: 1.45
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-blue)', fontWeight: 700, marginBottom: '4px', fontSize: '0.78rem' }}>
              <Zap size={14} /> EXPLAINABILITY REASONING
            </div>
            <div dangerouslySetInnerHTML={{ __html: explainabilityReason.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        )}

        {/* Confirmation Action Box before Checkout */}
        {showConfirmationPrompt && !isExecutingTrace && traceSteps.length === 0 && (
          <div className="fade-in-node" style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-focus)',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            boxShadow: 'var(--shadow-sm)',
            marginTop: '4px'
          }}>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Proceed with bounded agent checkout?
            </div>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Issuing single-use payment mandate bounded to ₹{finalPick?.price.toLocaleString('en-IN') || '2,799'} with Razorpay test rails.
            </p>

            <button
              onClick={handleConfirmAndExecute}
              className="btn btn-primary"
              style={{ width: '100%', fontSize: '0.88rem', padding: '10px' }}
            >
              <Zap size={16} />
              <span>Confirm & Execute Agent Checkout</span>
            </button>
          </div>
        )}

        {/* THE EXECUTION TRACE (Centerpiece Live Stepper) */}
        {traceSteps.length > 0 && (
          <AgentExecutionTrace
            traceState={traceSteps}
            isExecuting={isExecutingTrace}
            onResetTrace={handleConfirmAndExecute}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form at Bottom */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          handleSendQuery();
        }}
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface)',
          display: 'flex',
          gap: '8px'
        }}
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="e.g. running shoes under ₹3000, size 9..."
          className="input-text"
          style={{ fontSize: '0.84rem', padding: '9px 12px' }}
          disabled={isProcessing || isExecutingTrace}
        />
        <button
          type="submit"
          disabled={isProcessing || isExecutingTrace || !inputValue.trim()}
          className="btn btn-primary"
          style={{ padding: '8px 14px', flexShrink: 0 }}
        >
          {isProcessing ? <RotateCw size={15} className="spin-icon" /> : <Send size={15} />}
        </button>
      </form>

    </div>
  );
}
