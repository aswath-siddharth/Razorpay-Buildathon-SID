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
  RefreshCw,
  CreditCard,
  ShoppingBag,
  Receipt,
  FileText
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
    title: "TrailGrip Pro Off-Road Runner",
    brand: "STRIDELINE",
    category: "Running",
    categoryKey: "running_shoes",
    merchant: "QuickBuy",
    price: 3499,
    originalPrice: 4599,
    rating: 4.8,
    reviews: "908",
    eta: "in 2 days",
    sizes: [8, 9, 10],
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 3,
    title: "CloudGlide Ultra Sprint Shoes",
    brand: "AEROSTEP",
    category: "Running",
    categoryKey: "running_shoes",
    merchant: "ShopSphere",
    price: 2899,
    originalPrice: 3499,
    rating: 4.5,
    reviews: "1,420",
    eta: "Tomorrow",
    sizes: [7, 8, 9, 10],
    image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 4,
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
    id: 17,
    title: "ZoomX Marathon Elite VaporFly",
    brand: "STRIDELINE",
    category: "Running",
    categoryKey: "running_shoes",
    merchant: "TechMart",
    price: 3899,
    originalPrice: 4999,
    rating: 4.9,
    reviews: "3,210",
    eta: "Tomorrow",
    sizes: [8, 9, 10, 11],
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 18,
    title: "Infinity React Lightweight Racer",
    brand: "AEROSTEP",
    category: "Running",
    categoryKey: "running_shoes",
    merchant: "PulseGadgets",
    price: 2299,
    originalPrice: 3199,
    rating: 4.5,
    reviews: "820",
    eta: "in 2 days",
    sizes: [7, 8, 9, 10],
    image: "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=300&q=80"
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
    id: 9,
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
  {
    id: 19,
    title: "Urban Canvas Low Court Kicks",
    brand: "URBANCRAFT",
    category: "Sneakers",
    categoryKey: "sneakers",
    merchant: "QuickBuy",
    price: 1999,
    originalPrice: 2799,
    rating: 4.5,
    reviews: "1,850",
    eta: "Tomorrow",
    sizes: [7, 8, 9, 10, 11],
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 20,
    title: "Vintage Suede Minimalist Classic",
    brand: "STRIDELINE",
    category: "Sneakers",
    categoryKey: "sneakers",
    merchant: "ShopSphere",
    price: 2899,
    originalPrice: 3699,
    rating: 4.8,
    reviews: "940",
    eta: "Tomorrow",
    sizes: [8, 9, 10],
    image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=300&q=80"
  },

  // AUDIO / HEADPHONES
  {
    id: 6,
    title: "SoundCore Pro ANC Wireless Audio",
    brand: "SONICPRO",
    category: "Audio",
    categoryKey: "audio",
    merchant: "ShopSphere",
    price: 2999,
    originalPrice: 4999,
    rating: 4.8,
    reviews: "4,502",
    eta: "Tomorrow",
    sizes: ["Standard"],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 10,
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
    id: 11,
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
    id: 12,
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
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 21,
    title: "StudioBeat Studio Pro High-Res Headset",
    brand: "SONICPRO",
    category: "Audio",
    categoryKey: "audio",
    merchant: "ShopSphere",
    price: 3699,
    originalPrice: 5299,
    rating: 4.9,
    reviews: "1,150",
    eta: "Tomorrow",
    sizes: ["Standard"],
    image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=300&q=80"
  },

  // SMARTWATCHES
  {
    id: 8,
    title: "Chronos GPS Smart Performance Watch",
    brand: "HOROLOGE",
    category: "Watches",
    categoryKey: "smartwatch",
    merchant: "PulseGadgets",
    price: 2999,
    originalPrice: 4299,
    rating: 4.7,
    reviews: "1,890",
    eta: "Tomorrow",
    sizes: ["44mm"],
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 13,
    title: "Noise ColorFit Pro 5 AMOLED Smartwatch",
    brand: "Noise",
    category: "Watches",
    categoryKey: "smartwatch",
    merchant: "PulseGadgets",
    price: 2799,
    originalPrice: 4199,
    rating: 4.7,
    reviews: "1,490",
    eta: "Tomorrow",
    sizes: ["45mm"],
    image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 14,
    title: "Fire-Boltt Gladiator Bluetooth Calling Watch",
    brand: "Fire-Boltt",
    category: "Watches",
    categoryKey: "smartwatch",
    merchant: "TechMart",
    price: 2199,
    originalPrice: 3299,
    rating: 4.4,
    reviews: "980",
    eta: "Tomorrow",
    sizes: ["1.96 Inch"],
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 22,
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
  {
    id: 23,
    title: "Titan Apex Rugged Outdoor Smartwatch",
    brand: "HOROLOGE",
    category: "Watches",
    categoryKey: "smartwatch",
    merchant: "ShopSphere",
    price: 3799,
    originalPrice: 5499,
    rating: 4.8,
    reviews: "1,630",
    eta: "Tomorrow",
    sizes: ["46mm"],
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=300&q=80"
  },

  // BAGS
  {
    id: 7,
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
    id: 15,
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
    image: "https://images.unsplash.com/photo-1577733966973-d680bffd2e80?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 16,
    title: "Apex Explorer 45L Travel Duffel",
    brand: "STRIDELINE",
    category: "Bags",
    categoryKey: "bags",
    merchant: "TechMart",
    price: 2899,
    originalPrice: 3999,
    rating: 4.6,
    reviews: "890",
    eta: "Tomorrow",
    sizes: ["45L"],
    image: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=300&q=80"
  },
  {
    id: 24,
    title: "CityVibe Urban Crossbody Sling Pack",
    brand: "URBANCRAFT",
    category: "Bags",
    categoryKey: "bags",
    merchant: "QuickBuy",
    price: 1499,
    originalPrice: 2199,
    rating: 4.4,
    reviews: "640",
    eta: "Tomorrow",
    sizes: ["10L"],
    image: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=300&q=80"
  }
];

import { API_BASE, RAZORPAY_KEY } from '../config';

export default function AIBuyerPanel({
  onRunAgentBackend,
  backendConnected = false,
  selectedStorefrontProduct = null,
  onClearSelectedProduct = () => {},
  onAddToCart = () => {},
  onOrderCompleted = () => {},
  onViewOrderReceipt = () => {},
  cartCheckoutTrigger = null,
  onClearCartTrigger = () => {}
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
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [explainabilityReason, setExplainabilityReason] = useState('');
  const [mandateConstraints, setMandateConstraints] = useState(null);
  const [hasZeroMatch, setHasZeroMatch] = useState(false);
  const [itemAddedToast, setItemAddedToast] = useState(false);

  // Execution Trace state machine
  const [isExecutingTrace, setIsExecutingTrace] = useState(false);
  const [traceSteps, setTraceSteps] = useState([]);
  const [activeFailureScenario, setActiveFailureScenario] = useState('none');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle' | 'awaiting' | 'completed' | 'cancelled'

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    scrollToBottom();
    const t1 = setTimeout(scrollToBottom, 100);
    const t2 = setTimeout(scrollToBottom, 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [messages, candidateList, finalPick, traceSteps, showConfirmationPrompt, explainabilityReason]);

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

  // If Cart checkout was triggered from CartDrawer
  useEffect(() => {
    if (cartCheckoutTrigger && cartCheckoutTrigger.length > 0) {
      handleInitiateCartCheckout(cartCheckoutTrigger);
      onClearCartTrigger();
    }
  }, [cartCheckoutTrigger]);

  // Handler to initiate consolidated multi-item cart checkout
  const handleInitiateCartCheckout = (items) => {
    const subtotal = items.reduce((acc, it) => acc + (it.price * (it.quantity || 1)), 0);
    const tax = Math.round(subtotal * 0.05);
    const cartTotal = subtotal + tax;

    const userMsg = {
      id: `user-cart-${Date.now()}`,
      sender: 'user',
      text: `🛒 Checkout entire cart (${items.length} items, Total: ₹${cartTotal.toLocaleString('en-IN')})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const agentAckMsg = {
      id: `agent-cart-ack-${Date.now()}`,
      sender: 'agent',
      text: `Understood! Compiling **Single Consolidated Tax Invoice** for ${items.length} cart items. Generating amount-bound Payment Mandate for **₹${cartTotal.toLocaleString('en-IN')}** (Subtotal: ₹${subtotal.toLocaleString('en-IN')} + GST: ₹${tax.toLocaleString('en-IN')}).`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg, agentAckMsg]);
    setCheckoutItems(items);
    setFinalPick({
      id: 'cart-bundle',
      title: `${items.length} Cart Items Bundle`,
      merchant: "Meridian Multi-Merchant",
      price: cartTotal,
      eta: "Tomorrow",
      items: items
    });
    setMandateConstraints({
      category: "Cart Checkout",
      categoryLabel: `${items.length} items`,
      budget_max: cartTotal,
      delivery_deadline: "Tomorrow"
    });

    setCandidateList([]);
    setExplainabilityReason(`📦 **Consolidated Cart Checkout:** Single invoice & single Razorpay transaction covering all ${items.length} items (Subtotal ₹${subtotal.toLocaleString('en-IN')} + 5% GST ₹${tax.toLocaleString('en-IN')} = ₹${cartTotal.toLocaleString('en-IN')}).`);
    setShowConfirmationPrompt(true);
  };

  // Payment Success Handler (User completed payment in Razorpay modal)
  const handlePaymentSuccess = (response) => {
    const rzpPaymentId = response?.razorpay_payment_id || `pay_${Math.random().toString(36).substring(2, 11)}`;
    const rzpOrderId = response?.razorpay_order_id || `order_RPZ${Math.random().toString(36).substring(2, 8)}`;
    const receiptNum = `RCP_${rzpPaymentId.slice(-6).toUpperCase()}`;

    setPaymentStatus('completed');
    setIsExecutingTrace(false);

    const completedOrder = {
      id: `ord_${Date.now()}`,
      receipt_id: receiptNum,
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      items: checkoutItems.length > 0 ? checkoutItems : [finalPick],
      totalAmount: finalPick?.price || 2799,
      razorpay_payment_id: rzpPaymentId,
      razorpay_order_id: rzpOrderId,
      mandate_token: "mnd_tok_892104a99b",
      status: "PAID & VERIFIED"
    };

    onOrderCompleted(completedOrder);

    // Transition Step 5 -> Step 6 -> Step 7
    setTraceSteps(prev => prev.filter(s => s.id !== 'AGENT_MITIGATION').map(s => {
      if (s.id === 'PAYMENT_INITIATED') {
        return {
          ...s,
          status: 'done',
          title: '5. Payment Captured',
          description: `Razorpay payment captured successfully: ${rzpPaymentId}`,
          timestamp: '+1.15s',
          rawPayload: {
            ...s.rawPayload,
            razorpay_payment_id: rzpPaymentId,
            status: "captured"
          }
        };
      }
      if (s.id === 'WEBHOOK_VERIFIED') {
        return {
          ...s,
          status: 'done',
          title: '6. Webhook Verified',
          description: 'Server-side cryptographic HMAC-SHA256 signature verified against webhook payload',
          timestamp: '+1.42s',
          signatureDetails: { algorithm: "HMAC-SHA256", status: "VALID_CAPTURED" },
          rawPayload: {
            event: "payment.captured",
            razorpay_payment_id: rzpPaymentId,
            signature_check: "PASS (HMAC-SHA256 match)",
            server_side_check: "PASS_200"
          }
        };
      }
      if (s.id === 'CONFIRMED') {
        return {
          ...s,
          status: 'done',
          title: '7. Confirmed',
          description: `Order receipt generated, audit trail finalized and locked (Receipt: ${receiptNum})`,
          timestamp: '+1.78s',
          rawPayload: {
            receipt_id: receiptNum,
            razorpay_payment_id: rzpPaymentId,
            status: "paid_and_confirmed",
            audit_sealed: true
          }
        };
      }
      return s;
    }));
  };

  // Payment Cancelled / Dismissed Handler
  const handlePaymentCancelled = () => {
    setPaymentStatus('cancelled');
    setIsExecutingTrace(false);

    setTraceSteps(prev => {
      const updated = prev.map(s => {
        if (s.id === 'PAYMENT_INITIATED') {
          return {
            ...s,
            status: 'failed',
            title: '5. Payment Cancelled / Dismissed',
            description: 'Razorpay checkout modal was closed without completing payment. Zero funds captured.',
            timestamp: '+1.15s'
          };
        }
        if (s.id === 'WEBHOOK_VERIFIED' || s.id === 'CONFIRMED') {
          return {
            ...s,
            status: 'pending',
            description: 'Awaiting valid payment authorization...'
          };
        }
        return s;
      });

      const alreadyHasMitigation = updated.some(s => s.id === 'AGENT_MITIGATION');
      if (!alreadyHasMitigation) {
        return [
          ...updated,
          {
            id: 'AGENT_MITIGATION',
            title: '🛑 Agent Mitigation: Standby (Zero Spend)',
            description: 'Payment was dismissed by user. Mandate token is on hold (valid for 10 min). ₹0 deducted. Click "Retry Razorpay Checkout" to complete.',
            status: 'mitigated',
            timestamp: '+1.30s',
            rawPayload: {
              action: "STANDBY_USER_DISMISS",
              reason: "Payment modal dismissed before capture",
              funds_charged: 0,
              mandate_status: "reserved_on_hold"
            }
          }
        ];
      }
      return updated;
    });
  };

  // Open the Razorpay Checkout Modal
  const triggerRazorpayCheckout = (item = finalPick, price = finalPick?.price || 2799) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      const options = {
        key: RAZORPAY_KEY,
        amount: price * 100, // paise
        currency: "INR",
        name: "Meridian Store",
        description: `Agent Mandate Bounded Order: ${item?.title || 'Selected Item'}`,
        image: item?.image || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&q=80",
        prefill: {
          name: "AI Autonomous Buyer",
          email: "buyer.agent@meridian.com",
          contact: "9876543210"
        },
        notes: {
          mandate_token: "mnd_tok_892104a99b",
          merchant: item?.merchant || "TechMart",
          bounded_ceiling: `INR ${mandateConstraints?.budget_max || 3000}`
        },
        theme: {
          color: "#0066ff"
        },
        modal: {
          ondismiss: function () {
            handlePaymentCancelled();
          }
        },
        handler: function (response) {
          handlePaymentSuccess(response);
        }
      };

      try {
        const rzpInstance = new window.Razorpay(options);
        rzpInstance.open();
      } catch (err) {
        console.warn("Razorpay popup fallback", err);
        handlePaymentCancelled();
      }
    } else {
      window.open(`https://rzp.io/rzp/${(item?.id || 1)}`, '_blank');
    }
  };

  // Natural Language Parser
  const parseNaturalLanguageIntent = (queryText, targetProduct = null) => {
    const text = queryText.toLowerCase();

    let budgetMax = null;
    const kMatch = text.match(/(\d+(?:\.\d+)?)\s*k\b/i);
    if (kMatch) {
      budgetMax = Math.round(parseFloat(kMatch[1]) * 1000);
    } else {
      const numMatches = text.match(/(?:under|below|max|budget|limit|rs\.?|₹|\bless\s+than\b)\s*(\d+[\d,]*)/i);
      if (numMatches) {
        const parsed = parseInt(numMatches[1].replace(/,/g, ''), 10);
        if (parsed > 50) {
          budgetMax = parsed;
        }
      }
    }

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

    let deliveryEta = "Friday (2026-08-29)";
    if (text.includes("tomo") || text.includes("tomorrow") || text.includes("1 day") || text.includes("urgent")) {
      deliveryEta = "Tomorrow";
    } else if (text.includes("friday") || text.includes("fri")) {
      deliveryEta = "Friday (2026-08-29)";
    } else if (text.includes("2 day") || text.includes("weekend")) {
      deliveryEta = "in 2 days";
    }

    let size = null;
    const sizeMatch = text.match(/(?:size|sz|uk)\s*(\d+)/i);
    if (sizeMatch) {
      size = parseInt(sizeMatch[1], 10);
    } else if (category === "Running" || category === "Sneakers") {
      size = 9;
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
    setCheckoutItems([]);
    setTraceSteps([]);
    setHasZeroMatch(false);
    setPaymentStatus('idle');
    setActiveFailureScenario(scenario);

    // 1. First attempt Groq LLM parse from backend, with instant deterministic fallback
    let constraints;
    try {
      const resp = await fetch(`${API_BASE}/buyer/parse-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.is_greeting && !targetProduct) {
          const greetingMsg = {
            id: `agent-greeting-${Date.now()}`,
            sender: 'agent',
            text: data.conversational_reply || "👋 Hello! I am your Autonomous AI Buyer Agent on Meridian.\n\nTell me what you'd like to buy (e.g. 'smartwatch under ₹3000 by tomorrow' or 'running shoes under ₹3000, size 9').",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, greetingMsg]);
          setIsProcessing(false);
          return;
        }
        constraints = {
          category: data.category || "Running",
          categoryLabel: data.categoryLabel || "running shoes",
          budget_max: data.budget_max || 3000,
          delivery_deadline: data.delivery_deadline || "Friday (2026-08-29)",
          size: data.size || (targetProduct ? targetProduct.sizes?.[0] : null),
          max_retries: data.max_retries || 2,
          rawQuery: queryText
        };
      } else {
        constraints = parseNaturalLanguageIntent(queryText, targetProduct);
      }
    } catch (err) {
      // Deterministic fallback if backend is offline
      const isGreeting = /^(hi|hello|hey|greetings|hola|help|what can you do|who are you|hi there)[!.]*$/i.test(queryText.trim());
      if (isGreeting && !targetProduct) {
        const greetingMsg = {
          id: `agent-greeting-${Date.now()}`,
          sender: 'agent',
          text: "👋 Hello! I am your Autonomous AI Buyer Agent on Meridian.\n\nTell me what you'd like to buy and your constraints, for example:\n• *'running shoes under ₹3000, size 9'*\n• *'smartwatch under ₹3000 by tomorrow'*\n• *'wireless audio headphones under ₹2500'*\n• *'commuter tech backpack under ₹2500'*\n\nI will find the best candidates across merchant catalogs, enforce your budget mandate bounds, and execute payment with single-invoice cryptographic proof!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, greetingMsg]);
        setIsProcessing(false);
        return;
      }
      constraints = parseNaturalLanguageIntent(queryText, targetProduct);
    }

    setMandateConstraints(constraints);

    const budgetStr = constraints.budget_max 
      ? ` under **₹${constraints.budget_max.toLocaleString('en-IN')}**` 
      : '';
    const sizeStr = constraints.size ? `, size ${constraints.size}` : '';
    const etaStr = constraints.delivery_deadline && !constraints.delivery_deadline.includes("Standard") && !constraints.delivery_deadline.includes("Not specified")
      ? `, arriving **${constraints.delivery_deadline}**`
      : '';
    const agentAckMsg = {
      id: `agent-ack-${Date.now()}`,
      sender: 'agent',
      text: `Understood! I parsed your intent mandate: Looking for **${constraints.categoryLabel}**${budgetStr}${sizeStr}${etaStr}. Querying multi-merchant catalogs...`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, agentAckMsg]);

      setTimeout(() => {
        let pool = CATALOG_DATABASE.filter(p => p.category === constraints.category);
        if (pool.length === 0) pool = CATALOG_DATABASE.slice(0, 4);

        if (targetProduct) {
          pool = [targetProduct, ...pool.filter(p => p.id !== targetProduct.id)];
        }

        const evaluatedCandidates = pool.map(item => {
          const hasBudgetLimit = constraints.budget_max !== null && constraints.budget_max !== undefined;
          const exceedsBudget = hasBudgetLimit && item.price > constraints.budget_max;
          let candidateStatus = 'candidate';
          let candidateReason = '';

          if (exceedsBudget) {
            candidateStatus = 'rejected';
            candidateReason = `✕ Rejected: Price ₹${item.price.toLocaleString('en-IN')} exceeds budget ceiling ₹${constraints.budget_max.toLocaleString('en-IN')}`;
          } else if (hasBudgetLimit) {
            candidateStatus = 'candidate';
            candidateReason = `Meets budget (₹${item.price.toLocaleString('en-IN')} ≤ ₹${constraints.budget_max.toLocaleString('en-IN')}), rating ${item.rating}★, ETA: ${item.eta}`;
          } else {
            candidateStatus = 'candidate';
            candidateReason = `Available: ₹${item.price.toLocaleString('en-IN')}, rating ${item.rating}★, ETA: ${item.eta}`;
          }

          return {
            ...item,
            status: candidateStatus,
            reason: candidateReason,
            score: (10000 - item.price) / 10000 + (item.rating / 10)
          };
        });

        const viableCandidates = evaluatedCandidates.filter(c => c.status !== 'rejected').sort((a, b) => a.price - b.price);

        if (viableCandidates.length === 0) {
          const lowestCandidate = pool.slice().sort((a, b) => a.price - b.price)[0];
          setCandidateList(evaluatedCandidates.slice(0, 3));
          setHasZeroMatch(true);
          setFinalPick(lowestCandidate);
          
          const explainText = `⚠️ **Zero Candidates Within Budget:** No verified ${constraints.categoryLabel} found under ₹${(constraints.budget_max || 0).toLocaleString('en-IN')}. Lowest available candidate is **${lowestCandidate.title}** at ₹${lowestCandidate.price.toLocaleString('en-IN')} (+₹${(lowestCandidate.price - (constraints.budget_max || 0)).toLocaleString('en-IN')} over ceiling). **Mandate boundary defense prevents unauthorized checkout.**`;
          setExplainabilityReason(explainText);
          setShowConfirmationPrompt(true);
          setIsProcessing(false);
          return;
        }

        let winner = viableCandidates[0];
        let fallback = viableCandidates[1] || evaluatedCandidates.find(c => c.id !== winner.id);

        if (scenario === 'stockout') {
          winner.status = 'stockout_first';
          winner.reason = 'Stockout mid-flow during live reservation';
          if (fallback) {
            fallback.status = 'winner';
            fallback.reason = `✓ Secured as Rank #2 fallback within mandate bounds (₹${fallback.price.toLocaleString('en-IN')})`;
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

        const savedAmount = constraints.budget_max ? constraints.budget_max - chosen.price : 0;
        const savedText = constraints.budget_max && savedAmount > 0 
          ? `saved ₹${savedAmount.toLocaleString('en-IN')} vs ₹${constraints.budget_max.toLocaleString('en-IN')} ceiling, ` 
          : '';
        
        const explainText = scenario === 'stockout'
          ? `🎯 **Final Pick:** **${chosen.title}** at ₹${chosen.price.toLocaleString('en-IN')} (Recovered gracefully to Rank #2 from ${chosen.merchant} after Rank #1 stockout).`
          : `🎯 **Final Pick:** **${chosen.title}** at ₹${chosen.price.toLocaleString('en-IN')} (${savedText}delivers ${chosen.eta}, merchant ${chosen.merchant}, rated ${chosen.rating}★).`;

        setExplainabilityReason(explainText);
        setShowConfirmationPrompt(true);
        setIsProcessing(false);
      }, 650);
  };



  // Start the Live 7-Stage Execution Trace
  const handleConfirmAndExecute = (overrideForceBreach = false) => {
    setShowConfirmationPrompt(false);
    setIsExecutingTrace(true);
    setPaymentStatus('awaiting');

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
          items_count: checkoutItems.length > 0 ? checkoutItems.length : 1,
          max_retries: 2,
          auth_context: "pre_approved_mandate_bound"
        }
      },
      {
        id: 'CANDIDATES_SCORED',
        title: '2. Candidates Scored',
        description: checkoutItems.length > 0 
          ? `Cart verified: ${checkoutItems.length} items validated against merchant stock and unit pricing`
          : `Catalog discovery evaluated ${candidateList.length || 3} items across merchants; best candidate scored`,
        status: 'pending',
        timestamp: '',
        rawPayload: {
          candidates_evaluated_count: checkoutItems.length > 0 ? checkoutItems.length : (candidateList.length || 3),
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
        description: checkoutItems.length > 0
          ? `Consolidated Single Invoice created for ${checkoutItems.length} cart items`
          : `Merchant ${chosen.merchant} order created with single-use authorization token`,
        status: 'pending',
        timestamp: '',
        rawPayload: {
          merchant_order_id: `ord_merch_${chosen.merchant.toLowerCase().replace(/\s+/g, '_')}_78291a`,
          merchant_id: `m_${chosen.merchant.toLowerCase().replace(/\s+/g, '_')}_01`,
          item_title: chosen.title,
          currency: "INR",
          total: actualPrice,
          items: checkoutItems.length > 0 ? checkoutItems : [chosen]
        }
      },
      {
        id: 'PAYMENT_INITIATED',
        title: '5. Payment Initiated',
        description: 'Razorpay test Orders API dispatched. Waiting for checkout authorization...',
        status: 'pending',
        timestamp: '',
        rawPayload: {
          razorpay_order_id: "order_RPZ8192019482",
          amount_paisa: actualPrice * 100,
          currency: "INR",
          receipt: "rcpt_mnd_892104a99b",
          status: "awaiting_payment"
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
          status: isBadSig ? "INVALID_SIGNATURE" : "AWAITING_PAYMENT"
        },
        rawPayload: {
          event: "payment.captured",
          status: "pending_completion"
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
          status: "pending"
        }
      }
    ];

    setTraceSteps(initialSteps);

    const runInitialStages = async () => {
      // Step 1: Intent Parsed -> Done
      await new Promise(r => setTimeout(r, 600));
      setTraceSteps(prev => prev.map((s, i) => i === 0 ? { ...s, status: 'done', timestamp: '+0.12s' } : i === 1 ? { ...s, status: 'running' } : s));

      // Step 2: Candidates Scored -> Done
      await new Promise(r => setTimeout(r, 700));
      setTraceSteps(prev => prev.map((s, i) => i === 1 ? { ...s, status: 'done', timestamp: '+0.38s' } : i === 2 ? { ...s, status: 'running' } : s));

      // Step 3: Mandate Authorized
      await new Promise(r => setTimeout(r, 750));
      if (isBreach) {
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
        setPaymentStatus('cancelled');
        return;
      }

      setTraceSteps(prev => prev.map((s, i) => i === 2 ? { ...s, status: 'done', timestamp: '+0.62s' } : i === 3 ? { ...s, status: 'running' } : s));

      // Step 4: Order Created -> Done
      await new Promise(r => setTimeout(r, 700));
      setTraceSteps(prev => prev.map((s, i) => i === 3 ? { ...s, status: 'done', timestamp: '+0.89s' } : i === 4 ? { ...s, status: 'running' } : s));

      // Step 5: Payment Initiated -> Set running and trigger Razorpay modal!
      await new Promise(r => setTimeout(r, 750));
      setTraceSteps(prev => prev.map((s, i) => i === 4 ? { 
        ...s, 
        status: 'running', 
        description: 'Razorpay Checkout opened. Complete with any dummy details or dismiss to cancel.',
        timestamp: '+1.15s' 
      } : s));

      if (isBadSig) {
        await new Promise(r => setTimeout(r, 900));
        setTraceSteps(prev => [
          ...prev.map((s, i) => i === 4 ? { ...s, status: 'done' } : i === 5 ? { ...s, status: 'failed', timestamp: '+1.42s' } : s),
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
        setPaymentStatus('cancelled');
        return;
      }

      // Automatically launch Razorpay Checkout modal
      triggerRazorpayCheckout(chosen, actualPrice);
    };

    runInitialStages();
  };

  const handleAddToCartAction = () => {
    if (finalPick) {
      onAddToCart(finalPick);
      setItemAddedToast(true);
      setTimeout(() => setItemAddedToast(false), 2000);
    }
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
    setCheckoutItems([]);
    setTraceSteps([]);
    setHasZeroMatch(false);
    setPaymentStatus('idle');
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

        {/* Confirmation Action Box with TWO clear options: Add to Cart OR Proceed to Direct Payment */}
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
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  What would you like to do next?
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Selected: <strong>{finalPick?.title}</strong> for <strong>₹{finalPick?.price.toLocaleString('en-IN')}</strong>.
                </p>

                {/* 2 Clear Options: Add to Cart OR Proceed to Payment */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px' }}>
                  
                  {/* Option 1: Add to Cart */}
                  <button
                    onClick={handleAddToCartAction}
                    className="btn btn-secondary"
                    style={{ padding: '10px 8px', fontSize: '0.82rem', gap: '5px' }}
                    title="Add this item to cart and continue shopping"
                  >
                    {itemAddedToast ? <CheckCircle2 size={15} color="#10b981" /> : <ShoppingBag size={15} />}
                    <span>{itemAddedToast ? 'Added to Cart!' : 'Add to Cart'}</span>
                  </button>

                  {/* Option 2: Proceed to Direct Payment */}
                  <button
                    onClick={() => handleConfirmAndExecute(false)}
                    className="btn btn-primary"
                    style={{ padding: '10px 10px', fontSize: '0.84rem', gap: '6px' }}
                    title="Proceed to immediate single-invoice payment with AI Mandate"
                  >
                    <Zap size={15} />
                    <span>Proceed to Pay</span>
                  </button>

                </div>
              </div>
            )}
          </div>
        )}

        {/* THE EXECUTION TRACE (Centerpiece Live Stepper) */}
        {traceSteps.length > 0 && (
          <div>
            <AgentExecutionTrace
              traceState={traceSteps}
              isExecuting={isExecutingTrace}
              onResetTrace={() => handleConfirmAndExecute(hasZeroMatch)}
              onOpenRazorpayModal={() => triggerRazorpayCheckout(finalPick, finalPick?.price || 2799)}
              onSimulateCompletePayment={() => handlePaymentSuccess({ razorpay_payment_id: `pay_sim_${Math.random().toString(36).substring(2, 9)}` })}
              selectedProduct={finalPick}
              actualAmount={finalPick?.price || 2799}
              paymentStatus={paymentStatus}
            />

            {/* View Tax Invoice Button once Confirmed */}
            {paymentStatus === 'completed' && (
              <div className="fade-in-node" style={{ marginTop: '10px' }}>
                <button
                  onClick={() => {
                    const completedOrder = {
                      id: `ord_${Date.now()}`,
                      receipt_id: `RCP_${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
                      items: checkoutItems.length > 0 ? checkoutItems : [finalPick],
                      totalAmount: finalPick?.price || 2799,
                      razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 11)}`,
                      razorpay_order_id: "order_RPZ8192019482",
                      mandate_token: "mnd_tok_892104a99b",
                      status: "PAID & VERIFIED"
                    };
                    onViewOrderReceipt(completedOrder);
                  }}
                  className="btn btn-success"
                  style={{ width: '100%', padding: '10px', fontSize: '0.86rem', gap: '6px' }}
                >
                  <FileText size={16} />
                  <span>📄 View Official Tax Invoice & Receipt</span>
                </button>
              </div>
            )}
          </div>
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
