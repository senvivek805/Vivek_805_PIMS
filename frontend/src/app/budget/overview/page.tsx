"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  NeoCard,
  NeoButton,
  NeoBadge,
  NeoIconBox,
} from "@/components/neumorphism";
import {
  Target,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Wallet,
  IndianRupee,
  Filter,
  RefreshCw,
  ArrowLeft,
  Package,
  BarChart3,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  getBudgetOverview,
  formatCurrency,
  type BudgetOverviewResponse,
} from "@/lib/api/funds";
import { getProjects, type Project } from "@/lib/api/projects";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Neumorphism palette for pie slices
const PIE_COLORS = [
  "#4f6df5",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

export default function BudgetOverviewPage() {
  const [data, setData] = useState<BudgetOverviewResponse | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [fyFilter, setFyFilter] = useState<string>("");
  const [projectFilter, setProjectFilter] = useState<number | "">("");

  // ============================================
  // LOAD
  // ============================================
  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [overviewData, projectsData] = await Promise.all([
        getBudgetOverview(
          fyFilter || undefined,
          projectFilter ? Number(projectFilter) : undefined
        ),
        getProjects(),
      ]);
      setData(overviewData);
      setProjects(projectsData.results);
    } catch (err: any) {
      setError(err.message || "Failed to load budget overview");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fyFilter, projectFilter]);

  // ============================================
  // CHART DATA (component level — useMemo)
  // ============================================

  // Bar Chart — FY-wise (Allocated vs Spent)
  const fyChartData = useMemo(
    () =>
      (data?.fy_wise || []).map((item) => ({
        name: item.fy,
        Allocated: item.allocated,
        Spent: item.spent,
      })),
    [data]
  );

  // Pie Chart — Head-wise allocated distribution
  const headChartData = useMemo(
    () =>
      (data?.head_wise || [])
        .filter((h) => h.allocated > 0)
        .map((h) => ({
          name: h.head_name,
          value: h.allocated,
        })),
    [data]
  );

  // ============================================
  // PAGE
  // ============================================
  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/budget">
              <NeoButton
                variant="secondary"
                size="md"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back
              </NeoButton>
            </Link>
            <div className="flex items-center gap-4">
              <NeoIconBox size="lg" color="text-green-600">
                <Target className="h-6 w-6" />
              </NeoIconBox>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Budget Overview
                </h1>
                <p className="text-sm text-slate-500">
                  Allocated vs Spent — FY & Project wise
                </p>
              </div>
            </div>
          </div>

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
        </div>

        {/* Filters */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-500 uppercase">
                Filters:
              </span>
            </div>

            {/* FY Filter */}
            <select
              value={fyFilter}
              onChange={(e) => setFyFilter(e.target.value)}
              className="h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
              style={{
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            >
              <option value="">All Financial Years</option>
              {data?.available_fys?.map((fy) => (
                <option key={fy} value={fy}>
                  FY {fy}
                </option>
              ))}
            </select>

            {/* Project Filter */}
            <select
              value={projectFilter}
              onChange={(e) =>
                setProjectFilter(e.target.value ? Number(e.target.value) : "")
              }
              className="h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
              style={{
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_code} — {p.project_name}
                </option>
              ))}
            </select>

            {(fyFilter || projectFilter) && (
              <button
                onClick={() => {
                  setFyFilter("");
                  setProjectFilter("");
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700"
              >
                Clear filters
              </button>
            )}
          </div>
        </NeoCard>

        {/* Error */}
        {error && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-4" />
            <p className="text-sm text-slate-500">Loading overview...</p>
          </div>
        ) : data ? (
          <>
            {/* ============================================
                SUMMARY CARDS
                ============================================ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <NeoCard>
                <div className="flex items-center gap-2 mb-2">
                  <IndianRupee className="h-4 w-4 text-blue-600" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    Received
                  </p>
                </div>
                <p className="text-2xl font-bold text-slate-800">
                  {formatCurrency(data.summary.total_received)}
                </p>
              </NeoCard>

              <NeoCard>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-[10px] font-bold text-slate-500 uppercase">
                    Allocated
                  </p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.summary.total_allocated)}
                </p>
              </NeoCard>

              <NeoCard>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <p className="text-[10px] font-bold text-red-700 uppercase">
                    Spent
                  </p>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(data.summary.total_spent)}
                </p>
              </NeoCard>

              <NeoCard>
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="h-4 w-4 text-blue-600" />
                  <p className="text-[10px] font-bold text-blue-700 uppercase">
                    Balance
                  </p>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  {formatCurrency(data.summary.total_balance)}
                </p>
              </NeoCard>
            </div>

            {/* ============================================
                CHARTS — Bar (FY-wise) + Pie (Head-wise)
                ============================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* BAR CHART — FY-wise Allocated vs Spent */}
              <NeoCard>
                <div className="flex items-center gap-3 mb-5">
                  <NeoIconBox size="md" color="text-indigo-600">
                    <BarChart3 className="h-5 w-5" />
                  </NeoIconBox>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      📊 FY-wise Allocated vs Spent
                    </h2>
                    <p className="text-xs text-slate-500">
                      Year comparison at a glance
                    </p>
                  </div>
                </div>

                {fyChartData.length > 0 ? (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={fyChartData}
                        margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
                        barGap={6}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          opacity={0.2}
                          vertical={false}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          axisLine={{ stroke: "#cbd5e1" }}
                        />
                        <YAxis
                          tick={{ fontSize: 11, fill: "#64748b" }}
                          tickFormatter={(v) =>
                            `₹${(Number(v) / 100000).toFixed(0)}L`
                          }
                          width={55}
                          axisLine={{ stroke: "#cbd5e1" }}
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            background: "#e0e5ec",
                            border: "none",
                            borderRadius: 12,
                            boxShadow:
                              "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
                            fontSize: 12,
                          }}
                          labelStyle={{
                            fontWeight: 700,
                            color: "#1e293b",
                            marginBottom: 4,
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                          iconType="circle"
                        />
                        <Bar
                          dataKey="Allocated"
                          fill="#10b981"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={48}
                        />
                        <Bar
                          dataKey="Spent"
                          fill="#ef4444"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={48}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-20">
                    No FY data available
                  </p>
                )}
              </NeoCard>

              {/* PIE CHART — Head-wise Allocation */}
              <NeoCard>
                <div className="flex items-center gap-3 mb-5">
                  <NeoIconBox size="md" color="text-orange-600">
                    <PieChartIcon className="h-5 w-5" />
                  </NeoIconBox>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      🥧 Head-wise Allocation
                    </h2>
                    <p className="text-xs text-slate-500">
                      Budget distribution across heads
                    </p>
                  </div>
                </div>

                {headChartData.length > 0 ? (
                  <div style={{ width: "100%", height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={headChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={3}
                          stroke="#e0e5ec"
                          strokeWidth={2}
                        >
                          {headChartData.map((entry, index) => (
                            <Cell
                              key={entry.name}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          contentStyle={{
                            background: "#e0e5ec",
                            border: "none",
                            borderRadius: 12,
                            boxShadow:
                              "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
                            fontSize: 12,
                          }}
                        />
                        <Legend
                          wrapperStyle={{ fontSize: 11 }}
                          iconType="circle"
                          layout="horizontal"
                          verticalAlign="bottom"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-20">
                    No head-wise data available
                  </p>
                )}
              </NeoCard>
            </div>

            {/* ============================================
                FY-WISE SUMMARY TABLE
                ============================================ */}
            <NeoCard>
              <div className="flex items-center gap-3 mb-5">
                <NeoIconBox size="md" color="text-purple-600">
                  <Target className="h-5 w-5" />
                </NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    📅 FY-wise Summary
                  </h2>
                  <p className="text-xs text-slate-500">
                    Financial Year wise breakdown
                  </p>
                </div>
              </div>

              {data.fy_wise.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-slate-300/60">
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">
                          FY
                        </th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right">
                          Received
                        </th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right">
                          Allocated
                        </th>
                        <th className="p-3 text-xs font-bold text-red-700 uppercase text-right">
                          Spent
                        </th>
                        <th className="p-3 text-xs font-bold text-blue-700 uppercase text-right">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.fy_wise.map((item) => (
                        <tr
                          key={item.fy}
                          className="border-b border-slate-200/40"
                        >
                          <td className="p-3 font-bold text-slate-800">
                            {item.fy}
                          </td>
                          <td className="p-3 text-right text-slate-700">
                            {formatCurrency(item.received)}
                          </td>
                          <td className="p-3 text-right text-green-600 font-bold">
                            {formatCurrency(item.allocated)}
                          </td>
                          <td className="p-3 text-right text-red-600 font-bold">
                            {formatCurrency(item.spent)}
                          </td>
                          <td className="p-3 text-right text-blue-700 font-bold">
                            {formatCurrency(item.balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">
                  No data available
                </p>
              )}
            </NeoCard>

            {/* ============================================
                HEAD-WISE BREAKDOWN
                ============================================ */}
            <NeoCard>
              <div className="flex items-center gap-3 mb-5">
                <NeoIconBox size="md" color="text-orange-600">
                  <Package className="h-5 w-5" />
                </NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    📊 Head-wise Breakdown
                  </h2>
                  <p className="text-xs text-slate-500">
                    All budget heads — Allocated, Spent, Balance, %
                  </p>
                </div>
              </div>

              {data.head_wise.length > 0 ? (
                <div className="space-y-2">
                  {data.head_wise.map((head) => {
                    const isOver = head.utilization_percentage > 100;
                    return (
                      <div
                        key={head.head_id}
                        className="p-3 rounded-2xl"
                        style={{
                          background: "#e0e5ec",
                          boxShadow:
                            "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                        }}
                      >
                        <div className="flex flex-wrap items-center gap-3">
                          <NeoBadge
                            variant={
                              head.category_code === "NON_REC"
                                ? "primary"
                                : "success"
                            }
                            size="sm"
                          >
                            {head.category_name}
                          </NeoBadge>
                          <div className="flex-1 min-w-[140px]">
                            <p className="text-sm font-bold text-slate-800">
                              {head.head_name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {head.head_code}
                            </p>
                          </div>

                          <div className="grid grid-cols-4 gap-3 text-right">
                            <div>
                              <p className="text-[9px] font-bold text-slate-500 uppercase">
                                Allocated
                              </p>
                              <p className="text-xs font-bold text-green-600">
                                {formatCurrency(head.allocated)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-red-700 uppercase">
                                Spent
                              </p>
                              <p className="text-xs font-bold text-red-600">
                                {formatCurrency(head.spent)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-blue-700 uppercase">
                                Balance
                              </p>
                              <p className="text-xs font-bold text-blue-700">
                                {formatCurrency(head.balance)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-500 uppercase">
                                %
                              </p>
                              <p
                                className={`text-xs font-bold ${
                                  isOver ? "text-red-600" : "text-slate-700"
                                }`}
                              >
                                {head.utilization_percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-6">
                  No data available
                </p>
              )}
            </NeoCard>

            {/* ============================================
                PROJECT-WISE SUMMARY
                ============================================ */}
            {data.project_wise.length > 0 && (
              <NeoCard>
                <div className="flex items-center gap-3 mb-5">
                  <NeoIconBox size="md" color="text-blue-600">
                    <TrendingUp className="h-5 w-5" />
                  </NeoIconBox>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      🏗️ Project-wise Summary
                    </h2>
                    <p className="text-xs text-slate-500">
                      Each project's budget status
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {data.project_wise.map((proj) => (
                    <div
                      key={proj.project_id}
                      className="p-4 rounded-2xl"
                      style={{
                        background: "#e0e5ec",
                        boxShadow:
                          "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                      }}
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <p className="text-xs font-bold text-slate-500">
                            {proj.project_code}
                          </p>
                          <p className="text-sm font-bold text-slate-800">
                            {proj.project_name}
                          </p>
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-right">
                          <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase">
                              Received
                            </p>
                            <p className="text-xs font-bold text-slate-700">
                              {formatCurrency(proj.received)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-green-700 uppercase">
                              Allocated
                            </p>
                            <p className="text-xs font-bold text-green-600">
                              {formatCurrency(proj.allocated)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-red-700 uppercase">
                              Spent
                            </p>
                            <p className="text-xs font-bold text-red-600">
                              {formatCurrency(proj.spent)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-blue-700 uppercase">
                              Balance
                            </p>
                            <p className="text-xs font-bold text-blue-700">
                              {formatCurrency(proj.balance)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </NeoCard>
            )}
          </>
        ) : null}
      </div>
    </AppLayout>
  );
}