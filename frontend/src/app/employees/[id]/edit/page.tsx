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
  Users,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FolderKanban,
  Landmark,
  FileText,
  Loader2,
} from "lucide-react";
import {
  getEmployee,
  updateEmployee,
  EMPLOYEE_TYPE_LABELS,
  MANPOWER_TYPE_LABELS,
  ACCOUNT_TYPE_LABELS,
  type EmployeeCreateUpdate,
  type EmployeeType,
  type ManpowerType,
  type AccountType,
} from "@/lib/api/employees";
import { getProjects, type Project } from "@/lib/api/projects";

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = Number(params.id);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Basic
  const [referenceNo, setReferenceNo] = useState("");
  const [fullName, setFullName] = useState("");
  const [designation, setDesignation] = useState("");
  const [department, setDepartment] = useState("");
  const [employeeType, setEmployeeType] = useState<EmployeeType>("staff");

  // Contact
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Dates
  const [joiningDate, setJoiningDate] = useState("");
  const [leavingDate, setLeavingDate] = useState("");

  // Project
  const [assignedProject, setAssignedProject] = useState<number | "">("");
  const [projectRole, setProjectRole] = useState("");
  const [manpowerType, setManpowerType] = useState<ManpowerType>("full_time");

  // Bank
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [accountType, setAccountType] = useState<AccountType | "">("");

  // Status
  const [isActive, setIsActive] = useState(true);

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!employeeId || isNaN(employeeId)) {
        setError("Invalid employee ID");
        setLoadingData(false);
        return;
      }
      try {
        const [employee, projectsData] = await Promise.all([
          getEmployee(employeeId),
          getProjects(),
        ]);

        setReferenceNo(employee.reference_no || "");
        setFullName(employee.full_name);
        setDesignation(employee.designation);
        setDepartment(employee.department || "");
        setEmployeeType(employee.employee_type);
        setEmail(employee.email || "");
        setPhone(employee.phone);
        setAddress(employee.address || "");
        setJoiningDate(employee.joining_date || "");
        setLeavingDate(employee.leaving_date || "");
        setAssignedProject(employee.assigned_project || "");
        setProjectRole(employee.project_role || "");
        setManpowerType(employee.manpower_type);
        setBankName(employee.bank_name || "");
        setAccountNumber(employee.account_number || "");
        setIfscCode(employee.ifsc_code || "");
        setBankBranch(employee.bank_branch || "");
        setAccountType(employee.account_type || "");
        setIsActive(employee.is_active);

        setProjects(projectsData.results);
      } catch (err: any) {
        setError(err.message || "Failed to load employee");
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [employeeId]);

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Full Name zaroori hai.");
      return;
    }
    if (!designation.trim()) {
      setError("Designation zaroori hai.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone zaroori hai.");
      return;
    }
    if (!joiningDate) {
      setError("Joining Date zaroori hai.");
      return;
    }
    if (joiningDate && leavingDate && leavingDate < joiningDate) {
      setError("Leaving date joining date se pehle nahi ho sakti.");
      return;
    }
    if (ifscCode && ifscCode.length !== 11) {
      setError("IFSC code 11 characters ka hona chahiye.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        reference_no: referenceNo || null,
        full_name: fullName.trim(),
        designation: designation.trim(),
        department: department || null,
        employee_type: employeeType,
        email: email || null,
        phone: phone.trim(),
        address: address || null,
        joining_date: joiningDate,
        leaving_date: leavingDate ? leavingDate : null,
        assigned_project: assignedProject || null,
        project_role: projectRole || null,
        manpower_type: manpowerType,
        bank_name: bankName || null,
        account_number: accountNumber || null,
        ifsc_code: ifscCode.toUpperCase() || null,
        bank_branch: bankBranch || null,
        account_type: accountType || null,
        is_active: isActive,
      };

      await updateEmployee(employeeId, payload);
      setSuccess("Employee successfully update ho gaya! 🎉");

      setTimeout(() => {
        router.push(`/employees/${employeeId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update employee");
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
          <Loader2 className="h-10 w-10 text-purple-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading employee...</p>
        </div>
      </AppLayout>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-orange-600">
              <Users className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Edit Employee
              </h1>
              <p className="text-sm text-slate-500">
                Update employee details
              </p>
            </div>
          </div>
          <Link href={`/employees/${employeeId}`}>
            <NeoButton
              variant="secondary"
              size="md"
              icon={<X className="h-4 w-4" />}
            >
              Cancel
            </NeoButton>
          </Link>
        </div>

        {error && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {success && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          </NeoCard>
        )}

        {/* SECTION 1: BASIC */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <Users className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Basic Information
              </h2>
              <p className="text-xs text-slate-500">Employee details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="reference_no"
              label="Reference No."
              placeholder="Department code"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />
            <NeoInput
              id="full_name"
              label="Full Name *"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <NeoInput
              id="designation"
              label="Designation *"
              placeholder="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />
            <NeoInput
              id="department"
              label="Department"
              placeholder="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Employee Type *
              </label>
              <select
                value={employeeType}
                onChange={(e) =>
                  setEmployeeType(e.target.value as EmployeeType)
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {Object.entries(EMPLOYEE_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </NeoCard>

        {/* SECTION 2: CONTACT */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-green-600">
              <Phone className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Contact</h2>
              <p className="text-xs text-slate-500">Contact details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="phone"
              label="Phone *"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <NeoInput
              id="email"
              label="Email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="md:col-span-2">
              <NeoInput
                id="address"
                label="Address"
                placeholder="Full address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>
        </NeoCard>

        {/* SECTION 3: DATES */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-cyan-600">
              <Calendar className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Dates</h2>
              <p className="text-xs text-slate-500">Joining aur leaving</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="joining_date"
              label="Joining Date *"
              type="date"
              value={joiningDate}
              onChange={(e) => setJoiningDate(e.target.value)}
              required
            />
            <NeoInput
              id="leaving_date"
              label="Leaving Date"
              type="date"
              value={leavingDate}
              onChange={(e) => setLeavingDate(e.target.value)}
            />
          </div>
        </NeoCard>

        {/* SECTION 4: PROJECT */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-orange-600">
              <FolderKanban className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Project Assignment
              </h2>
              <p className="text-xs text-slate-500">Project details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Assigned Project
              </label>
              <select
                value={assignedProject}
                onChange={(e) =>
                  setAssignedProject(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">Select Project (Optional)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.project_code} — {p.project_name}
                  </option>
                ))}
              </select>
            </div>

            <NeoInput
              id="project_role"
              label="Role in Project"
              placeholder="Role"
              value={projectRole}
              onChange={(e) => setProjectRole(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Manpower Type *
              </label>
              <select
                value={manpowerType}
                onChange={(e) =>
                  setManpowerType(e.target.value as ManpowerType)
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {Object.entries(MANPOWER_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </NeoCard>

        {/* SECTION 5: BANK */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-cyan-600">
              <Landmark className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Bank Details
              </h2>
              <p className="text-xs text-slate-500">Optional</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="bank_name"
              label="Bank Name"
              placeholder="Bank name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
            <NeoInput
              id="account_number"
              label="Account Number"
              placeholder="Account number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
            <NeoInput
              id="ifsc_code"
              label="IFSC Code"
              placeholder="IFSC"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            />
            <NeoInput
              id="bank_branch"
              label="Bank Branch"
              placeholder="Branch"
              value={bankBranch}
              onChange={(e) => setBankBranch(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) =>
                  setAccountType(e.target.value as AccountType | "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">Select Account Type</option>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </NeoCard>

        {/* SECTION 6: STATUS */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-purple-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Status</h2>
              <p className="text-xs text-slate-500">Employee active status</p>
            </div>
          </div>

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
              Employee is Active
            </label>
          </div>
        </NeoCard>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href={`/employees/${employeeId}`}>
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
            {loading ? "Updating..." : "Update Employee"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}