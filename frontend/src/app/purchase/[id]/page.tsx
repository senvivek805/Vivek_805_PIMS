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
  ShoppingCart,
  ArrowLeft,
  Pencil,
  Trash2,
  Printer,
  Calendar,
  Building2,
  FolderKanban,
  FileText,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Package,
  MapPin,
  Phone,
  Mail,
  Calculator,
} from "lucide-react";
import {
  getPurchaseOrder,
  deletePurchaseOrder,
  STATUS_LABELS,
  STATUS_EMOJIS,
  STATUS_BADGE_VARIANTS,
  formatCurrency,
  type PurchaseOrder,
} from "@/lib/api/purchase";

export default function PurchaseOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const poId = Number(params.id);

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!poId || isNaN(poId)) {
        setError("Invalid PO ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getPurchaseOrder(poId);
        setPo(data);
      } catch (err: any) {
        setError(err.message || "Failed to load PO");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [poId]);

  // ============================================
  // DELETE
  // ============================================

  async function handleDelete() {
    if (!po) return;
    setDeleting(true);
    try {
      await deletePurchaseOrder(po.id);
      router.push("/purchase");
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
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading purchase order...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !po) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Purchase Order not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/purchase">
              <NeoButton
                variant="primary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Purchase Orders
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  const items = po.items || [];
  const isIgst = po.gst_type === "igst";

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/purchase">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/purchase/${po.id}/print`}>
              <NeoButton
                variant="secondary"
                size="md"
                icon={<Printer className="h-4 w-4" />}
              >
                Print
              </NeoButton>
            </Link>
            <Link href={`/purchase/${po.id}/edit`}>
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
              <ShoppingCart className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {po.po_number}
                </span>
                <NeoBadge
                  variant={STATUS_BADGE_VARIANTS[po.status]}
                  size="md"
                >
                  {STATUS_EMOJIS[po.status]} {STATUS_LABELS[po.status]}
                </NeoBadge>
                {isIgst ? (
                  <NeoBadge variant="info" size="md">
                    🌐 IGST (Inter-State)
                  </NeoBadge>
                ) : (
                  <NeoBadge variant="success" size="md">
                    🏠 CGST + SGST (Intra-State)
                  </NeoBadge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                {po.subject || "Purchase Order"}
              </h1>

              {po.body_description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {po.body_description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3">
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {po.department_school}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(po.po_date)}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">
                Grand Total
              </p>
              <p className="text-3xl font-bold text-green-600">
                {formatCurrency(po.grand_total)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {po.item_count || items.length} items
              </p>
            </div>
          </div>
        </NeoCard>

        {/* Vendor + Project */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendor */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-green-600">
                <Building2 className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Vendor</h2>
                <p className="text-xs text-slate-500">
                  {po.vendor_code}
                </p>
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
              <p className="font-bold text-slate-800 text-base">
                {po.vendor_detail?.vendor_name || po.vendor_name}
              </p>

              {po.vendor_detail && (
                <>
                  <p className="text-sm text-slate-600 flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {po.vendor_detail.address_line1}
                      {po.vendor_detail.address_line2 && (
                        <>
                          <br />
                          {po.vendor_detail.address_line2}
                        </>
                      )}
                      <br />
                      {po.vendor_detail.city}, {po.vendor_detail.state} —{" "}
                      {po.vendor_detail.pincode}
                    </span>
                  </p>

                  {po.vendor_detail.gst_number && (
                    <p className="text-xs text-slate-600">
                      <strong>GST:</strong> {po.vendor_detail.gst_number}
                    </p>
                  )}
                  {po.vendor_detail.pan_number && (
                    <p className="text-xs text-slate-600">
                      <strong>PAN:</strong> {po.vendor_detail.pan_number}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {po.vendor_detail.phone}
                  </p>
                  {po.vendor_detail.email && (
                    <p className="text-xs text-slate-600 flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {po.vendor_detail.email}
                    </p>
                  )}
                </>
              )}
            </div>
          </NeoCard>

          {/* Project */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-blue-600">
                <FolderKanban className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Project</h2>
                <p className="text-xs text-slate-500">
                  Project details
                </p>
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
              {po.project_detail ? (
                <>
                  <p className="text-xs font-bold text-slate-500">
                    {po.project_detail.project_code}
                  </p>
                  <p className="font-bold text-slate-800 text-base">
                    {po.project_detail.project_name}
                  </p>
                  {po.project_detail.pi_name && (
                    <p className="text-sm text-slate-600">
                      <strong>PI:</strong> {po.project_detail.pi_name}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">No project linked</p>
              )}

              {po.major_budget_head && (
                <div className="pt-3 border-t border-slate-300/40">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Major Budget Head
                  </p>
                  <p className="text-sm text-slate-700">
                    {po.major_budget_head}
                  </p>
                </div>
              )}

              {po.minor_budget_head && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Minor Budget Head
                  </p>
                  <p className="text-sm text-slate-700">
                    {po.minor_budget_head}
                  </p>
                </div>
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
                Items / Services ({items.length})
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
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">
                      Sl. No.
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">
                      Item / Service
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-right">
                      Qty
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">
                      Unit
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-right">
                      Rate (₹)
                    </th>
                    {isIgst ? (
                      <th className="p-3 text-xs font-bold text-slate-600 uppercase text-right">
                        IGST (₹)
                      </th>
                    ) : (
                      <>
                        <th className="p-3 text-xs font-bold text-slate-600 uppercase text-right">
                          CGST (₹)
                        </th>
                        <th className="p-3 text-xs font-bold text-slate-600 uppercase text-right">
                          SGST (₹)
                        </th>
                      </>
                    )}
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-right">
                      Amount (₹)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => {
                    const qty = parseFloat(String(item.quantity)) || 0;
                    const rate = parseFloat(String(item.rate)) || 0;
                    const base = qty * rate;
                    const gstRate = parseFloat(String(item.gst_rate)) || 0;

                    let cgst = 0,
                      sgst = 0,
                      igst = 0;
                    if (isIgst) {
                      igst = (base * gstRate) / 100;
                    } else {
                      cgst = (base * (gstRate / 2)) / 100;
                      sgst = (base * (gstRate / 2)) / 100;
                    }
                    const lineTotal = base + cgst + sgst + igst;

                    return (
                      <tr
                        key={item.id || idx}
                        className="border-t border-slate-300/40"
                      >
                        <td className="p-3 font-bold text-slate-600">
                          {idx + 1}
                        </td>
                        <td className="p-3 text-slate-800">
                          {item.item_name}
                        </td>
                        <td className="p-3 text-right text-slate-700">
                          {qty}
                        </td>
                        <td className="p-3 text-slate-600">
                          {item.unit || "—"}
                        </td>
                        <td className="p-3 text-right text-slate-700">
                          {rate.toLocaleString("en-IN")}
                        </td>
                        {isIgst ? (
                          <td className="p-3 text-right text-slate-700">
                            {igst.toLocaleString("en-IN", {
                              maximumFractionDigits: 2,
                            })}
                          </td>
                        ) : (
                          <>
                            <td className="p-3 text-right text-slate-700">
                              {cgst.toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="p-3 text-right text-slate-700">
                              {sgst.toLocaleString("en-IN", {
                                maximumFractionDigits: 2,
                              })}
                            </td>
                          </>
                        )}
                        <td className="p-3 text-right font-bold text-slate-900">
                          {lineTotal.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500 py-6">
              No items added.
            </p>
          )}
        </NeoCard>

        {/* Financial Summary */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-green-600">
              <Calculator className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Financial Summary
              </h2>
              <p className="text-xs text-slate-500">
                Auto-calculated totals
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div
              className="p-4 rounded-2xl flex items-center justify-between"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <span className="text-sm font-bold text-slate-600 uppercase">
                Subtotal (Base)
              </span>
              <span className="text-lg font-bold text-slate-800">
                {formatCurrency(po.subtotal)}
              </span>
            </div>

            {isIgst ? (
              <div
                className="p-4 rounded-2xl flex items-center justify-between"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <span className="text-sm font-bold text-slate-600 uppercase">
                  IGST
                </span>
                <span className="text-lg font-bold text-slate-800">
                  {formatCurrency(po.igst_amount)}
                </span>
              </div>
            ) : (
              <>
                <div
                  className="p-4 rounded-2xl flex items-center justify-between"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <span className="text-sm font-bold text-slate-600 uppercase">
                    CGST
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {formatCurrency(po.cgst_amount)}
                  </span>
                </div>
                <div
                  className="p-4 rounded-2xl flex items-center justify-between"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <span className="text-sm font-bold text-slate-600 uppercase">
                    SGST
                  </span>
                  <span className="text-lg font-bold text-slate-800">
                    {formatCurrency(po.sgst_amount)}
                  </span>
                </div>
              </>
            )}

            <div
              className="p-5 rounded-2xl flex items-center justify-between"
              style={{
                background:
                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow:
                  "6px 6px 14px #b8bcc2, -6px -6px 14px #ffffff, inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <span className="text-base font-bold text-white uppercase">
                Grand Total
              </span>
              <span className="text-2xl font-bold text-white">
                {formatCurrency(po.grand_total)}
              </span>
            </div>

            {po.in_words && (
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
                <p className="text-sm font-bold text-slate-800 italic">
                  {po.in_words}
                </p>
              </div>
            )}
          </div>
        </NeoCard>

        {/* Terms & Conditions */}
        {po.terms_conditions && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-purple-600">
                <FileText className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Terms & Conditions
                </h2>
                <p className="text-xs text-slate-500">
                  {po.tc_template_display}
                </p>
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
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {po.terms_conditions}
              </p>
            </div>
          </NeoCard>
        )}

        {/* Extra Info */}
        {(po.reference_no || po.remarks) && (
          <NeoCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {po.reference_no && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Reference No.
                  </p>
                  <p className="text-sm text-slate-800">{po.reference_no}</p>
                </div>
              )}
              {po.remarks && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Remarks
                  </p>
                  <p className="text-sm text-slate-800">{po.remarks}</p>
                </div>
              )}
            </div>
          </NeoCard>
        )}

        {/* Audit */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Created:{" "}
              <strong className="text-slate-700">
                {formatDate(po.created_at)}
              </strong>
            </span>
            <span>
              Last Updated:{" "}
              <strong className="text-slate-700">
                {formatDate(po.updated_at)}
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
              Delete Purchase Order?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              Ye PO delete ho jayega:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {po.po_number}
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