"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox } from "@/components/neumorphism";
import { ArrowLeft, Loader2, Save, CalendarDays } from "lucide-react";
import { getLeaveTypes, applyForLeave, type LeaveType } from "@/lib/api/leaves";
// Agar employees API ka path alag hai to isko adjust kar lena
import { getEmployees } from "@/lib/api/employees"; 

export default function ApplyLeavePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [employees, setEmployees] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    employee: "",
    leave_type: "",
    from_date: "",
    to_date: "",
    reason: "",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [empRes, typeRes] = await Promise.all([
          getEmployees(),
          getLeaveTypes(),
        ]);
        setEmployees(empRes.results || []);
        setLeaveTypes(typeRes.results || []);
      } catch (err) {
        console.error("Failed to load form data", err);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.employee || !formData.leave_type || !formData.from_date || !formData.to_date) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      await applyForLeave(formData);
      router.push("/leaves");
    } catch (err: any) {
      alert(err.message || "Failed to apply for leave");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/leaves">
            <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </NeoButton>
          </Link>
          <div className="flex items-center gap-3">
            <NeoIconBox size="lg" color="text-indigo-600">
              <CalendarDays className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Apply for Leave</h1>
              <p className="text-sm text-slate-500">Fill details to submit a new leave request</p>
            </div>
          </div>
        </div>

        {/* Form */}
        {fetching ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : (
          <NeoCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Employee */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Employee *</label>
                  <select
                    className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}
                    value={formData.employee}
                    onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} ({emp.employee_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Leave Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Leave Type *</label>
                  <select
                    className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}
                    value={formData.leave_type}
                    onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                    required
                  >
                    <option value="">Select Leave Type</option>
                    {leaveTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} ({type.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* From Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">From Date *</label>
                  <input
                    type="date"
                    className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}
                    value={formData.from_date}
                    onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                    required
                  />
                </div>

                {/* To Date */}
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">To Date *</label>
                  <input
                    type="date"
                    className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}
                    value={formData.to_date}
                    onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reason *</label>
                <textarea
                  rows={4}
                  className="w-full p-4 rounded-xl bg-[#e0e5ec] text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  style={{ boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}
                  placeholder="Reason for leave..."
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex justify-end pt-4">
                <NeoButton
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  icon={loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                >
                  {loading ? "Submitting..." : "Submit Application"}
                </NeoButton>
              </div>

            </form>
          </NeoCard>
        )}
      </div>
    </AppLayout>
  );
}