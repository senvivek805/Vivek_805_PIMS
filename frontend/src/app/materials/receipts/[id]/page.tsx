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
  PackageCheck,
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Building2,
  ShoppingCart,
  Calendar,
  Package,
  FileText,
  Printer,
} from "lucide-react";
import {
  getMaterialReceipt,
  deleteMaterialReceipt,
  RECEIPT_STATUS_LABELS,
  RECEIPT_STATUS_EMOJIS,
  RECEIPT_STATUS_VARIANTS,
  type MaterialReceipt,
} from "@/lib/api/materials";

export default function MaterialReceiptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const receiptId = Number(params.id);

  const [receipt, setReceipt] = useState<MaterialReceipt | null>(null);
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
        const data = await getMaterialReceipt(receiptId);
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
      await deleteMaterialReceipt(receipt.id);
      router.push("/materials/receipts");
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
          <p className="text-sm text-slate-500">Loading receipt...</p>
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
              Receipt not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/materials/receipts">
              <NeoButton
                variant="primary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Receipts
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  const items = receipt.items || [];

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/materials/receipts">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/materials/receipts/${receipt.id}/print`}>
              <NeoButton
                variant="secondary"
                size="md"
                icon={<Printer className="h-4 w-4" />}
              >
                Print
              </NeoButton>
            </Link>
            <Link href={`/materials/receipts/${receipt.id}/edit`}>
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
              <PackageCheck className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {receipt.receipt_no}
                </span>
                <NeoBadge
                  variant={
                    RECEIPT_STATUS_VARIANTS[receipt.status] || "neutral"
                  }
                  size="md"
                >
                  {RECEIPT_STATUS_EMOJIS[receipt.status]}{" "}
                  {RECEIPT_STATUS_LABELS[receipt.status]}
                </NeoBadge>
              </div>

              <h1 className="text-2xl font-bold text-slate-800 mb-3">
                Material Receipt
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(receipt.receipt_date)}
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  PO: {receipt.po_number || "—"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">
                Items
              </p>
              <p className="text-3xl font-bold text-green-600">
                {receipt.item_count || items.length}
              </p>
            </div>
          </div>
        </NeoCard>

        {/* PO & Vendor Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PO Info */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-blue-600">
                <ShoppingCart className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Purchase Order
                </h2>
                <p className="text-xs text-slate-500">Against which PO</p>
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
                PO Number
              </p>
              <p className="text-base font-bold text-slate-800">
                {receipt.po_number || "—"}
              </p>
              {receipt.project_name && (
                <>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1 mt-3">
                    Project
                  </p>
                  <p className="text-sm text-slate-700">
                    {receipt.project_name}
                  </p>
                </>
              )}
            </div>
          </NeoCard>

          {/* Vendor Info */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-purple-600">
                <Building2 className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Vendor</h2>
                <p className="text-xs text-slate-500">Kis vendor se aaya</p>
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
                Vendor Name
              </p>
              <p className="text-base font-bold text-slate-800">
                {receipt.vendor_name || "—"}
              </p>
              {receipt.vendor_code && (
                <p className="text-xs text-slate-500 mt-1">
                  Code: {receipt.vendor_code}
                </p>
              )}
            </div>
          </NeoCard>
        </div>

        {/* Items Table */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-orange-600">
              <Package className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Received Items ({items.length})
              </h2>
              <p className="text-xs text-slate-500">
                Line-by-line breakdown
              </p>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Sl.
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">
                      Item
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Ordered
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Received
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Pending
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const ordered = parseFloat(String(item.ordered_quantity)) || 0;
                    const received = parseFloat(String(item.received_quantity)) || 0;
                    const pending = item.pending_quantity !== undefined
                      ? parseFloat(String(item.pending_quantity)) || 0
                      : ordered - received;

                    return (
                      <tr
                        key={item.id || idx}
                        className="border-t border-slate-300/40"
                      >
                        <td className="p-3 text-center font-bold text-slate-600">
                          {idx + 1}
                        </td>
                        <td className="p-3 text-slate-800">{item.item_name}</td>
                        <td className="p-3 text-center text-slate-700">
                          {ordered}
                        </td>
                        <td className="p-3 text-center font-bold text-green-600">
                          {received}
                        </td>
                        <td
                          className={`p-3 text-center font-bold ${
                            pending > 0
                              ? "text-orange-600"
                              : pending < 0
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {pending}
                        </td>
                        <td className="p-3 text-center text-slate-600">
                          {item.unit || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500 py-6">
              No items.
            </p>
          )}
        </NeoCard>

        {/* Remarks */}
        {receipt.remarks && (
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
              {receipt.remarks}
            </p>
          </NeoCard>
        )}

        {/* Audit */}
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
              Delete Receipt?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              Ye receipt delete ho jayegi:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {receipt.receipt_no}
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