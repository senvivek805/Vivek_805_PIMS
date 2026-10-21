"use client";

import { usePermissions } from "@/hooks/usePermissions";
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
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Calendar,
  RefreshCw,
  AlertCircle,
  X,
  AlertTriangle,
  Building2,
  FolderKanban,
  Receipt,
} from "lucide-react";
import {
  getBillEntries,
  deleteBillEntry,
  getBillEntryStats,
  BILL_STATUS_LABELS,
  BILL_STATUS_EMOJIS,
  BILL_STATUS_VARIANTS,
  type BillEntry,
  type BillEntryStats,
  type BillStatus,
} from "@/lib/api/bills";

export default function BillsPage() {
  // 👇 NEW: Hook call kiya
  const { canCreate, canEdit, canDelete } = usePermissions();

  const [bills, setBills] = useState<BillEntry[]>([]);
  const [stats, setStats] = useState<BillEntryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<BillStatus | "">("");

  const [deleteTarget, setDeleteTarget] = useState<BillEntry | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD DATA
  // ============================================

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [data, statsData] = await Promise.all([
        getBillEntries({
          search,
          status: statusFilter || undefined,
        }),
        getBillEntryStats(),
      ]);
      setBills(data.results);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

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
      await deleteBillEntry(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatAmount(amount: any) {
    const num = parseFloat(String(amount)) || 0;
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  }
  
  // Calculate Total Gross Amount for the summary card
  let totalGross = 0;
  bills.forEach(bill => {
    const base = Number(bill.bill_amount) || 0;
    const gst = (Number(bill.cgst_amount) || 0) + (Number(bill.sgst_amount) || 0) + (Number(bill.igst_amount) || 0);
    const other = Number(bill.other_charges) || 0;
    totalGross += (base + gst + other);
  });

  const draftCount =
    stats?.status_wise.find((s) => s.status === "draft")?.count || 0;
  const submittedCount =
    stats?.status_wise.find((s) => s.status === "submitted")?.count || 0;
  const paidCount =
    stats?.status_wise.find((s) => s.status === "paid")?.count || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-blue-600">
              <Receipt className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Bills (Form 5)
              </h1>
              <p className="text-sm text-slate-500">
                Bill entries for direct payment by finance
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
            
            {/* 👇 NEW: RBAC applied */}
            {canCreate && (
              <Link href="/bills/new">
                <NeoButton
                  variant="primary"
                  size="md"
                  icon={<Plus className="h-4 w-4" />}
                >
                  New Bill
                </NeoButton>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Total Bills
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.total_bills}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Total Gross
              </p>
              <p className="text-2xl font-bold text-indigo-600">
                {formatAmount(totalGross)}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Total Payable
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(stats.total_payable)}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Draft + Submitted
              </p>
              <p className="text-3xl font-bold text-slate-600">
                {draftCount + submittedCount}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Paid
              </p>
              <p className="text-3xl font-bold text-green-600">{paidCount}</p>
            </NeoCard>
          </div>
        )}

        {/* Search + Filter */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                <input
                  type="text"
                  placeholder="Search by bill no, recipient, vendor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
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
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as BillStatus | "")
                }
                className="h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
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

        {/* List */}
        <NeoCard padding="md">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl animate-pulse"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                />
              ))}
            </div>
          ) : bills.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
                }}
              >
                <Receipt className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                No bills found
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {search || statusFilter
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first bill"}
              </p>
              
              {/* 👇 NEW: RBAC applied */}
              {canCreate && (
                <Link href="/bills/new">
                  <NeoButton
                    variant="primary"
                    icon={<Plus className="h-4 w-4" />}
                  >
                    Create Bill Entry
                  </NeoButton>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {bills.map((bill) => {
                // Calculate Gross Amount for display
                const base = Number(bill.bill_amount) || 0;
                const gst = (Number(bill.cgst_amount) || 0) + (Number(bill.sgst_amount) || 0) + (Number(bill.igst_amount) || 0);
                const other = Number(bill.other_charges) || 0;
                const grossAmount = base + gst + other;

                return (
                  <div
                    key={bill.id}
                    className="p-4 rounded-2xl transition-all duration-200 hover:shadow-lg"
                    style={{
                      background: "#e0e5ec",
                      boxShadow:
                        "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                    }}
                  >
                    <div className="flex flex-wrap items-start gap-4">
                      <NeoIconBox color="text-blue-600" size="md">
                        <Receipt className="h-5 w-5" />
                      </NeoIconBox>

                      <div className="flex-1 min-w-[240px]">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-700">
                            {bill.bill_no}
                          </span>
                          <NeoBadge
                            variant={BILL_STATUS_VARIANTS[bill.status]}
                            size="sm"
                          >
                            {BILL_STATUS_EMOJIS[bill.status]}{" "}
                            {BILL_STATUS_LABELS[bill.status]}
                          </NeoBadge>
                        </div>

                        <p className="text-xs text-slate-500 mb-1">
                          Doc: {bill.document_no}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            👤 {bill.recipient_name}
                          </span>
                          
                          {bill.vendor_name && bill.vendor_name !== bill.recipient_name && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {bill.vendor_name}
                            </span>
                          )}
                          
                          {bill.project_code && (
                            <span className="flex items-center gap-1">
                              <FolderKanban className="h-3 w-3" />
                              {bill.project_code}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(bill.bill_date)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <p className="text-xl font-bold text-green-600">
                          {formatAmount(bill.total_payable)}
                        </p>
                        <p className="text-xs text-slate-500 font-semibold mb-1">Total Payable</p>
                        
                        {/* Show Gross Amount as a small sub-text */}
                        {grossAmount > 0 && (
                        <p className="text-xs font-bold text-indigo-800 bg-indigo-100/60 px-2.5 py-1 rounded-lg mt-1.5 shadow-sm border border-indigo-200/50">
                        Gross: {formatAmount(grossAmount)}
                        </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Link href={`/bills/${bill.id}`}>
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

                        {/* 👇 NEW: RBAC applied */}
                        {canEdit && (
                          <Link href={`/bills/${bill.id}/edit`}>
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
                        )}

                        {/* 👇 NEW: RBAC applied */}
                        {canDelete && (
                          <button
                            onClick={() => setDeleteTarget(bill)}
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
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </NeoCard>

        {!loading && bills.length > 0 && (
          <p className="text-center text-xs text-slate-500">
            Showing {bills.length} bill{bills.length !== 1 ? "s" : ""}
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
              Delete Bill?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              This bill will be deleted:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {deleteTarget.bill_no}
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