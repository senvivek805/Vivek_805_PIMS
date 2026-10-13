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
  Undo2,
  PackageMinus,
} from "lucide-react";
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

export default function DashboardPage() {
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [recentProjects, setRecentProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [poStats, setPoStats] = useState<POStats | null>(null);
  const [recentPOs, setRecentPOs] = useState<PurchaseOrder[]>([]);
  const [pendingPOs, setPendingPOs] = useState<PendingPOsResponse | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);

  // ============================================
  // LOAD DATA
  // ============================================

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [
        statsData,
        projectsData,
        poStatsData,
        poData,
        pendingData,
        materialsData,
      ] = await Promise.all([
        getProjectStats(),
        getProjects(),
        getPurchaseOrderStats(),
        getPurchaseOrders(),
        getPendingPurchaseOrders(),
        getMaterials(),
      ]);
      setStats(statsData);
      setRecentProjects(projectsData.results.slice(0, 4));
      setPoStats(poStatsData);
      setRecentPOs(poData.results.slice(0, 4));
      setPendingPOs(pendingData);
      setMaterials(materialsData.results);
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // ============================================
  // FORMATTERS
  // ============================================

  function formatCurrency(amount: number | undefined) {
    if (!amount) return "₹0";
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
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

  // ============================================
  // STOCK SUMMARY
  // ============================================

  const stockSummary = materials.reduce(
    (acc, m) => {
      const stock = m.current_stock || 0;
      acc.totalItems += 1;
      acc.totalStock += stock;
      if (stock === 0) acc.outOfStock += 1;
      else if (stock > 0 && stock < 10) acc.lowStock += 1;
      else if (stock > 0) acc.inStock += 1;
      return acc;
    },
    { totalItems: 0, totalStock: 0, outOfStock: 0, lowStock: 0, inStock: 0 }
  );

  const topStockMaterials = [...materials]
    .filter((m) => (m.current_stock || 0) > 0)
    .sort((a, b) => (b.current_stock || 0) - (a.current_stock || 0))
    .slice(0, 3);

  // ============================================
  // STATUS CONFIG
  // ============================================

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
        {/* WELCOME BANNER */}
        <NeoCard className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -ml-20 -mb-20"></div>

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-1">
                Welcome back, Vivek! 👋
              </h1>
              <p className="text-slate-500 text-sm">
                Here's what's happening with your projects today.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <NeoButton
                variant="secondary"
                size="md"
                onClick={loadData}
                icon={
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                }
              >
                Refresh
              </NeoButton>
              <Link href="/projects/new">
                <NeoButton
                  variant="primary"
                  size="md"
                  icon={<Plus className="h-4 w-4" />}
                >
                  New Project
                </NeoButton>
              </Link>
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

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <NeoCard hover>
            <div className="flex items-start justify-between mb-4">
              <NeoIconBox size="md" color="text-blue-600">
                <FolderKanban className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="info" size="sm">
                All Time
              </NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Total Projects
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {loading ? "—" : stats?.total_projects || 0}
            </p>
          </NeoCard>

          <NeoCard hover>
            <div className="flex items-start justify-between mb-4">
              <NeoIconBox size="md" color="text-green-600">
                <IndianRupee className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="success" size="sm">
                Sanctioned
              </NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Total Fund
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {loading ? "—" : formatCurrency(stats?.total_sanctioned_amount)}
            </p>
          </NeoCard>

          <NeoCard hover>
            <div className="flex items-start justify-between mb-4">
              <NeoIconBox size="md" color="text-orange-600">
                <Clock className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="warning" size="sm">
                Running
              </NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Active Projects
            </p>
            <p className="text-3xl font-bold text-orange-600">
              {loading ? "—" : stats?.active_projects || 0}
            </p>
          </NeoCard>

          <NeoCard hover>
            <div className="flex items-start justify-between mb-4">
              <NeoIconBox size="md" color="text-purple-600">
                <CheckCircle2 className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="primary" size="sm">
                Done
              </NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Completed
            </p>
            <p className="text-3xl font-bold text-purple-600">
              {loading ? "—" : stats?.completed_projects || 0}
            </p>
          </NeoCard>
        </div>

        {/* ============================================
            STOCK SUMMARY CARD
            ============================================ */}
        <NeoCard>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <NeoIconBox size="md" color="text-cyan-600">
                <Package className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  📦 Material Stock Summary
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Current inventory overview
                </p>
              </div>
            </div>
            <Link href="/materials">
              <NeoButton
                variant="secondary"
                size="sm"
                icon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View All Materials
              </NeoButton>
            </Link>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-blue-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Total Materials
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {stockSummary.totalItems}
              </p>
            </div>

            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Total Stock
                </p>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {stockSummary.totalStock}
              </p>
            </div>

            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Low Stock
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {stockSummary.lowStock}
              </p>
            </div>

            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Out of Stock
                </p>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {stockSummary.outOfStock}
              </p>
            </div>
          </div>

          {/* Top Stock Materials */}
          {topStockMaterials.length > 0 && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">
                🏆 Top Stock Materials
              </p>
              <div className="space-y-2">
                {topStockMaterials.map((mat, idx) => (
                  <Link key={mat.id} href={`/materials/${mat.id}`}>
                    <div
                      className="p-3 rounded-xl flex items-center justify-between gap-3 transition-all hover:shadow-md cursor-pointer"
                      style={{
                        background: "#e0e5ec",
                        boxShadow:
                          "inset 1px 1px 2px #b8bcc2, inset -1px -1px 2px #ffffff",
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-xs font-bold text-slate-400 w-4">
                          #{idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">
                            {mat.material_name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {mat.material_code}
                          </p>
                        </div>
                      </div>
                      <NeoBadge variant="success" size="sm">
                        📦 {mat.current_stock || 0}
                      </NeoBadge>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </NeoCard>

        {/* QUICK ACTIONS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Link href="/projects/new">
              <NeoCard hover className="h-full">
                <NeoIconBox color="text-blue-600" size="lg" className="mb-4">
                  <Plus className="h-6 w-6" />
                </NeoIconBox>
                <h3 className="font-bold text-slate-800 mb-1">New Project</h3>
                <p className="text-xs text-slate-500">
                  Register a new project
                </p>
              </NeoCard>
            </Link>

            <Link href="/funds">
              <NeoCard hover className="h-full">
                <NeoIconBox color="text-green-600" size="lg" className="mb-4">
                  <IndianRupee className="h-6 w-6" />
                </NeoIconBox>
                <h3 className="font-bold text-slate-800 mb-1">Fund Receipt</h3>
                <p className="text-xs text-slate-500">
                  Record new fund received
                </p>
              </NeoCard>
            </Link>

            <Link href="/materials/issues/new">
              <NeoCard hover className="h-full">
                <NeoIconBox color="text-purple-600" size="lg" className="mb-4">
                  <PackageMinus className="h-6 w-6" />
                </NeoIconBox>
                <h3 className="font-bold text-slate-800 mb-1">Issue Material</h3>
                <p className="text-xs text-slate-500">
                  Issue material to employee
                </p>
              </NeoCard>
            </Link>

            <Link href="/reports">
              <NeoCard hover className="h-full">
                <NeoIconBox color="text-orange-600" size="lg" className="mb-4">
                  <BarChart3 className="h-6 w-6" />
                </NeoIconBox>
                <h3 className="font-bold text-slate-800 mb-1">Reports</h3>
                <p className="text-xs text-slate-500">
                  Generate reports
                </p>
              </NeoCard>
            </Link>
          </div>
        </div>

        {/* RECENT PROJECTS */}
        <NeoCard>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Recent Projects
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Your latest registered projects
              </p>
            </div>
            <Link href="/projects">
              <NeoButton
                variant="secondary"
                size="sm"
                icon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View All
              </NeoButton>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl animate-pulse"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                />
              ))}
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="text-center py-10">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
                }}
              >
                <FolderKanban className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm text-slate-500 mb-4">
                No projects available yet.
              </p>
              <Link href="/projects/new">
                <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>
                  Create First Project
                </NeoButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => {
                const status = statusConfig[project.status] || {
                  label: project.status,
                  variant: "neutral",
                };

                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div
                      className="flex flex-wrap items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:shadow-lg cursor-pointer"
                      style={{
                        background: "#e0e5ec",
                        boxShadow:
                          "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                      }}
                    >
                      <NeoIconBox color="text-blue-600" size="md">
                        <FolderKanban className="h-5 w-5" />
                      </NeoIconBox>

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-500">
                            {project.project_code}
                          </span>
                          <NeoBadge variant={status.variant} size="sm">
                            {status.label}
                          </NeoBadge>
                        </div>
                        <h3 className="font-semibold text-slate-800">
                          {project.project_name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {project.pi_name}
                          </span>
                          {project.start_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(project.start_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">
                          {formatCurrency(
                            typeof project.sanctioned_amount === "string"
                              ? parseFloat(project.sanctioned_amount)
                              : project.sanctioned_amount
                          )}
                        </p>
                        <p className="text-xs text-slate-500">Sanctioned</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </NeoCard>

        {/* PENDING PO ALERTS */}
        {pendingPOs && pendingPOs.count > 0 && (
          <NeoCard>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <NeoIconBox size="md" color="text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                </NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    ⚠️ Pending Purchase Orders
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {pendingPOs.count} PO{pendingPOs.count !== 1 ? "s" : ""} with{" "}
                    {pendingPOs.total_pending_items} pending item
                    {pendingPOs.total_pending_items !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <Link href="/purchase">
                <NeoButton
                  variant="secondary"
                  size="sm"
                  icon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  View All POs
                </NeoButton>
              </Link>
            </div>

            <div className="space-y-3">
              {pendingPOs.results.slice(0, 3).map((po) => (
                <Link key={po.id} href={`/purchase/${po.id}`}>
                  <div
                    className="p-4 rounded-2xl transition-all duration-200 hover:shadow-lg cursor-pointer"
                    style={{
                      background: "rgba(245, 158, 11, 0.08)",
                      borderLeft: "4px solid #f59e0b",
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <NeoIconBox color="text-orange-600" size="md">
                        <AlertTriangle className="h-5 w-5" />
                      </NeoIconBox>

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-700">
                            {po.po_number}
                          </span>
                          <NeoBadge variant="warning" size="sm">
                            {po.pending_count} pending
                          </NeoBadge>
                        </div>
                        <p className="text-xs text-slate-600">
                          {po.vendor_name}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {po.fully_received}/{po.total_items} items received
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">
                          {formatPOAmount(po.grand_total)}
                        </p>
                        <ChevronRight className="h-4 w-4 text-slate-400 ml-auto mt-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}

              {pendingPOs.count > 3 && (
                <Link href="/purchase">
                  <p className="text-center text-xs font-bold text-blue-600 hover:text-blue-700 py-2">
                    +{pendingPOs.count - 3} more pending POs
                  </p>
                </Link>
              )}
            </div>
          </NeoCard>
        )}

        {/* PURCHASE ORDERS OVERVIEW */}
        {poStats && (
          <NeoCard>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <NeoIconBox size="md" color="text-orange-600">
                  <ShoppingCart className="h-5 w-5" />
                </NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Purchase Orders
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Total purchase orders overview
                  </p>
                </div>
              </div>
              <Link href="/purchase">
                <NeoButton
                  variant="secondary"
                  size="sm"
                  icon={<ArrowRight className="h-3.5 w-3.5" />}
                >
                  View All
                </NeoButton>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <ShoppingCart className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Total POs
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {poStats.total_orders}
                </p>
              </div>

              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="h-4 w-4 text-green-600" />
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Total Amount
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatPOAmount(poStats.total_amount)}
                </p>
              </div>

              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="h-4 w-4 text-purple-600" />
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Approved
                  </p>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {poStats.status_wise.find((s) => s.status === "approved")
                    ?.count || 0}
                </p>
              </div>
            </div>

            {recentPOs.length > 0 && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3">
                  Recent POs
                </p>
                <div className="space-y-2">
                  {recentPOs.map((po) => (
                    <Link key={po.id} href={`/purchase/${po.id}`}>
                      <div
                        className="p-3 rounded-xl flex items-center justify-between gap-3 transition-all hover:shadow-md cursor-pointer"
                        style={{
                          background: "#e0e5ec",
                          boxShadow:
                            "inset 1px 1px 2px #b8bcc2, inset -1px -1px 2px #ffffff",
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 truncate">
                            {po.po_number}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            {po.vendor_name}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-green-600 whitespace-nowrap">
                          {formatPOAmount(po.grand_total)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </NeoCard>
        )}

        {/* CHARTS PLACEHOLDER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeoCard>
            <div className="flex items-center gap-3 mb-4">
              <NeoIconBox color="text-blue-600" size="md">
                <TrendingUp className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h3 className="font-bold text-slate-800">Fund Utilization</h3>
                <p className="text-xs text-slate-500">Yearly progress</p>
              </div>
            </div>
            <div
              className="h-48 flex items-center justify-center text-slate-400 text-sm"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                borderRadius: "16px",
              }}
            >
              📊 Charts coming soon
            </div>
          </NeoCard>

          <NeoCard>
            <div className="flex items-center gap-3 mb-4">
              <NeoIconBox color="text-purple-600" size="md">
                <BarChart3 className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h3 className="font-bold text-slate-800">Project Status</h3>
                <p className="text-xs text-slate-500">Distribution</p>
              </div>
            </div>
            <div
              className="h-48 flex items-center justify-center text-slate-400 text-sm"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                borderRadius: "16px",
              }}
            >
              📈 Charts coming soon
            </div>
          </NeoCard>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-slate-500">
          © 2026 PIMS — Project Information Management System
        </div>
      </div>
    </AppLayout>
  );
}