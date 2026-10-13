"use client";

import { useEffect, useState, useMemo } from "react";
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
  Target,
  ArrowLeft,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  IndianRupee,
  Save,
  X,
  TrendingUp,
  TrendingDown,
  Package,
  Wallet,
  Pencil,
} from "lucide-react";
import {
  getFundReceipt,
  getBudgetHeads,
  bulkSaveBreakups,
  formatCurrency,
  type FundReceipt,
  type BudgetHead,
  type BulkSaveBreakupItem,
} from "@/lib/api/funds";

// ============================================
// ROW TYPE
// ============================================

interface BreakupRow {
  id: string;
  budget_head_id: number | "";
  amount: string;
  spent_amount: number;
  remarks: string;
}

function generateRowId() {
  return `row-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export default function BreakupPage() {
  const router = useRouter();
  const params = useParams();
  const receiptId = Number(params.id);

  // States
  const [receipt, setReceipt] = useState<FundReceipt | null>(null);
  const [budgetHeads, setBudgetHeads] = useState<BudgetHead[]>([]);
  const [rows, setRows] = useState<BreakupRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

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
        const [receiptData, headsData] = await Promise.all([
          getFundReceipt(receiptId),
          getBudgetHeads(),
        ]);
        setReceipt(receiptData);
        setBudgetHeads(headsData);

        // Initialize rows from existing breakups
        if (receiptData.breakups && receiptData.breakups.length > 0) {
          setRows(
            receiptData.breakups.map((b: any) => ({
              id: `existing-${b.id}`,
              budget_head_id: b.budget_head,
              amount: String(b.amount),
              spent_amount: parseFloat(String(b.spent_amount || 0)),
              remarks: b.remarks || "",
            }))
          );
        } else {
          setRows([
            {
              id: generateRowId(),
              budget_head_id: "",
              amount: "",
              spent_amount: 0,
              remarks: "",
            },
          ]);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [receiptId]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const totalReceived = receipt
    ? parseFloat(String(receipt.amount_received))
    : 0;

  const totalAllocated = useMemo(() => {
    return rows.reduce((sum, row) => {
      const amt = parseFloat(row.amount) || 0;
      return sum + amt;
    }, 0);
  }, [rows]);

  const totalSpent = useMemo(() => {
    return rows.reduce((sum, row) => {
      return sum + (row.spent_amount || 0);
    }, 0);
  }, [rows]);

  const totalBalance = totalAllocated - totalSpent;

  const remaining = totalReceived - totalAllocated;
  const percentage =
    totalReceived > 0 ? (totalAllocated / totalReceived) * 100 : 0;
  const isFullyAllocated = Math.abs(remaining) < 0.01;

  // ============================================
  // ROW HANDLERS
  // ============================================

  function addRow() {
    setRows([
      ...rows,
      {
        id: generateRowId(),
        budget_head_id: "",
        amount: "",
        spent_amount: 0,
        remarks: "",
      },
    ]);
  }

  function removeRow(id: string) {
    if (rows.length === 1) {
      alert("At least one row is required.");
      return;
    }
    setRows(rows.filter((r) => r.id !== id));
  }

  function updateRow(id: string, field: keyof BreakupRow, value: any) {
    setRows(rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSave() {
    setError("");
    setSuccess("");

    const validRows = rows.filter(
      (r) => r.budget_head_id && parseFloat(r.amount) > 0
    );

    if (validRows.length === 0) {
      setError("Add at least one breakup.");
      return;
    }

    if (!isFullyAllocated) {
      if (remaining > 0) {
        setError(
          `Still ${formatCurrency(remaining)} remaining. Allocate full amount.`
        );
      } else {
        setError(
          `${formatCurrency(Math.abs(remaining))} exceeded. Reduce amount.`
        );
      }
      return;
    }

    setSaving(true);
    try {
      const payload: BulkSaveBreakupItem[] = validRows.map((r) => ({
        budget_head: Number(r.budget_head_id),
        amount: parseFloat(r.amount),
        remarks: r.remarks,
      }));

      await bulkSaveBreakups(receiptId, payload);
      setSuccess("Breakup saved successfully! 🎉");

      setTimeout(() => {
        router.push(`/funds/${receiptId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save");
      setSaving(false);
    }
  }

  // ============================================
  // GROUP HEADS BY CATEGORY
  // ============================================

  const groupedHeads = useMemo(() => {
    const groups: Record<
      string,
      { category: string; heads: BudgetHead[] }
    > = {};
    budgetHeads.forEach((head) => {
      const key = head.category_code || `cat-${head.category}`;
      if (!groups[key]) {
        groups[key] = {
          category: head.category_name || "Other",
          heads: [],
        };
      }
      groups[key].heads.push(head);
    });
    return groups;
  }, [budgetHeads]);

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-orange-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading breakup data...</p>
        </div>
      </AppLayout>
    );
  }

  if (error && !receipt) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Cannot load breakup
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
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/funds/${receiptId}`}>
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>
          <div className="flex items-center gap-3">
            <NeoButton
              variant="primary"
              size="md"
              onClick={handleSave}
              loading={saving}
              disabled={!isFullyAllocated}
              icon={<Save className="h-4 w-4" />}
            >
              {saving ? "Saving..." : "Save Breakups"}
            </NeoButton>
          </div>
        </div>

        {/* Header Card */}
        <NeoCard>
          <div className="flex flex-wrap items-start gap-5">
            <NeoIconBox size="xl" color="text-orange-600" variant="inset">
              <Target className="h-8 w-8" />
            </NeoIconBox>
            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-500 tracking-wide">
                  {receipt?.receipt_reference_no}
                </span>
                <NeoBadge variant="primary" size="md">
                  📅 FY {receipt?.financial_year}
                </NeoBadge>
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-1">
                Budget Breakup
              </h1>
              <p className="text-sm text-slate-500">
                Allocate funds to different budget heads
              </p>
            </div>
          </div>
        </NeoCard>

        {/* LIVE SUMMARY CARD */}
        <NeoCard>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Received */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <IndianRupee className="h-4 w-4 text-blue-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Received
                </p>
              </div>
              <p className="text-xl font-bold text-slate-800">
                {formatCurrency(totalReceived)}
              </p>
            </div>

            {/* Allocated */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Allocated
                </p>
              </div>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(totalAllocated)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
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
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <p className="text-[10px] font-bold text-red-700 uppercase">
                  Spent
                </p>
              </div>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(totalSpent)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                From Form 5 bills
              </p>
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
              <div className="flex items-center gap-2 mb-2">
                <Wallet
                  className={`h-4 w-4 ${
                    totalBalance >= 0 ? "text-blue-600" : "text-red-600"
                  }`}
                />
                <p
                  className={`text-[10px] font-bold uppercase ${
                    totalBalance >= 0 ? "text-blue-700" : "text-red-700"
                  }`}
                >
                  Balance
                </p>
              </div>
              <p
                className={`text-xl font-bold ${
                  totalBalance >= 0 ? "text-blue-700" : "text-red-600"
                }`}
              >
                {formatCurrency(totalBalance)}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Allocated - Spent
              </p>
            </div>
          </div>

          {/* Remaining Alert */}
          {!isFullyAllocated && (
            <div
              className="mt-4 p-3 rounded-xl flex items-center gap-3"
              style={{
                background:
                  remaining < 0
                    ? "rgba(239, 68, 68, 0.08)"
                    : "rgba(245, 158, 11, 0.08)",
                borderLeft: `3px solid ${
                  remaining < 0 ? "#ef4444" : "#f59e0b"
                }`,
              }}
            >
              <AlertCircle
                className={`h-5 w-5 ${
                  remaining < 0 ? "text-red-600" : "text-orange-600"
                }`}
              />
              <p className="text-sm font-medium text-slate-700">
                {remaining > 0
                  ? `Still need to allocate: ${formatCurrency(remaining)}`
                  : `Over-allocated by: ${formatCurrency(
                      Math.abs(remaining)
                    )}`}
              </p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-5">
            <div
              className="h-4 rounded-full overflow-hidden"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            >
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${Math.min(percentage, 100)}%`,
                  background: isFullyAllocated
                    ? "linear-gradient(90deg, #10b981, #059669)"
                    : remaining < 0
                    ? "linear-gradient(90deg, #ef4444, #dc2626)"
                    : "linear-gradient(90deg, #f59e0b, #d97706)",
                }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              {percentage.toFixed(1)}% allocated
            </p>
          </div>
        </NeoCard>

        {/* Error / Success */}
        {error && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}
        {success && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          </NeoCard>
        )}

        {/* Breakup Rows */}
        <NeoCard>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <NeoIconBox size="md" color="text-orange-600">
                <Package className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
              Breakup Entries
                </h2>
                <p className="text-xs text-slate-500">
                  Allocate budget to different heads
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing && rows.length > 1 && (
                <NeoButton
                  type="button"
                  variant="success"
                  size="sm"
                  onClick={addRow}
                  icon={<Plus className="h-3.5 w-3.5" />}
                >
                  Add Row
                </NeoButton>
              )}

              {isEditing ? (
                <>
                  <NeoButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      // Reload page data — cancel edits
                      window.location.reload();
                    }}
                    icon={<X className="h-3.5 w-3.5" />}
                  >
                    Cancel
                  </NeoButton>
                  <NeoButton
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    loading={saving}
                    icon={<Save className="h-3.5 w-3.5" />}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </NeoButton>
                </>
              ) : (
                <NeoButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  icon={<Pencil className="h-3.5 w-3.5" />}
                >
                  Edit Breakup
                </NeoButton>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {rows.map((row, index) => {
              const allocated = parseFloat(row.amount) || 0;
              const spent = row.spent_amount || 0;
              const balance = allocated - spent;
              const hasExistingData = row.id.startsWith("existing-");
              const budgetHeadName =
                budgetHeads.find((h) => h.id === Number(row.budget_head_id))
                  ?.name || "—";

              return (
                <div
                  key={row.id}
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <NeoBadge variant="primary" size="sm">
                        #{index + 1}
                      </NeoBadge>
                      {spent > 0 && (
                        <NeoBadge variant="warning" size="sm">
                          💰 Spent: {formatCurrency(spent)}
                        </NeoBadge>
                      )}
                    </div>

                    {isEditing && rows.length > 1 && !hasExistingData && (
                      <button
                        type="button"
                        onClick={() => removeRow(row.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-red-600 transition-all hover:scale-110"
                        style={{
                          background: "#e0e5ec",
                          boxShadow:
                            "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                        }}
                        title="Remove"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* VIEW MODE */}
                  {!isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Budget Head
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {budgetHeadName}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                          Allocated
                        </p>
                        <p className="text-sm font-bold text-slate-800">
                          {formatCurrency(allocated)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-red-700 uppercase mb-1">
                          Spent
                        </p>
                        <p className="text-sm font-bold text-red-600">
                          {formatCurrency(spent)}
                        </p>
                      </div>
                      <div>
                        <p
                          className={`text-[10px] font-bold uppercase mb-1 ${
                            balance >= 0 ? "text-blue-700" : "text-red-700"
                          }`}
                        >
                          Balance
                        </p>
                        <p
                          className={`text-sm font-bold ${
                            balance >= 0 ? "text-blue-700" : "text-red-600"
                          }`}
                        >
                          {formatCurrency(balance)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* EDIT MODE */
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Budget Head Dropdown */}
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-slate-700 font-medium text-xs pl-2">
                            Budget Head *
                          </label>
                          <select
                            value={row.budget_head_id}
                            onChange={(e) =>
                              updateRow(
                                row.id,
                                "budget_head_id",
                                e.target.value ? Number(e.target.value) : ""
                              )
                            }
                            disabled={hasExistingData}
                            className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none disabled:opacity-60"
                            style={{
                              boxShadow:
                                "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                            }}
                          >
                            <option value="">Select Budget Head</option>
                            {Object.entries(groupedHeads).map(
                              ([key, group]) => (
                                <optgroup key={key} label={group.category}>
                                  {group.heads.map((head) => (
                                    <option key={head.id} value={head.id}>
                                      {head.name} ({head.code})
                                    </option>
                                  ))}
                                </optgroup>
                              )
                            )}
                          </select>
                        </div>

                        {/* Amount */}
                        <div className="space-y-1.5">
                          <label className="text-slate-700 font-medium text-xs pl-2">
                            Allocated (₹) *
                          </label>
                          <input
                            type="number"
                            placeholder="0"
                            value={row.amount}
                            onChange={(e) =>
                              updateRow(row.id, "amount", e.target.value)
                            }
                            className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                            style={{
                              boxShadow:
                                "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                            }}
                          />
                        </div>
                      </div>

                      {hasExistingData && spent > 0 && (
                        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-300/40">
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-red-700 uppercase mb-1">
                              Spent (Read-only)
                            </p>
                            <p className="text-base font-bold text-red-600">
                              {formatCurrency(spent)}
                            </p>
                          </div>
                          <div className="text-center">
                            <p
                              className={`text-[10px] font-bold uppercase mb-1 ${
                                balance >= 0
                                  ? "text-blue-700"
                                  : "text-red-700"
                              }`}
                            >
                              Balance
                            </p>
                            <p
                              className={`text-base font-bold ${
                                balance >= 0
                                  ? "text-blue-700"
                                  : "text-red-600"
                              }`}
                            >
                              {formatCurrency(balance)}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </NeoCard>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href={`/funds/${receiptId}`}>
            <NeoButton
              type="button"
              variant="secondary"
              size="lg"
              icon={<X className="h-4 w-4" />}
            >
              Cancel
            </NeoButton>
          </Link>
          <NeoButton
            type="button"
            variant={isFullyAllocated ? "success" : "primary"}
            size="lg"
            onClick={handleSave}
            loading={saving}
            disabled={!isFullyAllocated}
            icon={<Save className="h-4 w-4" />}
          >
            {saving
              ? "Saving..."
              : isFullyAllocated
              ? "Save Breakups ✅"
              : `Remaining: ${formatCurrency(Math.abs(remaining))}`}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}