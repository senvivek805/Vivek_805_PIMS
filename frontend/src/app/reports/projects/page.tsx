"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox } from "@/components/neumorphism";
// 👇 Import me FileSpreadsheet add kiya
import { ArrowLeft, Printer, Loader2, FolderKanban, Search, FileSpreadsheet } from "lucide-react";
import { getBudgetOverview, formatCurrency, type BudgetOverviewResponse } from "@/lib/api/funds";

export default function ProjectSummaryReportPage() {
  const [data, setData] = useState<BudgetOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

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

  // Filter Data
  const filteredProjects = data?.project_wise.filter(proj => 
    (proj.project_code || "").toLowerCase().includes(search.toLowerCase()) ||
    (proj.project_name || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  // Calculate Grand Totals based on filtered data
  let totalReceived = 0;
  let totalAllocated = 0;
  let totalSpent = 0;
  
  filteredProjects.forEach(proj => {
    totalReceived += proj.received;
    totalAllocated += proj.allocated;
    totalSpent += proj.spent;
  });

  const totalUtilization = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;

  // 👇 NAYA FUNCTION: Excel Export
  const handleExportExcel = () => {
    const headers = ["Project Code", "Project Name", "Total Received", "Allocated Budget", "Total Spent", "Utilization %"];
    
    const rows = filteredProjects.map(proj => {
      const util = proj.allocated > 0 ? (proj.spent / proj.allocated) * 100 : 0;
      return [
        `"${proj.project_code || ''}"`,
        `"${proj.project_name || ''}"`,
        proj.received,
        proj.allocated,
        proj.spent,
        util.toFixed(1) + "%"
      ].join(",");
    });

    const totalsRow = [
      '"Grand Total"', '""',
      totalReceived, totalAllocated, totalSpent, totalUtilization.toFixed(1) + "%"
    ].join(",");

    const csvContent = [headers.join(","), ...rows, totalsRow].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Project_Summary_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header (Hide on Print) */}
        <div className="hide-on-print flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </NeoButton>
            </Link>
            <div className="flex items-center gap-3">
              <NeoIconBox size="lg" color="text-purple-600">
                <FolderKanban className="h-6 w-6" />
              </NeoIconBox>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Project Summary Report</h1>
                <p className="text-sm text-slate-500">Budget vs Expenditure for all projects</p>
              </div>
            </div>
          </div>
          
          {/* 👇 Naye Buttons */}
          <div className="flex items-center gap-3">
            <NeoButton variant="secondary" onClick={handleExportExcel} icon={<FileSpreadsheet className="h-4 w-4" />}>
              Export Excel
            </NeoButton>
            <NeoButton variant="primary" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>
              Print Report
            </NeoButton>
          </div>
        </div>

        {/* Filters (Hide on Print) */}
        <NeoCard padding="sm" className="print:hidden">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
              <input
                type="text"
                placeholder="Search by Project Code or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
              />
            </div>
          </div>
        </NeoCard>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20 print:hidden">
            <Loader2 className="h-10 w-10 text-purple-600 animate-spin" />
          </div>
        ) : error ? (
          <NeoCard className="print:hidden">
            <p className="text-red-600">{error}</p>
          </NeoCard>
        ) : data ? (
          <>
            {/* Print Header */}
            <div className="hidden print:block text-center mb-8">
              <h2 className="text-2xl font-bold uppercase">Indian Institute of Technology (BHU)</h2>
              <p className="text-lg">Varanasi - 221005</p>
              <h3 className="text-xl font-bold mt-4 underline">Project Summary Report</h3>
              <p className="text-sm mt-2">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
            </div>

            {/* Data Table */}
            <NeoCard className="print:shadow-none print:border-none print:p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 print:bg-transparent border-b-2 border-slate-300 print:border-black">
                      <th className="p-3 font-bold text-slate-700 uppercase print:text-black">Project Details</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Total Received</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Allocated Budget</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Total Spent</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Utilization %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProjects.length > 0 ? (
                      filteredProjects.map((proj) => {
                        const util = proj.allocated > 0 ? (proj.spent / proj.allocated) * 100 : 0;
                        return (
                          <tr key={proj.project_id} className="border-b border-slate-200 print:border-gray-300 hover:bg-slate-50/30">
                            <td className="p-3">
                              <p className="font-bold text-slate-800 print:text-black">{proj.project_code}</p>
                              <p className="text-xs text-slate-500 print:text-gray-600">{proj.project_name}</p>
                            </td>
                            <td className="p-3 text-right text-slate-700 print:text-black">{formatCurrency(proj.received)}</td>
                            <td className="p-3 text-right font-medium text-green-600 print:text-black">{formatCurrency(proj.allocated)}</td>
                            <td className="p-3 text-right font-medium text-red-600 print:text-black">{formatCurrency(proj.spent)}</td>
                            <td className="p-3 text-right font-bold text-slate-800 print:text-black">
                              {util.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-500">No projects found matching your search.</td>
                      </tr>
                    )}

                    {/* 👇 Grand Total Row (Inside tbody) */}
                    {filteredProjects.length > 0 && (
                      <tr className="bg-slate-50 print:bg-gray-100 border-t-2 border-slate-300 print:border-black font-bold">
                        <td className="p-3 text-slate-800 print:text-black uppercase">Grand Total</td>
                        <td className="p-3 text-right text-slate-800 print:text-black">{formatCurrency(totalReceived)}</td>
                        <td className="p-3 text-right text-green-700 print:text-black">{formatCurrency(totalAllocated)}</td>
                        <td className="p-3 text-right text-red-700 print:text-black">{formatCurrency(totalSpent)}</td>
                        <td className="p-3 text-right text-slate-800 print:text-black">
                          {totalUtilization.toFixed(1)}%
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </NeoCard>

            {/* Print Footer */}
            <div className="hidden print:flex justify-between mt-24 px-10">
              <div className="text-center">
                <div className="w-48 border-t border-black pt-2">
                  <p className="font-bold">Prepared By</p>
                  <p className="text-sm">Project Assistant</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-48 border-t border-black pt-2">
                  <p className="font-bold">Verified By</p>
                  <p className="text-sm">Finance Officer</p>
                </div>
              </div>
              <div className="text-center">
                <div className="w-48 border-t border-black pt-2">
                  <p className="font-bold">Approved By</p>
                  <p className="text-sm">Dean / Registrar</p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* 👇 Custom Print Style Fix */}
      <style>{`
        @media print {
          .hide-on-print { display: none !important; }
        }
      `}</style>

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