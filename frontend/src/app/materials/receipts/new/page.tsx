"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  NeoCard,
  NeoButton,
  NeoIconBox,
  NeoInput,
  NeoBadge,
} from "@/components/neumorphism";
import {
  PackageCheck,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  Calendar,
  Package,
  FileText,
} from "lucide-react";
import {
  createMaterialReceipt,
  getPOItemsForReceipt,
  type MaterialReceiptCreateUpdate,
  type ReceiptStatus,
  type POItemsResponse,
} from "@/lib/api/materials";
import { getPurchaseOrders, type PurchaseOrder } from "@/lib/api/purchase";

// ============================================
// ITEM ROW (Detailed)
// ============================================

interface ReceiptItemRow {
  po_item: number;
  item_name: string;
  ordered_quantity: number;
  already_received: number;
  receipt_numbers: string[];
  pending_quantity: number;
  today_received: string;
  material: number | null;
  material_name: string;
  material_code: string;
  unit: string;
}

export default function NewMaterialReceiptPage() {
  const router = useRouter();

  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingPO, setLoadingPO] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // PO Selection
  const [selectedPO, setSelectedPO] = useState<number | "">("");
  const [poInfo, setPOInfo] = useState<POItemsResponse | null>(null);

  // Receipt Info
  const [receiptDate, setReceiptDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [status, setStatus] = useState<ReceiptStatus>("draft");
  const [remarks, setRemarks] = useState("");

  // Items
  const [items, setItems] = useState<ReceiptItemRow[]>([]);

  // ============================================
  // LOAD POs
  // ============================================

  useEffect(() => {
    async function loadData() {
      try {
        const poData = await getPurchaseOrders();
        setPurchaseOrders(
          poData.results.filter((po) => po.status !== "cancelled")
        );
      } catch (err: any) {
        setError("Failed to load data: " + err.message);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // ============================================
  // PO CHANGE HANDLER
  // ============================================

  async function handlePOChange(poId: string) {
    setError("");
    setSelectedPO(poId ? Number(poId) : "");

    if (!poId) {
      setPOInfo(null);
      setItems([]);
      return;
    }

    setLoadingPO(true);
    try {
      const data = await getPOItemsForReceipt(Number(poId));
      setPOInfo(data);

      // Only show items with pending > 0
      const pendingItems = data.items.filter(
        (item) => (item.pending_quantity || 0) > 0
      );

      if (pendingItems.length === 0) {
        setItems([]);
        setError(
          "All items in this PO are already fully received. No pending items remaining. ✅"
        );
        return;
      }

      // Build detailed rows — material comes auto from PO
      setItems(
        pendingItems.map((item) => ({
          po_item: item.id,
          item_name: item.item_name,
          ordered_quantity: item.ordered_quantity,
          already_received: item.received_quantity || 0,
          receipt_numbers: item.receipt_numbers || [],
          pending_quantity: item.pending_quantity || 0,
          today_received: "0",
          material: item.material ?? null,
          material_name: item.material_name || "—",
          material_code: item.material_code || "—",
          unit: item.unit || "",
        }))
      );
    } catch (err: any) {
      setError("Failed to load PO items: " + err.message);
      setItems([]);
    } finally {
      setLoadingPO(false);
    }
  }

  // ============================================
  // ITEM HANDLER
  // ============================================

  function updateTodayReceived(index: number, value: string) {
    const updated = [...items];
    updated[index].today_received = value;
    setItems(updated);
  }

  // ============================================
  // LIVE TOTAL
  // ============================================

  const totalPending = items.reduce(
    (sum, item) => sum + item.pending_quantity,
    0
  );

  const totalToday = items.reduce(
    (sum, item) => sum + (parseFloat(item.today_received) || 0),
    0
  );

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!selectedPO) {
      setError("Select Purchase Order.");
      return;
    }
    if (!receiptDate) {
      setError("Receipt Date is required.");
      return;
    }
    if (items.length === 0) {
      setError("At least one item is required.");
      return;
    }

    // Validation: today <= pending
    for (const item of items) {
      const today = parseFloat(item.today_received) || 0;
      if (today < 0) {
        setError(`"${item.item_name}" — quantity cannot be negative.`);
        return;
      }
      if (today > item.pending_quantity) {
        setError(
          `"${item.item_name}" — receiving quantity cannot exceed pending quantity (${item.pending_quantity}).`
        );
        return;
      }
    }

    // Only send items with today_received > 0
    const validItems = items.filter(
      (item) => (parseFloat(item.today_received) || 0) > 0
    );

    if (validItems.length === 0) {
      setError("Enter receiving quantity for at least one item (greater than 0).");
      return;
    }

    // Validate material linked for each item
    for (const item of validItems) {
      if (!item.material) {
        setError(
          `No Material linked for "${item.item_name}". Please link material in the PO first.`
        );
        return;
      }
    }

    if (!poInfo) {
      setError("PO info missing.");
      return;
    }

    setLoading(true);
    try {
      const payload: MaterialReceiptCreateUpdate = {
        receipt_date: receiptDate,
        purchase_order: Number(selectedPO),
        vendor: poInfo.po.vendor,
        project: poInfo.po.project || null,
        status: status,
        remarks: remarks,
        items: validItems.map((item) => ({
          item_name: item.item_name,
          ordered_quantity: item.ordered_quantity,
          received_quantity: parseFloat(item.today_received) || 0,
          material: item.material,
          unit: item.unit,
          po_item: item.po_item,
        })),
      };

      const created = await createMaterialReceipt(payload);
      setSuccess("Material Receipt created successfully! 🎉");

      setTimeout(() => {
        router.push(`/materials/receipts/${created.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create receipt");
      setLoading(false);
    }
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-green-600">
              <PackageCheck className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                New Material Receipt
              </h1>
              <p className="text-sm text-slate-500">
                Record material received against a Purchase Order
              </p>
            </div>
          </div>
          <Link href="/materials/receipts">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<X className="h-4 w-4" />}
            >
              Cancel
            </NeoButton>
          </Link>
        </div>

        {/* Error */}
        {error && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {/* Success */}
        {success && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          </NeoCard>
        )}

        {/* ============================================
            SECTION 1: PO SELECTION
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <ShoppingCart className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Purchase Order
              </h2>
              <p className="text-xs text-slate-500">
                Which PO's material are you receiving
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Select Purchase Order *
              </label>
              <select
                value={selectedPO}
                onChange={(e) => handlePOChange(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
                disabled={loadingData || loadingPO}
              >
                <option value="">Select Purchase Order</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_number} — {po.vendor_name} — ₹{po.grand_total}
                  </option>
                ))}
              </select>
            </div>

            {poInfo && (
              <div
                className="p-4 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-3"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    PO Number
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {poInfo.po.po_number}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    PO Date
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(poInfo.po.po_date).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Vendor
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {poInfo.po.vendor_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    PO Total
                  </p>
                  <p className="text-sm font-bold text-green-600">
                    ₹{poInfo.po.grand_total.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </NeoCard>

        {/* ============================================
            SECTION 2: RECEIPT INFO
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-purple-600">
              <Calendar className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Receipt Information
              </h2>
              <p className="text-xs text-slate-500">
                Receipt date and status
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="receipt_date"
              label="Receipt Date *"
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
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
                <option value="draft">📝 Draft</option>
                <option value="partial">🔄 Partial Received</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>
          </div>
        </NeoCard>

        {/* ============================================
            SECTION 3: ITEMS — DETAILED TABLE
            ============================================ */}
        {items.length > 0 && (
          <NeoCard>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <NeoIconBox size="md" color="text-orange-600">
                  <Package className="h-5 w-5" />
                </NeoIconBox>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    Pending Items ({items.length})
                  </h2>
                  <p className="text-xs text-slate-500">
                    Material is auto-linked from PO. Just enter received quantity.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <NeoBadge variant="warning" size="sm">
                  Pending: {totalPending}
                </NeoBadge>
                <NeoBadge variant="success" size="sm">
                  Receiving Now: {totalToday}
                </NeoBadge>
              </div>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      #
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">
                      Item
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">
                      Material Master
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Ordered
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Already
                      <br />
                      Received
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Pending
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Receiving
                      <br />
                      Now
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const today = parseFloat(item.today_received) || 0;
                    const nayaPending = item.pending_quantity - today;
                    const isOver = today > item.pending_quantity;
                    const isComplete = nayaPending === 0 && today > 0;
                    const isPartial = nayaPending > 0 && today > 0;

                    return (
                      <tr
                        key={item.po_item}
                        className="border-t border-slate-300/40"
                      >
                        <td className="p-3 text-center font-bold text-slate-600">
                          {index + 1}
                        </td>
                        <td className="p-3 text-slate-800">
                          <p className="font-medium">{item.item_name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {item.unit || "—"}
                          </p>
                        </td>
                        <td className="p-3">
                          <div
                            className="p-2 rounded-lg bg-[#e0e5ec]"
                            style={{
                              boxShadow:
                                "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                            }}
                          >
                            {item.material ? (
                              <>
                                <p className="text-xs font-bold text-slate-700">
                                  {item.material_name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {item.material_code}
                                </p>
                              </>
                            ) : (
                              <p className="text-xs text-red-600 font-bold">
                                ⚠️ Not linked
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-center text-slate-700 font-medium">
                          {item.ordered_quantity}
                        </td>
                        <td className="p-3 text-center text-slate-600">
                          <p className="font-bold">{item.already_received}</p>
                          {item.receipt_numbers.length > 0 && (
                            <p className="text-[10px] text-slate-500 mt-0.5">
                              {item.receipt_numbers.join(", ")}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-center font-bold text-orange-600">
                          {item.pending_quantity}
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            step="any"
                            min="0"
                            max={item.pending_quantity}
                            value={item.today_received}
                            onChange={(e) =>
                              updateTodayReceived(index, e.target.value)
                            }
                            className={`w-24 h-10 px-3 mx-auto block rounded-lg bg-[#e0e5ec] text-sm text-center font-bold border-0 outline-none ${
                              isOver ? "text-red-600" : "text-green-700"
                            }`}
                            style={{
                              boxShadow:
                                "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                            }}
                          />
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${
                              isOver
                                ? "text-red-600"
                                : isComplete
                                ? "text-green-600"
                                : isPartial
                                ? "text-blue-600"
                                : "text-slate-500"
                            }`}
                          >
                            {nayaPending}
                          </span>
                          {isOver && (
                            <p className="text-[10px] text-red-500 mt-0.5">
                              ⚠️ Excess
                            </p>
                          )}
                          {isComplete && (
                            <p className="text-[10px] text-green-600 mt-0.5">
                              ✅ Complete
                            </p>
                          )}
                          {isPartial && (
                            <p className="text-[10px] text-blue-600 mt-0.5">
                              🔄 Partial
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-slate-300/40 flex flex-wrap gap-4 text-[10px] text-slate-500">
              <span>✅ Complete — Full pending quantity received</span>
              <span>🔄 Partial — Some received, balance still pending</span>
              <span>⚠️ Excess — More than pending quantity entered</span>
            </div>
          </NeoCard>
        )}

        {/* ============================================
            SECTION 4: REMARKS
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-cyan-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Remarks</h2>
              <p className="text-xs text-slate-500">Optional notes</p>
            </div>
          </div>

          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            placeholder="Any additional notes..."
            className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none resize-none"
            style={{
              boxShadow:
                "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
            }}
          />
        </NeoCard>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href="/materials/receipts">
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
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            disabled={!selectedPO || items.length === 0 || totalToday === 0}
            icon={<Save className="h-4 w-4" />}
          >
            {loading ? "Saving..." : "Save Receipt"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}