"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
import { CalendarDays, Loader2, Plus, CheckCircle, XCircle, Clock } from "lucide-react";
import { getLeaveApplications, updateLeaveStatus, type LeaveApplication } from "@/lib/api/leaves";
import { usePermissions } from "@/hooks/usePermissions";

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin, isManager } = usePermissions();

  async function loadData() {
    setLoading(true);
    try {
      const res = await getLeaveApplications();
      setLeaves(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleAction(id: number, action: "approve" | "reject") {
    if (!confirm(`Are you sure you want to ${action} this leave?`)) return;
    try {
      await updateLeaveStatus(id, action);
      loadData(); // Refresh list
    } catch (err) {
      alert("Failed to update status");
    }
  }

  function getStatusBadge(status: string) {
    if (status === "approved") return <NeoBadge variant="success">Approved</NeoBadge>;
    if (status === "rejected") return <NeoBadge variant="danger">Rejected</NeoBadge>;
    if (status === "pending") return <NeoBadge variant="warning">Pending</NeoBadge>;
    return <NeoBadge variant="default">{status}</NeoBadge>;
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-blue-600">
              <CalendarDays className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Leave Applications</h1>
              <p className="text-sm text-slate-500">Manage your leaves and approvals</p>
            </div>
          </div>
          <Link href="/leaves/new">
            <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>
              Apply for Leave
            </NeoButton>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          </div>
        ) : leaves.length === 0 ? (
          <NeoCard>
            <div className="text-center py-16">
              <CalendarDays className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No leave applications</h3>
              <p className="text-sm text-slate-500">Click "Apply for Leave" to create a new request.</p>
            </div>
          </NeoCard>
        ) : (
          <div className="grid gap-4">
            {leaves.map((leave) => (
              <NeoCard key={leave.id} className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-slate-100">
                    <CalendarDays className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {leave.employee_name} <span className="text-xs font-normal text-slate-500">({leave.employee_code})</span>
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      <span className="font-semibold text-indigo-600">{leave.leave_type_name}</span> • {leave.from_date} to {leave.to_date} ({leave.total_days} days)
                    </p>
                    <p className="text-sm text-slate-500 mt-1">Reason: {leave.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                  {getStatusBadge(leave.status)}
                  
                  {/* Approve/Reject buttons for Admin/Manager */}
                  {(isAdmin || isManager) && leave.status === "pending" && (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(leave.id, "approve")}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handleAction(leave.id, "reject")}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              </NeoCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}