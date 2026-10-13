"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  NeoCard,
  NeoButton,
  NeoBadge,
  NeoIconBox,
} from "@/components/neumorphism";
import {
  IndianRupee,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Calendar,
  RefreshCw,
  AlertCircle,
  X,
  AlertTriangle,
  FileText,
  TrendingUp,
} from "lucide-react";
import {
  getFundReceipts,
  deleteFundReceipt,
  getFundReceiptStats,
  formatCurrency,
  FUND_TYPE_LABELS,
  type FundReceipt,
  type FundReceiptStats,
  type FundType,
} from "@/lib/api/funds";

export default function FundsPage() {
  const [receipts, setReceipts] = useState<FundReceipt[]>([]);
  const [stats, setStats] = useState<FundReceiptStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [fyFilter, setFyFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<FundType | "">("");

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<FundReceipt | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD DATA
  // ============================================

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [receiptsData, statsData] = await Promise.all([
        getFundReceipts({
          search,
          financial_year: fyFilter,
          fund_type: typeFilter || undefined,
        }),
        getFundReceiptStats(),
      ]);
      setReceipts(receiptsData.results);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load fund receipts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [fyFilter, typeFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ============================================
  // DELETE
  // ============================================

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteFundReceipt(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  // ============================================
  // FORMATTERS
  // ============================================

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-green-600">
              <IndianRupee className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Fund Receipts
              </h1>
              <p className="text-sm text-slate-500">
                Track all fund receipts across projects
              </p>
            </div>
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
            <Link href="/funds/new">
              <NeoButton
                variant="primary"
                size="md"
                icon={<Plus className="h-4 w-4" />}
              >
                New Fund Receipt
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Total Receipts
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.total_receipts}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Total Amount
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(stats.total_amount)}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Financial Years
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.fy_wise.length}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Fund Types
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.type_wise.length}
              </p>
            </NeoCard>
          </div>
        )}

        {/* Search + Filter Bar */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                <input
                  type="text"
                  placeholder="Search by reference no., project code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 placeholder:text-slate-400 border-0 outline-none"
                  style={{
                    boxShadow:
                      "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as FundType | "")}
                className="h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">All Types</option>
                {Object.entries(FUND_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </NeoCard>

        {/* Error */}
        {error && (
          <NeoCard>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {/* Receipts List */}
        <NeoCard padding="md">
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
          ) : receipts.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
                }}
              >
                <IndianRupee className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                No fund receipts found
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {search || typeFilter
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first fund receipt"}
              </p>
              <Link href="/funds/new">
                <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>
                  Add Fund Receipt
                </NeoButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="p-4 rounded-2xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <NeoIconBox color="text-green-600" size="md">
                      <IndianRupee className="h-5 w-5" />
                    </NeoIconBox>

                    <div className="flex-1 min-w-[240px]">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500">
                          {receipt.receipt_reference_no}
                        </span>
                        <NeoBadge variant="info" size="sm">
                          {receipt.fund_type_display ||
                            FUND_TYPE_LABELS[receipt.fund_type]}
                        </NeoBadge>
                        <NeoBadge variant="primary" size="sm">
                          FY {receipt.financial_year}
                        </NeoBadge>
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">
                        {receipt.project_name || "—"}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        {receipt.project_code && (
                          <span className="flex items-center gap-1">
                            📋 {receipt.project_code}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(receipt.receipt_date)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(receipt.amount_received)}
                      </p>
                      <p className="text-xs text-slate-500">Received</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/funds/${receipt.id}`}>
                        <button
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-blue-600 transition-all hover:scale-110"
                          style={{
                            background: "#e0e5ec",
                            boxShadow:
                              "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                          }}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>

                      <Link href={`/funds/${receipt.id}/edit`}>
                        <button
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-orange-600 transition-all hover:scale-110"
                          style={{
                            background: "#e0e5ec",
                            boxShadow:
                              "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                          }}
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </Link>

                      <button
                        onClick={() => setDeleteTarget(receipt)}
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-red-600 transition-all hover:scale-110"
                        style={{
                          background: "#e0e5ec",
                          boxShadow:
                            "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                        }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeoCard>

        {/* Footer Info */}
        {!loading && receipts.length > 0 && (
          <p className="text-center text-xs text-slate-500">
            Showing {receipts.length} receipt
            {receipts.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="w-full max-w-md p-6 rounded-3xl"
            style={{
              background: "#e0e5ec",
              boxShadow:
                "20px 20px 60px rgba(0,0,0,0.3), -10px -10px 30px rgba(255,255,255,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
              Delete Fund Receipt?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              Reference: <strong>{deleteTarget.receipt_reference_no}</strong>
            </p>
            <p className="text-sm font-bold text-green-600 text-center mb-6">
              {formatCurrency(deleteTarget.amount_received)}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl font-bold text-sm text-slate-700 disabled:opacity-50"
                style={{
                  background: "#e0e5ec",
                  boxShadow: "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </span>
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  boxShadow:
                    "4px 4px 12px #b8bcc2, -4px -4px 12px #ffffff",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  {deleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}