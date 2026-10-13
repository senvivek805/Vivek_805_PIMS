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
  Users,
  ArrowLeft,
  Pencil,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FolderKanban,
  Landmark,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Building2,
} from "lucide-react";
import {
  getEmployee,
  deleteEmployee,
  EMPLOYEE_TYPE_LABELS,
  EMPLOYEE_TYPE_EMOJIS,
  MANPOWER_TYPE_LABELS,
  ACCOUNT_TYPE_LABELS,
  type Employee,
} from "@/lib/api/employees";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = Number(params.id);

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      if (!employeeId || isNaN(employeeId)) {
        setError("Invalid employee ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getEmployee(employeeId);
        setEmployee(data);
      } catch (err: any) {
        setError(err.message || "Failed to load employee");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [employeeId]);

  async function handleDelete() {
    if (!employee) return;
    setDeleting(true);
    try {
      await deleteEmployee(employee.id);
      router.push("/employees");
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
      setDeleting(false);
    }
  }

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading employee...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !employee) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Employee not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/employees">
              <NeoButton variant="primary" icon={<ArrowLeft className="h-4 w-4" />}>
                Back to Employees
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  const typeEmoji = EMPLOYEE_TYPE_EMOJIS[employee.employee_type] || "👤";
  const typeLabel =
    employee.employee_type_display ||
    EMPLOYEE_TYPE_LABELS[employee.employee_type];
  const manpowerLabel =
    employee.manpower_type_display ||
    MANPOWER_TYPE_LABELS[employee.manpower_type];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/employees">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/employees/${employee.id}/edit`}>
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

        <NeoCard>
          <div className="flex flex-wrap items-start gap-5">
            <NeoIconBox size="xl" color="text-purple-600" variant="inset">
              <Users className="h-8 w-8" />
            </NeoIconBox>
            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-500 tracking-wide">
                  {employee.employee_code}
                </span>
                {employee.reference_no && (
                  <span className="text-xs text-slate-400">
                    Ref: {employee.reference_no}
                  </span>
                )}
                <NeoBadge variant="primary" size="md">
                  {typeEmoji} {typeLabel}
                </NeoBadge>
                {employee.is_active ? (
                  <NeoBadge variant="success" size="md">
                    ✅ Active
                  </NeoBadge>
                ) : (
                  <NeoBadge variant="warning" size="md">
                    ⚠️ Inactive
                  </NeoBadge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                {employee.full_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {employee.designation}
                </span>
                {employee.department && (
                  <span className="flex items-center gap-1">
                    🎓 {employee.department}
                  </span>
                )}
              </div>
            </div>
          </div>
        </NeoCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-green-600">
                <Phone className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Contact</h2>
                <p className="text-xs text-slate-500">Contact details</p>
              </div>
            </div>
            <div className="space-y-4">
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4 text-green-600" />
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Phone
                  </p>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {employee.phone}
                </p>
              </div>
              {employee.email && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      Email
                    </p>
                  </div>
                  <a
                    href={`mailto:${employee.email}`}
                    className="text-base font-bold text-blue-600 hover:underline break-all"
                  >
                    {employee.email}
                  </a>
                </div>
              )}
              {employee.address && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-orange-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      Address
                    </p>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed">
                    {employee.address}
                  </p>
                </div>
              )}
            </div>
          </NeoCard>

          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-cyan-600">
                <Calendar className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Dates</h2>
                <p className="text-xs text-slate-500">Joining aur leaving</p>
              </div>
            </div>
            <div className="space-y-4">
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Joining Date
                  </p>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {formatDate(employee.joining_date)}
                </p>
              </div>
              {employee.leaving_date && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-red-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      Leaving Date
                    </p>
                  </div>
                  <p className="text-base font-bold text-slate-800">
                    {formatDate(employee.leaving_date)}
                  </p>
                </div>
              )}
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-purple-600" />
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Manpower Type
                  </p>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {manpowerLabel}
                </p>
              </div>
            </div>
          </NeoCard>
        </div>

        {employee.assigned_project_name && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-blue-600">
                <FolderKanban className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Project Assignment
                </h2>
                <p className="text-xs text-slate-500">
                  Kis project me kaam kar raha hai
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                href={`/projects/${employee.assigned_project}`}
                className="md:col-span-2"
              >
                <div
                  className="p-4 rounded-2xl transition-all hover:shadow-lg cursor-pointer"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FolderKanban className="h-4 w-4 text-blue-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      Assigned Project
                    </p>
                  </div>
                  <p className="text-base font-bold text-slate-800">
                    {employee.assigned_project_name}
                  </p>
                  {employee.assigned_project_code && (
                    <p className="text-xs text-slate-500 mt-1">
                      {employee.assigned_project_code}
                    </p>
                  )}
                </div>
              </Link>
              {employee.project_role && (
                <div
                  className="p-4 rounded-2xl md:col-span-2"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Role in Project
                  </p>
                  <p className="text-base font-bold text-slate-800">
                    {employee.project_role}
                  </p>
                </div>
              )}
            </div>
          </NeoCard>
        )}

        {(employee.bank_name ||
          employee.account_number ||
          employee.ifsc_code) && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-cyan-600">
                <Landmark className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Bank Details
                </h2>
                <p className="text-xs text-slate-500">Payment info</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {employee.bank_name && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Bank Name
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {employee.bank_name}
                  </p>
                </div>
              )}
              {employee.account_number && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Account Number
                  </p>
                  <p className="text-sm font-bold text-slate-800 font-mono break-all">
                    {employee.account_number}
                  </p>
                </div>
              )}
              {employee.ifsc_code && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    IFSC Code
                  </p>
                  <p className="text-sm font-bold text-slate-800 font-mono">
                    {employee.ifsc_code}
                  </p>
                </div>
              )}
              {employee.bank_branch && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Bank Branch
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {employee.bank_branch}
                  </p>
                </div>
              )}
              {employee.account_type && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Account Type
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {employee.account_type_display ||
                      ACCOUNT_TYPE_LABELS[employee.account_type]}
                  </p>
                </div>
              )}
            </div>
          </NeoCard>
        )}

        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Created:{" "}
              <strong className="text-slate-700">
                {formatDate(employee.created_at)}
              </strong>
            </span>
            <span>
              Last Updated:{" "}
              <strong className="text-slate-700">
                {formatDate(employee.updated_at)}
              </strong>
            </span>
          </div>
        </NeoCard>
      </div>

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
              Delete Employee?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              Ye employee delete ho jayega:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {employee.full_name}
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