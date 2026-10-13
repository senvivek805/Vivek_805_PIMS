"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
  Percent,
  FileText,
  Loader2,
} from "lucide-react";
import {
  getMaterial,
  updateMaterial,
  getMaterialCategories,
  UNIT_LABELS,
  GST_RATE_OPTIONS,
  type MaterialCreateUpdate,
  type MaterialUnit,
  type MaterialCategory,
} from "@/lib/api/materials";

export default function EditMaterialPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = Number(params.id);

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
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!materialId || isNaN(materialId)) {
        setError("Invalid material ID");
        setLoadingData(false);
        return;
      }
      try {
        const [material, categoriesData] = await Promise.all([
          getMaterial(materialId),
          getMaterialCategories(),
        ]);

        setMaterialName(material.material_name);
        setCategoryId(material.category || "");
        setUnit(material.unit);
        setHsnCode(material.hsn_code || "");
        setGstRate(Number(material.gst_rate) || 18);
        setDescription(material.description || "");
        setIsActive(material.is_active);
        setCategories(categoriesData);
      } catch (err: any) {
        setError(err.message || "Failed to load material");
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [materialId]);

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!materialName.trim()) {
      setError("Material Name zaroori hai.");
      return;
    }

    setLoading(true);
    try {
      const payload: Partial<MaterialCreateUpdate> = {
        material_name: materialName.trim(),
        category: categoryId || null,
        unit: unit,
        hsn_code: hsnCode || undefined,
        gst_rate: gstRate,
        description: description || undefined,
        is_active: isActive,
      };

      await updateMaterial(materialId, payload);
      setSuccess("Material successfully update ho gaya! 🎉");

      setTimeout(() => {
        router.push(`/materials/${materialId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update material");
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
          <Loader2 className="h-10 w-10 text-cyan-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading material...</p>
        </div>
      </AppLayout>
    );
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
            <NeoIconBox size="lg" color="text-orange-600">
              <Package className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Edit Material
              </h1>
              <p className="text-sm text-slate-500">
                Update material details
              </p>
            </div>
          </div>
          <Link href={`/materials/${materialId}`}>
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

        {/* SECTION 1: BASIC INFO */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <Package className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Basic Information
              </h2>
              <p className="text-xs text-slate-500">Material details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <NeoInput
                id="material_name"
                label="Material Name *"
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

        {/* SECTION 2: UNIT & GST */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-green-600">
              <Percent className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Unit & GST</h2>
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

        {/* SECTION 3: DESCRIPTION */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-purple-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Description
              </h2>
            </div>
          </div>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none resize-none"
            style={{
              boxShadow:
                "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
            }}
          />
        </NeoCard>

        {/* SECTION 4: STATUS */}
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
          <Link href={`/materials/${materialId}`}>
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
            {loading ? "Updating..." : "Update Material"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}