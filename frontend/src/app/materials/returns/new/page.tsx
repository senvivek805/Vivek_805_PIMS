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
  Undo2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  User,
  Calendar,
  FolderKanban,
  Package,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import {
  createMaterialReturn,
  getMaterialIssues,
  getMaterialIssue,
  getMaterials,
  CONDITION_LABELS,
  CONDITION_EMOJIS,
  type MaterialReturnNoteCreateUpdate,
  type ReturnStatus,
  type ReturnCondition,
  type MaterialIssue,
  type Material,
} from "@/lib/api/materials";
import { getEmployees, type Employee } from "@/lib/api/employees";
import { getProjects, type Project } from "@/lib/api/projects";

// ============================================
// RETURN ITEM ROW
// ============================================

interface ReturnItemRow {
  material: number;
  material_name: string;
  material_code: string;
  current_stock: number;
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

export default function NewMaterialReturnPage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [issues, setIssues] = useState<MaterialIssue[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [returnedBy, setReturnedBy] = useState<number | "">("");
  const [project, setProject] = useState<number | "">("");
  const [selectedIssue, setSelectedIssue] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<ReturnStatus>("draft");
  const [remarks, setRemarks] = useState("");

  // Items
  const [items, setItems] = useState<ReturnItemRow[]>([]);
  const [newMaterialId, setNewMaterialId] = useState<number | "">("");

  // ============================================
  // LOAD DATA
  // ============================================

  useEffect(() => {
    async function loadData() {
      try {
        const [empData, projData, issueData, matData] = await Promise.all([
          getEmployees(),
          getProjects(),
          getMaterialIssues(),
          getMaterials(),
        ]);
        setEmployees(empData.results);
        setProjects(projData.results);
        setIssues(issueData.results);
        setMaterials(matData.results.filter((m) => m.is_active));
      } catch (err: any) {
        setError("Failed to load data: " + err.message);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // ============================================
  // ISSUE CHANGE HANDLER — Auto-populate
  // ============================================

  async function handleIssueChange(issueId: string) {
    setError("");
    setSelectedIssue(issueId ? Number(issueId) : "");

    if (!issueId) {
      setItems([]);
      return;
    }

    try {
      const issueData = await getMaterialIssue(Number(issueId));
      // Auto-fill employee and project
      if (issueData.issued_to) setReturnedBy(issueData.issued_to);
      if (issueData.project) setProject(issueData.project);

      // Auto-populate items from issue
      const populatedItems: ReturnItemRow[] = (issueData.items || []).map(
        (it) => {
          const mat = materials.find((m) => m.id === it.material);
          return {
            material: it.material,
            material_name: it.material_name || "—",
            material_code: it.material_code || "—",
            current_stock: mat?.current_stock || 0,
            quantity: "0",
            unit: it.unit || mat?.unit_display || mat?.unit || "",
            condition: "good",
          };
        }
      );
      setItems(populatedItems);
    } catch (err: any) {
      setError("Failed to load issue items: " + err.message);
    }
  }

  // ============================================
  // ADD / REMOVE ITEMS
  // ============================================

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
        current_stock: mat.current_stock || 0,
        quantity: "0",
        unit: mat.unit_display || mat.unit || "",
        condition: "good",
      },
    ]);
    setNewMaterialId("");
    setError("");
  }

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

  // ============================================
  // LIVE TOTAL
  // ============================================

  const totalQuantity = items.reduce(
    (sum, item) => sum + (parseFloat(item.quantity) || 0),
    0
  );

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!returnDate) {
      setError("Return date is required.");
      return;
    }
    if (!returnedBy) {
      setError("Please select an employee.");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one material.");
      return;
    }

    const validItems = items.filter(
      (item) => (parseFloat(item.quantity) || 0) > 0
    );

    if (validItems.length === 0) {
      setError("Enter quantity for at least one item.");
      return;
    }

    setLoading(true);
    try {
      const payload: MaterialReturnNoteCreateUpdate = {
        return_date: returnDate,
        returned_by: Number(returnedBy),
        material_issue: selectedIssue ? Number(selectedIssue) : null,
        project: project ? Number(project) : null,
        reason: reason,
        status: status,
        remarks: remarks,
        items: validItems.map((item) => ({
          material: item.material,
          quantity: parseFloat(item.quantity) || 0,
          unit: item.unit,
          condition: item.condition,
        })),
      };

      const created = await createMaterialReturn(payload);
      setSuccess("Material Return Note created successfully! 🎉");

      setTimeout(() => {
        router.push(`/materials/returns/${created.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create return note");
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
            <NeoIconBox size="lg" color="text-orange-600">
              <Undo2 className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                New Material Return
              </h1>
              <p className="text-sm text-slate-500">
                Record material returned by an employee
              </p>
            </div>
          </div>
          <Link href="/materials/returns">
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
            SECTION 1: RETURN INFO
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <Undo2 className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Return Information
              </h2>
              <p className="text-xs text-slate-500">
                Who, when, and against which issue
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Return Date */}
            <NeoInput
              id="return_date"
              label="Return Date *"
              type="date"
              value={returnDate}
              onChange={(e) => setReturnDate(e.target.value)}
              required
            />

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
                disabled={loadingData}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employee_code} — {emp.full_name || "—"}
                  </option>
                ))}
              </select>
            </div>

            {/* Linked Issue */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Linked Material Issue (Optional — auto-fills items)
              </label>
              <select
                value={selectedIssue}
                onChange={(e) => handleIssueChange(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
                disabled={loadingData}
              >
                <option value="">— No linked issue —</option>
                {issues.map((iss) => (
                  <option key={iss.id} value={iss.id}>
                    {iss.issue_no} — {iss.issued_to_name} —{" "}
                    {iss.item_count} items
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
                disabled={loadingData}
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
                    {s.charAt(0).toUpperCase() + s.slice(1)}
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

        {/* ============================================
            SECTION 2: ITEMS
            ============================================ */}
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
                  Enter quantity and condition for each item
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
                Add Material
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
                disabled={loadingData}
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
              {items.map((item, index) => {
                const qty = parseFloat(item.quantity) || 0;

                return (
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

                      {/* Quantity */}
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

                      {/* Condition */}
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

                      {/* Remove */}
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

                    {/* Condition hint */}
                    {item.condition !== "good" && (
                      <p className="text-[10px] text-orange-600 mt-2 ml-2">
                        ⚠️ {CONDITION_LABELS[item.condition]} items will NOT
                        be added back to stock
                      </p>
                    )}
                  </div>
                );
              })}

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-slate-300/40 flex flex-wrap gap-4 text-[10px] text-slate-500">
                <span>✅ Good — will be added back to stock</span>
                <span>⚠️ Damaged — will not be added to stock</span>
                <span>❌ Lost — will not be added to stock</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500 py-8">
              No materials added yet. Select issue above or add manually.
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

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href="/materials/returns">
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
            disabled={!returnedBy || items.length === 0}
            icon={<Save className="h-4 w-4" />}
          >
            {loading ? "Saving..." : "Save Return Note"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}