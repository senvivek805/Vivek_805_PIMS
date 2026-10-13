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
  Save,
  Loader2,
  AlertCircle,
  X,
  Building2,
  ShoppingCart,
  Calendar,
  Package,
  FileText,
  RefreshCw,
} from "lucide-react";
import {
  getMaterialReceipt,
  updateMaterialReceipt,
  RECEIPT_STATUS_LABELS,
  RECEIPT_STATUS_EMOJIS,
  RECEIPT_STATUS_VARIANTS,
  type MaterialReceipt,
  type ReceiptStatus,
  type MaterialReceiptItem,
} from "@/lib/api/materials";

const STATUS_OPTIONS: ReceiptStatus[] = [
  "draft",
  "partial",
  "completed",
  "cancelled",
];

export default function MaterialReceiptEditPage() {
  const router = useRouter();
  const params = useParams();
  const receiptId = Number(params.id);

  const [receipt, setReceipt] = useState<MaterialReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state
  const [receiptDate, setReceiptDate] = useState("");
  const [status, setStatus] = useState<ReceiptStatus>("draft");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<MaterialReceiptItem[]>([]);

  const [saving, setSaving] = useState(false);

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
        setReceiptDate(data.receipt_date || "");
        setStatus(data.status || "draft");
        setRemarks(data.remarks || "");
        setItems(data.items || []);
      } catch (err: any) {
        setError(err.message || "Failed to load receipt");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [receiptId]);

  // ============================================
  // ITEM CHANGE
  // ============================================
  function updateItemQty(idx: number, value: string) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx ? { ...it, received_quantity: value } : it
      )
    );
  }

  // ============================================
  // SAVE
  // ============================================
  async function handleSave() {
    if (!receipt) return;

    // Basic validation
    if (!receiptDate) {
      alert("Receipt date is required");
      return;
    }
    for (const it of items) {
      const q = parseFloat(String(it.received_quantity));
      if (isNaN(q) || q < 0) {
        alert("Received quantity valid nahi hai. Check karo.");
        return;
      }
    }

    setSaving(true);
    try {
      await updateMaterialReceipt(receipt.id, {
        receipt_date: receiptDate,
        status,
        remarks,
        items: items.map((it) => ({
          ...it,
          received_quantity: parseFloat(String(it.received_quantity)) || 0,
        })),
      });
      router.push(`/materials/receipts/${receipt.id}`);
    } catch (err: any) {
      alert("Failed to save: " + (err.message || "Unknown error"));
      setSaving(false);
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

  // ============================================
  // PAGE
  // ============================================
  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/materials/receipts/${receipt.id}`}>
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Cancel
            </NeoButton>
          </Link>

          <NeoButton
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={saving}
            icon={
              saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )
            }
          >
            {saving ? "Saving..." : "Save Changes"}
          </NeoButton>
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
                    RECEIPT_STATUS_VARIANTS[status] || "neutral"
                  }
                  size="md"
                >
                  {RECEIPT_STATUS_EMOJIS[status]}{" "}
                  {RECEIPT_STATUS_LABELS[status]}
                </NeoBadge>
              </div>

              <h1 className="text-2xl font-bold text-slate-800 mb-3">
                Edit Material Receipt
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <ShoppingCart className="h-3 w-3" />
                  PO: {receipt.po_number || "—"}
                </span>
              </div>
            </div>
          </div>
        </NeoCard>

        {/* Form — Receipt Date + Status */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-blue-600">
              <Calendar className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Receipt Details
              </h2>
              <p className="text-xs text-slate-500">
                Date aur status change karo
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Date */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                Receipt Date *
              </label>
              <input
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReceiptStatus)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {RECEIPT_STATUS_EMOJIS[s]} {RECEIPT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </NeoCard>

        {/* PO & Vendor Info (Read-only) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-blue-600">
                <ShoppingCart className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Purchase Order
                </h2>
                <p className="text-xs text-slate-500">Read-only</p>
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

          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-purple-600">
                <Building2 className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Vendor</h2>
                <p className="text-xs text-slate-500">Read-only</p>
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

        {/* Items — Editable received_quantity */}
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
                Received quantity editable hai. Baaki fields PO se aaye hain.
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
                      Received (Edit)
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Unit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const ordered =
                      parseFloat(String(item.ordered_quantity)) || 0;
                    return (
                      <tr
                        key={item.id || idx}
                        className="border-t border-slate-300/40"
                      >
                        <td className="p-3 text-center font-bold text-slate-600">
                          {idx + 1}
                        </td>
                        <td className="p-3 text-slate-800">
                          {item.item_name}
                        </td>
                        <td className="p-3 text-center text-slate-700">
                          {ordered}
                        </td>
                        <td className="p-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.received_quantity}
                            onChange={(e) =>
                              updateItemQty(idx, e.target.value)
                            }
                            className="w-24 h-10 px-3 mx-auto block rounded-lg bg-[#e0e5ec] text-sm text-center font-bold text-green-700 border-0 outline-none"
                            style={{
                              boxShadow:
                                "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                            }}
                          />
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
        <NeoCard>
          <div className="flex items-center gap-3 mb-4">
            <NeoIconBox size="md" color="text-cyan-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Remarks</h2>
              <p className="text-xs text-slate-500">
                Optional notes
              </p>
            </div>
          </div>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={4}
            placeholder="Koi bhi note likho..."
            className="w-full p-4 rounded-2xl bg-[#e0e5ec] text-sm text-slate-700 placeholder:text-slate-400 border-0 outline-none resize-none"
            style={{
              boxShadow:
                "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
            }}
          />
        </NeoCard>

        {/* Bottom Save */}
        <div className="flex justify-end gap-3 pb-4">
          <Link href={`/materials/receipts/${receipt.id}`}>
            <NeoButton
              variant="secondary"
              size="md"
              icon={<X className="h-4 w-4" />}
            >
              Cancel
            </NeoButton>
          </Link>
          <NeoButton
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={saving}
            icon={
              saving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )
            }
          >
            {saving ? "Saving..." : "Save Changes"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}