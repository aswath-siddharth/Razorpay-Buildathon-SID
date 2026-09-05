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
  Clock,
  RefreshCw
} from 'lucide-react';
import AgentExecutionTrace from './AgentExecutionTrace';

// Full Catalog Database for intelligent dynamic matching
const CATALOG_DATABASE = [
  // RUNNING SHOES
  {
    id: 1,
    title: "Velocity Run 3 Neutral Trainer",
    brand: "STRIDELINE",
    category: "Running",
    categoryKey: "running_shoes",
    merchant: "TechMart",
    price: 2799,
    originalPrice: 3999,
    rating: 4.6,
    reviews: "2,184",
    eta: "Tomorrow",
    sizes: [7, 8, 9, 10, 11],
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 2,
    title: "Duramo SL Responsive Trainer",
    brand: "AEROSTEP",
    category: "Running",
    categoryKey: "running_shoes",
    merchant: "ShopSphere",
    price: 2899,
    originalPrice: 3499,
    rating: 4.5,
    reviews: "1,420",
    eta: "in 2 days",
    sizes: [7, 8, 9, 10],
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 3,
    title: "AirMatrix Flow Road Runner",
    brand: "AEROSTEP",
    category: "Running",
    categoryKey: "running_shoes",
    merchant: "QuickBuy",
    price: 2599,
    originalPrice: 3699,
    rating: 4.3,
    reviews: "640",
    eta: "Tomorrow",
    sizes: [8, 9, 10, 11],
    image: "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 4,
    title: "TrailGrip Pro Off-Road Runner",
    brand: "STRIDELINE",
    category: "Running",
    categoryKey: "running_shoes",
    merchant: "QuickBuy",
    price: 3499,
    originalPrice: 4599,
    rating: 4.8,
    reviews: "908",
    eta: "Tomorrow",
    sizes: [8, 9, 10],
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=300&q=80"
  },

  // SNEAKERS
  {
    id: 5,
    title: "Apex Street Classic Low Sneakers",
    brand: "URBANCRAFT",
    category: "Sneakers",
    categoryKey: "sneakers",
    merchant: "ShopSphere",
    price: 2499,
    originalPrice: 3299,
    rating: 4.7,
    reviews: "3,110",
    eta: "Tomorrow",
    sizes: [7, 8, 9, 10],
    image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 6,
    title: "Air Retro High Top Street Sneaker",
    brand: "AEROSTEP",
    category: "Sneakers",
    categoryKey: "sneakers",
    merchant: "TechMart",
    price: 3199,
    originalPrice: 4199,
    rating: 4.6,
    reviews: "1,290",
    eta: "in 2 days",
    sizes: [8, 9, 10],
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=300&q=80"
  },

  // AUDIO / HEADPHONES
  {
    id: 7,
    title: "boAt Airdopes 141 ANC True Wireless",
    brand: "boAt",
    category: "Audio",
    categoryKey: "audio",
    merchant: "PulseGadgets",
    price: 1699,
    originalPrice: 2499,
    rating: 4.5,
    reviews: "3,400",
    eta: "Tomorrow",
    sizes: ["Universal"],
    image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 8,
    title: "JBL Tune 510BT Pure Bass On-Ear",
    brand: "JBL",
    category: "Audio",
    categoryKey: "audio",
    merchant: "PulseGadgets",
    price: 2499,
    originalPrice: 3499,
    rating: 4.6,
    reviews: "1,820",
    eta: "in 2 days",
    sizes: ["Standard"],
    image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 9,
    title: "Sony WH-CH520 Wireless Bluetooth",
    brand: "Sony",
    category: "Audio",
    categoryKey: "audio",
    merchant: "TechMart",
    price: 2999,
    originalPrice: 4499,
    rating: 4.8,
    reviews: "2,100",
    eta: "Tomorrow",
    sizes: ["Standard"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 10,
    title: "SoundCore Pro ANC Wireless Audio",
    brand: "SONICPRO",
    category: "Audio",
    categoryKey: "audio",
    merchant: "ShopSphere",
    price: 3499,
    originalPrice: 4999,
    rating: 4.8,
    reviews: "4,502",
    eta: "Tomorrow",
    sizes: ["Standard"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"
  },

  // SMARTWATCHES
  {
    id: 11,
    title: "Fire-Boltt Gladiator Bluetooth Calling Watch",
    brand: "Fire-Boltt",
    category: "Watches",
    categoryKey: "smartwatch",
    merchant: "PulseGadgets",
    price: 2199,
    originalPrice: 3299,
    rating: 4.4,
    reviews: "980",
    eta: "Tomorrow",
    sizes: ["1.96 Inch"],
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 12,
    title: "Noise ColorFit Pro 5 AMOLED Smartwatch",
    brand: "Noise",
    category: "Watches",
    categoryKey: "smartwatch",
    merchant: "PulseGadgets",
    price: 2999,
    originalPrice: 4199,
    rating: 4.7,
    reviews: "1,490",
    eta: "Tomorrow",
    sizes: ["45mm"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 13,
    title: "Chronos GPS Smart Performance Watch",
    brand: "HOROLOGE",
    category: "Watches",
    categoryKey: "smartwatch",
    merchant: "ShopSphere",
    price: 2999,
    originalPrice: 4299,
    rating: 4.7,
    reviews: "1,890",
    eta: "Tomorrow",
    sizes: ["44mm"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 14,
    title: "Amazfit Bip 5 Ultra Smartwatch",
    brand: "Amazfit",
    category: "Watches",
    categoryKey: "smartwatch",
    merchant: "PulseGadgets",
    price: 3499,
    originalPrice: 4699,
    rating: 4.7,
    reviews: "720",
    eta: "in 2 days",
    sizes: ["1.91 Inch"],
    image: "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=300&q=80"
  },

  // BAGS
  {
    id: 15,
    title: "AeroSport Lightweight Hydration Pack",
    brand: "URBANCRAFT",
    category: "Bags",
    categoryKey: "bags",
    merchant: "QuickBuy",
    price: 1899,
    originalPrice: 2499,
    rating: 4.5,
    reviews: "780",
    eta: "in 2 days",
    sizes: ["20L"],
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 16,
    title: "UrbanShield Commuter Tech Backpack",
    brand: "URBANCRAFT",
    category: "Bags",
    categoryKey: "bags",
    merchant: "ShopSphere",
    price: 2499,
    originalPrice: 3499,
    rating: 4.7,
    reviews: "1,120",
    eta: "Tomorrow",
    sizes: ["28L"],
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80"
  }
];

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
      text: "👋 Hi! I am your AI Buyer Agent. Tell me what you'd like to purchase with natural constraints (e.g., 'smartwatch under ₹3000 by tomorrow' or 'running shoes under ₹3,000, size 9').",
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
  const [hasZeroMatch, setHasZeroMatch] = useState(false);

  // Execution Trace state machine
  const [isExecutingTrace, setIsExecutingTrace] = useState(false);
  const [traceSteps, setTraceSteps] = useState([]);
  const [activeFailureScenario, setActiveFailureScenario] = useState('none');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, candidateList, finalPick, traceSteps, showConfirmationPrompt]);

  // If user clicked "Buy with AI Agent" on a storefront card
  useEffect(() => {
    if (selectedStorefrontProduct) {
      const category = selectedStorefrontProduct.category || 'Running';
      const budgetCeiling = Math.ceil(selectedStorefrontProduct.price + 200);
      const promptQuery = `Buy me ${selectedStorefrontProduct.title} (${category}) under ₹${budgetCeiling}, size 9, arrive by Friday`;
      setInputValue(promptQuery);
      handleSendQuery(promptQuery, 'none', selectedStorefrontProduct);
      onClearSelectedProduct();
    }
  }, [selectedStorefrontProduct]);

  // Natural Language Parser
  const parseNaturalLanguageIntent = (queryText, targetProduct = null) => {
    const text = queryText.toLowerCase();

    // 1. Parse Budget (handles "1k", "2.5k", "under 3000", "rs 2500", "₹1,000")
    let budgetMax = 3000;
    const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      budgetMax = Math.round(parseFloat(kMatch[1]) * 1000);
    } else {
      const numMatches = text.match(/(?:under|below|max|rs\.?|₹|\bless\s+than\b)\s*(\d+[\d,]*)/i) || text.match(/(\d+[\d,]*)/);
      if (numMatches) {
        const parsed = parseInt(numMatches[1].replace(/,/g, ''), 10);
        if (parsed > 50) { // avoid matching single digit sizes
          budgetMax = parsed;
        }
      }
    }

    // 2. Parse Category
    let category = "Running";
    let categoryLabel = "running shoes";
    if (text.includes("smartwatch") || text.includes("smart watch") || text.includes("watch") || text.includes("watches")) {
      category = "Watches";
      categoryLabel = "smartwatches";
    } else if (text.includes("audio") || text.includes("headphone") || text.includes("earbuds") || text.includes("earphone") || text.includes("tws") || text.includes("speaker") || text.includes("boat") || text.includes("sony") || text.includes("jbl")) {
      category = "Audio";
      categoryLabel = "wireless audio";
    } else if (text.includes("bag") || text.includes("backpack") || text.includes("pack")) {
      category = "Bags";
      categoryLabel = "travel & athletic bags";
    } else if (text.includes("sneaker") || text.includes("sneakers") || text.includes("streetwear")) {
      category = "Sneakers";
      categoryLabel = "sneakers";
    } else {
      category = "Running";
      categoryLabel = "running shoes";
    }

    if (targetProduct) {
      category = targetProduct.category;
      categoryLabel = targetProduct.category.toLowerCase();
    }

    // 3. Parse Delivery Deadline
    let deliveryEta = "Friday (2026-08-29)";
    if (text.includes("tomo") || text.includes("tomorrow") || text.includes("1 day") || text.includes("urgent")) {
      deliveryEta = "Tomorrow";
    } else if (text.includes("friday") || text.includes("fri")) {
      deliveryEta = "Friday (2026-08-29)";
    } else if (text.includes("2 day") || text.includes("weekend")) {
      deliveryEta = "in 2 days";
    }

    // 4. Parse Size
    let size = null;
    const sizeMatch = text.match(/(?:size|sz|uk)\s*(\d+)/i);
    if (sizeMatch) {
      size = parseInt(sizeMatch[1], 10);
    } else if (category === "Running" || category === "Sneakers") {
      size = 9; // sensible default
    }

    return {
      category,
      categoryLabel,
      budget_max: budgetMax,
      delivery_deadline: deliveryEta,
      size,
      max_retries: 2,
      rawQuery: queryText
    };
  };

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
    setHasZeroMatch(false);
    setActiveFailureScenario(scenario);

    // 1. Natural Language Parse
    const constraints = parseNaturalLanguageIntent(queryText, targetProduct);
    setMandateConstraints(constraints);

    // 2. Agent Conversational Acknowledgement
    setTimeout(() => {
      const sizeStr = constraints.size ? `, size ${constraints.size}` : '';
      const agentAckMsg = {
        id: `agent-ack-${Date.now()}`,
        sender: 'agent',
        text: `Understood! I parsed your intent mandate: Looking for **${constraints.categoryLabel}** under **₹${constraints.budget_max.toLocaleString('en-IN')}**${sizeStr}, arriving **${constraints.delivery_deadline}**. Querying multi-merchant catalogs...`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, agentAckMsg]);

      // 3. Dynamic Catalog Search & Deterministic Scoring
      setTimeout(() => {
        let pool = CATALOG_DATABASE.filter(p => p.category === constraints.category);
        if (pool.length === 0) pool = CATALOG_DATABASE.slice(0, 4);

        if (targetProduct) {
          // ensure target product is at front
          pool = [targetProduct, ...pool.filter(p => p.id !== targetProduct.id)];
        }

        // Evaluate each candidate against budget ceiling and constraints
        const evaluatedCandidates = pool.map(item => {
          const exceedsBudget = item.price > constraints.budget_max;
          let candidateStatus = 'candidate';
          let candidateReason = '';

          if (exceedsBudget) {
            candidateStatus = 'rejected';
            candidateReason = `✕ Rejected: Price ₹${item.price.toLocaleString('en-IN')} exceeds budget ceiling ₹${constraints.budget_max.toLocaleString('en-IN')}`;
          } else {
            candidateStatus = 'candidate';
            candidateReason = `Meets budget (₹${item.price} ≤ ₹${constraints.budget_max}), rating ${item.rating}★, ETA: ${item.eta}`;
          }

          return {
            ...item,
            status: candidateStatus,
            reason: candidateReason,
            score: (10000 - item.price) / 10000 + (item.rating / 10)
          };
        });

        // Filter viable candidates within budget
        const viableCandidates = evaluatedCandidates.filter(c => c.status !== 'rejected').sort((a, b) => a.price - b.price);

        if (viableCandidates.length === 0) {
          // Zero match / Budget Breach state
          const lowestCandidate = pool.slice().sort((a, b) => a.price - b.price)[0];
          setCandidateList(evaluatedCandidates.slice(0, 3));
          setHasZeroMatch(true);
          setFinalPick(lowestCandidate);
          
          const explainText = `⚠️ **Zero Candidates Within Budget:** No verified ${constraints.categoryLabel} found under ₹${constraints.budget_max.toLocaleString('en-IN')}. Lowest available candidate is **${lowestCandidate.title}** at ₹${lowestCandidate.price.toLocaleString('en-IN')} (+₹${(lowestCandidate.price - constraints.budget_max).toLocaleString('en-IN')} over ceiling). **Mandate boundary defense prevents unauthorized checkout.**`;
          setExplainabilityReason(explainText);
          setShowConfirmationPrompt(true);
          setIsProcessing(false);
          return;
        }

        // Set winner and fallback
        let winner = viableCandidates[0];
        let fallback = viableCandidates[1] || evaluatedCandidates.find(c => c.id !== winner.id);

        if (scenario === 'stockout') {
          // simulate rank 1 out of stock
          winner.status = 'stockout_first';
          winner.reason = 'Stockout mid-flow during live reservation';
          if (fallback) {
            fallback.status = 'winner';
            fallback.reason = `✓ Secured as Rank #2 fallback within mandate bounds (₹${fallback.price} ≤ ₹${constraints.budget_max})`;
          }
        } else {
          winner.status = 'winner';
          winner.reason = `✓ Best candidate: Lowest price (₹${winner.price.toLocaleString('en-IN')}) with ${winner.rating}★ rating, arrives ${winner.eta}`;
        }

        const finalList = [
          winner,
          fallback,
          ...evaluatedCandidates.filter(c => c.id !== winner.id && (!fallback || c.id !== fallback.id))
        ].filter(Boolean).slice(0, 3);

        setCandidateList(finalList);

        const chosen = scenario === 'stockout' && fallback ? fallback : winner;
        setFinalPick(chosen);

        const savedAmount = constraints.budget_max - chosen.price;
        const savedText = savedAmount > 0 ? `saved ₹${savedAmount.toLocaleString('en-IN')} vs ₹${constraints.budget_max.toLocaleString('en-IN')} ceiling` : `exact budget match`;
        
        const explainText = scenario === 'stockout'
          ? `🎯 **Final Pick:** **${chosen.title}** at ₹${chosen.price.toLocaleString('en-IN')} (Recovered gracefully to Rank #2 from ${chosen.merchant} after Rank #1 stockout).`
          : `🎯 **Final Pick:** **${chosen.title}** at ₹${chosen.price.toLocaleString('en-IN')} (${savedText}, delivers ${chosen.eta}, merchant ${chosen.merchant}).`;

        setExplainabilityReason(explainText);
        setShowConfirmationPrompt(true);
        setIsProcessing(false);

      }, 650);

    }, 450);
  };

  // Start the Live 7-Stage Execution Trace
  const handleConfirmAndExecute = (overrideForceBreach = false) => {
    setShowConfirmationPrompt(false);
    setIsExecutingTrace(true);

    const isBreach = overrideForceBreach || hasZeroMatch || activeFailureScenario === 'mandate_breach';
    const isBadSig = activeFailureScenario === 'bad_signature';
    const isStockout = activeFailureScenario === 'stockout';

    const chosen = finalPick || {
      title: "Velocity Run 3 Neutral Trainer",
      price: 2799,
      merchant: "TechMart",
      eta: "Tomorrow"
    };

    const budgetCeiling = mandateConstraints?.budget_max || 3000;
    const actualPrice = isBreach && hasZeroMatch ? chosen.price : isBreach ? budgetCeiling + 499 : chosen.price;

    const initialSteps = [
      {
        id: 'INTENT_PARSED',
        title: '1. Intent Parsed',
        description: `Structured constraints: Category (${mandateConstraints?.category || 'General'}), Budget Ceiling (₹${budgetCeiling.toLocaleString('en-IN')}), ETA (${mandateConstraints?.delivery_deadline || 'Friday'})`,
        status: 'running',
        timestamp: '+0.00s',
        rawPayload: {
          intent: "bounded_agent_purchase",
          category: mandateConstraints?.category || "Running",
          budget_max_inr: budgetCeiling,
          size_spec: mandateConstraints?.size || "Universal",
          delivery_deadline: mandateConstraints?.delivery_deadline || "Friday",
          max_retries: 2,
          auth_context: "pre_approved_mandate_bound"
        }
      },
      {
        id: 'CANDIDATES_SCORED',
        title: '2. Candidates Scored',
        description: `Catalog discovery evaluated ${candidateList.length || 3} items across merchants; best candidate scored`,
        status: 'pending',
        timestamp: '',
        rawPayload: {
          candidates_evaluated_count: candidateList.length || 3,
          filtered_out_count: candidateList.filter(c => c.status === 'rejected').length,
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
          ? `MANDATE REJECT: Amount ₹${actualPrice.toLocaleString('en-IN')} exceeds budget ceiling ₹${budgetCeiling.toLocaleString('en-IN')}`
          : `Bounded Proof: Amount ₹${actualPrice.toLocaleString('en-IN')} ≤ Ceiling ₹${budgetCeiling.toLocaleString('en-IN')} (Margin: ₹${(budgetCeiling - actualPrice).toLocaleString('en-IN')} remaining)`,
        status: 'pending',
        timestamp: '',
        boundedProof: {
          amountStr: `₹${actualPrice.toLocaleString('en-IN')}`,
          ceilingStr: `₹${budgetCeiling.toLocaleString('en-IN')}`,
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
        description: `Merchant ${chosen.merchant} order created with single-use authorization token`,
        status: 'pending',
        timestamp: '',
        rawPayload: {
          merchant_order_id: `ord_merch_${chosen.merchant.toLowerCase()}_78291a`,
          merchant_id: `m_${chosen.merchant.toLowerCase()}_01`,
          item_title: chosen.title,
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

    // Live Step Execution Sequencer
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
            title: '🛑 Agent Mitigation: Safe Abort',
            description: `Mandate Defense Triggered: Price ₹${actualPrice.toLocaleString('en-IN')} exceeds budget ceiling ₹${budgetCeiling.toLocaleString('en-IN')}. Zero authorization tokens issued. Transaction halted with ₹0 charged.`,
            status: 'mitigated',
            timestamp: '+0.88s',
            rawPayload: {
              action: "SAFE_ABORT",
              reason: `Amount ${actualPrice} exceeds mandate ceiling ${budgetCeiling}`,
              mitigation_strategy: "halt_and_protect_funds",
              funds_charged: 0,
              mandate_defense_active: true
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

  const handleAdjustBudgetAndRerun = (newBudget) => {
    const query = `Buy me ${mandateConstraints?.categoryLabel || 'product'} under ₹${newBudget}, arrive ${mandateConstraints?.delivery_deadline || 'by Friday'}`;
    handleSendQuery(query, 'none');
  };

  const handleReset = () => {
    setIsExecutingTrace(false);
    setShowConfirmationPrompt(false);
    setCandidateList([]);
    setFinalPick(null);
    setTraceSteps([]);
    setHasZeroMatch(false);
    setMessages([
      {
        id: 'welcome',
        sender: 'agent',
        text: "👋 AI Buyer Agent ready! Type any shopping request (e.g., 'smartwatch under ₹3000 by tomorrow' or 'running shoes under ₹3000, size 9').",
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
          onClick={() => handleSendQuery("running shoes under ₹3000, size 9, arrive by Friday", "none")}
          className="btn btn-secondary btn-xs"
          style={{ whiteSpace: 'nowrap', fontSize: '0.72rem' }}
          title="Happy Path: Full automated bounded purchase"
        >
          ⚡ Running Shoes &lt; ₹3k
        </button>

        <button
          onClick={() => handleSendQuery("smartwatch under ₹3000 by tomorrow", "none")}
          className="btn btn-secondary btn-xs"
          style={{ whiteSpace: 'nowrap', fontSize: '0.72rem' }}
          title="Smartwatch under ₹3k"
        >
          ⌚ Smartwatch &lt; ₹3k
        </button>

        <button
          onClick={() => handleSendQuery("smartwatch under 1K by tomorrow", "mandate_breach")}
          className="btn btn-secondary btn-xs"
          style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', color: '#b91c1c' }}
          title="Failure Demo: Budget Ceiling Breach (₹1k vs ₹2.1k)"
        >
          ⚠️ Mandate Breach (&lt; ₹1k)
        </button>

        <button
          onClick={() => handleSendQuery("wireless audio headphones under ₹3000", "bad_signature")}
          className="btn btn-secondary btn-xs"
          style={{ whiteSpace: 'nowrap', fontSize: '0.72rem', color: '#b91c1c' }}
          title="Failure Demo: Simulates bad cryptographic signature rejection"
        >
          🔒 Webhook Tamper
        </button>

        <button
          onClick={() => handleSendQuery("running shoes under ₹3000, size 9", "stockout")}
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
            background: hasZeroMatch ? '#fef2f2' : 'var(--accent-blue-light)',
            border: `1px solid ${hasZeroMatch ? '#fecaca' : 'var(--border-medium)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            fontSize: '0.82rem',
            color: 'var(--text-primary)',
            lineHeight: 1.45
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: hasZeroMatch ? '#dc2626' : 'var(--accent-blue)', fontWeight: 700, marginBottom: '4px', fontSize: '0.78rem' }}>
              <Zap size={14} /> EXPLAINABILITY REASONING
            </div>
            <div dangerouslySetInnerHTML={{ __html: explainabilityReason.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
          </div>
        )}

        {/* Confirmation Action Box before Checkout */}
        {showConfirmationPrompt && !isExecutingTrace && traceSteps.length === 0 && (
          <div className="fade-in-node" style={{
            background: 'var(--bg-surface)',
            border: `1px solid ${hasZeroMatch ? '#f87171' : 'var(--border-focus)'}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            boxShadow: 'var(--shadow-sm)',
            marginTop: '4px'
          }}>
            {hasZeroMatch ? (
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#991b1b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={16} color="#dc2626" />
                  <span>Mandate Boundary Breach Detected</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Price ₹{finalPick?.price.toLocaleString('en-IN')} exceeds your ₹{mandateConstraints?.budget_max.toLocaleString('en-IN')} ceiling. How would you like to proceed?
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => handleConfirmAndExecute(true)}
                    className="btn btn-danger"
                    style={{ width: '100%', fontSize: '0.84rem', padding: '9px' }}
                    title="Run execution trace to demonstrate Mandate Ceiling Breach and Safe Abort"
                  >
                    <span>Demonstrate Mandate Safety Abort (₹0 Charged)</span>
                  </button>

                  <button
                    onClick={() => handleAdjustBudgetAndRerun(Math.ceil((finalPick?.price || 2500) + 100))}
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '0.82rem', padding: '8px' }}
                  >
                    <span>Adjust Budget Ceiling to ₹{Math.ceil((finalPick?.price || 2500) + 100).toLocaleString('en-IN')} & Re-run</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  Proceed with bounded agent checkout?
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Issuing single-use payment mandate bounded to ₹{finalPick?.price.toLocaleString('en-IN') || '2,799'} with Razorpay test rails.
                </p>

                <button
                  onClick={() => handleConfirmAndExecute(false)}
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '0.88rem', padding: '10px' }}
                >
                  <Zap size={16} />
                  <span>Confirm & Execute Agent Checkout</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* THE EXECUTION TRACE (Centerpiece Live Stepper) */}
        {traceSteps.length > 0 && (
          <AgentExecutionTrace
            traceState={traceSteps}
            isExecuting={isExecutingTrace}
            onResetTrace={() => handleConfirmAndExecute(hasZeroMatch)}
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
          placeholder="e.g. smartwatch under 3k, running shoes..."
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
