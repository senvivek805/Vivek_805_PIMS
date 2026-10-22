"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import BillAttachments from "@/components/BillAttachments";
import {
  NeoCard,
  NeoButton,
  NeoBadge,
  NeoIconBox,
} from "@/components/neumorphism";
import {
  Receipt,
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Printer,
  Calendar,
  Building2,
  FolderKanban,
  FileText,
  IndianRupee,
  Landmark,
  User,
} from "lucide-react";
import {
  getBillEntry,
  deleteBillEntry,
  BILL_STATUS_LABELS,
  BILL_STATUS_EMOJIS,
  BILL_STATUS_VARIANTS,
  type BillEntry,
} from "@/lib/api/bills";
import { formatCurrency } from "@/lib/api/purchase";

export default function BillDetailPage() {
  const router = useRouter();
  const params = useParams();
  const billId = Number(params.id);

  const [bill, setBill] = useState<BillEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!billId || isNaN(billId)) {
        setError("Invalid bill ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getBillEntry(billId);
        setBill(data);
      } catch (err: any) {
        setError(err.message || "Failed to load bill");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [billId]);

  // ============================================
  // DELETE
  // ============================================

  async function handleDelete() {
    if (!bill) return;
    setDeleting(true);
    try {
      await deleteBillEntry(bill.id);
      router.push("/bills");
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

  function formatAmount(amount: any) {
    const num = parseFloat(String(amount)) || 0;
    return `₹${num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  // ============================================
  // LOADING / ERROR
  // ============================================

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading bill...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !bill) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Bill not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/bills">
              <NeoButton
                variant="primary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Bills
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  const items = bill.items || [];
  const totalItems = items.reduce(
    (sum, it) =>
      sum +
      (parseFloat(String(it.amount_rs)) || 0) +
      (parseFloat(String(it.amount_paise)) || 0) / 100,
    0
  );

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/bills">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/bills/${bill.id}/print`}>
              <NeoButton
                variant="secondary"
                size="md"
                icon={<Printer className="h-4 w-4" />}
              >
                Print (Form 5)
              </NeoButton>
            </Link>
            <Link href={`/bills/${bill.id}/edit`}>
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
            <NeoIconBox size="xl" color="text-blue-600" variant="inset">
              <Receipt className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {bill.bill_no}
                </span>
                <NeoBadge
                  variant={BILL_STATUS_VARIANTS[bill.status] || "neutral"}
                  size="md"
                >
                  {BILL_STATUS_EMOJIS[bill.status]}{" "}
                  {BILL_STATUS_LABELS[bill.status]}
                </NeoBadge>
              </div>

              <h1 className="text-2xl font-bold text-slate-800 mb-3">
                Bill Entry (Form 5)
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(bill.bill_date)}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  Doc: {bill.document_no}
                </span>
              </div>
            </div>

<div className="text-right flex flex-col items-end">
  <p className="text-[15px] font-semibold text-orange-800 uppercase tracking-wider mb-1">
    Gross Amount
  </p>
  <p className="text-[25px] font-bold text-indigo-600 mb-2">
    {formatCurrency(
      Number(bill.bill_amount) + 
      Number(bill.cgst_amount) + 
      Number(bill.sgst_amount) + 
      Number(bill.igst_amount) + 
      Number(bill.other_charges)
    )}
  </p>

  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 mt-2">
    Total Payable
  </p>
  <p className="text-2xl font-bold text-green-600">
    {formatCurrency(bill.total_payable)}
  </p>
</div>
          </div>
        </NeoCard>

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recipient */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-purple-600">
                <User className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Recipient
                </h2>
                <p className="text-xs text-slate-500">Bill to</p>
              </div>
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
                Name
              </p>
              <p className="text-base font-bold text-slate-800">
                {bill.recipient_name}
              </p>
            </div>
          </NeoCard>

          {/* Vendor */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-green-600">
                <Building2 className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Vendor</h2>
                <p className="text-xs text-slate-500">Supplier</p>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              {bill.vendor_name ? (
                <>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Vendor Name
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {bill.vendor_name}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">No vendor linked</p>
              )}
            </div>
          </NeoCard>
        </div>

        {/* Budget & PO */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Heads */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-purple-600">
                <FolderKanban className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Budget Heads
                </h2>
                <p className="text-xs text-slate-500">Major / Minor</p>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl space-y-3"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Major Budget Head
                </p>
                <p className="text-sm text-slate-700">
                  {bill.major_budget_head || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Minor Budget Head
                </p>
                <p className="text-sm text-slate-700">
                  {bill.minor_budget_head || "—"}
                </p>
              </div>
              {bill.budget_head_name && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Sub Head
                  </p>
                  <p className="text-sm text-slate-700">
                    {bill.budget_head_name}
                  </p>
                </div>
              )}
            </div>
          </NeoCard>

          {/* PO & Diary */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-blue-600">
                <FileText className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  PO & Diary
                </h2>
                <p className="text-xs text-slate-500">References</p>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl space-y-3"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Purchase Order
                </p>
                <p className="text-sm text-slate-700">
                  {bill.po_number || "—"}
                </p>
              </div>
              {bill.diary_voucher_no && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Diary Voucher No.
                  </p>
                  <p className="text-sm text-slate-700">
                    {bill.diary_voucher_no}
                  </p>
                </div>
              )}
              {bill.diary_voucher_date && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Diary Voucher Date
                  </p>
                  <p className="text-sm text-slate-700">
                    {formatDate(bill.diary_voucher_date)}
                  </p>
                </div>
              )}
            </div>
          </NeoCard>
        </div>

        {/* Particulars */}
        {bill.particulars && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-4">
              <NeoIconBox size="md" color="text-cyan-600">
                <FileText className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Particulars
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {bill.particulars}
            </p>
          </NeoCard>
        )}

        {/* Line Items */}
        {items.length > 0 && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-orange-600">
                <Receipt className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Line Items ({items.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Form 5 table rows
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      #
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">
                      Date
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">
                      Particulars
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Rs.
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Paise
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="border-t border-slate-300/40"
                    >
                      <td className="p-3 text-center font-bold text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="p-3 text-slate-700">
                        {item.date ? formatDate(item.date) : "—"}
                      </td>
                      <td className="p-3 text-slate-700">{item.particulars}</td>
                      <td className="p-3 text-center font-bold text-green-600">
                        {formatAmount(item.amount_rs)}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {item.amount_paise || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NeoCard>
        )}

        {/* Amounts & Deductions */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-green-600">
              <IndianRupee className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Amounts & Deductions
              </h2>
              <p className="text-xs text-slate-500">
                Bill breakdown
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* ============================================
                BASE AMOUNT
                ============================================ */}
            <div
              className="p-4 rounded-2xl flex items-center justify-between"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <span className="text-sm font-bold text-slate-600 uppercase">
                Bill Amount (Base)
              </span>
              <span className="text-lg font-bold text-slate-800">
                {formatAmount(bill.bill_amount)}
              </span>
            </div>

            {/* ============================================
                GST (ADD)
                ============================================ */}
            {parseFloat(String((bill as any).cgst_amount)) > 0 && (
              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: "rgba(34, 197, 94, 0.06)",
                  borderLeft: "4px solid #22c55e",
                }}
              >
                <span className="text-sm font-bold text-green-700 uppercase">
                  Add: CGST @{" "}
                  {(bill as any).cgst_rate}%
                </span>
                <span className="text-lg font-bold text-green-700">
                  + {formatAmount((bill as any).cgst_amount)}
                </span>
              </div>
            )}

            {parseFloat(String((bill as any).sgst_amount)) > 0 && (
              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: "rgba(34, 197, 94, 0.06)",
                  borderLeft: "4px solid #22c55e",
                }}
              >
                <span className="text-sm font-bold text-green-700 uppercase">
                  Add: SGST @{" "}
                  {(bill as any).sgst_rate}%
                </span>
                <span className="text-lg font-bold text-green-700">
                  + {formatAmount((bill as any).sgst_amount)}
                </span>
              </div>
            )}

            {parseFloat(String((bill as any).igst_amount)) > 0 && (
              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: "rgba(34, 197, 94, 0.06)",
                  borderLeft: "4px solid #22c55e",
                }}
              >
                <span className="text-sm font-bold text-green-700 uppercase">
                  Add: IGST @{" "}
                  {(bill as any).igst_rate}%
                </span>
                <span className="text-lg font-bold text-green-700">
                  + {formatAmount((bill as any).igst_amount)}
                </span>
              </div>
            )}

            {/* Other Charges (No Tax) */}
            {parseFloat(String((bill as any).other_charges)) > 0 && (
              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: "rgba(59, 130, 246, 0.06)",
                  borderLeft: "4px solid #3b82f6",
                }}
              >
                <span className="text-sm font-bold text-blue-700 uppercase">
                  Add: Other Charges
                  {(bill as any).other_charges_remarks &&
                    ` (${(bill as any).other_charges_remarks})`}
                </span>
                <span className="text-lg font-bold text-blue-700">
                  + {formatAmount((bill as any).other_charges)}
                </span>
              </div>
            )}

            {/* ============================================
                TOTAL BILL AMOUNT (with GST + Other)
                ============================================ */}
            {(parseFloat(String((bill as any).cgst_amount)) > 0 ||
              parseFloat(String((bill as any).sgst_amount)) > 0 ||
              parseFloat(String((bill as any).igst_amount)) > 0 ||
              parseFloat(String((bill as any).other_charges)) > 0) && (
              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  borderLeft: "4px solid #3b82f6",
                }}
              >
                <span className="text-sm font-bold text-blue-700 uppercase">
                  Total Bill Amount (Inc. GST)
                </span>
                <span className="text-lg font-bold text-blue-700">
                  {formatAmount(
                    (parseFloat(String(bill.bill_amount)) || 0) +
                      (parseFloat(String((bill as any).cgst_amount)) || 0) +
                      (parseFloat(String((bill as any).sgst_amount)) || 0) +
                      (parseFloat(String((bill as any).igst_amount)) || 0) +
                      (parseFloat(String((bill as any).other_charges)) || 0)
                  )}
                </span>
              </div>
            )}

            {/* ============================================
                DEDUCTIONS
                ============================================ */}
            {parseFloat(String(bill.tds_gst)) > 0 && (
              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: "rgba(239, 68, 68, 0.06)",
                  borderLeft: "4px solid #ef4444",
                }}
              >
                <span className="text-sm font-bold text-red-700 uppercase">
                  Less: TDS under GST
                </span>
                <span className="text-lg font-bold text-red-600">
                  - {formatAmount(bill.tds_gst)}
                </span>
              </div>
            )}

            {parseFloat(String(bill.tds_income_tax)) > 0 && (
              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: "rgba(239, 68, 68, 0.06)",
                  borderLeft: "4px solid #ef4444",
                }}
              >
                <span className="text-sm font-bold text-red-700 uppercase">
                  Less: Income Tax Deduction
                </span>
                <span className="text-lg font-bold text-red-600">
                  - {formatAmount(bill.tds_income_tax)}
                </span>
              </div>
            )}

            {(bill as any).penalty_applicable &&
              parseFloat(String(bill.penalty)) > 0 && (
                <div
                  className="p-4 rounded-2xl flex items-center justify-between"
                  style={{
                    background: "rgba(239, 68, 68, 0.06)",
                    borderLeft: "4px solid #ef4444",
                  }}
                >
                  <span className="text-sm font-bold text-red-700 uppercase">
                    Less: Penalty / Other
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    - {formatAmount(bill.penalty)}
                  </span>
                </div>
              )}

            {(bill as any).pbg_applicable &&
              parseFloat(String(bill.pbg_security)) > 0 && (
                <div
                  className="p-4 rounded-2xl flex items-center justify-between"
                  style={{
                    background: "rgba(239, 68, 68, 0.06)",
                    borderLeft: "4px solid #ef4444",
                  }}
                >
                  <span className="text-sm font-bold text-red-700 uppercase">
                    Less: PBG Security
                  </span>
                  <span className="text-lg font-bold text-red-600">
                    - {formatAmount(bill.pbg_security)}
                  </span>
                </div>
              )}

            {/* ============================================
                TOTAL PAYABLE
                ============================================ */}
            <div
              className="p-5 rounded-2xl flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow:
                  "6px 6px 14px #b8bcc2, -6px -6px 14px #ffffff, inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <span className="text-base font-bold text-white uppercase">
                Total Payable Amount
              </span>
              <span className="text-2xl font-bold text-white">
                {formatAmount(bill.total_payable)}
              </span>
            </div>

            {bill.in_words && (
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                  In Words
                </p>
                <p className="text-sm italic text-slate-700">
                  {bill.in_words}
                </p>
              </div>
            )}
          </div>
        </NeoCard>

        {/* RTGS Bank Details */}
        {(bill.bank_name || bill.bank_account_no) && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-purple-600">
                <Landmark className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  RTGS — Bank Details
                </h2>
                <p className="text-xs text-slate-500">
                  Beneficiary information
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Account Name
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {bill.bank_account_name || "—"}
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
                  Account Number
                </p>
                <p className="text-sm font-bold text-slate-800 font-mono">
                  {bill.bank_account_no || "—"}
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
                  Bank Name
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {bill.bank_name || "—"}
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
                  Branch
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {bill.bank_branch || "—"}
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
                  IFSC Code
                </p>
                <p className="text-sm font-bold text-slate-800 font-mono">
                  {bill.bank_ifsc || "—"}
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
                  Account Type
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {bill.bank_account_type || "—"}
                </p>
              </div>

              {bill.bank_address && (
                <div
                  className="p-4 rounded-2xl md:col-span-2"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Bank Address
                  </p>
                  <p className="text-sm text-slate-700">
                    {bill.bank_address}
                  </p>
                </div>
              )}
            </div>
          </NeoCard>
        )}

        {/* Remarks */}
        {bill.remarks && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-4">
              <NeoIconBox size="md" color="text-cyan-600">
                <FileText className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Remarks</h2>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {bill.remarks}
            </p>
          </NeoCard>
        )}

        {/* 👇 NEW: ATTACHMENTS SECTION (Yahan add kiya hai) */}
        <BillAttachments billId={bill.id} projectId={bill.project} />

        {/* Audit */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Created:{" "}
              <strong className="text-slate-700">
                {formatDate(bill.created_at)}
              </strong>
            </span>
            <span>
              Last Updated:{" "}
              <strong className="text-slate-700">
                {formatDate(bill.updated_at)}
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
              Delete Bill?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              This bill will be deleted:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {bill.bill_no}
            </p>

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