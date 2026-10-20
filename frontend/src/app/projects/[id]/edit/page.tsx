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
  NeoInput,
} from "@/components/neumorphism";
import {
  FolderKanban,
  Save,
  X,
  Plus,
  Trash2,
  UserPlus,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getProject,
  updateProject,
  getAgencies,
  getDepartments,
  type Agency,
  type Department,
  type PIRole,
} from "@/lib/api/projects";
import { getBudgetHeads, type BudgetHead } from "@/lib/api/funds";
import { getProjectSanctionedHeads, saveProjectSanctionedHeads } from "@/lib/api/projectSanction";

interface PIRow {
  id: string;
  name: string;
  role: PIRole;
  designation: string;
  email: string;
  phone: string;
  department: string;
  order: number;
}

function generatePIId() {
  return `pi-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = Number(params.id);

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [headsList, setHeadsList] = useState<BudgetHead[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [projectCode, setProjectCode] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [agencyId, setAgencyId] = useState<number | "">("");
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [sanctionedAmount, setSanctionedAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [remarks, setRemarks] = useState("");

  const [pis, setPis] = useState<PIRow[]>([]);
  const [allocations, setAllocations] = useState<{ budget_head: string; sanctioned_amount: string }[]>([]);

  // ============================================
  // LOAD DATA
  // ============================================
  useEffect(() => {
    async function loadData() {
      try {
        const [projData, agenciesData, departmentsData, headsData, sanctionsData] = await Promise.all([
          getProject(projectId),
          getAgencies(),
          getDepartments(),
          getBudgetHeads(),
          getProjectSanctionedHeads(projectId).catch(() => []) // Catch if no heads exist yet
        ]);

        setAgencies(agenciesData);
        setDepartments(departmentsData);
        setHeadsList(headsData || []);

        // Populate form
        setProjectCode(projData.project_code || "");
        setProjectName(projData.project_name || "");
        setDescription(projData.description || "");
        setAgencyId(projData.agency || "");
        setDepartmentId(projData.department || "");
        // Fallback to sanctioned_amount if total_sanctioned_amount is 0
        // Exact Fallback logic
        const fetchTotal = Number(projData.total_sanctioned_amount);
        const fetchSanctioned = Number(projData.sanctioned_amount);
        const correctAmount = fetchTotal > 0 ? fetchTotal : fetchSanctioned;
        setSanctionedAmount(correctAmount > 0 ? String(correctAmount) : "");
        setStartDate(projData.start_date || "");
        setEndDate(projData.end_date || "");
        setStatus(projData.status || "active");
        setRemarks(projData.remarks || "");

        if (projData.pis && projData.pis.length > 0) {
          setPis(projData.pis.map((p: any) => ({
            id: `pi-${p.id}`,
            name: p.name,
            role: p.role,
            designation: p.designation || "",
            email: p.email || "",
            phone: p.phone || "",
            department: p.department || "",
            order: p.order || 1,
          })));
        } else {
          setPis([{ id: "pi-initial", name: "", role: "pi", designation: "", email: "", phone: "", department: "", order: 1 }]);
        }

        if (sanctionsData && sanctionsData.length > 0) {
          setAllocations(sanctionsData.map(s => ({
            budget_head: String(s.budget_head),
            sanctioned_amount: String(s.sanctioned_amount)
          })));
        } else {
          setAllocations([{ budget_head: "", sanctioned_amount: "" }]);
        }

      } catch (err: any) {
        setError(err.message || "Failed to load project data");
      } finally {
        setLoading(false);
      }
    }
    if (projectId) loadData();
  }, [projectId]);

  // ============================================
  // HANDLERS
  // ============================================

  function addPIRow() {
    setPis([...pis, { id: generatePIId(), name: "", role: "co_pi", designation: "", email: "", phone: "", department: "", order: pis.length + 1 }]);
  }

  function removePIRow(id: string) {
    if (pis.length === 1) return alert("Kam se kam ek PI hona chahiye.");
    setPis(pis.filter(p => p.id !== id).map((p, i) => ({ ...p, order: i + 1 })));
  }

  function updatePIRow(id: string, field: keyof PIRow, value: any) {
    setPis(pis.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  const handleAddHead = () => setAllocations([...allocations, { budget_head: "", sanctioned_amount: "" }]);
  const handleRemoveHead = (index: number) => {
    const newAllocations = [...allocations];
    newAllocations.splice(index, 1);
    setAllocations(newAllocations);
  };
  const handleAllocationChange = (index: number, field: "budget_head" | "sanctioned_amount", value: string) => {
    const newAllocations = [...allocations];
    newAllocations[index][field] = value;
    setAllocations(newAllocations);
  };

  const totalAllocated = allocations.reduce((sum, item) => sum + (Number(item.sanctioned_amount) || 0), 0);

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const validPIs = pis.filter((p) => p.name.trim());
      if (validPIs.length === 0) throw new Error("Kam se kam ek PI ka naam zaroori hai.");

      const payload = {
        project_code: projectCode.toUpperCase(),
        project_name: projectName,
        description: description,
        agency: agencyId || null,
        department: departmentId || null,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        sanctioned_amount: parseFloat(sanctionedAmount),
        total_sanctioned_amount: parseFloat(sanctionedAmount),
        status: status,
        remarks: remarks,
        pi_name: validPIs.find((p) => p.role === "pi")?.name || validPIs[0].name,
        pis: validPIs.map((p, index) => ({
          name: p.name,
          role: p.role,
          designation: p.designation,
          email: p.email,
          phone: p.phone,
          department: p.department,
          order: index + 1,
        })),
      };

      // 1. Update Project
      await updateProject(projectId, payload);
      
      // 2. Save Sanctioned Heads
      const validHeads = allocations
        .filter(a => a.budget_head && Number(a.sanctioned_amount) > 0)
        .map(a => ({
          budget_head: Number(a.budget_head),
          sanctioned_amount: Number(a.sanctioned_amount)
        }));

      if (validHeads.length > 0) {
        await saveProjectSanctionedHeads(projectId, validHeads);
      }

      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message || "Failed to update project");
      setSaving(false);
    }
  }

  const roleOptions: { value: PIRole; label: string }[] = [
    { value: "pi", label: "🎯 Principal Investigator" },
    { value: "co_pi", label: "👥 Co-PI" },
    { value: "coordinator", label: "🎯 Coordinator" },
    { value: "mentor", label: "⭐ Mentor" },
    { value: "investigator", label: "🔬 Investigator" },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-amber-600">
              <FolderKanban className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Edit Project</h1>
              <p className="text-sm text-slate-500">Update project details and allocations</p>
            </div>
          </div>
          <Link href={`/projects/${projectId}`}>
            <NeoButton variant="secondary" size="md" icon={<X className="h-4 w-4" />}>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* SECTION 1: PROJECT INFO */}
          <NeoCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <NeoInput
                label="Project Code *"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                required
              />
              <NeoInput
                label="Project Name *"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
              <div className="md:col-span-2">
                <NeoInput
                  label="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </NeoCard>

          {/* SECTION 2: FUNDING */}
          <NeoCard>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Funding Agency with + Button */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium text-xs pl-2">Funding Agency</label>
                <div className="flex gap-2">
                  <select
                    value={agencyId}
                    onChange={(e) => setAgencyId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                    style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
                  >
                    <option value="">Select Agency</option>
                    {agencies.map((a) => <option key={a.id} value={a.id}>{a.code} — {a.name}</option>)}
                  </select>
                  <a 
                    href="http://localhost:8000/admin/projects/agency/add/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-[#e0e5ec] text-blue-600 shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:scale-105 transition-all"
                    title="Add New Agency"
                  >
                    <Plus className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Department with + Button */}
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium text-xs pl-2">Department</label>
                <div className="flex gap-2">
                  <select
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                    style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => <option key={d.id} value={d.id}>{d.code} — {d.name}</option>)}
                  </select>
                  <a 
                    href="http://localhost:8000/admin/projects/department/add/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-[#e0e5ec] text-blue-600 shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:scale-105 transition-all"
                    title="Add New Department"
                  >
                    <Plus className="h-5 w-5" />
                  </a>
                </div>
              </div>

              <NeoInput
                label="Total Sanctioned Amount (₹) *"
                type="number"
                step="0.01"
                value={sanctionedAmount}
                onChange={(e) => setSanctionedAmount(e.target.value)}
                required
              />
            </div>
          </NeoCard>

          {/* SECTION 3: SANCTIONED HEADS */}
          <NeoCard>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Sanctioned Heads Breakdown</h2>
                <p className="text-xs text-slate-500">Divide the total amount into specific budget heads</p>
              </div>
              <NeoButton type="button" variant="secondary" size="sm" onClick={handleAddHead} icon={<Plus className="h-4 w-4" />}>Add Head</NeoButton>
            </div>
            <div className="space-y-3">
              {allocations.map((alloc, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                  
                  {/* Select Head with + Button */}
                  <div className="flex-1 flex gap-2">
                    <select
                      value={alloc.budget_head}
                      onChange={(e) => handleAllocationChange(index, "budget_head", e.target.value)}
                      className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                      style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
                    >
                      <option value="">Select Budget Head</option>
                      {headsList.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                    <a 
                      href="http://localhost:8000/admin/funds/budgethead/add/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl bg-[#e0e5ec] text-indigo-600 shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:scale-105 transition-all"
                      title="Add New Budget Head"
                    >
                      <Plus className="h-5 w-5" />
                    </a>
                  </div>

                  <div className="w-full md:w-64 shrink-0">
                    <NeoInput
                      type="number"
                      placeholder="Amount (₹)"
                      value={alloc.sanctioned_amount}
                      onChange={(e) => handleAllocationChange(index, "sanctioned_amount", e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveHead(index)}
                    className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl text-red-600 bg-[#e0e5ec] shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:text-red-700 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end border-t border-slate-300 pt-4">
              <p className="text-sm font-bold text-slate-700">
                Total Allocated: <span className={totalAllocated === Number(sanctionedAmount) ? "text-green-600" : "text-orange-500"}>₹ {totalAllocated.toLocaleString("en-IN")}</span>
                <span className="text-slate-400 ml-2">/ ₹ {Number(sanctionedAmount || 0).toLocaleString("en-IN")}</span>
              </p>
            </div>
          </NeoCard>

          {/* SECTION 4: DATES */}
          <NeoCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <NeoInput label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <NeoInput label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </NeoCard>

          {/* SECTION 5: PIs */}
          <NeoCard>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">PIs / Co-PIs / Coordinators</h2>
              </div>
              <NeoButton type="button" variant="success" size="sm" onClick={addPIRow} icon={<Plus className="h-3.5 w-3.5" />}>Add More</NeoButton>
            </div>
            <div className="space-y-4">
              {pis.map((pi, index) => (
                <div key={pi.id} className="p-5 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}>
                  <div className="flex items-center justify-between mb-4">
                    <NeoBadge variant={pi.role === "pi" ? "primary" : "success"} size="sm">#{index + 1}</NeoBadge>
                    {pis.length > 1 && (
                      <button type="button" onClick={() => removePIRow(pi.id)} className="h-8 w-8 rounded-lg flex items-center justify-center text-red-600" style={{ background: "#e0e5ec", boxShadow: "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff" }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <NeoInput label="Name *" value={pi.name} onChange={(e) => updatePIRow(pi.id, "name", e.target.value)} required />
                    <div className="space-y-1.5">
                      <label className="text-slate-700 font-medium text-xs pl-2">Role *</label>
                      <select value={pi.role} onChange={(e) => updatePIRow(pi.id, "role", e.target.value as PIRole)} className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none" style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}>
                        {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                    <NeoInput label="Designation" value={pi.designation} onChange={(e) => updatePIRow(pi.id, "designation", e.target.value)} />
                    <NeoInput label="Email" value={pi.email} onChange={(e) => updatePIRow(pi.id, "email", e.target.value)} />
                    <NeoInput label="Phone" value={pi.phone} onChange={(e) => updatePIRow(pi.id, "phone", e.target.value)} />
                    <NeoInput label="Department" value={pi.department} onChange={(e) => updatePIRow(pi.id, "department", e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </NeoCard>

          {/* SECTION 6: STATUS */}
          <NeoCard>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium text-xs pl-2">Status *</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none" style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}>
                  <option value="active">🟢 Active</option>
                  <option value="pending">🟡 Pending Approval</option>
                  <option value="on_hold">🟠 On Hold</option>
                  <option value="completed">🔵 Completed</option>
                  <option value="cancelled">🔴 Cancelled</option>
                </select>
              </div>
              <NeoInput label="Remarks" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
          </NeoCard>

          <div className="flex justify-end gap-4">
            <Link href={`/projects/${projectId}`}>
              <NeoButton type="button" variant="secondary" size="lg" icon={<X className="h-4 w-4" />}>Cancel</NeoButton>
            </Link>
            <NeoButton type="submit" variant="primary" size="lg" loading={saving} icon={<Save className="h-4 w-4" />}>
              {saving ? "Updating..." : "Update Project"}
            </NeoButton>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}