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
  Pencil,
  Trash2,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Printer,
  User,
  FolderKanban,
  Calendar,
  Package,
  FileText,
} from "lucide-react";
import {
  getMaterialReturn,
  deleteMaterialReturn,
  RETURN_STATUS_LABELS,
  RETURN_STATUS_EMOJIS,
  RETURN_STATUS_VARIANTS,
  CONDITION_LABELS,
  CONDITION_EMOJIS,
  type MaterialReturnNote,
} from "@/lib/api/materials";

export default function MaterialReturnDetailPage() {
  const router = useRouter();
  const params = useParams();
  const returnId = Number(params.id);

  const [mrn, setMrn] = useState<MaterialReturnNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        const data = await getMaterialReturn(returnId);
        setMrn(data);
      } catch (err: any) {
        setError(err.message || "Failed to load MRN");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [returnId]);

  // ============================================
  // DELETE
  // ============================================

  async function handleDelete() {
    if (!mrn) return;
    setDeleting(true);
    try {
      await deleteMaterialReturn(mrn.id);
      router.push("/materials/returns");
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

  if (error || !mrn) {
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

  const items = mrn.items || [];
  const totalQty = items.reduce(
    (sum, it) => sum + (parseFloat(String(it.quantity)) || 0),
    0
  );

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/materials/returns">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/materials/returns/${mrn.id}/print`}>
              <NeoButton
                variant="secondary"
                size="md"
                icon={<Printer className="h-4 w-4" />}
              >
                Print
              </NeoButton>
            </Link>
            <Link href={`/materials/returns/${mrn.id}/edit`}>
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
            <NeoIconBox size="xl" color="text-orange-600" variant="inset">
              <Undo2 className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {mrn.mrn_no}
                </span>
                <NeoBadge
                  variant={RETURN_STATUS_VARIANTS[mrn.status] || "neutral"}
                  size="md"
                >
                  {RETURN_STATUS_EMOJIS[mrn.status]}{" "}
                  {RETURN_STATUS_LABELS[mrn.status]}
                </NeoBadge>
              </div>

              <h1 className="text-2xl font-bold text-slate-800 mb-3">
                Material Return Note
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(mrn.return_date)}
                </span>
                {mrn.issue_no && (
                  <span className="flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Issue: {mrn.issue_no}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">
                Items
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {mrn.item_count || items.length}
              </p>
            </div>
          </div>
        </NeoCard>

        {/* Returned By & Project */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Returned By */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-blue-600">
                <User className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Returned By
                </h2>
                <p className="text-xs text-slate-500">Employee</p>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                Employee Name
              </p>
              <p className="text-base font-bold text-slate-800">
                {mrn.returned_by_name || "—"}
              </p>
              {mrn.returned_by_code && (
                <p className="text-xs text-slate-500 mt-1">
                  Code: {mrn.returned_by_code}
                </p>
              )}
            </div>
          </NeoCard>

          {/* Project */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-green-600">
                <FolderKanban className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Project</h2>
                <p className="text-xs text-slate-500">Linked project</p>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              {mrn.project_name ? (
                <>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Project Name
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {mrn.project_name}
                  </p>
                  {mrn.project_code && (
                    <p className="text-xs text-slate-500 mt-1">
                      {mrn.project_code}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">No project linked</p>
              )}
            </div>
          </NeoCard>
        </div>

        {/* Reason */}
        {mrn.reason && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-4">
              <NeoIconBox size="md" color="text-cyan-600">
                <FileText className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Reason for Return
                </h2>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {mrn.reason}
            </p>
          </NeoCard>
        )}

        {/* Items Table */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-orange-600">
              <Package className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Returned Items ({items.length})
              </h2>
              <p className="text-xs text-slate-500">
                Line-by-line breakdown with condition
              </p>
            </div>
          </div>

          {items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Sl.
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase">
                      Material
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Code
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Quantity
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Unit
                    </th>
                    <th className="p-3 text-xs font-bold text-slate-600 uppercase text-center">
                      Condition
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr
                      key={item.id || idx}
                      className="border-t border-slate-300/40"
                    >
                      <td className="p-3 text-center font-bold text-slate-600">
                        {idx + 1}
                      </td>
                      <td className="p-3 text-slate-800 font-medium">
                        {item.material_name || "—"}
                      </td>
                      <td className="p-3 text-center text-slate-600 text-xs">
                        {item.material_code || "—"}
                      </td>
                      <td className="p-3 text-center font-bold text-orange-600">
                        {item.quantity}
                      </td>
                      <td className="p-3 text-center text-slate-600">
                        {item.unit || "—"}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            item.condition === "good"
                              ? "bg-green-100 text-green-700"
                              : item.condition === "damaged"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {CONDITION_EMOJIS[item.condition || "good"]}{" "}
                          {CONDITION_LABELS[item.condition || "good"]}
                        </span>
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-400/60">
                    <td
                      colSpan={3}
                      className="p-3 text-right font-bold text-slate-700"
                    >
                      Total Quantity:
                    </td>
                    <td className="p-3 text-center font-bold text-orange-700 text-lg">
                      {totalQty}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-sm text-slate-500 py-6">
              No items.
            </p>
          )}
        </NeoCard>

        {/* Remarks */}
        {mrn.remarks && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-4">
              <NeoIconBox size="md" color="text-cyan-600">
                <FileText className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Remarks</h2>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {mrn.remarks}
            </p>
          </NeoCard>
        )}

        {/* Audit */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Created:{" "}
              <strong className="text-slate-700">
                {formatDate(mrn.created_at)}
              </strong>
            </span>
            <span>
              Last Updated:{" "}
              <strong className="text-slate-700">
                {formatDate(mrn.updated_at)}
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
              Delete Return Note?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              This MRN will be deleted:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {mrn.mrn_no}
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