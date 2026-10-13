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
  FolderKanban,
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Building2,
  GraduationCap,
  Calendar,
  IndianRupee,
  Mail,
  Phone,
  Clock,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  FileText,
} from "lucide-react";
import {
  getProject,
  deleteProject,
  type Project,
  type ProjectPI,
} from "@/lib/api/projects";

export default function ProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.id);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!projectId || isNaN(projectId)) {
        setError("Invalid project ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getProject(projectId);
        setProject(data);
      } catch (err: any) {
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [projectId]);

  // ============================================
  // DELETE
  // ============================================

  async function handleDelete() {
    if (!project) return;
    setDeleting(true);
    try {
      await deleteProject(project.id);
      router.push("/projects");
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
      setDeleting(false);
    }
  }

  // ============================================
  // CONFIG
  // ============================================

  const statusConfig: Record<string, { label: string; variant: any; emoji: string }> = {
    active: { label: "Active", variant: "success", emoji: "🟢" },
    completed: { label: "Completed", variant: "primary", emoji: "🔵" },
    on_hold: { label: "On Hold", variant: "warning", emoji: "🟠" },
    cancelled: { label: "Cancelled", variant: "danger", emoji: "🔴" },
    pending: { label: "Pending", variant: "info", emoji: "🟡" },
  };

  const roleConfig: Record<string, { label: string; color: string; emoji: string }> = {
    pi: { label: "Principal Investigator", color: "text-blue-600", emoji: "🎯" },
    co_pi: { label: "Co-PI", color: "text-green-600", emoji: "👥" },
    coordinator: { label: "Coordinator", color: "text-orange-600", emoji: "🎯" },
    mentor: { label: "Mentor", color: "text-purple-600", emoji: "⭐" },
    investigator: { label: "Investigator", color: "text-cyan-600", emoji: "🔬" },
  };

  function formatCurrency(amount: string | number | undefined) {
    if (!amount) return "—";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return `₹${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
  }

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading project...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Project not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/projects">
              <NeoButton variant="primary" icon={<ArrowLeft className="h-4 w-4" />}>
                Back to Projects
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  const status = statusConfig[project.status] || {
    label: project.status,
    variant: "neutral",
    emoji: "⚪",
  };

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">

        {/* ============================================
            HEADER — Back + Actions
            ============================================ */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/projects">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/projects/${project.id}/edit`}>
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

        {/* ============================================
            HERO — Project Title Card
            ============================================ */}
        <NeoCard>
          <div className="flex flex-wrap items-start gap-5">
            <NeoIconBox size="xl" color="text-blue-600" variant="inset">
              <FolderKanban className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-500 tracking-wide">
                  {project.project_code}
                </span>
                <NeoBadge variant={status.variant} size="md">
                  {status.emoji} {status.label}
                </NeoBadge>
              </div>

              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                {project.project_name}
              </h1>

              {project.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200/40">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Sanctioned Amount
                </p>
              </div>
              <p className="text-2xl font-bold text-slate-800">
                {formatCurrency(project.sanctioned_amount)}
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
                <Calendar className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Start Date
                </p>
              </div>
              <p className="text-lg font-bold text-slate-800">
                {formatDate(project.start_date)}
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
                <Clock className="h-4 w-4 text-purple-600" />
                <p className="text-xs font-bold text-slate-500 uppercase">
                  End Date
                </p>
              </div>
              <p className="text-lg font-bold text-slate-800">
                {formatDate(project.end_date)}
              </p>
            </div>
          </div>
        </NeoCard>

        {/* ============================================
            ORGANIZATION
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-green-600">
              <Building2 className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Funding & Organization
              </h2>
              <p className="text-xs text-slate-500">
                Agency and department details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-green-600" />
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Funding Agency
                </p>
              </div>
              <p className="text-base font-bold text-slate-800">
                {project.agency_name || "—"}
              </p>
              {project.agency_code && (
                <p className="text-xs text-slate-500 mt-1">
                  Code: {project.agency_code}
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
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <p className="text-xs font-bold text-slate-500 uppercase">
                  Department
                </p>
              </div>
              <p className="text-base font-bold text-slate-800">
                {project.department_name || "—"}
              </p>
              {project.department_code && (
                <p className="text-xs text-slate-500 mt-1">
                  Code: {project.department_code}
                </p>
              )}
            </div>
          </div>
        </NeoCard>

        {/* ============================================
            PIs / CO-PIs
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-orange-600">
              <User className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                PIs / Co-PIs / Coordinators
              </h2>
              <p className="text-xs text-slate-500">
                People involved in this project
              </p>
            </div>
          </div>

          {/* PIs from new model */}
          {project.pis && project.pis.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.pis.map((pi: ProjectPI) => {
                const role = roleConfig[pi.role] || {
                  label: pi.role,
                  color: "text-slate-600",
                  emoji: "👤",
                };

                return (
                  <div
                    key={pi.id}
                    className="p-4 rounded-2xl"
                    style={{
                      background: "#e0e5ec",
                      boxShadow:
                        "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                    }}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center text-lg font-bold flex-shrink-0"
                        style={{
                          background: "linear-gradient(135deg, #4f6df5 0%, #6366f1 100%)",
                          color: "#ffffff",
                        }}
                      >
                        {pi.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {pi.name}
                        </p>
                        <p className={`text-xs font-semibold ${role.color} mt-0.5`}>
                          {role.emoji} {role.label}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600">
                      {pi.designation && (
                        <p className="flex items-center gap-2">
                          <GraduationCap className="h-3 w-3 text-slate-400" />
                          {pi.designation}
                        </p>
                      )}
                      {pi.department && (
                        <p className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-slate-400" />
                          {pi.department}
                        </p>
                      )}
                      {pi.email && (
                        <p className="flex items-center gap-2 truncate">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <a
                            href={`mailto:${pi.email}`}
                            className="hover:text-blue-600 truncate"
                          >
                            {pi.email}
                          </a>
                        </p>
                      )}
                      {pi.phone && (
                        <p className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-slate-400" />
                          {pi.phone}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Fallback to legacy fields
            <div className="space-y-3">
              {project.pi_name && (
                <div
                  className="p-4 rounded-2xl flex items-center gap-3"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{project.pi_name}</p>
                    <p className="text-xs text-blue-600 font-semibold">
                      🎯 Principal Investigator
                    </p>
                  </div>
                </div>
              )}
              {project.co_pi_name && (
                <div
                  className="p-4 rounded-2xl flex items-center gap-3"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{project.co_pi_name}</p>
                    <p className="text-xs text-green-600 font-semibold">
                      👥 Co-PI
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </NeoCard>

        {/* ============================================
            REMARKS
            ============================================ */}
        {project.remarks && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-4">
              <NeoIconBox size="md" color="text-purple-600">
                <FileText className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Remarks</h2>
                <p className="text-xs text-slate-500">
                  Additional notes
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {project.remarks}
            </p>
          </NeoCard>
        )}

        {/* ============================================
            TIMESTAMPS
            ============================================ */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Created:{" "}
              <strong className="text-slate-700">
                {formatDate(project.created_at)}
              </strong>
            </span>
            <span>
              Last Updated:{" "}
              <strong className="text-slate-700">
                {formatDate(project.updated_at)}
              </strong>
            </span>
          </div>
        </NeoCard>

      </div>

      {/* ============================================
          DELETE MODAL
          ============================================ */}
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
              Delete Project?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              Ye project delete ho jayega:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {project.project_name}
            </p>

            <div
              className="p-3 rounded-xl mb-6 text-xs text-red-600 flex items-start gap-2"
              style={{ background: "rgba(239, 68, 68, 0.08)" }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>Soft delete — data database me safe rahega.</p>
            </div>

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