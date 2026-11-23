# IndiHub Production Host - Port & Service Allocation Map

## Server Environment
- **Host**: `vmi3490799`
- **User**: `indihub`
- **Reverse Proxy**: Nginx
- **Process Supervisor**: PM2

---

## Live Port Map

| Port | Service | Process Name | Notes / Domain |
| :--- | :--- | :--- | :--- |
| **80** | Nginx | `nginx: master/worker` | HTTP (Redirects to 443) |
| **443** | Nginx | `nginx: master/worker` | HTTPS (SSL Certbot) |
| **3000** | Next.js | `indihub-web` | `indihub.conf` |
| **3001** | Next.js | `beeshub-blue` | **BeesHub Farmland (Standby Slot)** |
| **3002** | Next.js | `earthleaf-web` | ⚠️ **DO NOT USE** (`earthleaforganics.com`) |
| **3003** | Next.js | `beeshub-green` | 🚀 **BeesHub Farmland (Currently Active)** |
| **3010** | Next.js | Client web app | `flow.nexusnation.in` or similar |
| **3012** | PM2 | God Daemon | PM2 internal RPC |
| **3015** | Next.js | `ajphoto-store` | `ajfotogallery.in` |
| **3020** | Next.js | Client web app | `nexusnation.in` |
| **3030** | Next.js | Client web app | `jobs.vsbusinesssolution.com` |
| **4000** | Node.js | `indihub-api` | IndiHub backend API |
| **4020** | Node.js | Client API | Backend worker |
| **4030** | Node.js | Client API | Backend worker |

---

## Zero-Downtime Deployment Guidelines for BeesHub
- **Active Worker**: Currently on **Port 3003** (`beeshub-green`).
- **Next Deployment Target**: Will alternate to **Port 3001** (`beeshub-blue`).
- **Nginx Upstream Path**: `/var/www/beeshubfarmland/deployment/nginx/upstream.conf`
- **Shared Storage**: `/var/www/beeshubfarmland/shared/`
- **Elevated Permissions**: Always use `sudo nginx -t` and `sudo systemctl reload nginx`.
