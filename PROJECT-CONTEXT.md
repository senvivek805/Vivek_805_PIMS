# PIMS — Project Context (Updated: 10 Oct 2026)

**Owner:** Vivek Kumar Sen
**Location:** G:\pims\
**Current Status:** Form 5 (Bill Entry) Module Complete

---

## 🎯 Project Ka Maqsad

IIT(BHU) style ka complete ERP:
- Project Master (code, name, agency, PI, dates, fund)
- Fund Receipt + Budget Breakup (Recurring/Non-Recurring)
- Vendor Master
- Employee/Manpower Master
- Purchase Order (Annexure-IV format, 3 copies)
- Material Master + Stock
- Material Receipt (PO → received items)
- Material Issue (employee ko issue)
- Material Return Note (MRN)
- **Bill Entry / Form 5** (Finance Payment)
- Service Completion (pending)
- Utilization Certificate + Reports (pending)

**Principles:**
- Sab kuch Editable (Admin ke through)
- Sab kuch Deleteable (Soft delete)
- Data solid from Day 1 (PostgreSQL)
- Har file alag, chhoti, focused
- Modern UI (Neumorphism design)
- **All code in English** (comments, messages, UI)

---

## 🛠️ Tech Stack

### Backend
- Python 3.13
- Django 6.1.1
- Django REST Framework 3.18.1
- psycopg2-binary 2.9.13
- python-decouple 3.8
- django-cors-headers 4.9.0
- num2words 0.5.14

### Database & Cache
- PostgreSQL 16 (Docker, **port 5433**)
- Redis 7 (Docker, port 6379)
- pgAdmin (Docker, port 5050)

### Frontend
- Next.js 16.3.5 (App Router, Turbopack)
- TypeScript
- Tailwind CSS v4
- shadcn/ui (Radix UI, Nova preset)
- Lucide icons
- Recharts (charts)
- Sonner (toasts)

### Design — Neumorphism
- Background: #e0e5ec
- Shadows: light (#ffffff) + dark (#b8bcc2)
- Primary gradient: #4f6df5 → #6366f1
- Success gradient: #10b981 → #059669

### DevOps
- Docker Desktop (Windows)
- WSL2 + Ubuntu
- Git (not initialized)

---

## 📁 Folder Structure
G:\pims
├── docker-compose.yml
│
├── backend
│ ├── manage.py
│ ├── .env
│ ├── venv
│ ├── config
│ ├── core
│ ├── accounts
│ ├── projects
│ ├── funds
│ ├── vendors
│ ├── employees
│ ├── purchase
│ ├── materials
│ ├── bills\ (NEW)
│ │ ├── models.py (BillEntry, BillEntryItem)
│ │ ├── admin.py
│ │ ├── api
│ │ │ ├── serializers.py
│ │ │ ├── views.py
│ │ │ └── urls.py
│ │ └── migrations
│ ├── media
│ └── staticfiles
│
└── frontend
└── src
├── app
│ ├── login\page.tsx
│ ├── dashboard\page.tsx
│ ├── projects
│ ├── funds
│ ├── vendors
│ ├── employees
│ ├── purchase
│ ├── materials
│ └── bills\ (NEW)
│ ├── page.tsx (List)
│ ├── new\page.tsx
│ └── [id]
│ ├── page.tsx (Detail)
│ ├── edit\page.tsx
│ └── print\page.tsx (Form 5 + RTGS)
│
├── components
│ ├── layout
│ │ ├── AppSidebar.tsx
│ │ ├── AppHeader.tsx
│ │ └── AppLayout.tsx
│ ├── neumorphism (5 components)
│ └── ui
│
├── hooks
├── lib\api
│ ├── csrf.ts
│ ├── projects.ts
│ ├── funds.ts
│ ├── vendors.ts
│ ├── employees.ts
│ ├── purchase.ts
│ ├── materials.ts
│ └── bills.ts (NEW)
│
└── public
├── iitbhu-emblem.png
├── iitbhu-text.png
└── sbi-logo.png

text

---

## 🗄️ Database Tables

### PIMS Tables
- **pims_users** — Custom User
- **pims_roles** — Admin/Manager/Operator/Viewer
- **pims_agencies**
- **pims_departments**
- **pims_projects** — Project Master
- **pims_project_pis**
- **pims_fund_receipts**
- **pims_budget_categories**
- **pims_budget_heads**
- **pims_fund_breakups**
- **pims_vendors** — Vendor Master (with bank details)
- **pims_employees**
- **pims_purchase_orders**
- **pims_purchase_order_items** (item_type, material FK, received_quantity)
- **pims_material_categories**
- **pims_materials**
- **pims_material_receipts**
- **pims_material_receipt_items**
- **pims_material_issues**
- **pims_material_issue_items**
- **pims_material_return_notes** — MRN
- **pims_material_return_note_items**
- **pims_bill_entries** — Form 5 (NEW)
- **pims_bill_entry_items** — Form 5 line items (NEW)

---

## 🔌 API Endpoints

### Auth (`/api/`)
- POST `/auth/login/`, `/auth/logout/`
- GET `/auth/me/`, `/auth/check/`, `/auth/csrf/`

### Projects (`/api/`)
- GET/POST `/projects/`
- GET/PATCH/DELETE `/projects/{id}/`
- GET `/projects/stats/`, `/projects/{id}/budget-summary/`
- GET `/budget/overview/`, `/agencies/`, `/departments/`

### Funds (`/api/`)
- GET/POST `/fund-receipts/`
- GET/PATCH/DELETE `/fund-receipts/{id}/`
- GET `/fund-receipts/stats/`
- GET/POST `/fund-breakups/`
- GET `/budget-categories/`, `/budget-heads/`

### Vendors (`/api/`)
- GET/POST `/vendors/`
- GET/PATCH/DELETE `/vendors/{id}/`
- GET `/vendors/stats/`

### Employees (`/api/`)
- GET/POST `/employees/`
- GET/PATCH/DELETE `/employees/{id}/`
- GET `/employees/stats/`

### Purchase Orders (`/api/`)
- GET/POST `/purchase-orders/`
- GET/PATCH/DELETE `/purchase-orders/{id}/`
- GET `/purchase-orders/stats/`
- GET `/purchase-orders/pending-alerts/`

### Materials (`/api/`)
- GET `/material-categories/`
- GET/POST `/materials/`
- GET/PATCH/DELETE `/materials/{id}/`
- GET `/materials/stats/`, `/materials/low-stock/`
- GET/POST `/material-receipts/`
- GET/PATCH/DELETE `/material-receipts/{id}/`
- GET `/material-receipts/stats/`
- GET `/material-receipts/po/{id}/items/`
- GET/POST `/material-issues/`
- GET/PATCH/DELETE `/material-issues/{id}/`
- GET `/material-issues/stats/`
- GET/POST `/material-returns/`
- GET/PATCH/DELETE `/material-returns/{id}/`
- GET `/material-returns/stats/`

### Bills / Form 5 (`/api/`) — NEW
- GET/POST `/bills/`
- GET/PATCH/DELETE `/bills/{id}/`
- GET `/bills/stats/`

---

## ✅ Completed Modules

### Backend
- [x] Django + PostgreSQL + Redis
- [x] Custom User + Role
- [x] Project Master + ProjectPI
- [x] Django Admin (Neumorphism theme)
- [x] Fund Receipt + Budget Breakup
- [x] Budget Category + Head
- [x] Vendor Master (with bank details)
- [x] Employee Master
- [x] Purchase Order + Items (item_type: material/service)
- [x] Auto GST detection
- [x] In Words auto-generation
- [x] Material Category + Material Master
- [x] Material Receipt + Items
- [x] Material Issue + Items
- [x] Material Return Note + Items (condition: good/damaged/lost)
- [x] Stock calculation (received - issued + returned)
- [x] Stock validation
- [x] PO Item auto-update received_quantity
- [x] PO Status auto-update
- [x] **Bill Entry / Form 5 (with rates, amounts, other charges, RTGS)**
- [x] All APIs + Auth (CSRF)

### Frontend
- [x] Neumorphism design system
- [x] Login page
- [x] Dashboard (real data + alerts)
- [x] Projects, Funds, Vendors, Employees
- [x] Purchase Orders (CRUD + Print)
- [x] PO Item Type dropdown (Material/Service)
- [x] Notification Bell (PO alerts + Low stock)
- [x] Materials submenu in Sidebar
- [x] Material Master List (with Stock badges)
- [x] Material Receipt (New, Detail, Edit, Print)
- [x] Material Issue (New, Detail, Edit, Print)
- [x] Material Return Note (New, Detail, Edit, Print)
- [x] Stock Report (4 badges: Received, Issued, Returned, Stock)
- [x] **Bill Entry / Form 5 (List, New, Detail, Edit)**
- [x] **Bill Print (Form 5 + RTGS, A4 2 pages)**
- [x] **GST / TDS / Other Charges Auto-Calculate**
- [x] **Penalty + PBG Applicable checkboxes**
- [x] Protected routes + Logout modal

---

## ⏳ Pending Tasks

### Priority 1 — Service Completion Module
- [ ] ServiceCompletion model
- [ ] Backend API + Frontend pages

### Priority 2 — Reports
- [ ] Fund Utilization, FY-wise, Project-wise
- [ ] Vendor-wise, PO Reports, Bill Reports
- [ ] Stock Reports, Return Reports

### Priority 3 — Documents + UC
- [ ] Document Upload
- [ ] Utilization Certificate

### Other
- [ ] Git init + GitHub repo
- [ ] Bulk data import
- [ ] Deploy to server

---

## 🚀 Kal Kaise Start Karna

1. **Docker Desktop** open karo
2. **Backend PowerShell:**
   ```powershell
   cd G:\pims\backend
   venv\Scripts\activate
   python manage.py runserver

cd G:\pims
notepad PROJECT-CONTEXT.md

## ✅ Aaj Ka Kaam (12 Oct 2026)

### Form 5 (Bill Entry) — Polish
- [x] **Scheme Code + Component Code** fields (Minor Head ke neeche)
- [x] Backend model + migration
- [x] Frontend New/Edit page me inputs
- [x] Print me dikhe (sirf jab fill ho)
- [x] Form 5 print — A4 me fit
- [x] RTGS print — A4 me fit, border removed
- [x] Dono pages neeche-neeche print
- [x] Finance Office me Total Payable (Words + Figures)

### Budget Tracking (Form 5 → Fund Breakup)
- [x] `FundBreakup.spent_amount` field add
- [x] `balance` + `utilization_percentage` properties
- [x] Form 5 **approve/paid** hone pe → `spent_amount` auto-update
- [x] Form 5 **cancel** hone pe → `spent_amount` deduct
- [x] Fund Breakup API me `spent_amount`, `balance`, `total_spent`, `total_balance`
- [x] Frontend Budget Breakup page me **Spent + Balance cards**
- [x] Har row me **Spent + Balance** display

### Kal Ka Plan
- [ ] Budget Reports (Fund Utilization, Project-wise)
- [ ] Bill Payment Tracking
- [ ] Service Completion Module