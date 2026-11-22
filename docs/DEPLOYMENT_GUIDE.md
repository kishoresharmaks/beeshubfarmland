# BeesHub Farmland - Zero-Downtime Deployment & Operations Guide

This guide documents the production **Zero-Downtime Blue-Green Deployment Architecture** for BeesHub Farmland (`beeshubfarmland.com`).

---

## 1. System Architecture Overview

In a traditional deployment, running `npm run build` inside the active directory deletes `.next/` while users are shopping, causing missing chunk 404 errors, broken pages, and server downtime.

The new architecture isolates every build inside its own timestamped directory and flips traffic atomically between two independent PM2 workers (**Blue** on Port `3001` and **Green** on Port `3002`) after automated pre-flight health checks succeed.

```
                              Public Internet (HTTPS)
                                        │
                                        ▼
                             [ Nginx Reverse Proxy ]
                   ┌────────────────────┴────────────────────┐
                   ▼                                         ▼
         Static Asset Requests                     Application Traffic
        (/_next/static/*, /uploads/*)                 (SSR, APIs, Pages)
                   │                                         │
                   ▼                                         ▼
       [ Cumulative Static Cache ]                 [ Upstream Switcher ]
       shared/static_cache/_next/                (deployment/nginx/upstream.conf)
    (Contains chunks from ALL builds)                        │
                                            ┌────────────────┴────────────────┐
                                            ▼                                 ▼
                                    [ beeshub-blue ]                  [ beeshub-green ]
                                    (Port 3001 - Live)               (Port 3002 - Standby)
```

---

## 2. Server Directory Layout

```text
/var/www/beeshub/
│
├── current -> /var/www/beeshub/releases/release-20261122-140000   <-- Active Release Symlink
│
├── releases/                                                      <-- Timestamped Releases
│   ├── release-20261122-120000/
│   ├── release-20261122-130000/
│   └── release-20261122-140000/                                  <-- Latest 4 kept automatically
│
├── shared/                                                        <-- Persistent across releases
│   ├── .env.production                                           <-- Master secrets file
│   ├── static_cache/                                             <-- Cumulative static chunk cache
│   │   └── _next/static/
│   ├── uploads/                                                  <-- Product images & files
│   └── logs/                                                     <-- PM2 application logs
│
├── deployment/                                                    <-- DevOps Automation Suite
│   ├── deploy.sh                                                 <-- Zero-downtime orchestrator
│   ├── rollback.sh                                               <-- Instant rollback (< 2s)
│   ├── health-check.sh                                           <-- Pre-switch health tester
│   ├── setup-server.sh                                           <-- One-time bootstrap script
│   ├── ecosystem.config.cjs                                      <-- PM2 dual-process config
│   ├── .deploy_state                                             <-- Active color & release tracker
│   └── nginx/
│       ├── beeshub.conf                                          <-- Production virtual host
│       └── upstream.conf                                         <-- Switchable upstream target
│
└── deploy.sh                                                     <-- Root wrapper calling deployment/deploy.sh
```

---

## 3. Initial One-Time Server Setup

If configuring a new production server (or migrating an existing single-folder setup):

### Step 1: Run the Bootstrap Script
```bash
cd /var/www/beeshub
bash deployment/setup-server.sh
```
This creates `releases/`, `shared/`, `shared/static_cache/`, `shared/uploads/`, and sets safe permissions on `.env.production` (`chmod 600`).

### Step 2: Configure Environment Variables
Edit `/var/www/beeshub/shared/.env.production` and ensure your database, Razorpay, and production secrets are set.

### Step 3: Configure Nginx
Link the Nginx configuration to your system's sites-enabled:
```bash
sudo ln -sf /var/www/beeshub/deployment/nginx/beeshub.conf /etc/nginx/sites-enabled/beeshubfarmland.conf
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. How to Deploy (Zero-Downtime)

To deploy the latest code from `main`:

```bash
./deploy.sh
```

### What Happens Automatically:
1. **Determines Target:** Checks whether Blue (`3001`) or Green (`3002`) is live; targets the idle one.
2. **Builds in Isolation:** Creates a new folder `releases/release-<timestamp>`, downloads clean code, symlinks `.env.production` and `uploads/`, and runs `npm run build`.
3. **Preserves Static Chunks:** Copies all generated JavaScript/CSS chunks to `shared/static_cache/_next/static/` **without deleting previous chunks**.
4. **Starts Target Worker:** Starts `beeshub-<target>` on the idle port.
5. **Runs Pre-flight Health Check:** Pings `http://127.0.0.1:<target_port>/api/health`.
   - *If health check fails:* Immediately stops the new worker and deletes the failed release. **Active traffic is 100% undisturbed.**
6. **Switches Traffic Atomically:** Rewrites `upstream.conf` and reloads Nginx (`nginx -s reload`). Existing connections finish gracefully; new connections immediately hit the new release.
7. **Graceful Drain:** Waits 30 seconds for in-flight requests on the old worker before stopping it.
8. **Prunes Old Releases:** Retains the 4 latest releases and cleans older ones to preserve disk space.

---

## 5. Instant Emergency Rollback (< 2 Seconds)

If a critical bug is discovered after going live:

```bash
bash deployment/rollback.sh
```

### What Happens:
1. Reads `.deploy_state` to identify the previous working release and port.
2. Restarts the previous PM2 worker if paused.
3. Verifies its health (`/api/health`).
4. Re-points Nginx `upstream.conf` back to the previous port.
5. Reloads Nginx (`nginx -s reload`).
6. Re-points `current` symlink.
7. Shuts down the problematic worker.

**No re-cloning, no rebuilding, zero downtime.**

---

## 6. PM2 Process Monitoring

Check active processes:
```bash
pm2 status
```
*Expected output during normal operation:*
- One worker active (e.g. `beeshub-blue` on Port 3001 in `online` state).
- The other worker in `stopped` state (ready for instant rollback or next deployment).

View live logs:
```bash
pm2 logs beeshub-blue
pm2 logs beeshub-green
```

---

## 7. Static Asset Protection Runbook

Why users never get `404` errors for JavaScript chunks:
- When Nginx receives a request for `/_next/static/*`, it serves directly from `/var/www/beeshub/shared/static_cache/_next/static/`.
- Because `deploy.sh` uses `cp -rn` (no-clobber, copy without overwriting/deleting), chunks from previous builds remain on disk.
- Customers with browser tabs open from days prior continue to load their required chunks cleanly.

---

## 8. Operator Cheat Sheet

| Task | Command |
| :--- | :--- |
| **Deploy Latest Release** | `./deploy.sh` |
| **Instant Rollback** | `bash deployment/rollback.sh` |
| **Check Active PM2 Workers** | `pm2 list` |
| **View Live Server Logs** | `pm2 logs` |
| **Test Health Manually** | `curl -i http://127.0.0.1:3001/api/health` |
| **Test Nginx Configuration** | `sudo nginx -t` |
| **Reload Nginx Manually** | `sudo nginx -s reload` |
| **Inspect Release History** | `ls -lt /var/www/beeshub/releases` |
| **View Active Upstream Target**| `cat /var/www/beeshub/deployment/nginx/upstream.conf` |
