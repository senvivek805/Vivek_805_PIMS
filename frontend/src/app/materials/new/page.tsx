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
} from "@/components/neumorphism";
import {
  Package,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Hash,
  Percent,
  FileText,
} from "lucide-react";
import {
  createMaterial,
  getMaterialCategories,
  UNIT_LABELS,
  GST_RATE_OPTIONS,
  type MaterialCreateUpdate,
  type MaterialUnit,
  type MaterialCategory,
} from "@/lib/api/materials";

export default function NewMaterialPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form State
  const [materialName, setMaterialName] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [unit, setUnit] = useState<MaterialUnit>("piece");
  const [hsnCode, setHsnCode] = useState("");
  const [gstRate, setGstRate] = useState<number>(18);
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  // ============================================
  // LOAD CATEGORIES
  // ============================================

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getMaterialCategories();
        setCategories(data);
      } catch (err: any) {
        setError("Failed to load categories: " + err.message);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    // Validation
    if (!materialName.trim()) {
      setError("Material Name zaroori hai.");
      return;
    }

    setLoading(true);
    try {
      const payload: MaterialCreateUpdate = {
        material_name: materialName.trim(),
        category: categoryId || null,
        unit: unit,
        hsn_code: hsnCode || undefined,
        gst_rate: gstRate,
        description: description || undefined,
        is_active: isActive,
      };

      const created = await createMaterial(payload);
      setSuccess("Material successfully create ho gaya! 🎉");

      setTimeout(() => {
        router.push(`/materials/${created.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create material");
      setLoading(false);
    }
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-cyan-600">
              <Package className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                New Material
              </h1>
              <p className="text-sm text-slate-500">
                Register a new material in the master
              </p>
            </div>
          </div>
          <Link href="/materials">
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
            SECTION 1: BASIC INFO
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <Package className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Basic Information
              </h2>
              <p className="text-xs text-slate-500">
                Material ka naam aur category
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <div
                className="p-3 rounded-xl text-xs text-slate-600 flex items-center gap-2"
                style={{
                  background: "rgba(79, 109, 245, 0.08)",
                  borderLeft: "3px solid #4f6df5",
                }}
              >
                <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p>
                  Material Code <strong>auto-generate</strong> hoga save karne
                  par (MAT-000001)
                </p>
              </div>
            </div>

            <div className="md:col-span-2">
              <NeoInput
                id="material_name"
                label="Material Name *"
                placeholder="e.g., Dell Laptop i5"
                value={materialName}
                onChange={(e) => setMaterialName(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) =>
                  setCategoryId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
                disabled={loadingData}
              >
                <option value="">Select Category (Optional)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </NeoCard>

        {/* ============================================
            SECTION 2: UNIT & GST
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-green-600">
              <Percent className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Unit & GST</h2>
              <p className="text-xs text-slate-500">
                Unit aur tax details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Unit *
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as MaterialUnit)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {Object.entries(UNIT_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <NeoInput
              id="hsn_code"
              label="HSN Code"
              placeholder="e.g., 8471"
              value={hsnCode}
              onChange={(e) => setHsnCode(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                GST Rate *
              </label>
              <select
                value={gstRate}
                onChange={(e) => setGstRate(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
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
        </NeoCard>

        {/* ============================================
            SECTION 3: DESCRIPTION
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-purple-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Description
              </h2>
              <p className="text-xs text-slate-500">
                Material ki detail (optional)
              </p>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="e.g., Dell Vostro 15, i5, 8GB RAM, 512GB SSD"
            className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none resize-none"
            style={{
              boxShadow:
                "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
            }}
          />
        </NeoCard>

        {/* ============================================
            SECTION 4: STATUS
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium text-slate-700 cursor-pointer"
            >
              Material is Active
            </label>
          </div>
        </NeoCard>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href="/materials">
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
            {loading ? "Saving..." : "Save Material"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}