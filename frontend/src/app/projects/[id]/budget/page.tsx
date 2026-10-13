"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  NeoCard,
  NeoButton,
  NeoBadge,
  NeoIconBox,
} from "@/components/neumorphism";
import {
  TrendingUp,
  ArrowLeft,
  IndianRupee,
  Target,
  Calendar,
  FileText,
  Building2,
  AlertCircle,
  Loader2,
  Package,
  CheckCircle2,
  Plus,
  BarChart3,
  ArrowRight,
  Percent,
  Wallet,
} from "lucide-react";

import {
  getProjectBudgetSummary,
  type ProjectBudgetSummary,
} from "@/lib/api/projects";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function ProjectBudgetPage() {
  const params = useParams();
  const projectId = Number(params.id);

  const [data, setData] = useState<ProjectBudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!projectId || isNaN(projectId)) {
        setError("Invalid project ID");
        setLoading(false);
        return;
      }
      try {
        const summary = await getProjectBudgetSummary(projectId);
        setData(summary);
      } catch (err: any) {
        setError(err.message || "Failed to load budget");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  // ============================================
  // FORMATTERS
  // ============================================

  function formatCurrency(amount: number | undefined) {
    if (!amount) return "₹0";
    return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }

  function formatCompact(amount: number | undefined) {
    if (!amount) return "₹0";
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
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
  // LOADING / ERROR
  // ============================================

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading budget summary...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Budget not available
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href={`/projects/${projectId}`}>
              <NeoButton variant="primary" icon={<ArrowLeft className="h-4 w-4" />}>
                Back to Project
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  const { project, summary, receipts, breakup_by_category, breakup_by_head, fy_wise } = data;

  // Max value for chart scaling
  const maxHeadValue = Math.max(...breakup_by_head.map((h) => h.total), 1);
  const maxFyValue = Math.max(...fy_wise.map((f) => f.received), 1);

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/projects/${projectId}`}>
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Project
            </NeoButton>
          </Link>
          <div className="flex items-center gap-3">
            <NeoButton
              variant="secondary"
              size="md"
              onClick={() => window.print()}
              icon={<FileText className="h-4 w-4" />}
            >
              Print
            </NeoButton>
            <Link href="/funds/new">
              <NeoButton
                variant="primary"
                size="md"
                icon={<Plus className="h-4 w-4" />}
              >
                Add Fund Receipt
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* ============================================
            PROJECT HEADER CARD
            ============================================ */}
        <NeoCard>
          <div className="flex flex-wrap items-start gap-5">
            <NeoIconBox size="xl" color="text-blue-600" variant="inset">
              <Target className="h-8 w-8" />
            </NeoIconBox>
            <div className="flex-1 min-w-[240px]">
              <span className="text-sm font-bold text-slate-500 tracking-wide">
                {project.project_code}
              </span>
              <h1 className="text-2xl font-bold text-slate-800 mt-1 mb-2">
                {project.project_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                {project.pi_name && (
                  <span className="flex items-center gap-1">
                    👤 PI: {project.pi_name}
                  </span>
                )}
                {project.agency_name && (
                  <span className="flex items-center gap-1">
                    🏛️ {project.agency_name}
                  </span>
                )}
                {project.department_name && (
                  <span className="flex items-center gap-1">
                    🎓 {project.department_name}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">
                Total Sanctioned
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCompact(summary.total_sanctioned)}
              </p>
            </div>
          </div>
        </NeoCard>

        {/* ============================================
            KPI CARDS
            ============================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Sanctioned */}
          <NeoCard hover>
            <div className="flex items-start justify-between mb-3">
              <NeoIconBox size="md" color="text-blue-600">
                <Target className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="info" size="sm">
                Sanctioned
              </NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Total Sanctioned
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {formatCompact(summary.total_sanctioned)}
            </p>
          </NeoCard>

          {/* Total Received */}
          <NeoCard hover>
            <div className="flex items-start justify-between mb-3">
              <NeoIconBox size="md" color="text-green-600">
                <IndianRupee className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="success" size="sm">
                {summary.received_percentage.toFixed(1)}%
              </NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Total Received
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCompact(summary.total_received)}
            </p>
          </NeoCard>

          {/* Balance to Receive */}
          <NeoCard hover>
            <div className="flex items-start justify-between mb-3">
              <NeoIconBox size="md" color="text-orange-600">
                <Wallet className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge variant="warning" size="sm">
                Pending
              </NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Balance to Receive
            </p>
            <p className="text-2xl font-bold text-orange-600">
              {formatCompact(summary.balance_to_receive)}
            </p>
          </NeoCard>

          {/* Total Breakup */}
          <NeoCard hover>
            <div className="flex items-start justify-between mb-3">
              <NeoIconBox size="md" color="text-purple-600">
                <Package className="h-5 w-5" />
              </NeoIconBox>
              <NeoBadge
                variant={summary.breakup_percentage === 100 ? "success" : "warning"}
                size="sm"
              >
                {summary.breakup_percentage.toFixed(0)}%
              </NeoBadge>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
              Total Breakup
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {formatCompact(summary.total_breakup)}
            </p>
          </NeoCard>
        </div>
        {/* ============================================
            UTILIZATION SUMMARY + PIE CHART
            ============================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Utilization Summary Card */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-green-600">
                <Percent className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Budget Utilization
                </h2>
                <p className="text-xs text-slate-500">
                  Sanctioned vs Received vs Breakup
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Total Sanctioned */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Total Sanctioned
                  </span>
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCompact(summary.total_sanctioned)}
                </p>
              </div>

              {/* Total Received */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Total Received
                  </span>
                  <IndianRupee className="h-4 w-4 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCompact(summary.total_received)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {summary.received_percentage.toFixed(2)}% of sanctioned
                </p>
              </div>

              {/* Total Breakup */}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase">
                    Total Breakup
                  </span>
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCompact(summary.total_breakup)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {summary.breakup_percentage.toFixed(2)}% of received
                </p>
              </div>

              {/* Summary Row */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    borderLeft: "3px solid #f59e0b",
                  }}
                >
                  <p className="text-[10px] font-bold text-orange-800 uppercase mb-0.5">
                    To Receive
                  </p>
                  <p className="text-base font-bold text-orange-700">
                    {formatCompact(summary.balance_to_receive)}
                  </p>
                </div>
                <div
                  className="p-3 rounded-xl"
                  style={{
                    background:
                      summary.remaining_to_breakup > 0
                        ? "rgba(239, 68, 68, 0.1)"
                        : "rgba(16, 185, 129, 0.1)",
                    borderLeft:
                      summary.remaining_to_breakup > 0
                        ? "3px solid #ef4444"
                        : "3px solid #10b981",
                  }}
                >
                  <p
                    className={`text-[10px] font-bold uppercase mb-0.5 ${
                      summary.remaining_to_breakup > 0
                        ? "text-red-800"
                        : "text-green-800"
                    }`}
                  >
                    To Breakup
                  </p>
                  <p
                    className={`text-base font-bold ${
                      summary.remaining_to_breakup > 0
                        ? "text-red-700"
                        : "text-green-700"
                    }`}
                  >
                    {formatCompact(summary.remaining_to_breakup)}
                  </p>
                </div>
              </div>
            </div>
          </NeoCard>

          {/* Utilization Pie Chart */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-blue-600">
                <TrendingUp className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Fund Utilization
                </h2>
                <p className="text-xs text-slate-500">
                  Received vs Pending
                </p>
              </div>
            </div>

            <div style={{ height: "280px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Received",
                        value: summary.total_received,
                        color: "#10b981",
                      },
                      {
                        name: "Pending",
                        value: summary.balance_to_receive,
                        color: "#f59e0b",
                      },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={3}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => formatCompact(value)}
                    contentStyle={{
                      background: "#e0e5ec",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow:
                        "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-xs font-bold text-slate-700">
                  Received ({summary.received_percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                <span className="text-xs font-bold text-slate-700">
                  Pending ({(100 - summary.received_percentage).toFixed(1)}%)
                </span>
              </div>
            </div>
          </NeoCard>
        </div>

        {/* ============================================
            PROGRESS BARS
            ============================================ */}
        <NeoCard>
          <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Fund Flow Progress
          </h3>

          {/* Received Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="text-sm font-bold text-slate-700">
                  Fund Received
                </span>
              </div>
              <span className="text-sm font-bold text-green-600">
                {formatCompact(summary.total_received)} / {formatCompact(summary.total_sanctioned)}
              </span>
            </div>
            <div
              className="h-4 rounded-full overflow-hidden"
              style={{
                background: "#e0e5ec",
                boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary.received_percentage, 100)}%`,
                  background: "linear-gradient(90deg, #10b981, #059669)",
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.received_percentage.toFixed(2)}% received
            </p>
          </div>

          {/* Breakup Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-bold text-slate-700">
                  Fund Breakup
                </span>
              </div>
              <span className="text-sm font-bold text-purple-600">
                {formatCompact(summary.total_breakup)} / {formatCompact(summary.total_received)}
              </span>
            </div>
            <div
              className="h-4 rounded-full overflow-hidden"
              style={{
                background: "#e0e5ec",
                boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(summary.breakup_percentage, 100)}%`,
                  background:
                    summary.breakup_percentage === 100
                      ? "linear-gradient(90deg, #10b981, #059669)"
                      : "linear-gradient(90deg, #f59e0b, #d97706)",
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {summary.breakup_percentage.toFixed(2)}% allocated
              {summary.remaining_to_breakup > 0 && (
                <span className="text-orange-600 font-semibold">
                  {" "}• {formatCompact(summary.remaining_to_breakup)} remaining
                </span>
              )}
            </p>
          </div>
        </NeoCard>

        {/* ============================================
            ALERTS / WARNINGS
            ============================================ */}
        {(summary.balance_to_receive > 0 || summary.remaining_to_breakup > 0) && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-4">
              <NeoIconBox size="md" color="text-orange-600">
                <AlertCircle className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Alerts & Warnings
                </h2>
                <p className="text-xs text-slate-500">
                  Action items
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {summary.balance_to_receive > 0 && (
                <div
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{
                    background: "rgba(245, 158, 11, 0.1)",
                    borderLeft: "4px solid #f59e0b",
                  }}
                >
                  <Wallet className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-800">
                      {formatCompact(summary.balance_to_receive)} abhi tak receive nahi hua
                    </p>
                    <p className="text-xs text-orange-700 mt-0.5">
                      Total sanctioned ka {(100 - summary.received_percentage).toFixed(1)}% baaki hai
                    </p>
                  </div>
                </div>
              )}

              {summary.remaining_to_breakup > 0 && (
                <div
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{
                    background: "rgba(239, 68, 68, 0.1)",
                    borderLeft: "4px solid #ef4444",
                  }}
                >
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-red-800">
                      {formatCompact(summary.remaining_to_breakup)} ka breakup baaki hai
                    </p>
                    <p className="text-xs text-red-700 mt-0.5">
                      Fund Receipts ka breakup complete karo
                    </p>
                  </div>
                </div>
              )}

              {summary.breakup_percentage === 100 && summary.total_received > 0 && (
                <div
                  className="p-4 rounded-xl flex items-start gap-3"
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    borderLeft: "4px solid #10b981",
                  }}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-green-800">
                      Fund breakup 100% complete ✅
                    </p>
                    <p className="text-xs text-green-700 mt-0.5">
                      Sabhi heads me allocate ho gaya hai
                    </p>
                  </div>
                </div>
              )}
            </div>
          </NeoCard>
        )}

        {/* ============================================
            FUND RECEIPTS TABLE
            ============================================ */}
        <NeoCard>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <NeoIconBox size="md" color="text-green-600">
                <IndianRupee className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Fund Receipts ({receipts.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Year-wise fund received
                </p>
              </div>
            </div>
            <Link href="/funds">
              <NeoButton
                variant="secondary"
                size="sm"
                icon={<ArrowRight className="h-3.5 w-3.5" />}
              >
                View All
              </NeoButton>
            </Link>
          </div>

          {receipts.length > 0 ? (
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <Link key={receipt.id} href={`/funds/${receipt.id}`}>
                  <div
                    className="p-4 rounded-2xl transition-all duration-200 hover:shadow-lg cursor-pointer"
                    style={{
                      background: "#e0e5ec",
                      boxShadow:
                        "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <NeoIconBox color="text-green-600" size="md">
                        <IndianRupee className="h-5 w-5" />
                      </NeoIconBox>

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-500">
                            {receipt.receipt_reference_no}
                          </span>
                          <NeoBadge variant="primary" size="sm">
                            FY {receipt.financial_year}
                          </NeoBadge>
                          {receipt.is_fully_allocated ? (
                            <NeoBadge variant="success" size="sm">
                              ✅ 100% Breakup
                            </NeoBadge>
                          ) : (
                            <NeoBadge variant="warning" size="sm">
                              {receipt.breakup_percentage.toFixed(0)}% Breakup
                            </NeoBadge>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(receipt.receipt_date)}
                          </span>
                          <span>{receipt.fund_type_display}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCompact(receipt.amount_received)}
                        </p>
                        <p className="text-xs text-slate-500">Received</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className="p-8 rounded-2xl text-center"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <IndianRupee className="h-10 w-10 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600 mb-1">
                Abhi koi fund receipt nahi
              </p>
              <p className="text-xs text-slate-500 mb-4">
                "Add Fund Receipt" button dabao
              </p>
            </div>
          )}
        </NeoCard>

        {/* ============================================
            QUICK ACTIONS
            ============================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link href="/funds/new">
            <NeoCard hover className="h-full">
              <NeoIconBox color="text-green-600" size="lg" className="mb-3">
                <Plus className="h-6 w-6" />
              </NeoIconBox>
              <h3 className="font-bold text-slate-800 mb-1">
                Add Fund Receipt
              </h3>
              <p className="text-xs text-slate-500">
                Naya fund receipt record karo
              </p>
            </NeoCard>
          </Link>

          <Link href="/funds">
            <NeoCard hover className="h-full">
              <NeoIconBox color="text-blue-600" size="lg" className="mb-3">
                <IndianRupee className="h-6 w-6" />
              </NeoIconBox>
              <h3 className="font-bold text-slate-800 mb-1">
                All Fund Receipts
              </h3>
              <p className="text-xs text-slate-500">
                Saare receipts dekho
              </p>
            </NeoCard>
          </Link>

          <Link href={`/projects/${projectId}/edit`}>
            <NeoCard hover className="h-full">
              <NeoIconBox color="text-purple-600" size="lg" className="mb-3">
                <Target className="h-6 w-6" />
              </NeoIconBox>
              <h3 className="font-bold text-slate-800 mb-1">
                Edit Project
              </h3>
              <p className="text-xs text-slate-500">
                Sanctioned amount update karo
              </p>
            </NeoCard>
          </Link>
        </div>

        {/* ============================================
            BREAKUP SUMMARY
            ============================================ */}
        {breakup_by_category.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category-wise */}
            <NeoCard>
              <div className="flex items-center gap-3 mb-5">
                <NeoIconBox size="md" color="text-purple-600">
                  <Package className="h-5 w-5" />
                </NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Category-wise
                  </h2>
                  <p className="text-xs text-slate-500">
                    Recurring vs Non-Recurring
                  </p>
                </div>
              </div>
                            {/* Pie Chart */}
              <div className="mb-5" style={{ height: "220px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={breakup_by_category}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={3}
                    >
                      {breakup_by_category.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            entry.code === "NON_REC" ? "#8b5cf6" : "#10b981"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => formatCompact(value)}
                      contentStyle={{
                        background: "#e0e5ec",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow:
                          "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {breakup_by_category.map((cat) => (
                  <div key={cat.id}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-700">
                        {cat.name}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {formatCompact(cat.total)}{" "}
                        <span className="text-xs text-slate-500">
                          ({cat.percentage.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-3 rounded-full overflow-hidden"
                      style={{
                        background: "#e0e5ec",
                        boxShadow:
                          "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                      }}
                    >
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          background:
                            cat.code === "NON_REC"
                              ? "linear-gradient(90deg, #8b5cf6, #a855f7)"
                              : "linear-gradient(90deg, #10b981, #059669)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </NeoCard>

            {/* Head-wise */}
            <NeoCard>
              <div className="flex items-center gap-3 mb-5">
                <NeoIconBox size="md" color="text-orange-600">
                  <BarChart3 className="h-5 w-5" />
                </NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Head-wise Breakup
                  </h2>
                  <p className="text-xs text-slate-500">
                    Top budget heads
                  </p>
                </div>
              </div>
              {/* Bar Chart */}
              <div className="mb-5" style={{ height: "280px" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={breakup_by_head.slice(0, 6)}
                    margin={{ top: 5, right: 5, left: -20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#b8bcc2" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 9, fill: "#64748b" }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      height={60}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "#64748b" }}
                      tickFormatter={(value) =>
                        value >= 100000
                          ? `${(value / 100000).toFixed(0)}L`
                          : `${value}`
                      }
                    />
                    <Tooltip
                      formatter={(value: any) => formatCompact(value)}
                      contentStyle={{
                        background: "#e0e5ec",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow:
                          "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
                      }}
                    />
                    <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                      {breakup_by_head.slice(0, 6).map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={
                            entry.category_code === "NON_REC"
                              ? "#8b5cf6"
                              : "#10b981"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {breakup_by_head.map((head) => (
                  <div key={head.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700">
                          {head.name}
                        </span>
                        <NeoBadge
                          variant={
                            head.category_code === "NON_REC"
                              ? "primary"
                              : "success"
                          }
                          size="sm"
                        >
                          {head.category_code === "NON_REC" ? "📦" : "🔄"}
                        </NeoBadge>
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        {formatCompact(head.total)}
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{
                        background: "#e0e5ec",
                        boxShadow:
                          "inset 1px 1px 2px #b8bcc2, inset -1px -1px 2px #ffffff",
                      }}
                    >
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${(head.total / maxHeadValue) * 100}%`,
                          background:
                            head.category_code === "NON_REC"
                              ? "linear-gradient(90deg, #8b5cf6, #a855f7)"
                              : "linear-gradient(90deg, #10b981, #059669)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </NeoCard>
          </div>
        )}

        {/* ============================================
            FY-WISE CHART
            ============================================ */}
        {fy_wise.length > 0 && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-blue-600">
                <Calendar className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Year-wise Fund Flow
                </h2>
                <p className="text-xs text-slate-500">
                  Financial Year wise received vs breakup
                </p>
              </div>
            </div>

            <div className="space-y-5">
              {fy_wise.map((fy) => (
                <div key={fy.financial_year}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-slate-700">
                      FY {fy.financial_year}
                    </span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-green-600 font-bold">
                        Recv: {formatCompact(fy.received)}
                      </span>
                      <span className="text-purple-600 font-bold">
                        Breakup: {formatCompact(fy.breakup)}
                      </span>
                    </div>
                  </div>

                  {/* Received bar */}
                  <div className="mb-1.5">
                    <div
                      className="h-3 rounded-full overflow-hidden"
                      style={{
                        background: "#e0e5ec",
                        boxShadow:
                          "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                      }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${(fy.received / maxFyValue) * 100}%`,
                          background: "linear-gradient(90deg, #10b981, #059669)",
                        }}
                      />
                    </div>
                  </div>

                  {/* Breakup bar */}
                  <div>
                    <div
                      className="h-3 rounded-full overflow-hidden"
                      style={{
                        background: "#e0e5ec",
                        boxShadow:
                          "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                      }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${(fy.breakup / maxFyValue) * 100}%`,
                          background:
                            "linear-gradient(90deg, #8b5cf6, #a855f7)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </NeoCard>
        )}

        {/* Footer */}
        <div className="text-center py-4 text-xs text-slate-500">
          Budget Summary — {project.project_code}
        </div>
      </div>
    </AppLayout>
  );
}