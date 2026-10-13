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
  PackageMinus,
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
  Building2,
} from "lucide-react";
import {
  createMaterialIssue,
  getMaterials,
  type MaterialIssueCreateUpdate,
  type MaterialIssueItem,
  type IssueStatus,
  type Material,
} from "@/lib/api/materials";
import { getEmployees, type Employee } from "@/lib/api/employees";
import { getProjects, type Project } from "@/lib/api/projects";

// ============================================
// ISSUE ITEM ROW
// ============================================

interface IssueItemRow {
  material: number;
  material_name: string;
  material_code: string;
  current_stock: number;
  quantity: string;
  unit: string;
}

export default function NewMaterialIssuePage() {
  const router = useRouter();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Issue Info
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [issuedTo, setIssuedTo] = useState<number | "">("");
  const [project, setProject] = useState<number | "">("");
  const [purpose, setPurpose] = useState("");
  const [status, setStatus] = useState<IssueStatus>("draft");
  const [remarks, setRemarks] = useState("");

  // Items
  const [items, setItems] = useState<IssueItemRow[]>([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState<number | "">("");

  // ============================================
  // LOAD DATA
  // ============================================

  useEffect(() => {
    async function loadData() {
      try {
        const [empData, projData, matData] = await Promise.all([
          getEmployees(),
          getProjects(),
          getMaterials(),
        ]);
        setEmployees(empData.results);
        setProjects(projData.results);
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
  // ADD ITEM
  // ============================================

  function handleAddItem() {
    if (!selectedMaterialId) return;

    // Check if already added
    if (items.some((it) => it.material === selectedMaterialId)) {
      setError("This material is already added.");
      return;
    }

    const mat = materials.find((m) => m.id === selectedMaterialId);
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
      },
    ]);
    setSelectedMaterialId("");
    setError("");
  }

  function updateItemQuantity(index: number, value: string) {
    const updated = [...items];
    updated[index].quantity = value;
    setItems(updated);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  // ============================================
  // LIVE TOTALS
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

    // Validation
    if (!issueDate) {
      setError("Issue date is required.");
      return;
    }
    if (!issuedTo) {
      setError("Please select an employee.");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one material.");
      return;
    }

    // Check quantities
    const validItems = items.filter(
      (item) => (parseFloat(item.quantity) || 0) > 0
    );
    if (validItems.length === 0) {
      setError("Please enter quantity for at least one material.");
      return;
    }

    // Stock check (only for 'issued' status)
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

    setLoading(true);
    try {
      const payload: MaterialIssueCreateUpdate = {
        issue_date: issueDate,
        issued_to: Number(issuedTo),
        project: project ? Number(project) : null,
        purpose: purpose,
        status: status,
        remarks: remarks,
        items: validItems.map((item) => ({
          material: item.material,
          quantity: parseFloat(item.quantity) || 0,
          unit: item.unit,
        })),
      };

      const created = await createMaterialIssue(payload);
      setSuccess("Material Issue created successfully! 🎉");

      setTimeout(() => {
        router.push(`/materials/issues/${created.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create issue");
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
            <NeoIconBox size="lg" color="text-purple-600">
              <PackageMinus className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                New Material Issue
              </h1>
              <p className="text-sm text-slate-500">
                Issue materials to an employee
              </p>
            </div>
          </div>
          <Link href="/materials/issues">
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
            SECTION 1: ISSUE INFO
            ============================================ */}
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
                Who, when, and for what
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Issue Date */}
            <NeoInput
              id="issue_date"
              label="Issue Date *"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              required
            />

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
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.project_code} — {proj.project_name}
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
                <option value="draft">📝 Draft (no stock check)</option>
                <option value="issued">📤 Issued (stock will be deducted)</option>
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
                  Materials ({items.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Select materials and enter quantities
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
                Select Material
              </label>
              <select
                value={selectedMaterialId}
                onChange={(e) =>
                  setSelectedMaterialId(
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
              onClick={handleAddItem}
              disabled={!selectedMaterialId}
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
                            Stock: {item.current_stock}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Input */}
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

                      {/* Balance */}
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
                            ⚠️ Over stock!
                          </p>
                        )}
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
                  </div>
                );
              })}

              {/* Legend */}
              <div className="mt-5 pt-4 border-t border-slate-300/40 flex flex-wrap gap-4 text-[10px] text-slate-500">
                <span>✅ Green — within stock</span>
                <span>🟠 Orange — stock exactly consumed</span>
                <span>⚠️ Red — exceeds available stock</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500 py-8">
              No materials added yet. Select and add materials above.
            </p>
          )}
        </NeoCard>

        {/* ============================================
            SECTION 3: REMARKS
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
          <Link href="/materials/issues">
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
            disabled={!issuedTo || items.length === 0}
            icon={<Save className="h-4 w-4" />}
          >
            {loading ? "Saving..." : "Save Issue"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}