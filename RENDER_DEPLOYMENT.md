# 🚀 Hosting Meridian AI Buyer on Render

This guide provides step-by-step instructions to deploy both the **FastAPI Backend** and **React Frontend** as two connected services on [Render](https://render.com/).

---

## 📋 Architecture Overview
- **Backend**: Render **Web Service** (Python / FastAPI) running on Uvicorn.
- **Frontend**: Render **Static Site** (React / Vite) publishing the `dist/` directory.
- **Connection**: The Frontend communicates with the Backend via the `VITE_API_BASE_URL` environment variable.

---

## 🛠️ Option 1: Automated Deployment (Render Blueprint)

We have included a [`render.yaml`](./render.yaml) file in the root repository.

1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com/) -> Click **New +** -> Select **Blueprint**.
3. Select your repository.
4. Render will automatically detect `render.yaml` and configure both the **Backend Web Service** and **Frontend Static Site**, wiring their URLs automatically!
5. Add any secrets (like `RAZORPAY_KEY_SECRET` or `GROQ_API_KEY`) in the environment variables section and click **Apply**.

---

## 🛠️ Option 2: Manual Step-by-Step Setup on Render

If you prefer setting up the two projects individually in the Render Dashboard:

### Step 1: Deploy the Backend (Web Service)

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `ai-buyer-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add **Environment Variables**:
   | Key | Value / Note |
   |---|---|
   | `PYTHON_VERSION` | `3.11.0` |
   | `RAZORPAY_KEY_ID` | `rzp_test_TTbqDaKP2i6PmQ` |
   | `RAZORPAY_KEY_SECRET` | *(Your test secret from backend/.env)* |
   | `RAZORPAY_WEBHOOK_SECRET` | *(Your test webhook secret)* |
   | `GROQ_API_KEY` | *(Optional, if using Groq LLM)* |
5. Click **Create Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://ai-buyer-backend-xxxx.onrender.com`).

---

### Step 2: Deploy the Frontend (Static Site)

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Connect your GitHub repository.
3. Configure the following settings:
   - **Name**: `ai-buyer-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://ai-buyer-backend-xxxx.onrender.com` *(Your backend URL from Step 1)* |
   | `VITE_RAZORPAY_KEY_ID` | `rzp_test_TTbqDaKP2i6PmQ` |
5. Click **Create Static Site**.

---

## 🔄 Verification Checklist

1. Open your Frontend Render URL (e.g., `https://ai-buyer-frontend-xxxx.onrender.com`).
2. Verify the **Connected** badge in the top right header.
3. Test natural language shopping queries (e.g. `smartwatch under ₹3000 by tomorrow`).
4. Test Cart management and single-invoice AI mandate checkout.
5. Trigger Razorpay test payment modal and verify official Tax Invoice generation!
