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
  Package,
  ArrowLeft,
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Hash,
  Percent,
  FileText,
  Folder,
  TrendingUp,
  TrendingDown,
  Undo2,
} from "lucide-react";
import {
  getMaterial,
  deleteMaterial,
  UNIT_LABELS,
  type Material,
} from "@/lib/api/materials";

export default function MaterialDetailPage() {
  const router = useRouter();
  const params = useParams();
  const materialId = Number(params.id);

  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!materialId || isNaN(materialId)) {
        setError("Invalid material ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getMaterial(materialId);
        setMaterial(data);
      } catch (err: any) {
        setError(err.message || "Failed to load material");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [materialId]);

  // ============================================
  // DELETE
  // ============================================

  async function handleDelete() {
    if (!material) return;
    setDeleting(true);
    try {
      await deleteMaterial(material.id);
      router.push("/materials");
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

  function getGstColor(rate: number) {
    const r = Number(rate);
    if (r === 0) return "#64748b";
    if (r === 5) return "#10b981";
    if (r === 12) return "#f59e0b";
    if (r === 18) return "#4f6df5";
    if (r === 28) return "#ef4444";
    return "#64748b";
  }

  // ============================================
  // LOADING / ERROR
  // ============================================

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-cyan-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading material...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !material) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Material not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/materials">
              <NeoButton
                variant="primary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Materials
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  // ============================================
  // STOCK CALCULATION
  // ============================================

  const totalReceived = material.total_received || 0;
  const totalIssued = material.total_issued || 0;
  const totalReturned = material.total_returned || 0;
  const currentStock = material.current_stock || 0;

  const stockStatus =
    currentStock > 10
      ? { label: "In Stock", color: "#10b981", emoji: "✅" }
      : currentStock > 0
      ? { label: "Low Stock", color: "#f59e0b", emoji: "⚠️" }
      : { label: "Out of Stock", color: "#ef4444", emoji: "❌" };

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/materials">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/materials/${material.id}/edit`}>
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
            <NeoIconBox size="xl" color="text-cyan-600" variant="inset">
              <Package className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-500 tracking-wide">
                  {material.material_code}
                </span>
                {material.category_name && (
                  <NeoBadge variant="primary" size="md">
                    📁 {material.category_name}
                  </NeoBadge>
                )}
                <span
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: `${getGstColor(Number(material.gst_rate))}20`,
                    color: getGstColor(Number(material.gst_rate)),
                  }}
                >
                  <Percent className="h-3 w-3" />
                  GST {material.gst_rate}%
                </span>
                {material.is_active ? (
                  <NeoBadge variant="success" size="md">
                    ✅ Active
                  </NeoBadge>
                ) : (
                  <NeoBadge variant="warning" size="md">
                    ⚠️ Inactive
                  </NeoBadge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                {material.material_name}
              </h1>

              {material.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {material.description}
                </p>
              )}
            </div>

            {/* Current Stock Display */}
            <div
              className="p-4 rounded-2xl text-center"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                minWidth: "130px",
              }}
            >
              <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">
                Current Stock
              </p>
              <p
                className="text-3xl font-bold"
                style={{ color: stockStatus.color }}
              >
                {currentStock}
              </p>
              <p className="text-[10px] mt-1" style={{ color: stockStatus.color }}>
                {stockStatus.emoji} {stockStatus.label}
              </p>
            </div>
          </div>
        </NeoCard>

        {/* ============================================
            STOCK BREAKDOWN
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-cyan-600">
              <Package className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                📊 Stock Breakdown
              </h2>
              <p className="text-xs text-slate-500">
                Received - Issued + Returned = Current Stock
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Received */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Received
                </p>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {totalReceived}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                From Material Receipts
              </p>
            </div>

            {/* Issued */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="h-4 w-4 text-orange-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Issued
                </p>
              </div>
              <p className="text-2xl font-bold text-orange-600">
                {totalIssued}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                To Employees
              </p>
            </div>

            {/* Returned */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Undo2 className="h-4 w-4 text-purple-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Returned
                </p>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                {totalReturned}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Good Condition Only
              </p>
            </div>

            {/* Current Stock */}
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-green-600" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Current Stock
                </p>
              </div>
              <p
                className="text-2xl font-bold"
                style={{ color: stockStatus.color }}
              >
                {currentStock}
              </p>
              <p
                className="text-[10px] mt-0.5"
                style={{ color: stockStatus.color }}
              >
                {stockStatus.emoji} {stockStatus.label}
              </p>
            </div>
          </div>

          {/* Formula Hint */}
          <div
            className="mt-4 p-3 rounded-xl text-center"
            style={{
              background: "rgba(6, 182, 212, 0.08)",
              borderLeft: "3px solid #06b6d4",
            }}
          >
            <p className="text-xs text-slate-600">
              <strong>Formula:</strong> {totalReceived} (Received) −{" "}
              {totalIssued} (Issued) + {totalReturned} (Returned) ={" "}
              <strong>{currentStock}</strong> (Current Stock)
            </p>
          </div>
        </NeoCard>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className="p-4 rounded-2xl"
            style={{
              background: "#e0e5ec",
              boxShadow:
                "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Folder className="h-4 w-4 text-purple-600" />
              <p className="text-xs font-bold text-slate-500 uppercase">
                Category
              </p>
            </div>
            <p className="text-base font-bold text-slate-800">
              {material.category_name || "—"}
            </p>
            {material.category_code && (
              <p className="text-xs text-slate-500 mt-1">
                Code: {material.category_code}
              </p>
            )}
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{
              background: "#e0e5ec",
              boxShadow:
                "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Package className="h-4 w-4 text-blue-600" />
              <p className="text-xs font-bold text-slate-500 uppercase">
                Unit
              </p>
            </div>
            <p className="text-base font-bold text-slate-800">
              {material.unit_display || UNIT_LABELS[material.unit]}
            </p>
          </div>

          <div
            className="p-4 rounded-2xl"
            style={{
              background: "#e0e5ec",
              boxShadow:
                "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Hash className="h-4 w-4 text-orange-600" />
              <p className="text-xs font-bold text-slate-500 uppercase">
                HSN Code
              </p>
            </div>
            <p className="text-base font-bold text-slate-800 font-mono">
              {material.hsn_code || "—"}
            </p>
          </div>
        </div>

        {/* Audit */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Created:{" "}
              <strong className="text-slate-700">
                {formatDate(material.created_at)}
              </strong>
            </span>
            <span>
              Last Updated:{" "}
              <strong className="text-slate-700">
                {formatDate(material.updated_at)}
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
              Delete Material?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              This material will be deleted:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {material.material_name}
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