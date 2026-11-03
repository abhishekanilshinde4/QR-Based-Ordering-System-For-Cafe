# ☕ Café Chai Affair — QR Ordering System

A QR-code based ordering system for a café. Customers scan a QR code on their table, see the menu on their phone, and place an order. The kitchen/admin sees the order **instantly** on a dashboard with a sound alert.

> **In one line:** Scan QR → Pick items → Place order → Kitchen gets alert → Mark complete.

---

## 📑 Table of Contents

1. [What Problem Does It Solve?](#1-what-problem-does-it-solve)
2. [Features](#2-features)
3. [Tech Stack](#3-tech-stack)
4. [Architecture (Big Picture)](#4-architecture-big-picture)
5. [How It Works — Step by Step](#5-how-it-works--step-by-step)
6. [Folder Structure](#6-folder-structure)
7. [Database Design](#7-database-design)
8. [API Endpoints](#8-api-endpoints)
9. [Pages & Routes](#9-pages--routes)
10. [Real-Time Updates Explained](#10-real-time-updates-explained)
11. [Run Locally](#11-run-locally)
12. [Deploy](#12-deploy)
13. [Default Login](#13-default-login)
14. [Known Limitations & Improvements](#14-known-limitations--improvements)

---

## 1. What Problem Does It Solve?

| Without this system | With this system |
|---|---|
| Waiter takes order on paper | Customer orders from own phone |
| Orders can be missed or mixed up | Every order is saved with a number (#1001, #1002…) |
| Kitchen has to be told verbally | Kitchen dashboard rings + speaks when an order arrives |
| End-of-day counting by hand | One-click Excel export of all orders |

---

## 2. Features

### 👤 Customer side
- **Table QR codes** — each table has its own link: `/menu?table=1` … `/menu?table=6`. The table number is detected automatically.
- **Live menu** with categories, search, photos, and prices (₹).
- **Item notes** — e.g. "less sugar", "extra spicy".
- **Cart** that remembers items even if the page is refreshed.
- **Order confirmation** screen showing the order number.
- **Built-in QR scanner** (camera or upload image) to pick the table.

### 👨‍🍳 Admin / Kitchen side
- **Secure login** (`/login`).
- **Live dashboard** with *Active* and *Completed* tabs.
- **Sound + voice alert** when a new order comes in, and a pop-up that must be acknowledged.
- **Complete** or **Cancel** any order in one click.
- **Excel export** (`.xlsx`) of orders; **Export & Clear** to reset for the next shift (asks for admin password).
- **Menu management** — add, edit, delete items, change price/photo, toggle availability.
- **Table management** — add/delete tables, view, download or print QR codes.

---

## 3. Tech Stack

| Layer | Technology | Why it is used |
|---|---|---|
| Frontend | **React 19 + TypeScript** | Builds the user interface |
| Build tool | **Vite** | Fast dev server and bundler |
| Styling | **Tailwind CSS 4** | Quick, responsive design |
| Routing | **React Router 7** | Switching between pages |
| Animation | **Motion** | Smooth modals and transitions |
| Icons | **Lucide React** | Icon set |
| QR generate | **qrcode.react** | Creates table QR codes |
| QR scan | **html5-qrcode** | Scans QR via camera/image |
| Backend | **Node.js + Express** | REST API server |
| Real-time | **Socket.IO** | Push events to connected screens |
| Database | **SQLite + Prisma ORM** | Stores menu, orders, tables, admin |
| Auth | **JWT + bcryptjs** | Login tokens and password hashing |
| Excel | **xlsx (SheetJS)** | Export orders to `.xlsx` |
| Serverless | **Netlify Functions** | Backend alternative for Netlify hosting |
| Cloud relay | **ntfy.sh** | Free public pub/sub used for cross-device sync on static hosting |

---

## 4. Architecture (Big Picture)

The project can run in **two modes**. Both use the *same* React frontend.

```
                        ┌──────────────────────────────┐
                        │      React Frontend (Vite)    │
                        │  Customer pages + Admin pages │
                        └───────────────┬──────────────┘
                                        │
                         apiClient.ts (one file talks to everything)
                                        │
          ┌─────────────────────────────┼─────────────────────────────┐
          │                             │                             │
          ▼                             ▼                             ▼
 ┌─────────────────┐        ┌────────────────────┐        ┌─────────────────────┐
 │  MODE 1:        │        │  MODE 2:           │        │  Browser Safety Net │
 │  Express Server │        │  Netlify Function  │        │  localStorage +     │
 │  (server.ts)    │        │  (api.ts)          │        │  ntfy.sh live relay │
 │                 │        │                    │        │                     │
 │  Socket.IO      │        │  JSON files in     │        │  Keeps orders alive │
 │  Prisma+SQLite  │        │  /tmp (temporary)  │        │  even if API is down│
 └─────────────────┘        └────────────────────┘        └─────────────────────┘
   Full / permanent           Serverless / light            Works in both modes
```

### The three layers explained simply

1. **Frontend (React)** — everything the user sees. Customer pages and admin pages live in the same app, separated by routes.
2. **Backend (two options)**
   - **Express + Prisma + SQLite** → the *complete* version. Real database, real WebSockets.
   - **Netlify Function** → a *lightweight* version for free serverless hosting. It stores data in temporary files, so data is not permanent.
3. **Safety net in the browser** — `apiClient.ts` saves every order to `localStorage` first and shares it between devices through **ntfy.sh**. This is why orders still appear on the admin screen even when the backend is not available.

---

## 5. How It Works — Step by Step

### Customer places an order

```
 Customer phone                                              Admin phone
 ──────────────                                              ───────────
 1. Scan QR  ──►  /menu?table=3
 2. Table 3 detected automatically
 3. Browse menu, add items (+ notes) to cart
 4. Open Cart ──► tap "Place Order"
 5. apiClient.placeOrder():
      a) Create order #1001 and save in localStorage
      b) Publish "order:placed" event  ───────────────►  6. Event received instantly
      c) POST /api/orders to backend (if available)      7. 🔔 Sound + voice + pop-up
 8. "Order Success" page shows #1001                      8. Admin taps "Acknowledge"
                                                          9. Cooks → taps "Complete"
                                                         10. Order moves to Completed tab
```

### Admin daily workflow

```
Login → Dashboard (live orders) → Complete orders during the day
      → End of shift: "Export & Clear" → enter password → Excel downloaded → queue reset
```

---

## 6. Folder Structure

```
cafe-chai-affair/
│
├── server.ts                  # Express server: API + Socket.IO + DB seed + serves frontend
├── package.json               # Scripts and dependencies
├── vite.config.ts             # Vite + React + Tailwind setup
├── netlify.toml               # Netlify build + redirect rules
├── index.html                 # App entry HTML
├── .env.example               # Environment variable template
│
├── prisma/
│   ├── schema.prisma          # Database tables definition
│   └── dev.db                 # SQLite database file
│
├── netlify/functions/
│   └── api.ts                 # Serverless version of the API (for Netlify)
│
├── public/
│   └── _redirects             # SPA fallback: all routes → index.html
│
└── src/
    ├── main.tsx               # React starts here
    ├── App.tsx                # All routes + providers
    ├── types.ts               # TypeScript types (MenuItem, Order, Table…)
    ├── index.css              # Tailwind import
    │
    ├── pages/
    │   ├── CustomerMenu.tsx   # Menu with categories, search, table detection
    │   ├── CartPage.tsx       # Cart review + place order
    │   ├── OrderSuccessPage.tsx
    │   ├── AdminLogin.tsx
    │   ├── AdminDashboard.tsx # Live orders, sound alerts, export
    │   ├── AdminMenu.tsx      # Add/edit/delete menu items
    │   └── AdminTables.tsx    # Table list + printable QR codes
    │
    ├── components/
    │   ├── Navbar.tsx                   # Top bar: logo, table badge, cart
    │   ├── Logo.tsx                     # Café logo
    │   ├── MenuItemModal.tsx            # Item details + quantity + notes
    │   ├── QRScannerModal.tsx           # Camera / image QR scanner
    │   ├── UnacknowledgedOrderModal.tsx # "New order!" pop-up for kitchen
    │   └── ExportConfirmModal.tsx       # Password check before Export & Clear
    │
    ├── context/                         # Global state (React Context)
    │   ├── CartContext.tsx              # Cart items, table number, notes
    │   ├── SocketContext.tsx            # Socket.IO connection
    │   └── ThemeContext.tsx             # Theme
    │
    ├── services/
    │   └── apiClient.ts                 # ⭐ Heart of the frontend: all API calls,
    │                                    #    localStorage, live sync, Excel export
    ├── server/
    │   ├── db.ts                        # Prisma client
    │   └── auth.ts                      # JWT + password helpers + auth middleware
    │
    ├── utils/
    │   └── audioNotification.ts         # Beep + voice alert for new orders
    │
    └── assets/images/                   # Local food photos
```

---

## 7. Database Design

Defined in `prisma/schema.prisma` (SQLite).

```
┌──────────────┐        ┌───────────────────┐        ┌──────────────────┐
│    Menu      │        │   Order_Items     │        │     Orders       │
├──────────────┤        ├───────────────────┤        ├──────────────────┤
│ id (PK)      │◄───────│ menu_id (FK,null) │        │ id (PK)          │
│ name         │  1   * │ order_id (FK) ────┼───────►│ order_number ✱   │
│ description  │        │ item_name         │  *   1 │ table_number     │
│ category     │        │ item_price        │        │ total_amount     │
│ price        │        │ quantity          │        │ notes            │
│ image_url    │        │ notes             │        │ completed        │
│ available    │        └───────────────────┘        │ created_at       │
│ created_at   │                                     └──────────────────┘
│ updated_at   │
└──────────────┘        ┌──────────────┐             ┌──────────────┐
                        │   Tables     │             │    Admin     │
                        ├──────────────┤             ├──────────────┤
                        │ id (PK)      │             │ id (PK)      │
                        │ table_number✱│             │ username ✱   │
                        │ qr_code      │             │ password_hash│
                        └──────────────┘             └──────────────┘
                                                      ✱ = unique
```

**Important design choices**
- `Order_Items` stores **`item_name` and `item_price` as a copy** — so old orders stay correct even if the menu price changes later.
- `menu_id` is **optional** and becomes `null` if a menu item is deleted (`onDelete: SetNull`), so history is never lost.
- Deleting an Order also deletes its items (`onDelete: Cascade`).
- Order numbers start at **1001** and increase by one.

### Auto-created data (seeding) on first run
- Admin: `admin` / `admin123`
- Tables: 1 to 6
- Menu: 10 sample items (Chai & Hot Teas, Buns & Snacks, Cold Brews & Iced, Desserts & Sweets)

---

## 8. API Endpoints

Base path: `/api`  •  🔒 = needs `Authorization: Bearer <token>`

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login` | Login with username + password → returns token |
| GET | `/auth/me` 🔒 | Get current admin |

### Menu
| Method | Endpoint | Description |
|---|---|---|
| GET | `/menu` | List all items |
| POST | `/menu` 🔒 | Add item |
| PUT | `/menu/:id` 🔒 | Edit item |
| DELETE | `/menu/:id` 🔒 | Delete item |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| POST | `/orders` | Place an order (customer, no login) |
| GET | `/orders` 🔒 | List all orders with items |
| PUT / PATCH | `/orders/:id/complete` 🔒 | Mark order complete |
| DELETE | `/orders/:id` 🔒 | Cancel / delete order |
| GET | `/orders/export/today` 🔒 | Download Excel of all orders |
| POST | `/orders/export-and-clear` 🔒 | Verify password → download Excel → delete all orders |

### Tables
| Method | Endpoint | Description |
|---|---|---|
| GET | `/tables` | List tables |
| POST | `/tables` 🔒 | Add table |
| DELETE | `/tables/:id` 🔒 | Delete table |

### Socket.IO events (Express mode)
| Event | When it fires |
|---|---|
| `order:placed` | New order created |
| `order:updated` | Order marked complete |
| `order:deleted` | Order cancelled |
| `orders:cleared` | Shift export & clear done |
| `menu:updated` | Menu item added / edited / deleted |

---

## 9. Pages & Routes

| URL | Page | Who uses it |
|---|---|---|
| `/` | Redirects to `/menu` | Everyone |
| `/menu` or `/menu?table=3` | Customer menu | Customer |
| `/cart` | Cart + place order | Customer |
| `/order-success` | Order confirmation | Customer |
| `/login` | Admin login | Staff |
| `/admin` | Live orders dashboard | Staff |
| `/admin/menu` | Menu management | Staff |
| `/admin/tables` | Table QR codes | Staff |

---

## 10. Real-Time Updates Explained

The kitchen must know about an order immediately. The app uses **layers**, so something always works:

| Layer | Works between | How |
|---|---|---|
| **BroadcastChannel** | Tabs on the *same* device | Browser built-in messaging |
| **ntfy.sh relay (SSE)** | *Different* phones | Order is published to a shared topic; admin phone listens to it |
| **Socket.IO** | Phones ↔ Express server | Server pushes events to everyone connected |
| **Polling every 3 sec** | Admin dashboard | Re-fetches orders as a backup |
| **localStorage** | Same browser | Orders saved so a refresh never loses them |

On startup the admin device also pulls the relay's recent history, so orders placed while the admin device was asleep are recovered.

**Sound alert:** `audioNotification.ts` uses the Web Audio API (beep) plus Speech Synthesis (voice announces the table number) and keeps alerting until the admin acknowledges the order.

---

## 11. Run Locally

**Requirements:** Node.js 18+ (Bun also works — a `bun.lock` is included).

```bash
# 1. Install dependencies (also runs "prisma generate")
npm install

# 2. Create the database tables
npm run db:push

# 3. Start dev server (Express + Vite together)
npm run dev
```

Open **http://localhost:3000**

| Script | What it does |
|---|---|
| `npm run dev` | Runs `server.ts` with Vite in middleware mode |
| `npm run build` | Prisma generate → Vite build → bundle server to `dist/server.cjs` |
| `npm run start` | Runs the production server |
| `npm run lint` | TypeScript type-check |

**Test on a real phone:** connect the phone and computer to the same Wi-Fi and open `http://<your-computer-ip>:3000/menu?table=1`.

### Environment variables
| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Secret for signing login tokens (a default exists — **change it**) |
| `GEMINI_API_KEY`, `APP_URL` | Listed in `.env.example` (from AI Studio); not used by the ordering features |

> Note: the server port is fixed to `3000` in `server.ts`. The README of the original project mentions a `PORT` variable, but the code does not read it, so change the constant if your host needs another port.

---

## 12. Deploy

### Option A — Full Node.js hosting (Render, Railway, VPS) ✅ recommended
- Build: `npm run build`
- Start: `npm run start`
- Gives you the persistent SQLite database and Socket.IO.

### Option B — Netlify (serverless)
1. Push the project to GitHub.
2. Netlify → **Add new site → Import project**.
3. Settings are read from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions: `netlify/functions`
4. `/api/*` is redirected to the Netlify Function; all other routes go to `index.html`.

> ⚠️ On Netlify the function stores data in `/tmp`, which is **temporary**. Cross-device order delivery relies on the browser + ntfy.sh safety net (see section 10).

---

## 13. Default Login

| Field | Value |
|---|---|
| URL | `/login` |
| Username | `admin` |
| Password | `admin123` |

⚠️ **Change this before using in a real café.**

---

## 14. Known Limitations & Improvements

Being honest about the current state also helps you explain the project well in interviews.

**Limitations**
1. **Default credentials & fallback secrets** — the password `admin123`, a default `JWT_SECRET`, and a hardcoded fallback token (`mock_jwt_token_cafe_chai_affair_admin`) exist in the code. Anyone who knows them can access admin APIs.
2. **Public ntfy.sh topic** — the relay topic name is hardcoded; anyone who learns it can read or publish order events. Fine for a demo, not for production.
3. **Orders are created on the client first** — the browser generates the order number and total, then sends the order to the server. The server trusts the prices sent by the client instead of reading them from the menu table.
4. **Netlify mode data is temporary** — `/tmp` files reset on cold start.
5. **No online payment** — payment is expected to happen at the counter.
6. **Branding names differ** — the code uses "Chai Affair", "Chaai Affair", and "Aura Cafe" in different places (e.g. localStorage keys); worth making consistent.

**Ideas to improve**
- Calculate prices and totals only on the server, from the menu table.
- Replace ntfy.sh with your own WebSocket / managed realtime service (e.g. Pusher, Supabase Realtime).
- Use PostgreSQL instead of SQLite for cloud hosting.
- Add UPI / online payment.
- Add order status steps: *Received → Preparing → Ready → Served*.
- Add rate limiting and an admin "change password" screen.

---

### 🧾 Quick Summary (30 seconds)

> A **React + Express + Prisma/SQLite** web app where customers scan a **table QR code**, order from their phone, and the kitchen gets a **live, sound-alerted dashboard**. It supports **menu & table management**, **Excel shift export**, and runs on both a **full Node server** and **Netlify serverless**, using a **localStorage + ntfy.sh real-time safety net**.
