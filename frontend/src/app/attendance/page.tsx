"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
import { UserCheck, Loader2, RefreshCw } from "lucide-react";
import { fetchWithCsrf } from "@/lib/api/csrf";

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetchWithCsrf<any>(`${API_BASE_URL}/attendance/?format=json`);
      setAttendance(res.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NeoIconBox size="lg" color="text-emerald-600">
              <UserCheck className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Attendance Records</h1>
              <p className="text-sm text-slate-500">Daily attendance tracking</p>
            </div>
          </div>
          <NeoButton
            variant="secondary"
            onClick={loadData}
            icon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </NeoButton>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
          </div>
        ) : attendance.length === 0 ? (
          <NeoCard>
            <div className="text-center py-16">
              <UserCheck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No attendance records</h3>
              <p className="text-sm text-slate-500">Attendance marking system will be available soon.</p>
            </div>
          </NeoCard>
        ) : (
          <div className="grid gap-3">
             {/* Basic list view - will enhance later */}
            {attendance.map((record) => (
              <NeoCard key={record.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-800">{record.employee_name}</p>
                  <p className="text-sm text-slate-500">{record.date}</p>
                </div>
                <NeoBadge variant={record.status === "present" ? "success" : "danger"}>
                  {record.status.toUpperCase()}
                </NeoBadge>
              </NeoCard>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}