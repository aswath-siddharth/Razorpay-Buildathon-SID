# AI Buyer: Making Merchants Transactable by AI
### End-to-end build plan — Razorpay AI Buildathon, Track 01

---

## 1. Scope the problem before you scope the code

The brief as written is deliberately broad — discovery, comparison, decision, checkout, payment, confirmation, all "end to end." If you try to build general-purpose e-commerce AI shopping in the time you have, you'll ship something shallow everywhere instead of solid anywhere.

**Narrow it to one concrete customer journey** and build that journey deep. Example:

> "Buy me running shoes under ₹3,000, size 9, that can arrive by Friday."

That single sentence forces every piece of the pipeline to exist: natural language parsing, multi-merchant discovery, constraint-based comparison (price + size + delivery), a bounded purchase decision, real payment execution, and a confirmation. Pick your own journey if you want (electronics under a budget, groceries under a budget — anything with 2–3 comparable constraints), but pick **one**, and design the demo around it.

---

## 2. Architecture

```
                    ┌─────────────────────┐
   User (chat/CLI)  │   Intent Mandate     │  "budget ≤ ₹3000, size 9,
   ───────────────► │   (set once, up      │   deliver by Fri, max 2
                     │   front)             │   retries, notify on fail"
                     └──────────┬───────────┘
                                │ bounds every downstream action
                                ▼
                     ┌─────────────────────┐
                     │   Buyer Agent        │   orchestrator: parses intent,
                     │   (orchestrator)     │   calls tools, scores options,
                     │                      │   never spends outside bounds
                     └──────┬──────┬────────┘
                             │      │
             ┌───────────────┘      └───────────────┐
             ▼                                       ▼
   ┌───────────────────┐                  ┌───────────────────────┐
   │ Merchant Catalog    │                  │  Audit Log (append-only)│
   │ Service(s)          │◄─────────────────┤  every decision, tool  │
   │ — agent-readable     │    logs every    │  call, amount logged   │
   │   structured JSON    │    call/decision │  before it executes    │
   └───────────────────┘                  └───────────────────────┘
             │
             ▼ agent picks best option within Intent Mandate
   ┌───────────────────┐
   │  Cart + Payment      │  scoped, single-use, amount-bound
   │  Mandate              │  authorization token
   └──────────┬────────┘
              ▼
   ┌───────────────────┐
   │  Razorpay (test)     │  Orders API → Payment Link / Checkout →
   │                       │  webhook confirms → signature verified
   └──────────┬────────┘
              ▼
   ┌───────────────────┐
   │  Confirmation back    │  "Bought Nike Revolution 6, ₹2,799,
   │  to user               │  arrives Thu. Here's the receipt + trail."
   └───────────────────┘
```

### Why this shape, not a simpler one

A tempting shortcut is: "LLM calls a function, function calls Razorpay, done." That collapses discovery, decision, and authorization into one undifferentiated blob — which means you *can't* show an audit trail with distinct, explainable steps, and you can't demonstrate "bounded." The mandate layer is what turns a demo into an architecture. It's the difference between a car with no brakes and one with brakes — both can drive, only one is safe to hand the keys to.

---

## 3. Core entities (your data model)

| Entity | Purpose | Key fields |
|---|---|---|
| `IntentMandate` | What the user authorized, set once | `budget_max`, `constraints` (size, delivery date, category), `max_retries`, `expiry`, `notify_on` |
| `Merchant` | A seller in your catalog | `id`, `name`, `rating` |
| `Product` | Agent-readable catalog item | `id`, `merchant_id`, `title`, `price`, `stock`, `attributes` (size, color), `delivery_eta` |
| `CandidateSet` | Products the agent found matching intent | scored list with explanation per candidate |
| `PaymentMandate` | Scoped, single-use, amount-bound token derived from IntentMandate + chosen cart | `amount`, `merchant_id`, `order_ref`, `expiry`, `single_use=true` |
| `Order` | Razorpay order object | `razorpay_order_id`, `status`, `receipt` |
| `AuditEvent` | One row per action taken | `timestamp`, `actor`, `action`, `input`, `output`, `reasoning`, `mandate_ref` |

Every write to `Order` or `PaymentMandate` should be preceded by an `AuditEvent` — log the decision *before* you act on it, not after. That single habit is what makes your audit trail credible instead of decorative.

---

## 4. Tech stack

| Layer | Recommendation | Why |
|---|---|---|
| Backend / orchestrator | **Python + FastAPI** | Fast to build, good for both the agent loop and the merchant/catalog services, easy webhook handling |
| Agent reasoning | **Claude (Sonnet) or GPT via function/tool calling** | You need structured tool-calling (parse intent → tool calls → structured comparison), not free-form chat |
| Orchestration pattern | **Hand-rolled explicit state machine**, not a heavyweight agent framework | You need every transition to be inspectable and gate-able for the audit trail. A framework like LangGraph is fine if you're comfortable with it, but a plain `if/elif` state machine with named states (`PARSE_INTENT → DISCOVER → SCORE → AUTHORIZE → PAY → CONFIRM`) is easier to defend live in a 5-minute pitch and easier to prove is "bounded" |
| Merchant catalog | Seed **SQLite or Postgres** with 15–25 synthetic products across 2–3 fake merchants | Gives you real comparison logic (price/delivery/stock) instead of one hardcoded product |
| Catalog exposure | Plain REST **and** an MCP server wrapping the same data | MCP is the layer Anthropic and the wider industry are standardizing tool access around right now — wrapping your catalog as an MCP server is a small amount of extra work that signals real engineering awareness to evaluators |
| Payments | **Razorpay Python SDK, test mode** — Orders API + Payment Links API + Webhooks | Orders API creates the order; Payment Links gives you a hosted checkout surface you can either drive by browser automation or hand to the user for one-tap confirmation; Webhooks + signature verification (`razorpay.Utility.verify_payment_signature`) close the loop server-side, which is what makes the payment *trustworthy*, not just successful |
| Demo checkout automation (optional, for full autonomy) | **Playwright** scripted against Razorpay's published test cards (`4111 1111 1111 1111`, any future expiry, any CVV) | Lets you show a genuinely unattended run if you want to demonstrate the fully autonomous path alongside the mandate-gated one |
| Audit trail storage | Simple **append-only table** (Postgres) or even JSONL file for the MVP | Don't over-engineer this — a viewable, timestamped, tamper-evident-looking log is enough |
| Frontend / demo surface | A minimal **React chat UI** + a second page that renders the audit trail as a timeline | You're pitching to humans in 5 minutes — a visible trail is worth more than a polished chat bubble UI |

---

## 5. Implementation plan

### Phase 1 — Foundations (Days 1–2)
- Set up Razorpay test-mode account, get test API keys.
- Build the merchant catalog: schema + seed script with 15–25 products across price/size/delivery variance so comparison logic actually has something to chew on.
- Stand up the catalog as a REST endpoint. Wrap it as an MCP server once REST works (don't do MCP first — get the data model right, then expose it).

### Phase 2 — Agent core (Days 3–5)
- Build the `IntentMandate` parser: natural language → structured constraints (use tool-calling with a strict JSON schema, not free text).
- Build the discovery + scoring step: query catalog(s), filter by hard constraints (size, stock), rank by soft constraints (price, delivery, rating) with a transparent scoring function — not just "ask the LLM which is best." A scoring function you can explain in one sentence ("lowest price among items meeting delivery deadline") is more defensible than an opaque LLM ranking.
- Log every candidate considered and why it was accepted/rejected — this *is* your explainability story.

### Phase 3 — Payment + mandate layer (Days 6–8)
- Implement `PaymentMandate` generation: once the agent picks a cart, derive a scoped token — amount-bound to that cart total, single-use, expiring in e.g. 10 minutes, tied to the specific `order_ref`.
- Create the Razorpay Order via the Orders API using that mandate's amount (never let the agent construct an arbitrary amount at payment time — it must match the mandate).
- Wire up Payment Links API for the actual checkout surface.
- Implement the webhook receiver + signature verification. This is the step people skip and it's the one that actually proves the payment is real and authentic, not just "the API returned 200."

### Phase 4 — Failure handling (Day 9)
- Pick **one** failure mode and handle it gracefully end-to-end: out-of-stock mid-flow, payment timeout, or price mismatch between catalog and checkout.
- Show: detection → bounded retry (respecting `max_retries` from the intent mandate) → graceful fallback (cancel + notify user, or pick next-best candidate) → audit log entry for the whole sequence.
- This is explicitly called out in "the bar" — don't skip it, and don't fake it. A judge will ask you to trigger it live.

### Phase 5 — Confirmation + audit trail UI (Day 10)
- Build the confirmation message back to the user (what was bought, at what price, from whom, ETA).
- Build the audit trail viewer: a simple timeline showing intent → candidates considered → decision reasoning → mandate issued → payment created → webhook confirmed → user notified.

### Phase 6 — Polish + pitch prep (Days 11–12)
- Record the 5-minute pitch: 1 successful run end-to-end, 1 deliberate failure handled gracefully, and 60 seconds walking through the architecture diagram + audit trail.
- Clean up the public repo: README with architecture diagram, setup instructions, and a note on test-mode credentials (never commit live keys, obviously use test keys only).   

---

## 6. What "good" looks like against Razorpay's bar

Their bar is: *"Every money action explainable, bounded and gated. Show the audit trail and one failure handled gracefully."* Translate that into a checklist you can literally tick off before you submit:

- [ ] No payment amount is ever computed at the moment of payment — it's always inherited from a mandate created earlier and logged.
- [ ] There's a hard ceiling (budget) the agent structurally cannot exceed, not just a prompt instruction telling it not to.
- [ ] Every tool call and decision is logged *before* the corresponding action executes, with a human-readable reason.
- [ ] The audit trail is something you can actually open and read during the pitch, not a claim in a slide.
- [ ] You can trigger the failure case live, on demand, and the recovery is visible in the trail.
- [ ] Webhook signatures are verified server-side — you don't just trust that Razorpay says "success."

---

## 7. If you're short on time — what to cut, in order

1. Cut multi-merchant discovery down to 2 merchants instead of a full "registry." One merchant with rich catalog data still proves the pattern.
2. Cut the Playwright full-autonomy demo — the mandate + payment-link flow alone is enough to prove the concept.
3. Cut the React frontend — a well-formatted CLI/terminal walkthrough plus a single audit-trail HTML page is fine for a 5-minute pitch.
4. **Do not cut**: the mandate/authorization layer, the audit trail, or the one graceful failure. Those three are what the judges are explicitly scoring.

---

## 8. Relevant context for your pitch (why now)

Worth a single slide, not more — this shows you understand the space, not just the API:

- NPCI is actively developing a Unified Agent Protocol (UAP) to let AI agents transact over UPI on a user's behalf, using an authorization/boundary model similar to what's proposed here — it's not yet launched and needs RBI approval, but it's the direction India's own rails are heading.
- Globally, the same shape has appeared three times independently: OpenAI + Stripe's Agentic Commerce Protocol (Shared Payment Tokens, scoped and single-use), Google's AP2 (IntentMandate → CartMandate → PaymentMandate), and Coinbase's x402 for stablecoin-native agent payments. Different rails, same underlying idea — scoped, bounded authorization beats blanket autonomy.
- That convergence is your strongest pitch line: you're not inventing a novel architecture, you're implementing the pattern the entire industry has independently arrived at, on Razorpay's rails, for the Indian market.
