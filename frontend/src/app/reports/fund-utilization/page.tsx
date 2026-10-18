"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox } from "@/components/neumorphism";
import { ArrowLeft, Printer, Loader2, BarChart3 } from "lucide-react";
import { getBudgetOverview, formatCurrency, type BudgetOverviewResponse } from "@/lib/api/funds";

export default function FundUtilizationReportPage() {
  const [data, setData] = useState<BudgetOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getBudgetOverview();
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load report data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header (Hide on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </NeoButton>
            </Link>
            <div className="flex items-center gap-3">
              <NeoIconBox size="lg" color="text-blue-600">
                <BarChart3 className="h-6 w-6" />
              </NeoIconBox>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Fund Utilization Report</h1>
                <p className="text-sm text-slate-500">Project-wise summary of funds</p>
              </div>
            </div>
          </div>
          <NeoButton variant="primary" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>
            Print Report
          </NeoButton>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20 print:hidden">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
          </div>
        ) : error ? (
          <NeoCard className="print:hidden">
            <p className="text-red-600">{error}</p>
          </NeoCard>
        ) : data ? (
          <>
            {/* Print Header (Visible only on print) */}
            <div className="hidden print:block text-center mb-8">
              <h2 className="text-2xl font-bold uppercase">Indian Institute of Technology (BHU)</h2>
              <p className="text-lg">Varanasi - 221005</p>
              <h3 className="text-xl font-bold mt-4 underline">Fund Utilization Report</h3>
              <p className="text-sm mt-2">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
            </div>

            {/* Summary Cards (Hide on print, or keep them simple) */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:hidden mb-6">
              <NeoCard>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Received</p>
                <p className="text-lg font-bold text-slate-800">{formatCurrency(data.summary.total_received)}</p>
              </NeoCard>
              <NeoCard>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Allocated</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(data.summary.total_allocated)}</p>
              </NeoCard>
              <NeoCard>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Spent</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(data.summary.total_spent)}</p>
              </NeoCard>
              <NeoCard>
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">Total Balance</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(data.summary.total_balance)}</p>
              </NeoCard>
            </div>

            {/* Data Table */}
            <NeoCard className="print:shadow-none print:border-none print:p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 print:bg-transparent border-b-2 border-slate-300 print:border-black">
                      <th className="p-3 font-bold text-slate-700 uppercase print:text-black">Project Code & Name</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Received</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Allocated</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Spent</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.project_wise.length > 0 ? (
                      data.project_wise.map((proj) => (
                        <tr key={proj.project_id} className="border-b border-slate-200 print:border-gray-300">
                          <td className="p-3">
                            <p className="font-bold text-slate-800 print:text-black">{proj.project_code}</p>
                            <p className="text-xs text-slate-500 print:text-gray-600">{proj.project_name}</p>
                          </td>
                          <td className="p-3 text-right text-slate-700 print:text-black">{formatCurrency(proj.received)}</td>
                          <td className="p-3 text-right font-medium text-green-600 print:text-black">{formatCurrency(proj.allocated)}</td>
                          <td className="p-3 text-right font-medium text-red-600 print:text-black">{formatCurrency(proj.spent)}</td>
                          <td className="p-3 text-right font-bold text-blue-700 print:text-black">{formatCurrency(proj.balance)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">No project data available.</td>
                      </tr>
                    )}
                  </tbody>
                  {/* Footer Total Row */}
                  <tfoot>
                    <tr className="bg-slate-50 print:bg-transparent border-t-2 border-slate-300 print:border-black font-bold">
                      <td className="p-3 text-slate-800 print:text-black uppercase">Grand Total</td>
                      <td className="p-3 text-right text-slate-800 print:text-black">{formatCurrency(data.summary.total_received)}</td>
                      <td className="p-3 text-right text-green-700 print:text-black">{formatCurrency(data.summary.total_allocated)}</td>
                      <td className="p-3 text-right text-red-700 print:text-black">{formatCurrency(data.summary.total_spent)}</td>
                      <td className="p-3 text-right text-blue-800 print:text-black">{formatCurrency(data.summary.total_balance)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </NeoCard>

            {/* Print Footer (Signatures) */}
            <div className="hidden print:flex justify-between mt-24 px-10">
              <div className="text-center">
                <div className="w-48 border-t border-black pt-2">
                  <p className="font-bold">Prepared By</p>
                  <p className="text-sm">Finance Assistant</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-48 border-t border-black pt-2">
                  <p className="font-bold">Verified By</p>
                  <p className="text-sm">Accounts Officer</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-48 border-t border-black pt-2">
                  <p className="font-bold">Approved By</p>
                  <p className="text-sm">Registrar / Dean</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </AppLayout>
  );
}