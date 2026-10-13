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
  PackageMinus,
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  X,
  User,
  FolderKanban,
  Calendar,
  Package,
  FileText,
  RefreshCw,
  Trash2,
  Plus,
} from "lucide-react";
import {
  getMaterialIssue,
  updateMaterialIssue,
  getMaterials,
  ISSUE_STATUS_LABELS,
  ISSUE_STATUS_EMOJIS,
  ISSUE_STATUS_VARIANTS,
  type MaterialIssue,
  type MaterialIssueItem,
  type IssueStatus,
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
  current_stock: number;
  original_quantity: number; // original qty (for stock calc)
  quantity: string;
  unit: string;
}

const STATUS_OPTIONS: IssueStatus[] = [
  "draft",
  "issued",
  "returned",
  "cancelled",
];

export default function MaterialIssueEditPage() {
  const router = useRouter();
  const params = useParams();
  const issueId = Number(params.id);

  const [issue, setIssue] = useState<MaterialIssue | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [issueDate, setIssueDate] = useState("");
  const [issuedTo, setIssuedTo] = useState<number | "">("");
  const [project, setProject] = useState<number | "">("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState<IssueStatus>("draft");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<EditItemRow[]>([]);

  // New item add
  const [newMaterialId, setNewMaterialId] = useState<number | "">("");

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!issueId || isNaN(issueId)) {
        setError("Invalid issue ID");
        setLoading(false);
        return;
      }
      try {
        const [issueData, empData, projData, matData] = await Promise.all([
          getMaterialIssue(issueId),
          getEmployees(),
          getProjects(),
          getMaterials(),
        ]);

        setIssue(issueData);
        setEmployees(empData.results);
        setProjects(projData.results);
        setMaterials(matData.results.filter((m) => m.is_active));

        // Populate form
        setIssueDate(issueData.issue_date || "");
        setIssuedTo(issueData.issued_to || "");
        setProject(issueData.project || "");
        setPurpose(issueData.purpose || "");
        setStatus(issueData.status || "draft");
        setRemarks(issueData.remarks || "");

        // Populate items with stock info
        const populatedItems: EditItemRow[] = (issueData.items || []).map(
          (it) => {
            const mat = matData.results.find((m) => m.id === it.material);
            return {
              material: it.material,
              material_name: it.material_name || "—",
              material_code: it.material_code || "—",
              current_stock: (mat?.current_stock || 0) + (parseFloat(String(it.quantity)) || 0), // add back original qty (since it was already deducted)
              original_quantity: parseFloat(String(it.quantity)) || 0,
              quantity: String(it.quantity),
              unit: it.unit || mat?.unit_display || mat?.unit || "",
            };
          }
        );
        setItems(populatedItems);
      } catch (err: any) {
        setError(err.message || "Failed to load issue");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [issueId]);

  // ============================================
  // ITEM HANDLERS
  // ============================================

  function updateItemQuantity(index: number, value: string) {
    const updated = [...items];
    updated[index].quantity = value;
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleAddMaterial() {
    if (!newMaterialId) return;

    // Check duplicate
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
        original_quantity: 0,
        quantity: "0",
        unit: mat.unit_display || mat.unit || "",
      },
    ]);
    setNewMaterialId("");
    setError("");
  }

  // ============================================
  // SAVE
  // ============================================

  async function handleSave() {
    if (!issue) return;

    setError("");

    if (!issueDate) {
      setError("Issue date is required.");
      return;
    }
    if (!issuedTo) {
      setError("Please select an employee.");
      return;
    }
    if (items.length === 0) {
      setError("At least one item is required.");
      return;
    }

    // Validate quantities
    const validItems = items.filter(
      (it) => (parseFloat(it.quantity) || 0) > 0
    );
    if (validItems.length === 0) {
      setError("Enter quantity for at least one item.");
      return;
    }

    // Stock check (only if status is 'issued')
    if (status === "issued") {
      for (const item of validItems) {
        const qty = parseFloat(item.quantity) || 0;
        if (qty > item.current_stock) {
          setError(
            `Insufficient stock for '${item.material_name}'. Available: ${item.current_stock}, Requested: ${qty}`
          );
          return;
        }
      }
    }

    setSaving(true);
    try {
      await updateMaterialIssue(issue.id, {
        issue_date: issueDate,
        issued_to: Number(issuedTo),
        project: project ? Number(project) : null,
        purpose,
        status,
        remarks,
        items: validItems.map((it) => ({
          material: it.material,
          quantity: parseFloat(it.quantity) || 0,
          unit: it.unit,
        })),
      });

      router.push(`/materials/issues/${issue.id}`);
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
          <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading issue...</p>
        </div>
      </AppLayout>
    );
  }

  if (!issue) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Issue not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/materials/issues">
              <NeoButton
                variant="primary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Issues
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
          <Link href={`/materials/issues/${issue.id}`}>
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
            <NeoIconBox size="xl" color="text-purple-600" variant="inset">
              <PackageMinus className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {issue.issue_no}
                </span>
                <NeoBadge
                  variant={ISSUE_STATUS_VARIANTS[status] || "neutral"}
                  size="md"
                >
                  {ISSUE_STATUS_EMOJIS[status]}{" "}
                  {ISSUE_STATUS_LABELS[status]}
                </NeoBadge>
              </div>

              <h1 className="text-2xl font-bold text-slate-800 mb-3">
                Edit Material Issue
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

        {/* Issue Info */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <User className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Issue Information
              </h2>
              <p className="text-xs text-slate-500">
                Update who, when, and for what
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Issue Date */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Issue Date *
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              />
            </div>

            {/* Issued To */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Issued To (Employee) *
              </label>
              <select
                value={issuedTo}
                onChange={(e) =>
                  setIssuedTo(e.target.value ? Number(e.target.value) : "")
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
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {ISSUE_STATUS_EMOJIS[s]} {ISSUE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Purpose
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
                placeholder="What is this material being issued for?"
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
                  Materials ({items.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Update quantities or remove items
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
                    {mat.material_code} — {mat.material_name} (Stock:{" "}
                    {mat.current_stock || 0})
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
                const isOver = qty > item.current_stock;
                const balance = item.current_stock - qty;

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
                          <span
                            className={
                              item.current_stock > 0
                                ? "text-green-600 font-bold"
                                : "text-red-600 font-bold"
                            }
                          >
                            Available: {item.current_stock}
                          </span>
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
                          className={`w-full h-10 px-3 rounded-lg bg-[#e0e5ec] text-sm text-center font-bold border-0 outline-none ${
                            isOver ? "text-red-600" : "text-blue-700"
                          }`}
                          style={{
                            boxShadow:
                              "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                          }}
                        />
                      </div>

                      <div className="w-24 text-center">
                        <label className="text-slate-700 font-medium text-[10px] uppercase block mb-1">
                          Balance
                        </label>
                        <p
                          className={`text-base font-bold ${
                            isOver
                              ? "text-red-600"
                              : balance === 0
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                        >
                          {balance.toFixed(2)}
                        </p>
                        {isOver && (
                          <p className="text-[10px] text-red-500 mt-0.5">
                            ⚠️ Over stock
                          </p>
                        )}
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
                );
              })}
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
          <Link href={`/materials/issues/${issue.id}`}>
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