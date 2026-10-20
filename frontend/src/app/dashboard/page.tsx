"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoBadge, NeoIconBox } from "@/components/neumorphism";
import {
  FolderKanban,
  IndianRupee,
  TrendingUp,
  Plus,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  User,
  RefreshCw,
  ShoppingCart,
  AlertTriangle,
  ChevronRight,
  Package,
  PackageMinus,
  Receipt,
  FileCheck,
  FolderOpen,
  FileSpreadsheet,
  Filter,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  getProjects,
  getProjectStats,
  type Project,
  type ProjectStats,
} from "@/lib/api/projects";
import {
  getPurchaseOrders,
  getPurchaseOrderStats,
  getPendingPurchaseOrders,
  formatCompact as formatPOAmount,
  type PurchaseOrder,
  type POStats,
  type PendingPOsResponse,
} from "@/lib/api/purchase";
import {
  getMaterials,
  type Material,
} from "@/lib/api/materials";
import { getBillEntries, type BillEntry } from "@/lib/api/bills";
import { getServiceCompletions, type ServiceCompletion } from "@/lib/api/serviceCompletion";
import { getDocuments, type Document } from "@/lib/api/documents";
import { getBudgetOverview, formatCurrency, type BudgetOverviewResponse } from "@/lib/api/funds";

const PIE_COLORS = ["#4f6df5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function DashboardPage() {
  // Global Stats
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [poStats, setPoStats] = useState<POStats | null>(null);
  const [pendingPOsData, setPendingPOsData] = useState<PendingPOsResponse | null>(null);

  // Raw Lists (for filtering)
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [allPOs, setAllPOs] = useState<PurchaseOrder[]>([]);
  const [allBills, setAllBills] = useState<BillEntry[]>([]);
  const [allServices, setAllServices] = useState<ServiceCompletion[]>([]);
  const [allDocs, setAllDocs] = useState<Document[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  // Charts State
  const [budgetData, setBudgetData] = useState<BudgetOverviewResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("");

  // ============================================
  // LOAD ALL DATA
  // ============================================
  async function loadInitialData() {
    setLoading(true);
    setError("");
    try {
      const [
        statsData,
        projectsData,
        poStatsData,
        poData,
        pendingData,
        billsData,
        serviceData,
        docData,
        materialsData,
      ] = await Promise.all([
        getProjectStats(),
        getProjects(),
        getPurchaseOrderStats(),
        getPurchaseOrders(),
        getPendingPurchaseOrders(),
        getBillEntries(),
        getServiceCompletions(),
        getDocuments(),
        getMaterials(),
      ]);
      
      setStats(statsData);
      setProjectsList(projectsData.results || []);
      setPoStats(poStatsData);
      setAllPOs(poData.results || []);
      setPendingPOsData(pendingData);
      setAllBills(billsData.results || []);
      setAllServices(serviceData.results || []);
      setAllDocs(docData.results || []);
      setMaterials(materialsData.results || []);

    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  // ============================================
  // FETCH BUDGET DATA (Whenever project changes)
  // ============================================
  async function loadBudgetData() {
    try {
      const data = await getBudgetOverview(
        undefined, 
        selectedProject ? Number(selectedProject) : undefined
      );
      setBudgetData(data);
    } catch (err) {
      console.error("Failed to load chart data", err);
    }
  }

  useEffect(() => {
    loadBudgetData();
  }, [selectedProject]);

  // ============================================
  // DERIVED (FILTERED) DATA BASED ON SELECTION
  // ============================================
  const isGlobal = !selectedProject;
  const activeProjectObj = projectsList.find(p => String(p.id) === selectedProject);

  // 1. Projects Stats
  const displayTotalProjects = isGlobal ? (stats?.total_projects || 0) : 1;
  // Exact Total Fund without rounding issue
  const displayTotalFund = isGlobal ? (stats?.total_sanctioned_amount || 0) : Number(activeProjectObj?.total_sanctioned_amount || activeProjectObj?.sanctioned_amount || 0);
  const displayActive = isGlobal ? (stats?.active_projects || 0) : (activeProjectObj?.status === 'active' ? 1 : 0);
  const displayCompleted = isGlobal ? (stats?.completed_projects || 0) : (activeProjectObj?.status === 'completed' ? 1 : 0);

  // 2. Filtered Lists
  const filteredPOs = isGlobal ? allPOs : allPOs.filter(po => String(po.project) === selectedProject);
  const filteredBills = isGlobal ? allBills : allBills.filter(b => String(b.project) === selectedProject);
  const filteredServices = isGlobal ? allServices : allServices.filter(s => String(s.project) === selectedProject);
  const filteredDocs = isGlobal ? allDocs : allDocs.filter(d => String(d.project) === selectedProject);

  // 3. Module Stats
  const displayBillsCount = filteredBills.length;
  let displayBillsGross = 0;
  filteredBills.forEach(b => {
    displayBillsGross += (Number(b.bill_amount || 0) + Number(b.cgst_amount || 0) + Number(b.sgst_amount || 0) + Number(b.igst_amount || 0) + Number(b.other_charges || 0));
  });
  const displayServiceCount = filteredServices.length;
  const displayDocCount = filteredDocs.length;

  // 4. PO Stats & Alerts
  const pendingPOList = isGlobal 
    ? (pendingPOsData?.results || []) 
    : filteredPOs.filter(po => (po.pending_count || 0) > 0);

  let displayPOTotalAmount = isGlobal ? (poStats?.total_amount || 0) : 0;
  let displayPOApproved = isGlobal ? (poStats?.status_wise.find(s => s.status === 'approved')?.count || 0) : 0;
  
  if (!isGlobal) {
    filteredPOs.forEach(po => displayPOTotalAmount += Number(po.grand_total || 0));
    displayPOApproved = filteredPOs.filter(po => po.status === 'approved').length;
  }

  const displayRecentPOs = filteredPOs.slice(0, 4);

  // 5. Recent Projects
  const displayRecentProjects = isGlobal ? projectsList.slice(0, 4) : projectsList.filter(p => String(p.id) === selectedProject);

  // ============================================
  // CHARTS DATA PREPARATION
  // ============================================
  const fundChartData = budgetData?.fy_wise.map(item => ({
    name: item.fy,
    Allocated: item.allocated,
    Spent: item.spent,
  })) || [];

  let pieChartData = [];
  let pieChartTitle = "";
  
  if (!isGlobal && budgetData?.head_wise) {
    pieChartData = budgetData.head_wise.map(h => ({ name: h.head_name, value: h.allocated }));
    pieChartTitle = "Head-wise Allocation";
  } else {
    pieChartData = [
      { name: "Active", value: stats?.active_projects || 0 },
      { name: "Completed", value: stats?.completed_projects || 0 },
    ].filter(d => d.value > 0);
    pieChartTitle = "Project Status Distribution";
  }

  // ============================================
  // STOCK SUMMARY
  // ============================================
  const stockSummary = materials.reduce((acc, m) => {
    const stock = m.current_stock || 0;
    acc.totalItems += 1;
    acc.totalStock += stock;
    if (stock === 0) acc.outOfStock += 1;
    else if (stock > 0 && stock < 10) acc.lowStock += 1;
    else if (stock > 0) acc.inStock += 1;
    return acc;
  }, { totalItems: 0, totalStock: 0, outOfStock: 0, lowStock: 0, inStock: 0 });

  const topStockMaterials = [...materials]
    .filter((m) => (m.current_stock || 0) > 0)
    .sort((a, b) => (b.current_stock || 0) - (a.current_stock || 0))
    .slice(0, 3);

  // ============================================
  // HELPERS
  // ============================================
  
  // Custom formatter to prevent rounding up to next Cr/L (e.g. 1.99 stays 1.99)
  function formatAmount(amount: number | undefined) {
    if (!amount) return "₹0";
    if (amount >= 10000000) {
      const val = Math.floor((amount / 10000000) * 100) / 100;
      return `₹${val.toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      const val = Math.floor((amount / 100000) * 100) / 100;
      return `₹${val.toFixed(2)} L`;
    }
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  function getExactAmount(amount: number | undefined) {
    if (!amount) return "₹0";
    return `₹${amount.toLocaleString("en-IN")}`;
  }

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const statusConfig: Record<string, { label: string; variant: any }> = {
    active: { label: "Active", variant: "success" },
    completed: { label: "Completed", variant: "primary" },
    on_hold: { label: "On Hold", variant: "warning" },
    cancelled: { label: "Cancelled", variant: "danger" },
    pending: { label: "Pending", variant: "info" },
  };

  // ============================================
  // PAGE
  // ============================================
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* WELCOME BANNER & FILTER */}
        <NeoCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -ml-20 -mb-20"></div>

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
                Welcome back, Vivek! 👋
              </h1>
              <p className="text-slate-500 text-sm">
                {isGlobal ? "Here's what's happening globally." : `Viewing dashboard for: ${activeProjectObj?.project_name}`}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-[#e0e5ec] px-3 py-1.5 rounded-xl shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff]">
                <Filter className="h-4 w-4 text-slate-500" />
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="bg-transparent text-sm font-medium text-slate-700 outline-none w-48 cursor-pointer"
                >
                  <option value="">All Projects (Global)</option>
                  {projectsList.map(p => (
                    <option key={p.id} value={p.id}>{p.project_code} - {p.project_name}</option>
                  ))}
                </select>
              </div>

              <NeoButton
                variant="secondary"
                size="md"
                onClick={loadInitialData}
                icon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
              >
                Refresh
              </NeoButton>
            </div>
          </div>
        </NeoCard>

        {/* ERROR */}
        {error && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {/* STATS CARDS (Filtered) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <NeoCard hover>
            <div className="flex items-start justify-between mb-4">
              <NeoIconBox size="md" color="text-blue-600">
                <FolderKanban className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="info" size="sm">All Time</NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Projects</p>
            <p className="text-3xl font-bold text-slate-900">{loading ? "—" : displayTotalProjects}</p>
          </NeoCard>

          <NeoCard hover>
            <div className="flex items-start justify-between mb-4">
              <NeoIconBox size="md" color="text-green-600">
                <IndianRupee className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="success" size="sm">Sanctioned</NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Fund</p>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? "—" : formatAmount(displayTotalFund)}
            </p>
            <p className="text-[11px] font-medium text-slate-500 mt-1">
              {loading ? "—" : getExactAmount(displayTotalFund)}
            </p>
          </NeoCard>

          <NeoCard hover>
            <div className="flex items-start justify-between mb-4">
              <NeoIconBox size="md" color="text-orange-600">
                <Clock className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="warning" size="sm">Running</NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Active Projects</p>
            <p className="text-3xl font-bold text-orange-600">{loading ? "—" : displayActive}</p>
          </NeoCard>

          <NeoCard hover>
            <div className="flex items-start justify-between mb-4">
              <NeoIconBox size="md" color="text-purple-600">
                <CheckCircle2 className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="primary" size="sm">Done</NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Completed</p>
            <p className="text-3xl font-bold text-purple-600">{loading ? "—" : displayCompleted}</p>
          </NeoCard>
        </div>

        {/* CHARTS (Filtered) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeoCard>
            <div className="flex items-center gap-3 mb-6">
              <NeoIconBox color="text-blue-600" size="md">
                <TrendingUp className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h3 className="font-bold text-slate-800">
                  {isGlobal ? "Global Fund Utilization" : "Project Fund Utilization"}
                </h3>
                <p className="text-xs text-slate-500">FY-wise Allocated vs Spent</p>
              </div>
            </div>
            <div style={{ width: "100%", height: 250 }}>
              {fundChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fundChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v / 100000}L`} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                      formatter={(value: number) => formatAmount(value)}
                      contentStyle={{ background: "#e0e5ec", border: "none", borderRadius: 12, boxShadow: "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                    <Bar dataKey="Allocated" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No Fund Data Available</div>
              )}
            </div>
          </NeoCard>

          <NeoCard>
            <div className="flex items-center gap-3 mb-6">
              <NeoIconBox color="text-purple-600" size="md">
                <BarChart3 className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h3 className="font-bold text-slate-800">{pieChartTitle}</h3>
                <p className="text-xs text-slate-500">
                  {isGlobal ? "Overall project distribution" : "Budget distribution across heads"}
                </p>
              </div>
            </div>
            <div style={{ width: "100%", height: 250 }}>
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} stroke="#e0e5ec" strokeWidth={2}>
                      {pieChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: number) => isGlobal ? `${value} Projects` : formatAmount(value)}
                      contentStyle={{ background: "#e0e5ec", border: "none", borderRadius: 12, boxShadow: "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">No Data Available</div>
              )}
            </div>
          </NeoCard>
        </div>

        {/* SYSTEM MODULES (Filtered) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">
              System Modules {isGlobal ? "(Global)" : "(Project Specific)"}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link href={`/bills${selectedProject ? `?project=${selectedProject}` : ''}`}>
              <NeoCard hover className="h-full relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <NeoIconBox color="text-green-600" size="md"><Receipt className="h-5 w-5" /></NeoIconBox>
                  <NeoBadge variant="success" size="sm">Bills</NeoBadge>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Bills</p>
                <p className="text-3xl font-bold text-slate-900">{displayBillsCount}</p>
                <p className="text-xs text-green-600 font-medium mt-1">Gross: {formatAmount(displayBillsGross)}</p>
              </NeoCard>
            </Link>

            <Link href={`/services${selectedProject ? `?project=${selectedProject}` : ''}`}>
              <NeoCard hover className="h-full relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <NeoIconBox color="text-blue-600" size="md"><FileCheck className="h-5 w-5" /></NeoIconBox>
                  <NeoBadge variant="info" size="sm">Service</NeoBadge>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Completions</p>
                <p className="text-3xl font-bold text-slate-900">{displayServiceCount}</p>
                <p className="text-xs text-slate-500 mt-1">Certificates generated</p>
              </NeoCard>
            </Link>

            <Link href={`/documents${selectedProject ? `?project=${selectedProject}` : ''}`}>
              <NeoCard hover className="h-full relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <NeoIconBox color="text-purple-600" size="md"><FolderOpen className="h-5 w-5" /></NeoIconBox>
                  <NeoBadge variant="primary" size="sm">Files</NeoBadge>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Documents</p>
                <p className="text-3xl font-bold text-slate-900">{displayDocCount}</p>
                <p className="text-xs text-slate-500 mt-1">Uploaded files</p>
              </NeoCard>
            </Link>

            <Link href={`/uc${selectedProject ? `?project=${selectedProject}` : ''}`}>
              <NeoCard hover className="h-full relative overflow-hidden">
                <div className="flex items-start justify-between mb-4">
                  <NeoIconBox color="text-amber-600" size="md"><FileSpreadsheet className="h-5 w-5" /></NeoIconBox>
                  <NeoBadge variant="warning" size="sm">Reports</NeoBadge>
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">UC & Reports</p>
                <p className="text-3xl font-bold text-slate-900">Generate</p>
                <p className="text-xs text-slate-500 mt-1">Print certificates</p>
              </NeoCard>
            </Link>
          </div>
        </div>

        {/* STOCK SUMMARY (Global Only) */}
        {isGlobal && (
          <NeoCard>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <NeoIconBox size="md" color="text-cyan-600"><Package className="h-5 w-5" /></NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">📦 Material Stock Summary</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Current inventory overview</p>
                </div>
              </div>
              <Link href="/materials">
                <NeoButton variant="secondary" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>View All Materials</NeoButton>
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                <div className="flex items-center gap-2 mb-1"><Package className="h-4 w-4 text-blue-600" /><p className="text-[10px] font-bold text-slate-500 uppercase">Total Materials</p></div>
                <p className="text-2xl font-bold text-slate-800">{stockSummary.totalItems}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-green-600" /><p className="text-[10px] font-bold text-slate-500 uppercase">Total Stock</p></div>
                <p className="text-2xl font-bold text-green-600">{stockSummary.totalStock}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                <div className="flex items-center gap-2 mb-1"><AlertTriangle className="h-4 w-4 text-orange-600" /><p className="text-[10px] font-bold text-slate-500 uppercase">Low Stock</p></div>
                <p className="text-2xl font-bold text-orange-600">{stockSummary.lowStock}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                <div className="flex items-center gap-2 mb-1"><AlertCircle className="h-4 w-4 text-red-600" /><p className="text-[10px] font-bold text-slate-500 uppercase">Out of Stock</p></div>
                <p className="text-2xl font-bold text-red-600">{stockSummary.outOfStock}</p>
              </div>
            </div>

            {topStockMaterials.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">🏆 Top Stock Materials</p>
                <div className="space-y-2">
                  {topStockMaterials.map((mat, idx) => (
                    <Link key={mat.id} href={`/materials/${mat.id}`}>
                      <div className="p-3 rounded-xl flex items-center justify-between gap-3 transition-all hover:shadow-md cursor-pointer" style={{ background: "#e0e5ec", boxShadow: "inset 1px 1px 2px #b8bcc2, inset -1px -1px 2px #ffffff" }}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xs font-bold text-slate-400 w-4">#{idx + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">{mat.material_name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{mat.material_code}</p>
                          </div>
                        </div>
                        <NeoBadge variant="success" size="sm">📦 {mat.current_stock || 0}</NeoBadge>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </NeoCard>
        )}

        {/* QUICK ACTIONS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/projects/new">
              <NeoCard hover className="h-full"><NeoIconBox color="text-blue-600" size="lg" className="mb-4"><Plus className="h-6 w-6" /></NeoIconBox><h3 className="font-bold text-slate-800 mb-1">New Project</h3><p className="text-xs text-slate-500">Register a new project</p></NeoCard>
            </Link>
            <Link href="/funds">
              <NeoCard hover className="h-full"><NeoIconBox color="text-green-600" size="lg" className="mb-4"><IndianRupee className="h-6 w-6" /></NeoIconBox><h3 className="font-bold text-slate-800 mb-1">Fund Receipt</h3><p className="text-xs text-slate-500">Record new fund received</p></NeoCard>
            </Link>
            <Link href="/materials/issues/new">
              <NeoCard hover className="h-full"><NeoIconBox color="text-purple-600" size="lg" className="mb-4"><PackageMinus className="h-6 w-6" /></NeoIconBox><h3 className="font-bold text-slate-800 mb-1">Issue Material</h3><p className="text-xs text-slate-500">Issue material to employee</p></NeoCard>
            </Link>
            <Link href="/reports">
              <NeoCard hover className="h-full"><NeoIconBox color="text-orange-600" size="lg" className="mb-4"><BarChart3 className="h-6 w-6" /></NeoIconBox><h3 className="font-bold text-slate-800 mb-1">Reports</h3><p className="text-xs text-slate-500">Generate reports</p></NeoCard>
            </Link>
            <Link href="/bills/new">
              <NeoCard hover className="h-full"><NeoIconBox color="text-emerald-600" size="lg" className="mb-4"><Receipt className="h-6 w-6" /></NeoIconBox><h3 className="font-bold text-slate-800 mb-1">New Bill</h3><p className="text-xs text-slate-500">Create Form 5 bill entry</p></NeoCard>
            </Link>
            <Link href="/services/new">
              <NeoCard hover className="h-full"><NeoIconBox color="text-indigo-600" size="lg" className="mb-4"><FileCheck className="h-6 w-6" /></NeoIconBox><h3 className="font-bold text-slate-800 mb-1">Service Completion</h3><p className="text-xs text-slate-500">Add completion certificate</p></NeoCard>
            </Link>
            <Link href="/documents">
              <NeoCard hover className="h-full"><NeoIconBox color="text-pink-600" size="lg" className="mb-4"><FolderOpen className="h-6 w-6" /></NeoIconBox><h3 className="font-bold text-slate-800 mb-1">Documents</h3><p className="text-xs text-slate-500">Upload and manage files</p></NeoCard>
            </Link>
            <Link href="/uc">
              <NeoCard hover className="h-full"><NeoIconBox color="text-cyan-600" size="lg" className="mb-4"><FileSpreadsheet className="h-6 w-6" /></NeoIconBox><h3 className="font-bold text-slate-800 mb-1">Utilization Cert.</h3><p className="text-xs text-slate-500">Print official UC</p></NeoCard>
            </Link>
          </div>
        </div>

        {/* RECENT PROJECTS (Filtered) */}
        <NeoCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Recent Projects</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your latest registered projects</p>
            </div>
            <Link href="/projects"><NeoButton variant="secondary" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>View All</NeoButton></Link>
          </div>

          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => (<div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }} />))}</div>
          ) : displayRecentProjects.length === 0 ? (
            <div className="text-center py-10">
              <div className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "#e0e5ec", boxShadow: "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff" }}><FolderKanban className="h-6 w-6 text-slate-400" /></div>
              <p className="text-sm text-slate-500 mb-4">No projects available.</p>
              <Link href="/projects/new"><NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>Create First Project</NeoButton></Link>
            </div>
          ) : (
            <div className="space-y-3">
              {displayRecentProjects.map((project) => {
                const status = statusConfig[project.status] || { label: project.status, variant: "neutral" };
                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:shadow-lg cursor-pointer" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                      <NeoIconBox color="text-blue-600" size="md"><FolderKanban className="h-5 w-5" /></NeoIconBox>
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-500">{project.project_code}</span>
                          <NeoBadge variant={status.variant} size="sm">{status.label}</NeoBadge>
                        </div>
                        <h3 className="font-semibold text-slate-800">{project.project_name}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{project.pi_name}</span>
                          {project.start_date && (<span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(project.start_date)}</span>)}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{formatAmount(typeof project.sanctioned_amount === "string" ? parseFloat(project.sanctioned_amount) : project.sanctioned_amount)}</p>
                        <p className="text-xs text-slate-500">Sanctioned</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </NeoCard>

        {/* PENDING PO ALERTS (Filtered) */}
        {pendingPOList.length > 0 && (
          <NeoCard>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <NeoIconBox size="md" color="text-orange-600"><AlertTriangle className="h-5 w-5" /></NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">⚠️ Pending Purchase Orders</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{pendingPOList.length} PO{pendingPOList.length !== 1 ? "s" : ""} with {isGlobal ? pendingPOsData?.total_pending_items : pendingPOList.reduce((sum, po) => sum + (po.pending_count || 0), 0)} pending items</p>
                </div>
              </div>
              <Link href="/purchase"><NeoButton variant="secondary" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>View All POs</NeoButton></Link>
            </div>
            <div className="space-y-3">
              {pendingPOList.slice(0, 3).map((po) => (
                <Link key={po.id} href={`/purchase/${po.id}`}>
                  <div className="p-4 rounded-2xl transition-all duration-200 hover:shadow-lg cursor-pointer" style={{ background: "rgba(245, 158, 11, 0.08)", borderLeft: "4px solid #f59e0b" }}>
                    <div className="flex flex-wrap items-center gap-4">
                      <NeoIconBox color="text-orange-600" size="md"><AlertTriangle className="h-5 w-5" /></NeoIconBox>
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-700">{po.po_number}</span>
                          <NeoBadge variant="warning" size="sm">{po.pending_count} pending</NeoBadge>
                        </div>
                        <p className="text-xs text-slate-600">{po.vendor_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{formatPOAmount(po.grand_total)}</p>
                        <ChevronRight className="h-4 w-4 text-slate-400 ml-auto mt-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
              {pendingPOList.length > 3 && (
                <Link href="/purchase"><p className="text-center text-xs font-bold text-blue-600 hover:text-blue-700 py-2">+{pendingPOList.length - 3} more pending POs</p></Link>
              )}
            </div>
          </NeoCard>
        )}

        {/* PURCHASE ORDERS OVERVIEW (Filtered) */}
        {filteredPOs.length > 0 && (
          <NeoCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <NeoIconBox size="md" color="text-orange-600"><ShoppingCart className="h-5 w-5" /></NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Purchase Orders</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Total purchase orders overview</p>
                </div>
              </div>
              <Link href="/purchase"><NeoButton variant="secondary" size="sm" icon={<ArrowRight className="h-3.5 w-3.5" />}>View All</NeoButton></Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                <div className="flex items-center gap-2 mb-1"><ShoppingCart className="h-4 w-4 text-blue-600" /><p className="text-xs font-bold text-slate-500 uppercase">Total POs</p></div>
                <p className="text-2xl font-bold text-slate-800">{isGlobal ? poStats?.total_orders : filteredPOs.length}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                <div className="flex items-center gap-2 mb-1"><IndianRupee className="h-4 w-4 text-green-600" /><p className="text-xs font-bold text-slate-500 uppercase">Total Amount</p></div>
                <p className="text-2xl font-bold text-green-600">{formatPOAmount(displayPOTotalAmount)}</p>
              </div>
              <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                <div className="flex items-center gap-2 mb-1"><CheckCircle2 className="h-4 w-4 text-purple-600" /><p className="text-xs font-bold text-slate-500 uppercase">Approved</p></div>
                <p className="text-2xl font-bold text-purple-600">{displayPOApproved}</p>
              </div>
            </div>
            {displayRecentPOs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">Recent POs</p>
                <div className="space-y-2">
                  {displayRecentPOs.map((po) => (
                    <Link key={po.id} href={`/purchase/${po.id}`}>
                      <div className="p-3 rounded-xl flex items-center justify-between gap-3 transition-all hover:shadow-md cursor-pointer" style={{ background: "#e0e5ec", boxShadow: "inset 1px 1px 2px #b8bcc2, inset -1px -1px 2px #ffffff" }}>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">{po.po_number}</p>
                          <p className="text-[10px] text-slate-500 truncate">{po.vendor_name}</p>
                        </div>
                        <p className="text-sm font-bold text-green-600 whitespace-nowrap">{formatPOAmount(po.grand_total)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </NeoCard>
        )}

        {/* Footer */}
        <div className="text-center py-4 text-xs text-slate-500">© 2026 PIMS — Project Information Management System</div>
      </div>
    </AppLayout>
  );
}