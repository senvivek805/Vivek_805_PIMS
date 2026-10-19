"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox } from "@/components/neumorphism";
import { ArrowLeft, Printer, Loader2, FileCheck } from "lucide-react";
import { getProjects, type Project } from "@/lib/api/projects";
import { getProjectUCData, type UCDataResponse, type UCHeadData } from "@/lib/api/uc";
import { formatCurrency } from "@/lib/api/funds";

export default function UtilizationCertificatePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [ucData, setUcData] = useState<UCDataResponse | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [fetchingUC, setFetchingUC] = useState(false);
  const [error, setError] = useState("");

  // 1. Load Projects initially
  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await getProjects();
        setProjects(res.results || []);
        if (res.results && res.results.length > 0) {
          setSelectedProjectId(String(res.results[0].id));
        } else {
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load projects");
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  // 2. Load UC Data when project changes
  useEffect(() => {
    if (!selectedProjectId) return;

    async function loadUC() {
      setFetchingUC(true);
      setError("");
      try {
        const data = await getProjectUCData(Number(selectedProjectId));
        setUcData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load UC data");
        setUcData(null);
      } finally {
        setFetchingUC(false);
        setLoading(false);
      }
    }
    loadUC();
  }, [selectedProjectId]);

  const handlePrint = () => {
    window.print();
  };

  // Helper to calculate totals for a specific FY across all heads
  const getFYTotal = (fyIndex: number, key: 'allocated' | 'spent' | 'balance') => {
    if (!ucData) return 0;
    return ucData.heads.reduce((sum, head) => sum + (head.fy_data[fyIndex]?.[key] || 0), 0);
  };

  // Helper to calculate grand totals across all FYs for a specific key
  const getGrandTotal = (key: 'allocated' | 'spent' | 'balance') => {
    if (!ucData) return 0;
    return ucData.heads.reduce((sum, head) => {
      return sum + head.fy_data.reduce((fySum, fy) => fySum + (fy[key] || 0), 0);
    }, 0);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>
      </AppLayout>
    );
  }

  // Group heads by category
  // Group heads based on our forced API categories
  const groupedHeads: Record<string, UCHeadData[]> = {
    'Non-Recurring': ucData?.heads.filter(h => h.category === 'Non-Recurring') || [],
    'Recurring': ucData?.heads.filter(h => h.category === 'Recurring') || [],
    'Other': ucData?.heads.filter(h => h.category !== 'Non-Recurring' && h.category !== 'Recurring') || [],
  };

  return (
    <AppLayout>
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* Header (Hide on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <Link href="/reports">
              <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </NeoButton>
            </Link>
            <div className="flex items-center gap-3">
              <NeoIconBox size="lg" color="text-emerald-600">
                <FileCheck className="h-6 w-6" />
              </NeoIconBox>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Utilization Certificate (UC)</h1>
                <p className="text-sm text-slate-500">Statement of Expenditure</p>
              </div>
            </div>
          </div>
          <NeoButton variant="primary" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>
            Print UC
          </NeoButton>
        </div>

        {/* Project Selector (Hide on Print) */}
        <NeoCard padding="sm" className="print:hidden">
          <div className="flex items-center gap-4">
            <label className="text-sm font-bold text-slate-700 whitespace-nowrap">Select Project:</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
              style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.project_code} - {p.project_name}</option>
              ))}
            </select>
          </div>
        </NeoCard>

        {error && (
          <NeoCard className="print:hidden"><p className="text-red-600">{error}</p></NeoCard>
        )}

        {/* UC Preview Area */}
        {fetchingUC ? (
          <div className="flex justify-center py-20 print:hidden">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : ucData ? (
          <div className="bg-white p-6 shadow-xl print:shadow-none text-black font-sans text-xs">
            
            {/* Print Header */}
            <div className="text-center mb-6">
              <h2 className="text-sm font-bold uppercase tracking-widest">Request for Annual Installment with Utilization Statement of Expenditure</h2>
            </div>

            {/* Project Info */}
            <div className="mb-6 space-y-1">
              <p><strong>1. Name of the PI:</strong> {ucData.project.pi}</p>
              <p><strong>2. Project Code & Name:</strong> {ucData.project.code} - {ucData.project.name}</p>
              <p><strong>3. Funding Agency:</strong> {ucData.project.agency}</p>
              <p><strong>4. Date of Request:</strong> {new Date().toLocaleDateString('en-GB')}</p>
            </div>

            {/* Complex Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-black text-center">
                
                {/* Table Headers */}
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black p-2" rowSpan={2}>Sl. No.</th>
                    <th className="border border-black p-2" rowSpan={2}>Sanctioned/Head</th>
                    <th className="border border-black p-2" rowSpan={2}>Total Fund Sanctioned</th>
                    
                    {/* FY Columns */}
                    {ucData.fys.map(fy => (
                      <th key={fy} className="border border-black p-2" colSpan={3}>FY {fy}</th>
                    ))}

                    {/* Grand Total Columns */}
                    <th className="border border-black p-2 bg-blue-50" colSpan={3}>Grand Total (All FYs)</th>
                    
                    <th className="border border-black p-2" rowSpan={2}>Unspent Balance as on Date</th>
                    <th className="border border-black p-2" rowSpan={2}>Balance Returned / Refunded</th>
                  </tr>
                  <tr className="bg-gray-50">
                    {/* Sub-headers for FYs */}
                    {ucData.fys.map(fy => (
                      <React.Fragment key={`sub-${fy}`}>
                        <th className="border border-black p-1">Released</th>
                        <th className="border border-black p-1">Expenditure</th>
                        <th className="border border-black p-1">Balance</th>
                      </React.Fragment>
                    ))}
                    {/* Sub-headers for Grand Total */}
                    <th className="border border-black p-1 bg-blue-50">Released</th>
                    <th className="border border-black p-1 bg-blue-50">Expenditure</th>
                    <th className="border border-black p-1 bg-blue-50">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {Object.entries(groupedHeads).map(([categoryName, heads]) => {
                    if (heads.length === 0) return null;
                    
                    return (
                      <React.Fragment key={categoryName}>
                        {/* Category Header Row */}
                        <tr className="bg-gray-200 font-bold text-left">
                          <td className="border border-black p-2 text-center">-</td>
                          <td className="border border-black p-2 uppercase" colSpan={2}>{categoryName} Head</td>
                          
                          {ucData.fys.map((_, i) => (
                            <td key={i} className="border border-black p-2" colSpan={3}></td>
                          ))}
                          <td className="border border-black p-2" colSpan={3}></td>
                          <td className="border border-black p-2"></td>
                          <td className="border border-black p-2"></td>
                        </tr>

                        {/* Head Rows */}
                        {heads.map((head, idx) => {
                          const grandReleased = head.fy_data.reduce((sum, fy) => sum + fy.allocated, 0);
                          const grandSpent = head.fy_data.reduce((sum, fy) => sum + fy.spent, 0);
                          const grandBalance = grandReleased - grandSpent;

                          return (
                            <tr key={head.head_id}>
                              <td className="border border-black p-2">{idx + 1}</td>
                              <td className="border border-black p-2 text-left font-semibold">{head.head_name}</td>
                              <td className="border border-black p-2 text-right">{formatCurrency(head.total_sanctioned)}</td>
                              
                              {head.fy_data.map((fy, i) => (
                                <React.Fragment key={i}>
                                  <td className="border border-black p-1 text-right">{formatCurrency(fy.allocated)}</td>
                                  <td className="border border-black p-1 text-right">{formatCurrency(fy.spent)}</td>
                                  <td className="border border-black p-1 text-right">{formatCurrency(fy.balance)}</td>
                                </React.Fragment>
                              ))}

                              <td className="border border-black p-1 text-right bg-blue-50 font-semibold">{formatCurrency(grandReleased)}</td>
                              <td className="border border-black p-1 text-right bg-blue-50 font-semibold">{formatCurrency(grandSpent)}</td>
                              <td className="border border-black p-1 text-right bg-blue-50 font-semibold">{formatCurrency(grandBalance)}</td>

                              <td className="border border-black p-1 text-right">{formatCurrency(grandBalance)}</td>
                              <td className="border border-black p-1 text-right">₹0.00</td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>

                {/* Grand Total Footer Row */}
                <tfoot>
                  <tr className="bg-green-50 font-bold">
                    <td className="border border-black p-2" colSpan={2}>Grand Total</td>
                    <td className="border border-black p-2 text-right">
                      {formatCurrency(ucData.project.total_sanctioned_amount || ucData.heads.reduce((sum, h) => sum + h.total_sanctioned, 0))}
                    </td>
                    
                    {ucData.fys.map((_, i) => (
                      <React.Fragment key={`footer-${i}`}>
                        <td className="border border-black p-1 text-right">{formatCurrency(getFYTotal(i, 'allocated'))}</td>
                        <td className="border border-black p-1 text-right">{formatCurrency(getFYTotal(i, 'spent'))}</td>
                        <td className="border border-black p-1 text-right">{formatCurrency(getFYTotal(i, 'balance'))}</td>
                      </React.Fragment>
                    ))}

                    <td className="border border-black p-1 text-right bg-blue-100">{formatCurrency(getGrandTotal('allocated'))}</td>
                    <td className="border border-black p-1 text-right bg-blue-100">{formatCurrency(getGrandTotal('spent'))}</td>
                    <td className="border border-black p-1 text-right bg-blue-100">{formatCurrency(getGrandTotal('balance'))}</td>

                    <td className="border border-black p-1 text-right">{formatCurrency(getGrandTotal('balance'))}</td>
                    <td className="border border-black p-1 text-right">₹0.00</td>
                  </tr>
                </tfoot>

              </table>
            </div>

            {/* Signatures */}
            <div className="mt-20 flex justify-between px-10">
              <div className="text-center w-48">
                <div className="border-t border-black pt-2">
                  <p className="font-bold text-sm">Prepared By</p>
                  <p className="text-xs">Accounts Assistant</p>
                </div>
              </div>
              
              <div className="text-center w-48">
                <div className="border-t border-black pt-2">
                  <p className="font-bold text-sm">Finance Officer</p>
                  <p className="text-xs">IIT (BHU)</p>
                </div>
              </div>

              <div className="text-center w-48">
                <div className="border-t border-black pt-2">
                  <p className="font-bold text-sm">Registrar / Dean</p>
                  <p className="text-xs">IIT (BHU)</p>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <NeoCard><p className="text-center py-10 text-slate-500">No data available for this project.</p></NeoCard>
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
            margin: 10mm;
          }
        }
      `}</style>
    </AppLayout>
  );
}