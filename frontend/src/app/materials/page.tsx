"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import {
  NeoCard,
  NeoButton,
  NeoBadge,
  NeoIconBox,
} from "@/components/neumorphism";
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Filter,
  RefreshCw,
  AlertCircle,
  X,
  AlertTriangle,
  Hash,
  Percent,
} from "lucide-react";
import {
  getMaterials,
  deleteMaterial,
  getMaterialStats,
  getMaterialCategories,
  UNIT_LABELS,
  type Material,
  type MaterialStats,
  type MaterialCategory,
} from "@/lib/api/materials";

export default function MaterialsPage() {
  // 👇 NEW: RBAC Hook
  const { canCreate, canEdit, canDelete } = usePermissions();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [stats, setStats] = useState<MaterialStats | null>(null);
  const [categories, setCategories] = useState<MaterialCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | "">("");

  const [deleteTarget, setDeleteTarget] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD
  // ============================================

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [data, statsData, categoriesData] = await Promise.all([
        getMaterials({
          search,
          category: categoryFilter || undefined,
        }),
        getMaterialStats(),
        getMaterialCategories(),
      ]);
      setMaterials(data.results);
      setStats(statsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError(err.message || "Failed to load materials");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ============================================
  // DELETE
  // ============================================

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMaterial(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  // ============================================
  // HELPERS
  // ============================================

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
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-cyan-600">
              <Package className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Materials</h1>
              <p className="text-sm text-slate-500">
                Manage all materials used in projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NeoButton
              variant="secondary"
              size="md"
              onClick={loadData}
              icon={
                <RefreshCw
                  className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
              }
            >
              Refresh
            </NeoButton>
            
            {/* 👇 NEW: RBAC applied */}
            {canCreate && (
              <Link href="/materials/new">
                <NeoButton
                  variant="primary"
                  size="md"
                  icon={<Plus className="h-4 w-4" />}
                >
                  New Material
                </NeoButton>
              </Link>
            )}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Total Materials
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.total_materials}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Active
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.active_materials}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Inactive
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.inactive_materials}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Categories
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.total_categories}
              </p>
            </NeoCard>
          </div>
        )}

        {/* Search + Filter */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                <input
                  type="text"
                  placeholder="Search by code, name, HSN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                  style={{
                    boxShadow:
                      "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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

        {/* Materials List */}
        <NeoCard padding="md">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl animate-pulse"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                />
              ))}
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
                }}
              >
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                No materials found
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {search || categoryFilter
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first material"}
              </p>
              
              {/* 👇 NEW: RBAC applied */}
              {canCreate && (
                <Link href="/materials/new">
                  <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>
                    Add Material
                  </NeoButton>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {materials.map((material) => (
                <div
                  key={material.id}
                  className="p-4 rounded-2xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <NeoIconBox color="text-cyan-600" size="md">
                      <Package className="h-5 w-5" />
                    </NeoIconBox>

                    <div className="flex-1 min-w-[240px]">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500">
                          {material.material_code}
                        </span>
                        {material.category_name && (
                          <NeoBadge variant="primary" size="sm">
                            📁 {material.category_name}
                          </NeoBadge>
                        )}
                        <span
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            background: `${getGstColor(
                              Number(material.gst_rate)
                            )}20`,
                            color: getGstColor(Number(material.gst_rate)),
                          }}
                        >
                          <Percent className="h-2.5 w-2.5" />
                          GST {material.gst_rate}%
                        </span>
                        {!material.is_active && (
                          <NeoBadge variant="warning" size="sm">
                            Inactive
                          </NeoBadge>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">
                        {material.material_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          📏 {material.unit_display || UNIT_LABELS[material.unit]}
                        </span>
                        {material.hsn_code && (
                          <span className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            HSN: {material.hsn_code}
                          </span>
                        )}
                        {material.description && (
                          <span className="truncate max-w-[300px]">
                            {material.description}
                          </span>
                        )}

          {/* ✅ STOCK BREAKDOWN BADGES */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
            ↓ Recv: {material.total_received || 0}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">
            ↑ Issued: {material.total_issued || 0}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
            ↩ Ret: {material.total_returned || 0}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              (material.current_stock || 0) > 0
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            📦 Stock: {material.current_stock || 0}
          </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/materials/${material.id}`}>
                        <button
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-blue-600 transition-all hover:scale-110"
                          style={{
                            background: "#e0e5ec",
                            boxShadow:
                              "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                          }}
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </Link>

                      {/* 👇 NEW: RBAC applied */}
                      {canEdit && (
                        <Link href={`/materials/${material.id}/edit`}>
                          <button
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-orange-600 transition-all hover:scale-110"
                            style={{
                              background: "#e0e5ec",
                              boxShadow:
                                "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                            }}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        </Link>
                      )}

                      {/* 👇 NEW: RBAC applied */}
                      {canDelete && (
                        <button
                          onClick={() => setDeleteTarget(material)}
                          className="h-9 w-9 rounded-lg flex items-center justify-center text-red-600 transition-all hover:scale-110"
                          style={{
                            background: "#e0e5ec",
                            boxShadow:
                              "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                          }}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeoCard>

        {!loading && materials.length > 0 && (
          <p className="text-center text-xs text-slate-500">
            Showing {materials.length} material
            {materials.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteTarget(null)}
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
              {deleteTarget.material_name}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
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
                onClick={confirmDelete}
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