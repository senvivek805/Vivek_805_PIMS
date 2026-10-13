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
  Undo2,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  X,
  User,
  FolderKanban,
  Package,
  FileText,
  RefreshCw,
  Trash2,
  Plus,
} from "lucide-react";
import {
  getMaterialReturn,
  updateMaterialReturn,
  getMaterials,
  CONDITION_LABELS,
  CONDITION_EMOJIS,
  RETURN_STATUS_LABELS,
  RETURN_STATUS_EMOJIS,
  RETURN_STATUS_VARIANTS,
  type MaterialReturnNote,
  type ReturnStatus,
  type ReturnCondition,
  type Material,
} from "@/lib/api/materials";
import { getEmployees, type Employee } from "@/lib/api/employees";
import { getProjects, type Project } from "@/lib/api/projects";

// ============================================
// EDIT ITEM ROW
// ============================================

interface EditItemRow {
  material: number;
  material_name: string;
  material_code: string;
  quantity: string;
  unit: string;
  condition: ReturnCondition;
}

const STATUS_OPTIONS: ReturnStatus[] = [
  "draft",
  "returned",
  "completed",
  "cancelled",
];

const CONDITION_OPTIONS: ReturnCondition[] = ["good", "damaged", "lost"];

export default function MaterialReturnEditPage() {
  const router = useRouter();
  const params = useParams();
  const returnId = Number(params.id);

  const [mrn, setMrn] = useState<MaterialReturnNote | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [returnDate, setReturnDate] = useState("");
  const [returnedBy, setReturnedBy] = useState<number | "">("");
  const [project, setProject] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<ReturnStatus>("draft");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<EditItemRow[]>([]);

  // New item add
  const [newMaterialId, setNewMaterialId] = useState<number | "">("");

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!returnId || isNaN(returnId)) {
        setError("Invalid MRN ID");
        setLoading(false);
        return;
      }
      try {
        const [mrnData, empData, projData, matData] = await Promise.all([
          getMaterialReturn(returnId),
          getEmployees(),
          getProjects(),
          getMaterials(),
        ]);

        setMrn(mrnData);
        setEmployees(empData.results);
        setProjects(projData.results);
        setMaterials(matData.results.filter((m) => m.is_active));

        // Populate form
        setReturnDate(mrnData.return_date || "");
        setReturnedBy(mrnData.returned_by || "");
        setProject(mrnData.project || "");
        setReason(mrnData.reason || "");
        setStatus(mrnData.status || "draft");
        setRemarks(mrnData.remarks || "");

        // Populate items
        const populatedItems: EditItemRow[] = (mrnData.items || []).map(
          (it) => ({
            material: it.material,
            material_name: it.material_name || "—",
            material_code: it.material_code || "—",
            quantity: String(it.quantity),
            unit: it.unit || "",
            condition: it.condition || "good",
          })
        );
        setItems(populatedItems);
      } catch (err: any) {
        setError(err.message || "Failed to load MRN");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [returnId]);

  // ============================================
  // ITEM HANDLERS
  // ============================================

  function updateItemQuantity(index: number, value: string) {
    const updated = [...items];
    updated[index].quantity = value;
    setItems(updated);
  }

  function updateItemCondition(index: number, condition: ReturnCondition) {
    const updated = [...items];
    updated[index].condition = condition;
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleAddMaterial() {
    if (!newMaterialId) return;

    if (items.some((it) => it.material === newMaterialId)) {
      setError("This material is already added.");
      return;
    }

    const mat = materials.find((m) => m.id === newMaterialId);
    if (!mat) return;

    setItems([
      ...items,
      {
        material: mat.id,
        material_name: mat.material_name,
        material_code: mat.material_code,
        quantity: "0",
        unit: mat.unit_display || mat.unit || "",
        condition: "good",
      },
    ]);
    setNewMaterialId("");
    setError("");
  }

  // ============================================
  // SAVE
  // ============================================

  async function handleSave() {
    if (!mrn) return;

    setError("");

    if (!returnDate) {
      setError("Return date is required.");
      return;
    }
    if (!returnedBy) {
      setError("Please select an employee.");
      return;
    }
    if (items.length === 0) {
      setError("At least one item is required.");
      return;
    }

    const validItems = items.filter(
      (it) => (parseFloat(it.quantity) || 0) > 0
    );

    if (validItems.length === 0) {
      setError("Enter quantity for at least one item.");
      return;
    }

    setSaving(true);
    try {
      await updateMaterialReturn(mrn.id, {
        return_date: returnDate,
        returned_by: Number(returnedBy),
        project: project ? Number(project) : null,
        reason,
        status,
        remarks,
        items: validItems.map((it) => ({
          material: it.material,
          quantity: parseFloat(it.quantity) || 0,
          unit: it.unit,
          condition: it.condition,
        })),
      });

      router.push(`/materials/returns/${mrn.id}`);
    } catch (err: any) {
      setError("Failed to save: " + (err.message || "Unknown error"));
      setSaving(false);
    }
  }

  // ============================================
  // LOADING / ERROR
  // ============================================

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-orange-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading MRN...</p>
        </div>
      </AppLayout>
    );
  }

  if (!mrn) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Return Note not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/materials/returns">
              <NeoButton
                variant="primary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Returns
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  const totalQuantity = items.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0
  );

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/materials/returns/${mrn.id}`}>
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

        {/* Hero */}
        <NeoCard>
          <div className="flex flex-wrap items-start gap-5">
            <NeoIconBox size="xl" color="text-orange-600" variant="inset">
              <Undo2 className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {mrn.mrn_no}
                </span>
                <NeoBadge
                  variant={RETURN_STATUS_VARIANTS[status] || "neutral"}
                  size="md"
                >
                  {RETURN_STATUS_EMOJIS[status]}{" "}
                  {RETURN_STATUS_LABELS[status]}
                </NeoBadge>
              </div>

              <h1 className="text-2xl font-bold text-slate-800 mb-3">
                Edit Material Return Note
              </h1>
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

        {/* Return Info */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <User className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Return Information
              </h2>
              <p className="text-xs text-slate-500">
                Update who, when, and why
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Return Date */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Return Date *
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              />
            </div>

            {/* Returned By */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Returned By (Employee) *
              </label>
              <select
                value={returnedBy}
                onChange={(e) =>
                  setReturnedBy(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_code} — {emp.full_name || "—"}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Project
              </label>
              <select
                value={project}
                onChange={(e) =>
                  setProject(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">Select Project (optional)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_code} — {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReturnStatus)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {RETURN_STATUS_EMOJIS[s]} {RETURN_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Reason for Return
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Why is this material being returned?"
                className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none resize-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              />
            </div>
          </div>
        </NeoCard>

        {/* Items */}
        <NeoCard>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <NeoIconBox size="md" color="text-orange-600">
                <Package className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Returned Materials ({items.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Update quantities or conditions
                </p>
              </div>
            </div>
            {items.length > 0 && (
              <NeoBadge variant="primary" size="sm">
                Total Qty: {totalQuantity}
              </NeoBadge>
            )}
          </div>

          {/* Add Material */}
          <div className="flex flex-wrap items-end gap-3 mb-6">
            <div className="flex-1 min-w-[240px]">
              <label className="text-slate-700 font-medium text-xs pl-2 block mb-1.5">
                Add New Material
              </label>
              <select
                value={newMaterialId}
                onChange={(e) =>
                  setNewMaterialId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">Select Material</option>
                {materials.map((mat) => (
                  <option key={mat.id} value={mat.id}>
                    {mat.material_code} — {mat.material_name}
                  </option>
                ))}
              </select>
            </div>
            <NeoButton
              type="button"
              variant="primary"
              size="md"
              onClick={handleAddMaterial}
              disabled={!newMaterialId}
              icon={<Plus className="h-4 w-4" />}
            >
              Add
            </NeoButton>
          </div>

          {/* Items List */}
          {items.length > 0 ? (
            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.material}
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <NeoBadge variant="primary" size="sm">
                      #{index + 1}
                    </NeoBadge>

                    <div className="flex-1 min-w-[200px]">
                      <p className="text-sm font-bold text-slate-800 mb-1">
                        {item.material_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>{item.material_code}</span>
                        <span>Unit: {item.unit || "—"}</span>
                      </div>
                    </div>

                    <div className="w-32">
                      <label className="text-slate-700 font-medium text-[10px] uppercase pl-2 block mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        min="0"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItemQuantity(index, e.target.value)
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#e0e5ec] text-sm text-center font-bold text-blue-700 border-0 outline-none"
                        style={{
                          boxShadow:
                            "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                        }}
                      />
                    </div>

                    <div className="w-32">
                      <label className="text-slate-700 font-medium text-[10px] uppercase pl-2 block mb-1">
                        Condition
                      </label>
                      <select
                        value={item.condition}
                        onChange={(e) =>
                          updateItemCondition(
                            index,
                            e.target.value as ReturnCondition
                          )
                        }
                        className="w-full h-10 px-3 rounded-lg bg-[#e0e5ec] text-xs text-slate-700 border-0 outline-none"
                        style={{
                          boxShadow:
                            "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                        }}
                      >
                        {CONDITION_OPTIONS.map((c) => (
                          <option key={c} value={c}>
                            {CONDITION_EMOJIS[c]} {CONDITION_LABELS[c]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-red-600 transition-all hover:scale-110"
                      style={{
                        background: "#e0e5ec",
                        boxShadow:
                          "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                      }}
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500 py-8">
              No materials. Add at least one.
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

        {/* Bottom Save */}
        <div className="flex justify-end gap-3 pb-4">
          <Link href={`/materials/returns/${mrn.id}`}>
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