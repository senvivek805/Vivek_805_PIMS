"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FolderKanban,
  Landmark,
  FileText,
} from "lucide-react";
import {
  createEmployee,
  EMPLOYEE_TYPE_LABELS,
  MANPOWER_TYPE_LABELS,
  ACCOUNT_TYPE_LABELS,
  type EmployeeCreateUpdate,
  type EmployeeType,
  type ManpowerType,
  type AccountType,
} from "@/lib/api/employees";
import { getProjects, type Project } from "@/lib/api/projects";

export default function NewEmployeePage() {
  const router = useRouter();

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
  // LOAD PROJECTS
  // ============================================

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProjects();
        setProjects(data.results);
      } catch (err: any) {
        setError("Failed to load projects: " + err.message);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    // Validation
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
      const payload: EmployeeCreateUpdate = {
        reference_no: referenceNo || undefined,
        full_name: fullName.trim(),
        designation: designation.trim(),
        department: department || undefined,
        employee_type: employeeType,
        email: email || undefined,
        phone: phone.trim(),
        address: address || undefined,
        joining_date: joiningDate,
        leaving_date: leavingDate || undefined,
        assigned_project: assignedProject || null,
        project_role: projectRole || undefined,
        manpower_type: manpowerType,
        bank_name: bankName || undefined,
        account_number: accountNumber || undefined,
        ifsc_code: ifscCode.toUpperCase() || undefined,
        bank_branch: bankBranch || undefined,
        account_type: accountType || undefined,
        is_active: isActive,
      };

      const created = await createEmployee(payload);
      setSuccess("Employee successfully create ho gaya! 🎉");

      setTimeout(() => {
        router.push(`/employees/${created.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create employee");
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-purple-600">
              <Users className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                New Employee
              </h1>
              <p className="text-sm text-slate-500">
                Register a new faculty / staff member
              </p>
            </div>
          </div>
          <Link href="/employees">
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
              <Users className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Basic Information
              </h2>
              <p className="text-xs text-slate-500">
                Employee ka naam aur designation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <div
                className="p-3 rounded-xl text-xs text-slate-600 flex items-center gap-2"
                style={{
                  background: "rgba(79, 109, 245, 0.08)",
                  borderLeft: "3px solid #4f6df5",
                }}
              >
                <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p>
                  Employee Code <strong>auto-generate</strong> hoga save karne
                  par (EMP-000001)
                </p>
              </div>
            </div>

            <NeoInput
              id="reference_no"
              label="Reference No. (Optional)"
              placeholder="Department code"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />

            <NeoInput
              id="full_name"
              label="Full Name *"
              placeholder="e.g., Dr. Rajesh Kumar"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <NeoInput
              id="designation"
              label="Designation *"
              placeholder="e.g., Assistant Professor"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              required
            />

            <NeoInput
              id="department"
              label="Department"
              placeholder="e.g., Civil Engineering"
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
              placeholder="e.g., 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <NeoInput
              id="email"
              label="Email"
              type="email"
              placeholder="e.g., name@iitbhu.ac.in"
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

        {/* SECTION 4: PROJECT ASSIGNMENT */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-orange-600">
              <FolderKanban className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Project Assignment
              </h2>
              <p className="text-xs text-slate-500">
                Kis project me kaam karega
              </p>
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
                disabled={loadingData}
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
              placeholder="e.g., Research Assistant"
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
              <p className="text-xs text-slate-500">
                Payment ke liye (optional)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="bank_name"
              label="Bank Name"
              placeholder="e.g., State Bank of India"
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
              placeholder="e.g., SBIN0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            />
            <NeoInput
              id="bank_branch"
              label="Bank Branch"
              placeholder="e.g., Varanasi Main"
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
          <Link href="/employees">
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
            {loading ? "Saving..." : "Save Employee"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}