"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoBadge, NeoIconBox } from "@/components/neumorphism";
import {
  FolderKanban,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Filter,
  IndianRupee,
  Calendar,
  User,
  RefreshCw,
  AlertCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getProjects,
  deleteProject,
  getProjectStats,
  type Project,
  type ProjectStats,
} from "@/lib/api/projects";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD DATA
  // ============================================

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [projectsData, statsData] = await Promise.all([
        getProjects({ search, status: statusFilter }),
        getProjectStats(),
      ]);
      setProjects(projectsData.results);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // ============================================
  // DELETE
  // ============================================

  function openDeleteModal(project: Project) {
    setDeleteTarget(project);
  }

  function closeDeleteModal() {
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteProject(deleteTarget.id);
      closeDeleteModal();
      await loadData();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
    }
  }

  // ============================================
  // STATUS CONFIG
  // ============================================

  const statusConfig: Record<string, { label: string; variant: any }> = {
    active: { label: "Active", variant: "success" },
    completed: { label: "Completed", variant: "primary" },
    on_hold: { label: "On Hold", variant: "warning" },
    cancelled: { label: "Cancelled", variant: "danger" },
    pending: { label: "Pending", variant: "info" },
  };

  // ============================================
  // FORMATTERS
  // ============================================

  function formatCurrency(amount: string | number) {
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-blue-600">
              <FolderKanban className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Projects</h1>
              <p className="text-sm text-slate-500">
                Manage all your research and development projects
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NeoButton
              variant="secondary"
              size="md"
              onClick={loadData}
              icon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </NeoButton>
            <Link href="/projects/new">
              <NeoButton
                variant="primary"
                size="md"
                icon={<Plus className="h-4 w-4" />}
              >
                New Project
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Total Projects
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.total_projects}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Active
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.active_projects}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Completed
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.completed_projects}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Total Sanctioned
              </p>
              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(stats.total_sanctioned_amount)}
              </p>
            </NeoCard>
          </div>
        )}

        {/* Search + Filter Bar */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px]">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                <input
                  type="text"
                  placeholder="Search by project name, code, or PI..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 placeholder:text-slate-400 border-0 outline-none"
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
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </NeoCard>

        {/* Error */}
        {error && (
          <NeoCard>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {/* Projects List */}
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
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
                }}
              >
                <FolderKanban className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                No projects found
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {search || statusFilter
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first project"}
              </p>
              <Link href="/projects/new">
                <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>
                  Create Project
                </NeoButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => {
                const status = statusConfig[project.status] || {
                  label: project.status,
                  variant: "neutral",
                };

                return (
                  <div
                    key={project.id}
                    className="p-4 rounded-2xl transition-all duration-200 hover:shadow-lg"
                    style={{
                      background: "#e0e5ec",
                      boxShadow:
                        "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                    }}
                  >
                    <div className="flex flex-wrap items-start gap-4">
                      <NeoIconBox color="text-blue-600" size="md">
                        <FolderKanban className="h-5 w-5" />
                      </NeoIconBox>

                      <div className="flex-1 min-w-[240px]">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-500">
                            {project.project_code}
                          </span>
                          <NeoBadge variant={status.variant} size="sm">
                            {status.label}
                          </NeoBadge>
                        </div>
                        <h3 className="font-bold text-slate-800 mb-1">
                          {project.project_name}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            PI: {project.pi_name}
                          </span>
                          {project.agency_name && (
                            <span className="flex items-center gap-1">
                              🏛️ {project.agency_name}
                            </span>
                          )}
                          {project.department_name && (
                            <span className="flex items-center gap-1">
                              🎓 {project.department_name}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-xs">
                        <div>
                          <p className="text-slate-500 mb-0.5">Amount</p>
                          <p className="font-bold text-slate-800 flex items-center gap-1">
                            <IndianRupee className="h-3 w-3" />
                            {formatCurrency(project.sanctioned_amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-0.5">Start</p>
                          <p className="font-semibold text-slate-700 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(project.start_date)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Link href={`/projects/${project.id}`}>
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

                        <Link href={`/projects/${project.id}/edit`}>
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
                          onClick={() => openDeleteModal(project)}
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
                );
              })}
            </div>
          )}
        </NeoCard>

        {/* Footer Info */}
        {!loading && projects.length > 0 && (
          <p className="text-center text-xs text-slate-500">
            Showing {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* ============================================
          DELETE CONFIRMATION MODAL
          ============================================ */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >
          <div
            className="w-full max-w-md p-6 rounded-3xl"
            style={{
              background: "#e0e5ec",
              boxShadow: "20px 20px 60px rgba(0,0,0,0.3), -10px -10px 30px rgba(255,255,255,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
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

            {/* Title */}
            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
              Delete Project?
            </h2>

            {/* Message */}
            <p className="text-sm text-slate-600 text-center mb-1">
              Ye project delete ho jayega:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-1">
              {deleteTarget.project_name}
            </p>
            <p className="text-xs text-slate-500 text-center mb-6">
              Code: {deleteTarget.project_code}
            </p>

            {/* Warning */}
            <div
              className="p-3 rounded-xl mb-6 text-xs text-red-600 flex items-start gap-2"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
              }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>
                Ye action reversible hai (soft delete) — data database me safe rahega.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl font-bold text-sm text-slate-700 transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
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
                className="flex-1 h-11 rounded-xl font-bold text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  boxShadow:
                    "4px 4px 12px #b8bcc2, -4px -4px 12px #ffffff, inset 0 1px 0 rgba(255,255,255,0.2)",
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