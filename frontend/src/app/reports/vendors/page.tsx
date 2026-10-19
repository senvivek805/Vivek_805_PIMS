"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox } from "@/components/neumorphism";
import { ArrowLeft, Printer, Loader2, Users, Search, Filter } from "lucide-react";
import { getBillEntries, type BillEntry } from "@/lib/api/bills";
import { getProjects, type Project } from "@/lib/api/projects";
import { formatCurrency } from "@/lib/api/funds";

interface VendorSummary {
  vendor_name: string;
  project_code: string;
  project_name: string;
  project_id: number;
  total_bills: number;
  total_gross: number;
  total_paid: number;
  total_pending: number;
}

export default function VendorPaymentsReportPage() {
  const [data, setData] = useState<VendorSummary[]>([]);
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
        
        setProjects(projRes.results || []);
        const bills = billsRes.results || [];

        const summaryMap = new Map<string, VendorSummary>();

        bills.forEach((bill) => {
          const vName = bill.vendor_name || "Unknown Vendor";
          const pCode = bill.project_code || "No Project";
          const pName = bill.project_name || "";
          const pId = bill.project || 0;
          
          const groupKey = `${vName}_${pCode}`;
          
          const base = Number(bill.bill_amount) || 0;
          const cgst = Number(bill.cgst_amount) || 0;
          const sgst = Number(bill.sgst_amount) || 0;
          const igst = Number(bill.igst_amount) || 0;
          const other = Number(bill.other_charges) || 0;
          
          const grossAmount = base + cgst + sgst + igst + other;
          const payableAmount = Number(bill.total_payable) || 0;
          
          if (!summaryMap.has(groupKey)) {
            summaryMap.set(groupKey, {
              vendor_name: vName,
              project_code: pCode,
              project_name: pName,
              project_id: pId,
              total_bills: 0,
              total_gross: 0,
              total_paid: 0,
              total_pending: 0,
            });
          }

          const stats = summaryMap.get(groupKey)!;
          stats.total_bills += 1;
          stats.total_gross += grossAmount;

          if (bill.status === 'paid') {
            stats.total_paid += payableAmount;
          } else if (bill.status === 'approved' || bill.status === 'submitted') {
            stats.total_pending += payableAmount;
          }
        });

        const summaryArray = Array.from(summaryMap.values()).sort((a, b) => b.total_gross - a.total_gross);
        setData(summaryArray);

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
  const filteredData = data.filter(vendor => {
    const matchesSearch = 
      vendor.vendor_name.toLowerCase().includes(search.toLowerCase()) ||
      vendor.project_code.toLowerCase().includes(search.toLowerCase()) ||
      vendor.project_name.toLowerCase().includes(search.toLowerCase());
      
    const matchesProject = projectFilter === "" || String(vendor.project_id) === projectFilter;

    return matchesSearch && matchesProject;
  });

  const grandTotalGross = filteredData.reduce((sum, v) => sum + v.total_gross, 0);
  const grandTotalPaid = filteredData.reduce((sum, v) => sum + v.total_paid, 0);
  const grandTotalPending = filteredData.reduce((sum, v) => sum + v.total_pending, 0);

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </NeoButton>
            </Link>
            <div className="flex items-center gap-3">
              <NeoIconBox size="lg" color="text-orange-600">
                <Users className="h-6 w-6" />
              </NeoIconBox>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Vendor Payments Report</h1>
                <p className="text-sm text-slate-500">Vendor & Project-wise summary</p>
              </div>
            </div>
          </div>
          <NeoButton variant="primary" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>
            Print Report
          </NeoButton>
        </div>

        {/* Filters (Hide on Print) */}
        <NeoCard padding="sm" className="print:hidden">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[240px] relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
              <input
                type="text"
                placeholder="Search by Vendor, Project Code or Name..."
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
            <Loader2 className="h-10 w-10 text-orange-600 animate-spin" />
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
              <h3 className="text-xl font-bold mt-4 underline">Vendor Payments Report</h3>
              <p className="text-sm mt-2">Generated on: {new Date().toLocaleDateString('en-GB')}</p>
            </div>

            {/* Data Table */}
            <NeoCard className="print:shadow-none print:border-none print:p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/50 print:bg-transparent border-b-2 border-slate-300 print:border-black">
                      <th className="p-3 font-bold text-slate-700 uppercase print:text-black w-1/4">Vendor Name</th>
                      <th className="p-3 font-bold text-slate-700 uppercase print:text-black w-1/3">Project Details</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-center print:text-black">Bills</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black bg-blue-50/50 print:bg-transparent">Total Gross</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black text-green-700">Net Paid</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black text-red-700">Net Pending</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length > 0 ? (
                      filteredData.map((vendor, idx) => (
                        <tr key={idx} className="border-b border-slate-200 print:border-gray-300 hover:bg-slate-50/30">
                          <td className="p-3 font-bold text-slate-800 print:text-black">
                            {vendor.vendor_name}
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-indigo-700 print:text-black">{vendor.project_code}</p>
                            <p className="text-xs text-slate-500 print:text-gray-600">{vendor.project_name}</p>
                          </td>
                          <td className="p-3 text-center text-slate-700 print:text-black">{vendor.total_bills}</td>
                          <td className="p-3 text-right font-bold text-blue-800 print:text-black bg-blue-50/20 print:bg-transparent">
                            {formatCurrency(vendor.total_gross)}
                          </td>
                          <td className="p-3 text-right font-medium text-green-600 print:text-black">
                            {formatCurrency(vendor.total_paid)}
                          </td>
                          <td className="p-3 text-right font-medium text-red-600 print:text-black">
                            {formatCurrency(vendor.total_pending)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-500">No vendor data found.</td>
                      </tr>
                    )}
                  </tbody>
                  {/* Footer Total Row */}
                  {filteredData.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100 print:bg-transparent border-t-2 border-slate-400 print:border-black font-bold">
                        <td colSpan={2} className="p-3 text-slate-800 print:text-black uppercase">Grand Total</td>
                        <td className="p-3 text-center text-slate-800 print:text-black">
                          {filteredData.reduce((sum, v) => sum + v.total_bills, 0)}
                        </td>
                        <td className="p-3 text-right text-blue-800 print:text-black">{formatCurrency(grandTotalGross)}</td>
                        <td className="p-3 text-right text-green-700 print:text-black">{formatCurrency(grandTotalPaid)}</td>
                        <td className="p-3 text-right text-red-700 print:text-black">{formatCurrency(grandTotalPending)}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </NeoCard>

            {/* Print Footer */}
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