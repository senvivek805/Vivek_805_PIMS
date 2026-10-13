"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  NeoCard,
  NeoButton,
  NeoBadge,
  NeoIconBox,
} from "@/components/neumorphism";
import {
  IndianRupee,
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  FileText,
  Building2,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Target,
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle2,
  Plus,
  Wallet,
} from "lucide-react";
import {
  getFundReceipt,
  deleteFundReceipt,
  formatCurrency,
  FUND_TYPE_LABELS,
  type FundReceipt,
  type FundBreakup,
} from "@/lib/api/funds";

export default function FundReceiptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const receiptId = Number(params.id);

  const [receipt, setReceipt] = useState<FundReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!receiptId || isNaN(receiptId)) {
        setError("Invalid receipt ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getFundReceipt(receiptId);
        setReceipt(data);
      } catch (err: any) {
        setError(err.message || "Failed to load receipt");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [receiptId]);

  // ============================================
  // DELETE
  // ============================================

  async function handleDelete() {
    if (!receipt) return;
    setDeleting(true);
    try {
      await deleteFundReceipt(receipt.id);
      router.push("/funds");
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
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
      month: "long",
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
          <Loader2 className="h-10 w-10 text-green-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading fund receipt...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !receipt) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Fund Receipt not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/funds">
              <NeoButton
                variant="primary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Fund Receipts
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  // ============================================
  // COMPUTED
  // ============================================

  const totalReceived = parseFloat(String(receipt.amount_received)) || 0;
  const totalAllocated = receipt.total_breakup || 0;
  const remaining = receipt.remaining ?? (totalReceived - totalAllocated);
  const percentage = receipt.breakup_percentage || 0;
  const isFullyAllocated = receipt.is_fully_allocated || false;
  const breakups = receipt.breakups || [];

  // Spent & Balance
  const totalSpent = breakups.reduce((sum, b: any) => {
    return sum + (parseFloat(String(b.spent_amount || 0)) || 0);
  }, 0);
  const totalBalance = totalAllocated - totalSpent;

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/funds">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/funds/${receipt.id}/edit`}>
              <NeoButton
                variant="primary"
                size="md"
                icon={<Pencil className="h-4 w-4" />}
              >
                Edit
              </NeoButton>
            </Link>
            <NeoButton
              variant="danger"
              size="md"
              onClick={() => setShowDelete(true)}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </NeoButton>
          </div>
        </div>

        {/* Hero Card */}
        <NeoCard>
          <div className="flex flex-wrap items-start gap-5">
            <NeoIconBox size="xl" color="text-green-600" variant="inset">
              <IndianRupee className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-500 tracking-wide">
                  {receipt.receipt_reference_no}
                </span>
                <NeoBadge variant="success" size="md">
                  💰 {receipt.fund_type_display || FUND_TYPE_LABELS[receipt.fund_type]}
                </NeoBadge>
                <NeoBadge variant="primary" size="md">
                  📅 FY {receipt.financial_year}
                </NeoBadge>
              </div>

              <p className="text-4xl font-bold text-green-600 mb-2">
                {formatCurrency(receipt.amount_received)}
              </p>

              <p className="text-sm text-slate-500">
                Received on {formatDate(receipt.receipt_date)}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200/40">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Receipt Date
                </p>
              </div>
              <p className="text-lg font-bold text-slate-800">
                {formatDate(receipt.receipt_date)}
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
                <FileText className="h-4 w-4 text-purple-600" />
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Financial Year
                </p>
              </div>
              <p className="text-lg font-bold text-slate-800">
                {receipt.financial_year}
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
                <Target className="h-4 w-4 text-orange-600" />
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Fund Type
                </p>
              </div>
              <p className="text-lg font-bold text-slate-800">
                {receipt.fund_type_display || FUND_TYPE_LABELS[receipt.fund_type]}
              </p>
            </div>
          </div>
        </NeoCard>

        {/* Project Information */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-blue-600">
              <Building2 className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Project Information
              </h2>
              <p className="text-xs text-slate-500">
                Which project this fund belongs to
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                Project Code
              </p>
              <p className="text-base font-bold text-slate-800">
                {receipt.project_code || "—"}
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
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                Project Name
              </p>
              <p className="text-base font-bold text-slate-800">
                {receipt.project_name || "—"}
              </p>
            </div>

            {receipt.project_detail?.pi_name && (
              <div
                className="p-4 rounded-2xl md:col-span-2"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Principal Investigator
                </p>
                <p className="text-base font-bold text-slate-800">
                  {receipt.project_detail.pi_name}
                </p>
              </div>
            )}
          </div>
        </NeoCard>

        {/* Remarks */}
        {receipt.remarks && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-4">
              <NeoIconBox size="md" color="text-purple-600">
                <FileText className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Remarks</h2>
                <p className="text-xs text-slate-500">Additional notes</p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {receipt.remarks}
            </p>
          </NeoCard>
        )}

        {/* ============================================
            BUDGET BREAKUP SECTION
            ============================================ */}
        <NeoCard>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <NeoIconBox size="md" color="text-orange-600">
                <Target className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Budget Breakup
                </h2>
                <p className="text-xs text-slate-500">
                  Allocate funds to different heads
                </p>
              </div>
            </div>

            <Link href={`/funds/${receipt.id}/breakup`}>
              <NeoButton
                variant={breakups.length > 0 ? "secondary" : "primary"}
                size="md"
                icon={
                  breakups.length > 0 ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )
                }
              >
                {breakups.length > 0 ? "Manage Breakup" : "Add Breakup"}
              </NeoButton>
            </Link>
          </div>

          {/* Breakup Summary Bar — 4 cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                Received
              </p>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(totalReceived)}
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
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                Allocated
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(totalAllocated)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {percentage.toFixed(1)}%
              </p>
            </div>

            {/* Spent */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "rgba(239, 68, 68, 0.06)",
                borderLeft: "4px solid #ef4444",
              }}
            >
              <p className="text-xs font-bold text-red-700 uppercase mb-1">
                Spent
              </p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-xs text-slate-500 mt-1">From Form 5</p>
            </div>

            {/* Balance */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background:
                  totalBalance >= 0
                    ? "rgba(59, 130, 246, 0.06)"
                    : "rgba(239, 68, 68, 0.06)",
                borderLeft: `4px solid ${
                  totalBalance >= 0 ? "#3b82f6" : "#ef4444"
                }`,
              }}
            >
              <p
                className={`text-xs font-bold uppercase mb-1 ${
                  totalBalance >= 0 ? "text-blue-700" : "text-red-700"
                }`}
              >
                Balance
              </p>
              <p
                className={`text-xl font-bold ${
                  totalBalance >= 0 ? "text-blue-700" : "text-red-600"
                }`}
              >
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Allocated - Spent
              </p>
            </div>
          </div>

          {/* Breakups List */}
          {breakups.length > 0 ? (
            <div className="space-y-3">
              {breakups.map((breakup: FundBreakup) => {
                const allocated = parseFloat(String(breakup.amount)) || 0;
                const spent =
                  parseFloat(String((breakup as any).spent_amount || 0)) || 0;
                const balance = allocated - spent;

                return (
                  <div
                    key={breakup.id}
                    className="p-4 rounded-2xl"
                    style={{
                      background: "#e0e5ec",
                      boxShadow:
                        "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                    }}
                  >
                    <div className="flex flex-wrap items-center gap-4">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background:
                            breakup.category_code === "NON_REC"
                              ? "linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)"
                              : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "#ffffff",
                        }}
                      >
                        {breakup.category_code === "NON_REC" ? (
                          <Package className="h-5 w-5" />
                        ) : (
                          <TrendingUp className="h-5 w-5" />
                        )}
                      </div>

                      <div className="flex-1 min-w-[160px]">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <NeoBadge
                            variant={
                              breakup.category_code === "NON_REC"
                                ? "primary"
                                : "success"
                            }
                            size="sm"
                          >
                            {breakup.category_name}
                          </NeoBadge>
                          <span className="text-xs font-bold text-slate-500">
                            {breakup.budget_head_code}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-800">
                          {breakup.budget_head_name}
                        </h3>
                      </div>

                      {/* 3 columns: Allocated | Spent | Balance */}
                      <div className="grid grid-cols-3 gap-4 text-right">
                        <div>
                          <p className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">
                            Allocated
                          </p>
                          <p className="text-base font-bold text-slate-800">
                            {formatCurrency(allocated)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-red-700 uppercase mb-0.5">
                            Spent
                          </p>
                          <p className="text-base font-bold text-red-600">
                            {formatCurrency(spent)}
                          </p>
                        </div>
                        <div>
                          <p
                            className={`text-[10px] font-bold uppercase mb-0.5 ${
                              balance >= 0 ? "text-blue-700" : "text-red-700"
                            }`}
                          >
                            Balance
                          </p>
                          <p
                            className={`text-base font-bold ${
                              balance >= 0 ? "text-blue-700" : "text-red-600"
                            }`}
                          >
                            {formatCurrency(balance)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Empty state
            <div
              className="p-8 rounded-2xl text-center"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <Target className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-600 mb-1">
                No breakup added yet
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Click "Add Breakup" to allocate funds
              </p>
              <Link href={`/funds/${receipt.id}/breakup`}>
                <NeoButton
                  variant="primary"
                  size="sm"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Start Breakup
                </NeoButton>
              </Link>
            </div>
          )}
        </NeoCard>

        {/* Audit Info */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Created:{" "}
              <strong className="text-slate-700">
                {formatDate(receipt.created_at)}
              </strong>
            </span>
            <span>
              Last Updated:{" "}
              <strong className="text-slate-700">
                {formatDate(receipt.updated_at)}
              </strong>
            </span>
          </div>
        </NeoCard>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => !deleting && setShowDelete(false)}
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
              Reference: <strong>{receipt.receipt_reference_no}</strong>
            </p>
            <p className="text-sm font-bold text-green-600 text-center mb-6">
              {formatCurrency(receipt.amount_received)}
            </p>

            {breakups.length > 0 && (
              <div
                className="p-3 rounded-xl mb-4 text-xs text-red-600 flex items-start gap-2"
                style={{ background: "rgba(239, 68, 68, 0.08)" }}
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <p>Delete all breakups first ({breakups.length}).</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
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
                onClick={handleDelete}
                disabled={deleting || breakups.length > 0}
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