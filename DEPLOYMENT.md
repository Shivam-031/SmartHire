# SmartHire Deployment Guide

This guide details how to deploy **SmartHire** when hosting the **Frontend** and **Backend** on separate platforms (e.g., Frontend on **Vercel / Netlify** and Backend on **Render / Railway**).

---

## Architecture Overview

```
+----------------------------------------------------+
|               FRONTEND (Client)                    |
|   Platform: Vercel / Netlify                       |
|   URL: https://smarthire-client.vercel.app         |
|   Config: VITE_API_BASE_URL                        |
+----------------------------------------------------+
                          |
                          | HTTPS REST Requests (CORS Allowed)
                          v
+----------------------------------------------------+
|               BACKEND (API Service)                |
|   Platform: Render / Railway / Fly.io              |
|   URL: https://smarthire-api.onrender.com          |
|   WSGI: Gunicorn (wsgi:app)                        |
|   Storage: SQLite (or PostgreSQL) + MongoDB        |
|   CORS: CORS_ORIGINS=*                             |
+----------------------------------------------------+
```

---

## Step 1: Deploy the Backend (e.g., on Render or Railway)

### On [Render](https://render.com):
1. Create a free account at **Render.com**.
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository: `Shivam-031/SmartHire`.
4. Fill in the deployment settings:
   - **Name**: `smarthire-backend`
   - **Region**: Choose closest to you (e.g., Oregon / Frankfurt / Singapore)
   - **Root Directory**: Leave blank (uses repo root)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `gunicorn wsgi:app --workers 1 --threads 4 --worker-class gthread --max-requests 500 --max-requests-jitter 50 --timeout 120`
5. Under **Advanced** > **Environment Variables**, add:
   | Key | Example Value | Description |
   |---|---|---|
   | `FLASK_ENV` | `production` | Production mode |
   | `PYTHONUNBUFFERED` | `1` | Stream output without RAM buffering |
   | `MALLOC_TRIM_THRESHOLD_` | `65536` | Optimizes Linux memory reclaiming for 512MB RAM |
   | `WEB_CONCURRENCY` | `1` | Ensures single worker process for 512MB limit |
   | `SECRET_KEY` | *(generate a random string)* | Flask session secret |
   | `JWT_SECRET_KEY` | *(generate a random string)* | JWT auth secret |
   | `CORS_ORIGINS` | `*` or your Vercel URL | Allowed origins |
   | `GROQ_API_KEY` | `gsk_...` *(optional)* | Free LLM API key |
   | `GEMINI_API_KEY` | `AIzaSy...` *(optional)* | Free Gemini API key |
   | `MONGO_URI` | `mongodb+srv://...` *(optional)* | If omitted, in-memory mongomock is used automatically |
6. Click **Create Web Service**.
7. Once deployed, copy your backend public URL:
   `https://smarthire-backend-xxxx.onrender.com`
   *(Test it in your browser: `https://smarthire-backend-xxxx.onrender.com/api/health` should return `{"status": "healthy"}`)*.

---

## Step 2: Deploy the Frontend (e.g., on Vercel or Netlify)

### On [Vercel](https://vercel.com):
1. Create a free account at **Vercel.com**.
2. Click **Add New...** > **Project**.
3. Import your GitHub repository: `Shivam-031/SmartHire`.
4. In the Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Expand **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `https://smarthire-backend-xxxx.onrender.com` |
   *(Important: Paste your deployed Backend URL from Step 1 with **no trailing slash**).*
6. Click **Deploy**.

---

### On [Netlify](https://netlify.com) (Alternative):
1. Click **Add new site** > **Import an existing project**.
2. Connect GitHub and select `Shivam-031/SmartHire`.
3. Set build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. In **Site Configuration** > **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://smarthire-backend-xxxx.onrender.com`
5. Click **Deploy Site**.

---

## How Cross-Platform Communication Works

1. **Centralized Client Config (`frontend/src/config/api.ts`)**:
   During build time, Vite injects `import.meta.env.VITE_API_BASE_URL`.
   All frontend requests (`/api/auth/login`, `/api/interview/start`, etc.) dynamically target the configured backend domain.
2. **CORS Headers (`backend/app.py`)**:
   Flask returns `Access-Control-Allow-Origin: *` (or specific allowed domains), allowing the browser to send cross-origin requests and bearer tokens without CORS blocks.
3. **SPA Client Routing (`vercel.json` & `_redirects`)**:
   Rewrites all sub-routes to `index.html` so direct navigation or browser refreshes on sub-routes do not produce 404 errors.

---

## Common Troubleshooting Tips

1. **Mixed Content Error (HTTPS vs HTTP)**:
   - If your frontend is hosted on `https://...` (Vercel/Netlify default), your backend URL **must also use `https://...`**.
   - Browsers block requests from HTTPS sites to unencrypted `http://` backend URLs.
2. **Backend Cold Starts (Render Free Tier)**:
   - Render's free tier spins down after 15 minutes of inactivity. The first request may take 30–50 seconds to wake up.
   - You can ping `https://your-backend.onrender.com/api/health` or use a free uptime monitor (e.g., UptimeRobot) to keep it warm.
3. **Testing Connection Locally**:
   To test with a remote backend on your local machine:
   ```bash
   cd frontend
   # In .env:
   VITE_API_BASE_URL=https://smarthire-backend-xxxx.onrender.com
   npm run dev
   ```

