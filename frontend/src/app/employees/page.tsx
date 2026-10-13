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
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  Filter,
  Mail,
  Phone,
  Building2,
  FolderKanban,
  RefreshCw,
  AlertCircle,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getEmployees,
  deleteEmployee,
  getEmployeeStats,
  EMPLOYEE_TYPE_LABELS,
  EMPLOYEE_TYPE_EMOJIS,
  MANPOWER_TYPE_LABELS,
  type Employee,
  type EmployeeStats,
  type EmployeeType,
} from "@/lib/api/employees";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [stats, setStats] = useState<EmployeeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<EmployeeType | "">("");

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD
  // ============================================

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [empData, statsData] = await Promise.all([
        getEmployees({
          search,
          employee_type: typeFilter || undefined,
        }),
        getEmployeeStats(),
      ]);
      setEmployees(empData.results);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [typeFilter]);

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
      await deleteEmployee(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    } finally {
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
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-purple-600">
              <Users className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
              <p className="text-sm text-slate-500">
                Manage faculty, staff, JRF, SRF, project staff
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
            <Link href="/employees/new">
              <NeoButton
                variant="primary"
                size="md"
                icon={<Plus className="h-4 w-4" />}
              >
                New Employee
              </NeoButton>
            </Link>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Total Employees
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {stats.total_employees}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Active
              </p>
              <p className="text-3xl font-bold text-green-600">
                {stats.active_employees}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Inactive
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.inactive_employees}
              </p>
            </NeoCard>

            <NeoCard hover>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                Employee Types
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.type_wise.length}
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
                  placeholder="Search by name, code, designation..."
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
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as EmployeeType | "")
                }
                className="h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">All Types</option>
                {Object.entries(EMPLOYEE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
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
          ) : employees.length === 0 ? (
            <div className="text-center py-16">
              <div
                className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff",
                }}
              >
                <Users className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                No employees found
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {search || typeFilter
                  ? "Try adjusting filters"
                  : "Add your first employee"}
              </p>
              <Link href="/employees/new">
                <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>
                  Add Employee
                </NeoButton>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="p-4 rounded-2xl transition-all hover:shadow-lg"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    <NeoIconBox color="text-purple-600" size="md">
                      <Users className="h-5 w-5" />
                    </NeoIconBox>

                    <div className="flex-1 min-w-[240px]">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500">
                          {emp.employee_code}
                        </span>
                        <NeoBadge variant="primary" size="sm">
                          {EMPLOYEE_TYPE_EMOJIS[emp.employee_type]}{" "}
                          {emp.employee_type_display ||
                            EMPLOYEE_TYPE_LABELS[emp.employee_type]}
                        </NeoBadge>
                        <NeoBadge variant="info" size="sm">
                          {emp.manpower_type_display ||
                            MANPOWER_TYPE_LABELS[emp.manpower_type]}
                        </NeoBadge>
                        {!emp.is_active && (
                          <NeoBadge variant="warning" size="sm">
                            Inactive
                          </NeoBadge>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-800 mb-1">
                        {emp.full_name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {emp.designation}
                        </span>
                        {emp.department && (
                          <span className="flex items-center gap-1">
                            🎓 {emp.department}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {emp.phone}
                        </span>
                      </div>
                      {emp.assigned_project_name && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                          <FolderKanban className="h-3 w-3" />
                          {emp.assigned_project_name}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/employees/${emp.id}`}>
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
                      <Link href={`/employees/${emp.id}/edit`}>
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
                        onClick={() => setDeleteTarget(emp)}
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

        {!loading && employees.length > 0 && (
          <p className="text-center text-xs text-slate-500">
            Showing {employees.length} employee
            {employees.length !== 1 ? "s" : ""}
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
              Delete Employee?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              Ye employee delete ho jayega:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {deleteTarget.full_name}
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