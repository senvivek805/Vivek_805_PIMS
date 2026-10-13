"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  NeoCard,
  NeoButton,
  NeoIconBox,
  NeoInput,
  NeoBadge,
} from "@/components/neumorphism";
import {
  ShoppingCart,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2,
  Building2,
  FolderKanban,
  Package,
  FileText,
  Calculator,
  Loader2,
} from "lucide-react";
import {
  getPurchaseOrder,
  updatePurchaseOrder,
  GST_RATE_OPTIONS,
  TC_TEMPLATE_OPTIONS,
  formatCurrency,
  type PurchaseOrderCreateUpdate,
  type POStatus,
  type TCTemplate,
} from "@/lib/api/purchase";
import { getVendors, type Vendor } from "@/lib/api/vendors";
import { getProjects, type Project } from "@/lib/api/projects";

// ============================================
// ITEM ROW TYPE
// ============================================

interface ItemRow {
  id: string;
  item_name: string;
  quantity: string;
  unit: string;
  rate: string;
  gst_rate: number;
  order: number;
}

function generateRowId() {
  return `item-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

type GSTTypeOverride = "auto" | "cgst_sgst" | "igst";

export default function EditPurchaseOrderPage() {
  const router = useRouter();
  const params = useParams();
  const poId = Number(params.id);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Order Info
  const [poNumber, setPoNumber] = useState("");
  const [poDate, setPoDate] = useState("");
  const [departmentSchool, setDepartmentSchool] = useState("");
  const [status, setStatus] = useState<POStatus>("draft");

  // Relations
  const [vendorId, setVendorId] = useState<number | "">("");
  const [projectId, setProjectId] = useState<number | "">("");
  const [gstTypeOverride, setGstTypeOverride] =
    useState<GSTTypeOverride>("auto");

  // Budget Heads
  const [approximateCost, setApproximateCost] = useState("");
  const [majorBudgetHead, setMajorBudgetHead] = useState("");
  const [minorBudgetHead, setMinorBudgetHead] = useState("");
  const [budgetGrant, setBudgetGrant] = useState("");
  const [amountSpent, setAmountSpent] = useState("");
  const [balanceAvailable, setBalanceAvailable] = useState("");

  // Subject
  const [subject, setSubject] = useState("");
  const [bodyDescription, setBodyDescription] = useState("");

  // T&C
  const [tcTemplate, setTcTemplate] = useState<TCTemplate>("material");
  const [termsConditions, setTermsConditions] = useState("");

  // Extra
  const [referenceNo, setReferenceNo] = useState("");
  const [remarks, setRemarks] = useState("");

  // Items
  const [items, setItems] = useState<ItemRow[]>([]);

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!poId || isNaN(poId)) {
        setError("Invalid PO ID");
        setLoadingData(false);
        return;
      }
      try {
        const [po, vendorsData, projectsData] = await Promise.all([
          getPurchaseOrder(poId),
          getVendors(),
          getProjects(),
        ]);

        // Fill form
        setPoNumber(po.po_number);
        setPoDate(po.po_date);
        setDepartmentSchool(po.department_school);
        setStatus(po.status);
        setVendorId(po.vendor);
        setProjectId(po.project || "");
        setApproximateCost(String(po.approximate_cost || ""));
        setMajorBudgetHead(po.major_budget_head || "");
        setMinorBudgetHead(po.minor_budget_head || "");
        setBudgetGrant(po.budget_grant || "");
        setAmountSpent(po.amount_spent || "");
        setBalanceAvailable(po.balance_available || "");
        setSubject(po.subject || "");
        setBodyDescription(po.body_description || "");
        setTcTemplate(po.tc_template);
        setTermsConditions(po.terms_conditions || "");
        setReferenceNo(po.reference_no || "");
        setRemarks(po.remarks || "");

        // GST type override
        // If auto-detect matches saved, set "auto", else manual
        const savedGstType = po.gst_type;
        setGstTypeOverride("auto"); // Default auto; user can change

        // Items
        if (po.items && po.items.length > 0) {
          setItems(
            po.items.map((item, idx) => ({
              id: `existing-${item.id || idx}`,
              item_name: item.item_name,
              quantity: String(item.quantity),
              unit: item.unit || "",
              rate: String(item.rate),
              gst_rate: parseFloat(String(item.gst_rate)) || 0,
              order: item.order || idx + 1,
            }))
          );
        } else {
          setItems([
            {
              id: generateRowId(),
              item_name: "",
              quantity: "1",
              unit: "Job",
              rate: "",
              gst_rate: 18,
              order: 1,
            },
          ]);
        }

        setVendors(vendorsData.results);
        setProjects(projectsData.results);
      } catch (err: any) {
        setError(err.message || "Failed to load PO");
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [poId]);

  // ============================================
  // T&C TEMPLATE AUTO-FILL
  // ============================================

  // Note: On edit, we do NOT auto-fill T&C (to preserve user's edits)

  // ============================================
  // SELECTED VENDOR
  // ============================================

  const selectedVendor = useMemo(() => {
    if (!vendorId) return null;
    return vendors.find((v) => v.id === Number(vendorId));
  }, [vendorId, vendors]);

  const autoDetectedGstType: "cgst_sgst" | "igst" = useMemo(() => {
    if (!selectedVendor) return "cgst_sgst";
    const vendorState = (selectedVendor.state || "").trim().toLowerCase();
    const iitState = "uttar pradesh";
    return vendorState === iitState ? "cgst_sgst" : "igst";
  }, [selectedVendor]);

  const gstType: "cgst_sgst" | "igst" =
    gstTypeOverride === "auto" ? autoDetectedGstType : gstTypeOverride;

  // ============================================
  // ITEM HANDLERS
  // ============================================

  function addItemRow() {
    setItems([
      ...items,
      {
        id: generateRowId(),
        item_name: "",
        quantity: "1",
        unit: "Job",
        rate: "",
        gst_rate: 18,
        order: items.length + 1,
      },
    ]);
  }

  function removeItemRow(id: string) {
    if (items.length === 1) {
      alert("Kam se kam ek item zaroori hai.");
      return;
    }
    const updated = items
      .filter((it) => it.id !== id)
      .map((it, idx) => ({ ...it, order: idx + 1 }));
    setItems(updated);
  }

  function updateItem(id: string, field: keyof ItemRow, value: any) {
    setItems(items.map((it) => (it.id === id ? { ...it, [field]: value } : it)));
  }

  // ============================================
  // LIVE CALCULATION
  // ============================================

  const totals = useMemo(() => {
    let subtotal = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    const itemTotals = items.map((item) => {
      const qty = parseFloat(item.quantity) || 0;
      const rate = parseFloat(item.rate) || 0;
      const base = qty * rate;
      const gstRate = item.gst_rate || 0;

      let lineCgst = 0,
        lineSgst = 0,
        lineIgst = 0;

      if (gstType === "cgst_sgst") {
        lineCgst = (base * (gstRate / 2)) / 100;
        lineSgst = (base * (gstRate / 2)) / 100;
      } else {
        lineIgst = (base * gstRate) / 100;
      }

      subtotal += base;
      cgst += lineCgst;
      sgst += lineSgst;
      igst += lineIgst;

      return {
        base,
        cgst: lineCgst,
        sgst: lineSgst,
        igst: lineIgst,
        gst: lineCgst + lineSgst + lineIgst,
        total: base + lineCgst + lineSgst + lineIgst,
      };
    });

    const gstTotal = cgst + sgst + igst;
    const grandTotal = subtotal + gstTotal;

    return { subtotal, cgst, sgst, igst, gstTotal, grandTotal, itemTotals };
  }, [items, gstType]);

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!poNumber.trim()) {
      setError("PO Number zaroori hai.");
      return;
    }
    if (!poDate) {
      setError("PO Date zaroori hai.");
      return;
    }
    if (!departmentSchool.trim()) {
      setError("Department/School zaroori hai.");
      return;
    }
    if (!vendorId) {
      setError("Vendor select karo.");
      return;
    }

    const validItems = items.filter(
      (it) => it.item_name.trim() && parseFloat(it.rate) > 0
    );
    if (validItems.length === 0) {
      setError("Kam se kam ek valid item add karo.");
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<PurchaseOrderCreateUpdate> = {
        po_number: poNumber.trim(),
        po_date: poDate,
        department_school: departmentSchool.trim(),
        vendor: Number(vendorId),
        project: projectId ? Number(projectId) : null,
        approximate_cost: approximateCost
          ? parseFloat(approximateCost)
          : totals.grandTotal,
        major_budget_head: majorBudgetHead || undefined,
        minor_budget_head: minorBudgetHead || undefined,
        budget_grant: budgetGrant || undefined,
        amount_spent: amountSpent || undefined,
        balance_available: balanceAvailable || undefined,
        subject: subject || undefined,
        body_description: bodyDescription || undefined,
        tc_template: tcTemplate,
        terms_conditions: termsConditions || undefined,
        reference_no: referenceNo || undefined,
        remarks: remarks || undefined,
        status: status,
        items: validItems.map((it, idx) => ({
          item_name: it.item_name.trim(),
          quantity: String(parseFloat(it.quantity) || 1),
          unit: it.unit || "",
          rate: String(parseFloat(it.rate) || 0),
          gst_rate: String(it.gst_rate || 0),
          order: idx + 1,
        })),
      };

      await updatePurchaseOrder(poId, payload);
      setSuccess("Purchase Order successfully update ho gaya! 🎉");

      setTimeout(() => {
        router.push(`/purchase/${poId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update PO");
      setLoading(false);
    }
  }

  // ============================================
  // LOADING
  // ============================================

  if (loadingData) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading PO...</p>
        </div>
      </AppLayout>
    );
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
            <NeoIconBox size="lg" color="text-orange-600">
              <ShoppingCart className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Edit Purchase Order
              </h1>
              <p className="text-sm text-slate-500">
                Update PO details and items
              </p>
            </div>
          </div>
          <Link href={`/purchase/${poId}`}>
            <NeoButton
              variant="secondary"
              size="md"
              icon={<X className="h-4 w-4" />}
            >
              Cancel
            </NeoButton>
          </Link>
        </div>

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

        {/* SECTION 1: ORDER INFO */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Order Information
              </h2>
              <p className="text-xs text-slate-500">Basic PO details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="po_number"
              label="Order No. *"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              required
            />
            <NeoInput
              id="po_date"
              label="Date *"
              type="date"
              value={poDate}
              onChange={(e) => setPoDate(e.target.value)}
              required
            />
            <NeoInput
              id="department_school"
              label="Department/School *"
              value={departmentSchool}
              onChange={(e) => setDepartmentSchool(e.target.value)}
              required
            />
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as POStatus)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="draft">📝 Draft</option>
                <option value="approved">✅ Approved</option>
                <option value="completed">🎯 Completed</option>
                <option value="cancelled">❌ Cancelled</option>
              </select>
            </div>
          </div>
        </NeoCard>

        {/* SECTION 2: VENDOR & PROJECT */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-green-600">
              <Building2 className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Vendor & Project
              </h2>
              <p className="text-xs text-slate-500">GST type selection</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Vendor *
              </label>
              <select
                value={vendorId}
                onChange={(e) =>
                  setVendorId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_code} — {v.vendor_name} ({v.city}, {v.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) =>
                  setProjectId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_code} — {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-700 font-medium text-xs pl-2">
                GST Type *
              </label>
              <select
                value={gstTypeOverride}
                onChange={(e) =>
                  setGstTypeOverride(e.target.value as GSTTypeOverride)
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="auto">🔄 Auto-detect (from vendor state)</option>
                <option value="cgst_sgst">
                  🏠 CGST + SGST (Intra-State)
                </option>
                <option value="igst">🌐 IGST (Inter-State)</option>
              </select>
            </div>

            {selectedVendor && (
              <div className="md:col-span-2">
                <div
                  className={`p-4 rounded-xl flex items-start gap-3 ${
                    gstType === "igst" ? "bg-purple-50" : "bg-green-50"
                  }`}
                  style={{
                    borderLeft: `4px solid ${
                      gstType === "igst" ? "#8b5cf6" : "#10b981"
                    }`,
                  }}
                >
                  <AlertCircle
                    className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      gstType === "igst" ? "text-purple-600" : "text-green-600"
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        gstType === "igst"
                          ? "text-purple-800"
                          : "text-green-800"
                      }`}
                    >
                      {gstType === "igst"
                        ? "🌐 IGST (Inter-State) Applied"
                        : "🏠 CGST + SGST (Intra-State) Applied"}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        gstType === "igst"
                          ? "text-purple-700"
                          : "text-green-700"
                      }`}
                    >
                      Vendor: <strong>{selectedVendor.state}</strong> • IIT(BHU):{" "}
                      <strong>Uttar Pradesh</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </NeoCard>

        {/* SECTION 3: BUDGET HEADS */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-purple-600">
              <FolderKanban className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Budget Heads (Header)
              </h2>
              <p className="text-xs text-slate-500">Optional info</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="major_budget_head"
              label="Major Budget Head"
              value={majorBudgetHead}
              onChange={(e) => setMajorBudgetHead(e.target.value)}
            />
            <NeoInput
              id="minor_budget_head"
              label="Minor Budget Head"
              value={minorBudgetHead}
              onChange={(e) => setMinorBudgetHead(e.target.value)}
            />
            <NeoInput
              id="approximate_cost"
              label="Approximate Cost (₹)"
              type="number"
              value={approximateCost}
              onChange={(e) => setApproximateCost(e.target.value)}
            />
            <NeoInput
              id="budget_grant"
              label="Budget Grant Rs."
              value={budgetGrant}
              onChange={(e) => setBudgetGrant(e.target.value)}
            />
            <NeoInput
              id="amount_spent"
              label="Amount spent including commitments"
              value={amountSpent}
              onChange={(e) => setAmountSpent(e.target.value)}
            />
            <NeoInput
              id="balance_available"
              label="Balance available Rs."
              value={balanceAvailable}
              onChange={(e) => setBalanceAvailable(e.target.value)}
            />
          </div>
        </NeoCard>

        {/* SECTION 4: SUBJECT */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-cyan-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Subject & Description
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            <NeoInput
              id="subject"
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <NeoInput
              id="body_description"
              label="Description"
              value={bodyDescription}
              onChange={(e) => setBodyDescription(e.target.value)}
            />
          </div>
        </NeoCard>

        {/* SECTION 5: ITEMS */}
        <NeoCard>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <NeoIconBox size="md" color="text-orange-600">
                <Package className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Items / Services
                </h2>
                <p className="text-xs text-slate-500">
                  Multiple items with GST per item
                </p>
              </div>
            </div>
            <NeoButton
              type="button"
              variant="success"
              size="sm"
              onClick={addItemRow}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Item
            </NeoButton>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => {
              const t = totals.itemTotals[index];
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <NeoBadge variant="primary" size="sm">
                      Item #{index + 1}
                    </NeoBadge>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItemRow(item.id)}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-red-600 transition-all hover:scale-110"
                        style={{
                          background: "#e0e5ec",
                          boxShadow:
                            "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="mb-3">
                    <NeoInput
                      id={`item_name_${item.id}`}
                      label="Item / Service Description *"
                      value={item.item_name}
                      onChange={(e) =>
                        updateItem(item.id, "item_name", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <NeoInput
                      id={`qty_${item.id}`}
                      label="Qty *"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(item.id, "quantity", e.target.value)
                      }
                    />
                    <NeoInput
                      id={`unit_${item.id}`}
                      label="Unit"
                      value={item.unit}
                      onChange={(e) =>
                        updateItem(item.id, "unit", e.target.value)
                      }
                    />
                    <NeoInput
                      id={`rate_${item.id}`}
                      label="Rate (₹) *"
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(item.id, "rate", e.target.value)
                      }
                    />
                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-medium text-xs pl-2">
                        GST %
                      </label>
                      <select
                        value={item.gst_rate}
                        onChange={(e) =>
                          updateItem(
                            item.id,
                            "gst_rate",
                            Number(e.target.value)
                          )
                        }
                        className="w-full h-11 px-3 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                        style={{
                          boxShadow:
                            "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                        }}
                      >
                        {GST_RATE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-300/50 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Base</p>
                      <p className="font-bold text-slate-700">
                        {formatCurrency(t.base)}
                      </p>
                    </div>
                    {gstType === "cgst_sgst" ? (
                      <>
                        <div>
                          <p className="text-slate-500">CGST</p>
                          <p className="font-bold text-slate-700">
                            {formatCurrency(t.cgst)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">SGST</p>
                          <p className="font-bold text-slate-700">
                            {formatCurrency(t.sgst)}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="col-span-2">
                        <p className="text-slate-500">IGST</p>
                        <p className="font-bold text-slate-700">
                          {formatCurrency(t.igst)}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-slate-500">Line Total</p>
                      <p className="font-bold text-green-600">
                        {formatCurrency(t.total)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </NeoCard>

        {/* SECTION 6: FINANCIAL SUMMARY */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-green-600">
              <Calculator className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Financial Summary
              </h2>
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
                Subtotal
              </span>
              <span className="text-lg font-bold text-slate-800">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>

            {gstType === "cgst_sgst" ? (
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
                    {formatCurrency(totals.cgst)}
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
                    {formatCurrency(totals.sgst)}
                  </span>
                </div>
              </>
            ) : (
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
                  {formatCurrency(totals.igst)}
                </span>
              </div>
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
                {formatCurrency(totals.grandTotal)}
              </span>
            </div>
          </div>
        </NeoCard>

        {/* SECTION 7: T&C */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-purple-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Terms & Conditions
              </h2>
            </div>
          </div>

          <div className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Template
              </label>
              <select
                value={tcTemplate}
                onChange={(e) => {
                  const newTemplate = e.target.value as TCTemplate;
                  setTcTemplate(newTemplate);

                  // Only auto-fill if user confirms
                  if (
                    confirm(
                      "Template change karne par current T&C overwrite ho jayega. Continue?"
                    )
                  ) {
                    if (newTemplate === "material") {
                      setTermsConditions(
                        `1. Price: The quoted prices are on FOR Destination Basis.\n2. Material shall be supplied as per specifications.\n3. Delivery Period: 30 days from the date of issuance of the Work Order.\n4. Payment: 100% payment after satisfactory delivery and acceptance.\n5. Warranty: 1 year from date of delivery.\n6. All disputes subject to Varanasi jurisdiction.`
                      );
                    } else if (newTemplate === "service") {
                      setTermsConditions(
                        `1. Price: The quoted prices are on FOR Destination Basis.\n2. The work shall be carried out strictly in accordance with the technical requirements specified by authorized person.\n3. The submitted document shall be subject to review and acceptance by authorized person.\n4. Necessary corrections and reasonable revisions shall be carried out by the vendor without additional cost.\n5. 100% payment shall be released only after satisfactory submission and acceptance of the final deliverable.\n6. Delivery Period: 30 days from the date of issuance of the Work Order.`
                      );
                    }
                  }
                }}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {TC_TEMPLATE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Terms & Conditions (Editable)
              </label>
              <textarea
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none resize-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              />
            </div>
          </div>
        </NeoCard>

        {/* Extra */}
        <NeoCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="reference_no"
              label="Reference No."
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />
            <NeoInput
              id="remarks"
              label="Remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </NeoCard>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href={`/purchase/${poId}`}>
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
            icon={<Save className="h-4 w-4" />}
          >
            {loading ? "Updating..." : "Update Purchase Order"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}