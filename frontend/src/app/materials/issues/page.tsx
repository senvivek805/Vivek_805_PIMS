"use client";

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
  PackageMinus,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Calendar,
  RefreshCw,
  AlertCircle,
  X,
  AlertTriangle,
  Building2,
  User,
  FolderKanban,
  Package,
} from "lucide-react";
import {
  getMaterialIssues,
  deleteMaterialIssue,
  getMaterialIssueStats,
  ISSUE_STATUS_LABELS,
  ISSUE_STATUS_EMOJIS,
  ISSUE_STATUS_VARIANTS,
  type MaterialIssue,
  type MaterialIssueStats,
  type IssueStatus,
} from "@/lib/api/materials";

export default function MaterialIssuesPage() {
  const [issues, setIssues] = useState<MaterialIssue[]>([]);
  const [stats, setStats] = useState<MaterialIssueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "">("");

  const [deleteTarget, setDeleteTarget] = useState<MaterialIssue | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD DATA
  // ============================================

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [data, statsData] = await Promise.all([
        getMaterialIssues({
          search,
          status: statusFilter || undefined,
        }),
        getMaterialIssueStats(),
      ]);
      setIssues(data.results);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load material issues");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

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
      await deleteMaterialIssue(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const draftCount = stats?.draft_issues || 0;
  const issuedCount = stats?.issued_issues || 0;
  const returnedCount = stats?.returned_issues || 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-purple-600">
              <PackageMinus className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Material Issues
              </h1>
              <p className="text-sm text-slate-500">
                Track materials issued to employees
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
            <Link href="/materials/issues/new">
              <NeoButton
                variant="primary"
                size="md"
                icon={<Plus className="h-4 w-4" />}
              >
                New Issue
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Total Issues
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.total_issues}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Draft
              </p>
              <p className="text-3xl font-bold text-slate-600">
                {draftCount}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Issued
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {issuedCount}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Returned
              </p>
              <p className="text-3xl font-bold text-green-600">
                {returnedCount}
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
                  placeholder="Search by issue no, employee, project..."
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
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as IssueStatus | "")
                }
                className="h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">All Status</option>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="returned">Returned</option>
                <option value="cancelled">Cancelled</option>
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

        {/* List */}
        <NeoCard padding="md">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-2xl animate-pulse"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
                }}
              >
                <PackageMinus className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                No material issues found
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {search || statusFilter
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first issue"}
              </p>
              <Link href="/materials/issues/new">
                <NeoButton
                  variant="primary"
                  icon={<Plus className="h-4 w-4" />}
                >
                  Create Material Issue
                </NeoButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className="p-4 rounded-2xl transition-all duration-200 hover:shadow-lg"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <NeoIconBox color="text-purple-600" size="md">
                      <PackageMinus className="h-5 w-5" />
                    </NeoIconBox>

                    <div className="flex-1 min-w-[240px]">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-slate-700">
                          {issue.issue_no}
                        </span>
                        <NeoBadge
                          variant={
                            ISSUE_STATUS_VARIANTS[issue.status] || "neutral"
                          }
                          size="sm"
                        >
                          {ISSUE_STATUS_EMOJIS[issue.status]}{" "}
                          {ISSUE_STATUS_LABELS[issue.status]}
                        </NeoBadge>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {issue.issued_to_name || "—"}
                        </span>
                        {issue.project_code && (
                          <span className="flex items-center gap-1">
                            <FolderKanban className="h-3 w-3" />
                            {issue.project_code}
                          </span>
                        )}
                        {issue.po_number && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {issue.po_number}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(issue.issue_date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package className="h-3 w-3" />
                          {issue.item_count} items
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/materials/issues/${issue.id}`}>
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

                      <Link href={`/materials/issues/${issue.id}/edit`}>
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

                      <button
                        onClick={() => setDeleteTarget(issue)}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </NeoCard>

        {!loading && issues.length > 0 && (
          <p className="text-center text-xs text-slate-500">
            Showing {issues.length} issue{issues.length !== 1 ? "s" : ""}
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
              Delete Material Issue?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              This issue will be deleted:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {deleteTarget.issue_no}
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