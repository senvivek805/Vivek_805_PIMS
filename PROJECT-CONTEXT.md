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

## ✅ Aaj Ka Kaam (13 Oct 2026)

### Git + GitHub Setup
- [x] Git init + `.gitignore` + `.env.example`
- [x] GitHub repo (private): senvivek805/Vivek_805_PIMS
- [x] 3 commits pushed

### Budget Overview + Charts
- [x] Budget Overview page (FY-wise, Head-wise, Project-wise)
- [x] Bar chart + Pie chart (Recharts)
- [x] 404 fix — Budget moved to standalone menu
- [x] `/budget` → `/budget/overview` redirect
## ✅ Aaj Ka Kaam (17 Oct 2026)

### Django Admin UI
- [x] Django Unfold install aur configure kiya
- [x] Custom modern UI (Sidebar, Colors) set kiya
- [x] Logo aur Header Admin me set kiya

### Service Completion Module (New)
- [x] Backend: Model, Serializers, Views, URLs
- [x] Frontend: List, New Form, Detail Page
- [x] Frontend: Print Page (IIT BHU Official Format)
- [x] Sidebar me "Service Completions" link add kiya

### Kal Ka Plan (Pending)
- [ ] Reports Module (Fund Utilization, Project-wise)
- [ ] Document Upload + Utilization Certificate (UC)
## ✅ Aaj Ka Kaam (18 Oct 2026 - Part 2)

### Accounting Logic Fix
- [x] Form 5 approve hone par FundBreakup ka `spent_amount` ab **Gross Amount** (Base + GST + Other) calculate karke update hota hai, Net Payable nahi.
- [x] Purane bills ko shell command se re-save karke naya logic apply karwaya.

### Reports Module Complete
- [x] Fund Utilization Report
- [x] Bill & Payments Report (Detailed Tax Breakdown, Gross vs Net)
- [x] Vendor Payments Report
- [x] Project Summary Report

### Bills List UI Polish
- [x] Duplicate Vendor Name hataya (agar Recipient aur Vendor same hon).
- [x] Summary Card aur List me **Gross Amount** clearly dikhne laga hai (Indigo color me).

### Kal Ka Plan (Pending)
- [ ] Document Upload Module
- [ ] Utilization Certificate (UC) generation
## ✅ Aaj Ka Kaam (19 Oct 2026)

### Documents Module
- [x] Backend: Document Model, Serializers, Views, URLs
- [x] File Upload API (MultiPartParser)
- [x] Media serving setup in `config/urls.py`
- [x] Frontend: API Client (`documents.ts`)
- [x] Frontend: Document List & Upload Modal Page
- [x] `csrf.ts` updated to handle FormData headers
- [x] File View & Delete functionality

### Next Pending
- [ ] Utilization Certificate (UC) generation
## ✅ Aaj Ka Kaam (19 Oct 2026 - Part 2)

### Global Search
- [x] Header me Global Search (Projects, Bills, Vendors, POs) add kiya.
- [x] API `global-search` endpoint banaya.

### Reports & UI Polish
- [x] Bill & Vendor Reports me alag-alag columns (Project Code & Vendor).
- [x] Reports me Search Bar aur Project Filter add kiya.
- [x] Accounting logic fix: Gross Amount vs Net Payable.

### Documents Module
- [x] Backend model, API (File Upload), Media serving setup.
- [x] Frontend Document List, Upload Modal, View & Delete functionality.

### Utilization Certificate (UC)
- [x] Backend API for Head-wise & FY-wise data (`project_uc_data`).
- [x] Frontend UC Print Page exact IIT(BHU) format me banaya.
- [x] Sidebar me UC ka link add kiya.

### Project Sanctioned Heads
- [x] `ProjectSanctionedHead` model (Project ke heads me amount divide karne ke liye).
- [x] New & Edit Project form me "Sanctioned Heads Breakdown" add kiya.
- [x] Dropdown ke bagal me `+` button lagaya (direct Admin add ke liye).

### Kal Ka Plan
- [ ] Service Completion/UC Documents ko link karna.
- [ ] Dashboard stats update karna.
## ✅ Aaj Ka Kaam (20 Oct 2026 - Part 2)

### Fund Receipt Fixes
- [x] Fund Receipt Edit page banaya (404 error fix).
- [x] Fund Type "Grant" valid choice error fix (lowercase values use kiye).

### Bill Payment Tracking (Finance)
- [x] Backend: `payment_date`, `utr_number`, `payment_remarks` fields add kiye.
- [x] Database migration chala kar 500 Error (column does not exist) fix kiya.
- [x] Frontend: Bill Edit page me "Payment Details" ka section add kiya.
- [x] Frontend: Bill View page me Payment Details dikhne laga.

### Dashboard & Project Fixes
- [x] Dashboard me **Project Filter** (Global vs Specific Project) kaam kar raha hai.
- [x] Specific project select karne par saare modules, charts, POs aur stats us project ke hisaab se filter hote hain.
- [x] Amount formatting fix ki (1.99 Cr ko 2.00 Cr dikhne se roka, exact amount bhi add kiya).
- [x] `ProjectCreateUpdateSerializer` me `total_sanctioned_amount` add kiya (ab Project form se amount save hota hai).

### Kal Ka Plan (Pending)
- [ ] Role-Based Access Control (RBAC) implement karna.
- [ ] UI Polish (Liquid Glass theme).
- [ ] Bulk Data Import.
## ✅ Aaj Ka Kaam (21 Oct 2026)

### Frontend Role-Based Access Control (RBAC)
- [x] Naya custom hook banaya: `src/hooks/usePermissions.ts` (Admin, Manager, Operator, Viewer ke hisaab se permissions).
- [x] `Superuser` ke liye override logic add kiya (taaki admin ko sab kuch dikhe).
- [x] Saare major modules me buttons ko permission ke hisaab se hide/show kiya:
  - [x] Projects
  - [x] Bills (Form 5)
  - [x] Vendors
  - [x] Employees
  - [x] Purchase Orders
  - [x] Materials
  - [x] Service Completions
  - [x] Documents
  - [x] Fund Receipts
- [x] `New`, `Edit`, aur `Delete` buttons ab sirf authorized users ko dikhte hain.

### Next Pending
- [ ] **Backend API Security (RBAC)** — Taaki koi direct API se unauthorized data delete/edit na kar sake.
## ✅ Aaj Ka Kaam (21 Oct 2026 - Part 4)

### Premium Login Page (UI/UX)
- [x] Login page ko ekdum naye **3D Glassmorphism** theme me design kiya.
- [x] Royal Fonts (`Cinzel`, `Great Vibes`, `Jost`) integrate kiye.
- [x] Mouse move karne par **3D Tilt Effect** (Apple TV style) add kiya.
- [x] Background me Floating Glass Orbs aur Glass Frame add kiya.
- [x] Inputs ko pure transparent glass banaya.
- [x] Login button me 3D press effect (keyboard style) add kiya.

### Next Pending
- [ ] `login-bg.jpg` image ko `frontend/public/` folder me daalna hai (taaki background image load ho sake).
- [ ] Backend me kuch final testing.
## ✅ Aaj Ka Kaam (22 Oct 2026)

### Documents Linking (Bills & POs)
- [x] Backend `DocumentViewSet` me filtering add ki (`bill`, `purchase_order`, `project` ke hisaab se).
- [x] Frontend API `getDocuments` me query params add kiye.
- [x] Naya component banaya `BillAttachments.tsx` (Bills ke liye).
- [x] Naya component banaya `POAttachments.tsx` (Purchase Orders ke liye).
- [x] Bill Detail page aur PO Detail page me attachments section integrate kiya.
- [x] File upload, view/download, aur delete ka system perfectly kaam kar raha hai.

### Next Pending
- [ ] Bulk Data Import (Excel).
- [ ] UI Polish of remaining pages.
## ✅ Aaj Ka Kaam (25 Oct 2026)

### Bulk Data Import (Complete System)
- [x] Backend me **Vendors, Projects, Materials, aur Employees** ke liye Excel/CSV import API banayi.
- [x] Frontend me `/import` page par Data Type selector, Drag & Drop file upload, aur Status messages add kiye.
- [x] **CSV Template Download** ka feature add kiya (jisse exact format me sample file download hoti hai).
- [x] Database me saari fields (Bank Details, Tax Info, Project Assignment) perfectly handle kiye gayi hain.
- [x] Sidebar me "Import Data" link add kiya (Admin/Manager ke liye).

### Next Pending
- [ ] UI Polish of remaining pages (like Dashboard).
- [ ] Final End-to-End testing.
## ✅ Aaj Ka Kaam (25 Oct 2026 - Part 3)

### Settings & Password Change
- [x] Naya **Change Password** page banaya (`/profile/change-password`).
- [x] Backend me `change_password_view` API banayi (purana password verify karke naya set karta hai).
- [x] Settings page me "Change Password (Coming Soon)" ko hatakar working link laga diya.
- [x] Next.js ke scroll warning ko fix kiya (`data-scroll-behavior="smooth"`).