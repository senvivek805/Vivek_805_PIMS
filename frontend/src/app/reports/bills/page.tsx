"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
import { ArrowLeft, Printer, Loader2, Receipt, Search, Filter, FileSpreadsheet } from "lucide-react";
import { getBillEntries, type BillEntry } from "@/lib/api/bills";
import { getProjects, type Project } from "@/lib/api/projects";
import { formatCurrency } from "@/lib/api/funds";

export default function BillsReportPage() {
  const [data, setData] = useState<BillEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [projectFilter, setProjectFilter] = useState<string>("");

  useEffect(() => {
    async function loadData() {
      try {
        const [billsRes, projRes] = await Promise.all([
          getBillEntries(),
          getProjects()
        ]);
        setData(billsRes.results || []);
        setProjects(projRes.results || []);
      } catch (err: any) {
        setError(err.message || "Failed to load bills");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Filter the data based on search and project
  const filteredData = data.filter(bill => {
    const matchesSearch = 
      (bill.bill_no || "").toLowerCase().includes(search.toLowerCase()) ||
      (bill.vendor_name || "").toLowerCase().includes(search.toLowerCase());
      
    const matchesProject = projectFilter === "" || String(bill.project) === projectFilter;

    return matchesSearch && matchesProject;
  });

  // Calculate Grand Totals (Based on Filtered Data)
  let totalBase = 0;
  let totalGST = 0;
  let totalOther = 0;
  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  filteredData.forEach(bill => {
    const base = Number(bill.bill_amount) || 0;
    const cgst = Number(bill.cgst_amount) || 0;
    const sgst = Number(bill.sgst_amount) || 0;
    const igst = Number(bill.igst_amount) || 0;
    const gst = cgst + sgst + igst;
    const other = Number(bill.other_charges) || 0;
    
    const tds_gst = Number(bill.tds_gst) || 0;
    const tds_it = Number(bill.tds_income_tax) || 0;
    const penalty = Number(bill.penalty) || 0;
    const pbg = Number(bill.pbg_security) || 0;
    const deductions = tds_gst + tds_it + penalty + pbg;

    const gross = base + gst + other;
    const net = Number(bill.total_payable) || 0;

    totalBase += base;
    totalGST += gst;
    totalOther += other;
    totalGross += gross;
    totalDeductions += deductions;
    totalNet += net;
  });

  // 👇 NAYA FUNCTION: Export to Excel (CSV)
  const handleExportExcel = () => {
    const headers = ["Bill No", "Vendor", "Project Code", "Project Name", "Base Amount", "GST", "Other Charges", "Gross Total", "Deductions", "Net Payable", "Status"];
    
    const rows = filteredData.map(bill => {
      const base = Number(bill.bill_amount) || 0;
      const gst = (Number(bill.cgst_amount) || 0) + (Number(bill.sgst_amount) || 0) + (Number(bill.igst_amount) || 0);
      const other = Number(bill.other_charges) || 0;
      const deductions = (Number(bill.tds_gst) || 0) + (Number(bill.tds_income_tax) || 0) + (Number(bill.penalty) || 0) + (Number(bill.pbg_security) || 0);
      const gross = base + gst + other;
      const net = Number(bill.total_payable) || 0;

      return [
        `"${bill.bill_no}"`,
        `"${bill.vendor_name || ''}"`,
        `"${bill.project_code || ''}"`,
        `"${bill.project_name || ''}"`,
        base,
        gst,
        other,
        gross,
        deductions,
        net,
        `"${bill.status.toUpperCase()}"`
      ].join(",");
    });

    const totalsRow = [
      '"Grand Total"', '""', '""', '""',
      totalBase, totalGST, totalOther, totalGross, totalDeductions, totalNet, '""'
    ].join(",");

    const csvContent = [headers.join(","), ...rows, totalsRow].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Bill_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header (Hide on Print) */}
        <div className="hide-on-print flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </NeoButton>
            </Link>
            <div className="flex items-center gap-3">
              <NeoIconBox size="lg" color="text-green-600">
                <Receipt className="h-6 w-6" />
              </NeoIconBox>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Bill & Payments Report</h1>
                <p className="text-sm text-slate-500">Detailed breakdown of all bills</p>
              </div>
            </div>
          </div>
          
          {/* 👇 Yahan Excel aur Print dono buttons hain */}
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
                placeholder="Search by Bill No or Vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium min-w-[200px]"
                style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
              >
                <option value="">All Projects</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.project_code} - {p.project_name}</option>
                ))}
              </select>
            </div>
          </div>
        </NeoCard>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20 print:hidden">
            <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
          </div>
        ) : error ? (
          <NeoCard className="print:hidden">
            <p className="text-red-600">{error}</p>
          </NeoCard>
        ) : (
          <>
            {/* Print Header */}
            <div className="hidden print:block text-center mb-8">
              <h2 className="text-2xl font-bold uppercase">Indian Institute of Technology (BHU)</h2>
              <p className="text-lg">Varanasi - 221005</p>
              <h3 className="text-xl font-bold mt-4 underline">Bill & Payments Report</h3>
              <p className="text-sm mt-2">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
            </div>

            {/* Data Table */}
            <NeoCard className="print:shadow-none print:border-none print:p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 print:bg-transparent border-b-2 border-slate-300 print:border-black">
                      <th className="p-3 font-bold text-slate-700 uppercase print:text-black">Bill No</th>
                      <th className="p-3 font-bold text-slate-700 uppercase print:text-black">Vendor</th>
                      <th className="p-3 font-bold text-slate-700 uppercase print:text-black">Project Details</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Base Amt</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">GST</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Other (+)</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black bg-blue-50/50 print:bg-transparent">Gross</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black text-red-700">Deductions (-)</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black bg-green-50/50 print:bg-transparent text-green-700">Net Payable</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-center print:text-black">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((bill) => {
                        const base = Number(bill.bill_amount) || 0;
                        const gst = (Number(bill.cgst_amount) || 0) + (Number(bill.sgst_amount) || 0) + (Number(bill.igst_amount) || 0);
                        const other = Number(bill.other_charges) || 0;
                        const deductions = (Number(bill.tds_gst) || 0) + (Number(bill.tds_income_tax) || 0) + (Number(bill.penalty) || 0) + (Number(bill.pbg_security) || 0);
                        const gross = base + gst + other;
                        
                        return (
                          <tr key={bill.id} className="border-b border-slate-200 print:border-gray-300 hover:bg-slate-50/30">
                            <td className="p-3 font-bold text-slate-800 print:text-black whitespace-nowrap">{bill.bill_no}</td>
                            <td className="p-3 text-slate-700 print:text-black">{bill.vendor_name}</td>
                            <td className="p-3">
                              <p className="font-semibold text-indigo-700 print:text-black">{bill.project_code}</p>
                              <p className="text-[10px] text-slate-500 print:text-gray-600">{bill.project_name}</p>
                            </td>
                            <td className="p-3 text-right text-slate-700 print:text-black">{formatCurrency(base)}</td>
                            <td className="p-3 text-right text-slate-700 print:text-black">{formatCurrency(gst)}</td>
                            <td className="p-3 text-right text-slate-700 print:text-black">{formatCurrency(other)}</td>
                            <td className="p-3 text-right font-bold text-blue-800 print:text-black bg-blue-50/20 print:bg-transparent">
                              {formatCurrency(gross)}
                            </td>
                            <td className="p-3 text-right font-medium text-red-600 print:text-black">
                              {deductions > 0 ? `- ${formatCurrency(deductions)}` : formatCurrency(0)}
                            </td>
                            <td className="p-3 text-right font-bold text-green-700 print:text-black bg-green-50/20 print:bg-transparent">
                              {formatCurrency(Number(bill.total_payable))}
                            </td>
                            <td className="p-3 text-center">
                              <span className="print:hidden">
                                <NeoBadge variant={bill.status === 'paid' ? 'success' : bill.status === 'approved' ? 'primary' : 'warning'}>
                                  {bill.status.toUpperCase()}
                                </NeoBadge>
                              </span>
                              <span className="hidden print:inline font-bold uppercase text-xs">{bill.status}</span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-slate-500">No bills found matching your search.</td>
                      </tr>
                    )}
                    {/* Grand Total Row (Inside tbody to prevent repeating) */}
                    {filteredData.length > 0 && (
                      <tr className="bg-slate-100 print:bg-gray-100 border-t-2 border-slate-400 print:border-black font-bold">
                        <td colSpan={3} className="p-3 text-slate-800 print:text-black uppercase text-right">Grand Total</td>
                        <td className="p-3 text-right text-slate-800 print:text-black">{formatCurrency(totalBase)}</td>
                        <td className="p-3 text-right text-slate-800 print:text-black">{formatCurrency(totalGST)}</td>
                        <td className="p-3 text-right text-slate-800 print:text-black">{formatCurrency(totalOther)}</td>
                        <td className="p-3 text-right text-blue-800 print:text-black">{formatCurrency(totalGross)}</td>
                        <td className="p-3 text-right text-red-600 print:text-black">- {formatCurrency(totalDeductions)}</td>
                        <td className="p-3 text-right text-green-700 print:text-black">{formatCurrency(totalNet)}</td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </NeoCard>

            {/* Print Footer (Signatures) */}
            <div className="hidden print:flex justify-between mt-24 px-10">
              <div className="text-center">
                <div className="w-48 border-t border-black pt-2">
                  <p className="font-bold">Prepared By</p>
                  <p className="text-sm">Accounts Assistant</p>
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
                  <p className="text-sm">Registrar</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Print Styles */}
            {/* 👇 Ye naya style tag add karo */}
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
            size: A4 landscape;
            margin: 15mm;
          }
        }
      `}</style>
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
          }
          @page {
            size: A4 landscape;
            margin: 15mm;
          }
        }
      `}</style>
    </AppLayout>
  );
}