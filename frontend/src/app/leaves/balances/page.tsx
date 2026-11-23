"use client";

import { useEffect, useState } from "react";
import { getLeaveBalances, LeaveBalance } from "@/lib/api/leaves";
import { Loader2, CalendarDays, AlertCircle, RefreshCw } from "lucide-react";

export default function LeaveBalancesPage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function fetchBalances() {
    try {
      setLoading(true);
      setError("");
      // Backend automatically current user ka balance calculate karke bhejta hai
      const res = await getLeaveBalances();
      setBalances(res.results || []);
    } catch (err: any) {
      setError("Failed to load leave balances. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBalances();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#e0e5ec]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium">Calculating balances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e0e5ec] p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              My Leave Balances
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your accrued and used leaves for the current year
            </p>
          </div>
          
          <button
            onClick={fetchBalances}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 bg-[#e0e5ec] transition-all hover:scale-105 active:scale-95"
            style={{ boxShadow: "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff" }}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-600 flex items-center gap-3 border border-red-200">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Balance Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {balances.map((bal) => (
            <div
              key={bal.id}
              className="p-6 rounded-3xl bg-[#e0e5ec] flex flex-col justify-between"
              style={{ boxShadow: "8px 8px 16px #b8bcc2, -8px -8px 16px #ffffff" }}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                    {bal.employee_name}
                  </p>
                  <h2 className="text-xl font-bold text-slate-800">
                    {bal.leave_type_code} Leave
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wider">
                    {bal.year_start_date} to {bal.year_end_date}
                  </p>
                </div>
                <div 
                  className="h-12 w-12 rounded-2xl flex items-center justify-center bg-[#e0e5ec]"
                  style={{ boxShadow: "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff" }}
                >
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Total Accrued</span>
                  <span className="font-semibold text-slate-800">{bal.total_accrued}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Used Days</span>
                  <span className="font-semibold text-slate-800">{bal.used_days}</span>
                </div>
                <div className="flex justify-between text-sm border-t-2 border-slate-300/50 pt-3 mt-3">
                  <span className="text-slate-800 font-bold">Available Balance</span>
                  <span className="font-bold text-green-600 text-lg">
                    {bal.balance_days.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {balances.length === 0 && !error && (
            <div className="col-span-full py-16 text-center rounded-3xl bg-[#e0e5ec]"
                 style={{ boxShadow: "inset 4px 4px 8px #b8bcc2, inset -4px -4px 8px #ffffff" }}>
              <CalendarDays className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No leave balances found.</p>
              <p className="text-sm text-slate-400 mt-1">Apply for a leave to generate balance records.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}