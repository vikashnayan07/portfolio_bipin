# Production Deployment Guide — bipinoberoy.me

## Architecture Overview

```
┌──────────────────────────────────────────────┐
│              Vercel (Hosting)                 │
│                                              │
│  ┌──────────────┐   ┌─────────────────────┐  │
│  │  React SPA   │   │  Serverless APIs    │  │
│  │  (Frontend)  │   │  /api/send-reply    │  │
│  │  build/      │   │  /api/track-visit   │  │
│  └──────────────┘   └─────────────────────┘  │
│         │                    │                │
└─────────┼────────────────────┼────────────────┘
          │                    │
          ▼                    ▼
┌──────────────────────────────────────────────┐
│           Supabase (Backend)                 │
│  ┌─────────┐  ┌────────┐  ┌──────────────┐  │
│  │PostgreSQL│  │Storage │  │ Auth (Admin) │  │
│  │ 5 tables │  │ Bucket │  │  Email/Pass  │  │
│  └─────────┘  └────────┘  └──────────────┘  │
└──────────────────────────────────────────────┘
```

---

## 🔐 Environment Variables — What Goes Where

### Frontend (Vercel Dashboard → Environment Variables)

These are **safe to expose** (they're public anon keys):

| Variable                      | Value                                      | Safe?                                |
| ----------------------------- | ------------------------------------------ | ------------------------------------ |
| `REACT_APP_SUPABASE_URL`      | `https://xinyyvsjwuwyocsrmfzk.supabase.co` | ✅ Public                            |
| `REACT_APP_SUPABASE_ANON_KEY` | `eyJhbGci...61Q`                           | ✅ Public (anon role, RLS-protected) |

> The anon key is designed to be public. It can only access what RLS policies allow.

### Backend / Serverless Functions (Vercel Dashboard → Environment Variables)

These are **SECRET** and must NEVER be in frontend code:

| Variable               | Where to Get It                            | Safe to Expose? |
| ---------------------- | ------------------------------------------ | --------------- |
| `SUPABASE_URL`         | Same as above                              | ✅ (same URL)   |
| `SUPABASE_SERVICE_KEY` | Supabase → Settings → API → `service_role` | ❌ NEVER EXPOSE |
| `RESEND_API_KEY`       | https://resend.com/api-keys                | ❌ NEVER EXPOSE |

> The `service_role` key bypasses RLS entirely. It must only be used server-side.

---

## 📋 Step-by-Step Deployment Order

### Step 1: Run Supabase SQL Migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Paste the contents of `supabase-visitors-upgrade.sql`
3. Click **Run**
4. Verify: Go to Table Editor → `visitors` table → should see new columns:  
   `session_id`, `device_type`, `country`, `blog_slug`, `is_unique`

### Step 2: Push Code to GitHub

Open terminal in `D:\port_folio\portfolio`:

```powershell
# 1. Verify .env is NOT tracked
git ls-files --cached .env
# (should output nothing)

# 2. Stage all changes
git add -A

# 3. Review what's being committed
git status

# 4. Commit
git commit -m "feat: production upgrade - visitor analytics, dashboard, tracking API

- Add visitor tracking system (useVisitorTracking hook)
- Add /api/track-visit serverless function with IP hashing & anti-spam
- Upgrade VisitorCounter to use real Supabase data with live updates
- Upgrade Dashboard with full analytics (charts, device breakdown, top blogs)
- Add Supabase schema migration for visitor analytics
- Fix blog view counting (session-based, no refresh spam)"

# 5. Push
git push origin main
```

### Step 3: Set Environment Variables on Vercel

1. Go to https://vercel.com → your `portfolio_bipin` project
2. Click **Settings** → **Environment Variables**
3. Add these variables (if not already set):

| Name                          | Value                                      | Environment                      |
| ----------------------------- | ------------------------------------------ | -------------------------------- |
| `REACT_APP_SUPABASE_URL`      | `https://xinyyvsjwuwyocsrmfzk.supabase.co` | Production, Preview, Development |
| `REACT_APP_SUPABASE_ANON_KEY` | (your anon key)                            | Production, Preview, Development |
| `SUPABASE_URL`                | `https://xinyyvsjwuwyocsrmfzk.supabase.co` | Production                       |
| `SUPABASE_SERVICE_KEY`        | (your service_role key)                    | Production                       |
| `RESEND_API_KEY`              | (your Resend API key)                      | Production                       |

4. Click **Save**

### Step 4: Trigger Vercel Redeploy

After pushing to GitHub, Vercel should auto-deploy. If not:

1. Go to Vercel Dashboard → **Deployments**
2. Click **Redeploy** on the latest deployment
3. Wait for build to complete (~2-3 minutes)

### Step 5: Verify Everything Works

Test in this order:

1. **Website loads**: Visit https://bipinoberoy.me
2. **Visitor counter**: Scroll to the counter section — should show real count
3. **Blog**: Click a blog post — views should increment (check Supabase)
4. **Contact form**: Send a test message
5. **Admin panel**: Visit https://bipinoberoy.me/admin
6. **Dashboard analytics**: Should show visitor data
7. **Reply system**: Reply to a message — email should send
8. **Check Supabase**: `visitors` table should have new entries

---

## 📁 Project Structure (Production)

```
portfolio/
├── api/                        # Vercel Serverless Functions
│   ├── send-reply.js           # POST /api/send-reply (email replies)
│   └── track-visit.js          # POST /api/track-visit (visitor tracking)
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── admin/              # Admin panel (Dashboard, ProfileEditor, etc.)
│   │   ├── layout/             # Navbar, Footer
│   │   ├── sections/           # Hero, About, Blog, BlogPost, Contact, etc.
│   │   ├── three/              # 3D components
│   │   └── ui/                 # VisitorCounter, ScrollProgress, etc.
│   ├── context/                # ThemeContext, AuthContext
│   ├── hooks/                  # useProfile, useVisitorTracking
│   ├── lib/                    # supabase.js client
│   └── styles/                 # Custom CSS
├── .env                        # LOCAL ONLY — never pushed
├── .gitignore                  # Excludes .env, node_modules, build
├── vercel.json                 # Vercel routing config
├── supabase-schema.sql         # Initial DB schema (reference)
├── supabase-visitors-upgrade.sql # Analytics migration (run manually)
└── package.json
```

---

## 🔄 How the Systems Work

### Visitor Tracking Flow

```
User visits site
    ↓
useVisitorTracking hook fires (1.5s delay)
    ↓
Checks sessionStorage for anti-spam
    ↓
Inserts into Supabase `visitors` table
    ↓
(For blog posts: also tracks blog_slug)
    ↓
Dashboard reads from `visitors` table
VisitorCounter reads count with live realtime
```

### Email Reply Flow

```
Admin writes reply in MessagesManager
    ↓
POST /api/send-reply (Vercel Serverless)
    ↓
Validates with SUPABASE_SERVICE_KEY
    ↓
Updates message status in Supabase
    ↓
Sends email via Resend API
    ↓
User receives styled HTML email
```

---

## ⚠️ Troubleshooting

### "Visitor count shows 0"

→ Run `supabase-visitors-upgrade.sql` in Supabase SQL Editor

### "Email replies not working"

→ Check Vercel Environment Variables for `RESEND_API_KEY` and `SUPABASE_SERVICE_KEY`

### "Dashboard chart empty"

→ The `get_daily_visits` function needs to be created via the SQL migration

### "API returns 500"

→ Check Vercel Function Logs: Vercel Dashboard → **Functions** tab → click the function

### "Build fails on Vercel"

→ Ensure Node.js version is 18+ in Vercel Settings → General → Node.js Version

---

## 🎯 Post-Deployment Checklist

- [ ] SQL migration run in Supabase
- [ ] Code pushed to GitHub
- [ ] Environment variables set on Vercel
- [ ] Vercel deployment successful
- [ ] bipinoberoy.me loads correctly
- [ ] Visitor counter shows real data
- [ ] Blog posts load with views tracking
- [ ] Contact form submits messages
- [ ] Admin panel accessible at /admin
- [ ] Dashboard shows analytics
- [ ] Email replies work via Resend
- [ ] Domain DNS pointing correctly (Namecheap → Vercel)
