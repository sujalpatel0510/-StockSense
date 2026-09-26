# 📦 StockSense — Modular Inventory Management System (IMS)

> **Hackathon Edition** | Built with PostgreSQL, Node.js/Express, TypeScript, React 18, Tailwind CSS, Prisma ORM, and Docker.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [🔑 Database Configuration & Connection Path (Password Setup)](#-database-configuration--connection-path-password-setup)
3. [🏛️ Database Architecture & ERD (Hackathon Highlight)](#️-database-architecture--erd-hackathon-highlight)
4. [📂 Clear Project Folder Structure](#-clear-project-folder-structure)
5. [✨ Core Features & Workflows](#-core-features--workflows)
6. [🚀 Quick Start Guide (Local & Docker)](#-quick-start-guide-local--docker)
7. [👥 Demo Accounts for Hackathon Jury](#-demo-accounts-for-hackathon-jury)
8. [🛡️ Security & Scalability](#️-security--scalability)

---

## 🎯 Project Overview

**StockSense** is an enterprise-grade, modular Inventory Management System designed to digitize and streamline stock operations within a modern business. It replaces manual paper registers, fragile Excel spreadsheets, and scattered tracking methods with a centralized, real-time, high-performance web platform.

### Target Users:
- **Inventory Managers:** Oversee incoming receipts from vendors, outgoing delivery dispatches to customers, configure reordering rules (Min/Max thresholds), and analyze enterprise-wide stock distribution.
- **Warehouse Staff:** Execute order picking, staging, shelf shelving, physical count inventory audits, and internal transfers between warehouses, racks, and production floors.

---

## 🔑 Database Configuration & Connection Path (Password Setup)

> 📍 **WHERE TO ENTER YOUR DATABASE CONNECTION PATH & PASSWORD:**

Open the file located at:
```
backend/.env
```
*(A template is also provided in `backend/.env.example`)*

Look for the line starting with **`DATABASE_URL`**:

```env
DATABASE_URL="postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE_NAME>?schema=public"
```

### Exact Examples:

#### 1. Local PostgreSQL (Installed on your machine)
If your PostgreSQL username is `postgres`, your password is `mysecretpass`, and the database is `stocksense_db`:
```env
DATABASE_URL="postgresql://postgres:mysecretpass@localhost:5432/stocksense_db?schema=public"
```

#### 2. Pre-Configured Local Default (Current Environment)
If your local PostgreSQL server uses the password `admin`:
```env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/stocksense_db?schema=public"
```

#### 3. Docker Compose (Automated with Docker)
If running via Docker, this is automatically configured inside `docker-compose.yml` (using port `5433` on host to prevent colliding with local Postgres):
```env
# Inside Docker network:
DATABASE_URL="postgresql://postgres:postgrespassword@db:5432/stocksense_db?schema=public"

# From Host machine into Docker container:
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5433/stocksense_db?schema=public"
```

#### 4. Cloud PostgreSQL (Neon, Supabase, AWS RDS, Render)
```env
DATABASE_URL="postgresql://user:password@ep-cool-cloud.aws.neon.tech/stocksense_db?sslmode=require"
```

### How to Apply Schema & Seed Database:
Once you update your password in `backend/.env`, run:
```bash
# Push schema tables into PostgreSQL
npm run db:push

# Populate realistic demo warehouses, products, and movements
npm run seed
```

---

## 🏛️ Database Architecture & ERD (Hackathon Highlight)

The database design adheres to the **Double-Entry Inventory Accounting Model** (the same foundational principle powering global ERPs like Odoo and SAP). 

Instead of arbitrarily incrementing or decrementing integers in loose tables (which causes race conditions and untraceable phantom stock), **every stock transaction moves inventory from a Source Location to a Destination Location**, appending an immutable entry to the **Stock Ledger (`stock_moves`)**.

```
                   +---------------------------+
                   |           User            |
                   +---------------------------+
                   | id, email, passwordHash   |
                   | fullName, role, googleId  |
                   +-------------+-------------+
                                 | 1:N
                                 v
+------------------+      +---------------------------+      +-------------------+
|    Warehouse     | 1:N  |     OperationTransfer     | 1:N  |   TransferLine    |
+------------------+----->+---------------------------+----->+-------------------+
| id, name, code   |      | id, reference, type       |      | id, demandQty     |
| address, isActive|      | status, partnerName       |      | doneQty, uom      |
+--------+---------+      | sourceLocationId, destLoc |      +---------+---------+
         | 1:N            | scheduledDate, notes      |                |
         v                +-------------+-------------+                |
+------------------+                    |                              |
|     Location     |                    | 1:N                          |
+------------------+                    v                              |
| id, name, code   |              +-------------------+                |
| type (INTERNAL/  |<-------------+     StockMove     +<---------------+
|  VENDOR/CUSTOMER/| (Source/Dest)|  (IMMUTABLE LEDGER) |
|  LOSS/TRANSIT)   |              +-------------------+
+--------+---------+              | reference, qty    |
         |                        | status, timestamp |
         | 1:N                    +-------------------+
         v                                  ^
+------------------+                        |
|    StockQuant    |                        |
+------------------+                        |
| productId        |                        |
| locationId       |                        |
| quantity         |                        |
| reservedQuantity |                        |
+--------+---------+                        |
         ^                                  |
         | 1:N                              |
+--------+---------+                        |
|     Product      +------------------------+
+------------------+
| id, name, sku    |
| uom, costPrice   |
| minStockRule     | (Safety Stock Threshold)
| maxStockRule     | (Target Stock Level)
+--------+---------+
         | N:1
         v
+------------------+
| ProductCategory  |
+------------------+
| id, name, code   |
+------------------+
```

### Key Relational Models:
1. **`StockQuant` (Real-Time Balances):** Maintains `(productId, locationId)` uniqueness. Enables instantaneous $O(1)$ stock lookups per warehouse rack or bin.
2. **`StockMove` (Immutable Ledger):** Every validated receipt, customer delivery, transfer, or scrap adjustment writes here. Provides full legal and auditing compliance.
3. **`OperationTransfer` & `TransferLine`:** Handles document lifecycle (`DRAFT` $\to$ `WAITING` $\to$ `READY` $\to$ `DONE` $\to$ `CANCELED`).
4. **`PasswordResetOtp`:** Secure 6-digit OTP verification model with time-based expiration.

---

## 📂 Clear Project Folder Structure

```
StockSense/
├── backend/                        # High-Performance Node/Express & PostgreSQL API
│   ├── prisma/
│   │   ├── schema.prisma           # Master PostgreSQL database schema definitions
│   │   └── seed.ts                 # Real-world demo data seeder (Warehouses, Products, Moves)
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.ts           # Prisma ORM connection singleton
│   │   ├── middleware/
│   │   │   └── auth.ts             # JWT authentication & Role-Based Access Control (RBAC)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts      # Login, Register, Google OAuth, OTP password reset
│   │   │   ├── dashboard.routes.ts # KPIs, operational statistics, recent stream
│   │   │   ├── product.routes.ts   # Product master data, SKU lookup, reorder limits
│   │   │   ├── category.routes.ts  # Product category hierarchy
│   │   │   ├── warehouse.routes.ts # Warehouses & double-entry locations
│   │   │   ├── transfer.routes.ts  # Receipts, Deliveries, Internal movements
│   │   │   ├── adjustment.routes.ts# Physical count reconciliation & scrap logging
│   │   │   └── move-history.routes.ts # Immutable Stock Ledger querying
│   │   └── index.ts                # Express server bootloader & healthcheck
│   ├── Dockerfile                  # Multi-stage production container for Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example                # Documented environment configuration
│   └── .env                        # Active connection parameters & secrets
│
├── frontend/                       # Ultra-Fast React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx          # Odoo-style top navigation with quick warehouse selector
│   │   │   ├── AuthModal.tsx       # Auth view with Google Sign-In & 1-click Jury Logins
│   │   │   └── ProfileModal.tsx    # User settings and role inspector
│   │   ├── context/
│   │   │   └── AuthContext.tsx     # Global JWT & Google authentication context
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx   # Live KPIs, Wireframe Operation Cards, Category graphs
│   │   │   ├── ProductsPage.tsx    # Catalog, location breakdown, reorder rules
│   │   │   ├── TransfersPage.tsx   # Receipts & Deliveries pipeline (Draft -> Ready -> Done)
│   │   │   ├── AdjustmentsPage.tsx # Physical audit count delta reconciliation
│   │   │   ├── MoveHistoryPage.tsx # Complete stock ledger with CSV export
│   │   │   └── SettingsPage.tsx    # Multi-warehouse and location management
│   │   ├── services/
│   │   │   └── api.ts              # Strongly typed API client
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript data contracts & interfaces
│   │   ├── App.tsx                 # Root layout & real-time sync engine
│   │   ├── main.tsx                # React DOM mount with AuthProvider
│   │   └── index.css               # Tailwind CSS & custom styling
│   ├── Dockerfile                  # Production container for Frontend
│   ├── nginx.conf                  # Nginx reverse proxy configuration
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml              # Complete 1-command container orchestration
├── package.json                    # Root workspace orchestration scripts
└── README.md                       # Comprehensive system documentation
```

---

## ✨ Core Features & Workflows

### 1. Receipts (Incoming Stock)
- Reference: `WH/IN/xxxx`
- Used when goods arrive from vendors or suppliers.
- **Workflow:** `Draft` $\to$ `Ready` $\to$ **Validate**.
- **Automated Ledger Action:** Increases stock quants at the destination warehouse and records a debit/credit move in `stock_moves`.

### 2. Delivery Orders (Outgoing Goods)
- Reference: `WH/OUT/xxxx`
- Used when goods leave the warehouse for customer dispatch.
- **Workflow:** `Draft` $\to$ `Waiting` $\to$ `Ready` $\to$ **Validate**.
- **Automated Ledger Action:** Verifies stock availability, decrements on-hand stock, and records the outgoing movement.

### 3. Internal Transfers
- Reference: `WH/INT/xxxx`
- Transfers stock between company locations (e.g. *Main Logistics Hub $\to$ Production Floor*, or *Rack A $\to$ Rack B*).
- Preserves enterprise-level inventory count while updating location-specific balances.

### 4. Stock Adjustments (Physical Audits & Scraps)
- Reference: `WH/ADJ/xxxx`
- Resolves discrepancies between **Recorded Book Stock** and **Physical Count**.
- User selects product and location; the system automatically calculates the exact delta (+Gain or -Loss/Scrap) and reconciles the ledger.

### 5. Automated Reordering Rules (Safety Stock)
- Each product defines a **Min Stock Threshold** and **Max Target Level**.
- The system automatically triggers high-visibility alert pills whenever on-hand stock drops below the minimum safety threshold.

### 6. Authentication & Jury Demo Access
- **Standard Email + Password:** Secure registration with salted `bcryptjs` hashing and stateless JWT session tokens.
- **1-Click Jury Demo Access:** Instant access buttons for System Administrator, Inventory Manager, and Warehouse Staff on the sign-in modal with pre-seeded demo data.
- **OTP Password Reset:** Generates a secure 6-digit one-time password with real-time UI preview for immediate verification.
- **Automatic Seed Guarantee:** Server auto-seeds initial enterprise records and warehouse topology on first run if the database is fresh.

### 7. Modern Full-Screen Enterprise UI & SaaS Architecture
- **Enterprise SaaS Layout Shell:** Left dark sidebar (`#0B0F19`) featuring real-time facility filtering (`🏢 Enterprise (All Warehouses)` vs specific facilities), category-grouped navigation with dynamic badges, sticky breadcrumb header, and live telemetry system status footer.
- **Typography & Tabular Numbers:** Uses the **Inter** font family with micro letter-spacing and `font-mono tabular-nums` for crisp numeric precision across prices, stock counts, and SKU codes.
- **Design Tokens & Reusable UI Primitives:**
  - `StatusBadge`: Standardized pills across all tables and cards (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`, `DONE`, `READY`, `WAITING`, `DRAFT`, `CANCELED`).
  - `StatCard`: High-impact KPI asset cards with trend indicators and valuation badges.
  - `EmptyState`: Contextual zero-data illustration with direct 1-click filter reset actions.
  - `SkeletonLoader`: Modern subtle shimmer loading states.
- **Products Catalog Experience:**
  - **View Switcher:** Toggle between **Table View** (high-density data inspection) and **Card Grid View** (visual asset cards with on-hand vs target max progress bars).
  - **Valuation Metrics:** Instant calculation of Acquisition Cost Valuation ($\sum \text{qty} \times \text{cost}$) and Retail Sales Potential ($\sum \text{qty} \times \text{price}$) with estimated gross margin.
  - **Stock per Location Breakdown:** Interactive modal revealing internal bins, reserved units, and net available stock.
- **Operational Workflow Pipelines:**
  - Receipts (`WH/IN`), Deliveries (`WH/OUT`), and Internal Moves (`WH/INT`) feature a visual breadcrumb stepper (`Draft` → `Waiting` → `Ready` → `Done`) with direct slip printing and validation.
- **Physical Count Reconciliations:**
  - Adjustments feature a live delta calculation preview indicating surplus gain (`+`) or deficit/scrap loss (`-`) before posting directly into the ledger.
- **Two-Way URL Routing & Instant Zero-Latency Navigation:**
  - **Visible Unique URL per Tab:** Address bar actively synchronizes with `#/${tab}` (`/#/dashboard`, `/#/products`, `/#/receipts`, `/#/deliveries`, `/#/internal`, `/#/adjustments`, `/#/moves`, `/#/settings`), making every view directly shareable and bookmarkable across all browsers and servers without 404s.
  - **Anchor Tag Integration:** Navigation items in the sidebar use native `<a>` tags with `href="#/..."`, showing the link preview on hover and supporting browser Back / Forward history.
  - **Zero-Latency In-Memory Switching (<1ms):** Database data is cached in memory on initial login and only re-fetched upon mutations (adding products, validating transfers, making adjustments) or manual header **Sync** button clicks, eliminating sluggish network overhead on tab changes.
  - **Active State Persistence:** Active tab persists across page refreshes via `sessionStorage` and URL hash detection.
- **Split-Screen Authentication:** Modern enterprise sign-in showcase featuring real-time transaction ticker simulations, security guarantees, and 1-click jury logins for `Admin`, `Manager`, and `Staff`.

---

## 🚀 Quick Start Guide (Local & Docker)

### Option 1: 1-Command Local Run (Fastest & Recommended)
> **Note:** Your machine already has PostgreSQL 17 running and pre-seeded! You can start the entire platform with a single command without Docker.

From the root project folder:
```bash
npm run dev
```
*(This starts both the Backend API on port `5000` and Frontend Client on port `5173` concurrently)*

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

---

### Option 2: Using Docker Desktop
If you prefer running inside Docker containers:
1. Open **Docker Desktop** from your Windows Start Menu and wait until the bottom-left icon turns **green** (*"Engine running"*).
2. Run the compose command:
```bash
docker compose up --build
```
> *(The obsolete `version` attribute in `docker-compose.yml` has already been removed for compatibility with modern Docker)*

---

### Option 3: Running Services in Separate Terminals

#### Step 1: Initialize Database & Seed (Already Done)
```bash
npm run db:push
npm run seed
```

#### Step 2: Start Backend
```powershell
cd backend
npm run dev
```

#### Step 3: Start Frontend
```powershell
cd frontend
npm run dev
```

---

## 👥 Demo Accounts for Hackathon Jury

For immediate evaluation, the login screen features **1-Click Demo Buttons** to log in instantly without typing:

| Role | Email | Password | Access Capabilities |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@stocksense.com` | `admin123` | Full access to all modules, warehouse settings, and user administration |
| **Inventory Manager** | `manager@stocksense.com` | `manager123` | Product management, reorder rules, full transfer validation, adjustments |
| **Warehouse Staff** | `staff@stocksense.com` | `staff123` | Picking, packing, receipt checking, internal stock transfers |

---

## 🛡️ Security & Scalability

1. **Transactional Integrity:** All stock updates run inside ACID database transactions (`prisma.$transaction`) to prevent race conditions during simultaneous operations.
2. **Zero In-Memory Drift:** Quantities are dynamically calculated and checked against verified database records.
3. **Role-Based Access Control (RBAC):** Backend route guards protect administrative settings and stock validation from unauthorized roles.
4. **Stateless JWT Tokens:** Fast, horizontally scalable authentication.
5. **Prepared Statements & ORM Protection:** Immune to SQL injection attacks through Prisma's parameterized queries.
