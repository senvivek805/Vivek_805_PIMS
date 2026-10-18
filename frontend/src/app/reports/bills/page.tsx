"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
import { ArrowLeft, Printer, Loader2, Receipt } from "lucide-react";
import { getBillEntries, type BillEntry } from "@/lib/api/bills";
import { formatCurrency } from "@/lib/api/funds";

export default function BillsReportPage() {
  const [data, setData] = useState<BillEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getBillEntries();
        setData(res.results || []);
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

  // Calculate Grand Totals
  let totalBase = 0;
  let totalGST = 0;
  let totalOther = 0;
  let totalGross = 0;
  let totalDeductions = 0;
  let totalNet = 0;

  data.forEach(bill => {
    const base = Number(bill.bill_amount) || 0;
    const cgst = Number(bill.cgst_amount) || 0;
    const sgst = Number(bill.sgst_amount) || 0;
    const igst = Number(bill.igst_amount) || 0;
    const gst = cgst + sgst + igst;
    
    const other = Number(bill.other_charges) || 0;
    
    // Deductions = TDS GST + TDS Income Tax + Penalty + PBG
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

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header (Hide on Print) */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
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
          <NeoButton variant="primary" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>
            Print Report
          </NeoButton>
        </div>

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
            {/* Print Header (Visible only on print) */}
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
                      <th className="p-3 font-bold text-slate-700 uppercase print:text-black">Bill / Vendor</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Base Amt</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">GST</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black">Other (+)</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black bg-blue-50/50 print:bg-transparent">Gross Total</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black text-red-700">Deductions (-)</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-right print:text-black bg-green-50/50 print:bg-transparent text-green-700">Net Payable</th>
                      <th className="p-3 font-bold text-slate-700 uppercase text-center print:text-black">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length > 0 ? (
                      data.map((bill) => {
                        const base = Number(bill.bill_amount) || 0;
                        const gst = (Number(bill.cgst_amount) || 0) + (Number(bill.sgst_amount) || 0) + (Number(bill.igst_amount) || 0);
                        const other = Number(bill.other_charges) || 0;
                        const deductions = (Number(bill.tds_gst) || 0) + (Number(bill.tds_income_tax) || 0) + (Number(bill.penalty) || 0) + (Number(bill.pbg_security) || 0);
                        const gross = base + gst + other;
                        
                        return (
                          <tr key={bill.id} className="border-b border-slate-200 print:border-gray-300 hover:bg-slate-50/30">
                            <td className="p-3">
                              <p className="font-bold text-slate-800 print:text-black">{bill.bill_no}</p>
                              <p className="text-xs text-slate-500 print:text-gray-600">{bill.vendor_name}</p>
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
                        <td colSpan={8} className="p-6 text-center text-slate-500">No bills found.</td>
                      </tr>
                    )}
                  </tbody>
                  {/* Footer Total Row */}
                  {data.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100 print:bg-transparent border-t-2 border-slate-400 print:border-black font-bold">
                        <td className="p-3 text-slate-800 print:text-black uppercase text-right">Grand Total</td>
                        <td className="p-3 text-right text-slate-800 print:text-black">{formatCurrency(totalBase)}</td>
                        <td className="p-3 text-right text-slate-800 print:text-black">{formatCurrency(totalGST)}</td>
                        <td className="p-3 text-right text-slate-800 print:text-black">{formatCurrency(totalOther)}</td>
                        <td className="p-3 text-right text-blue-800 print:text-black">{formatCurrency(totalGross)}</td>
                        <td className="p-3 text-right text-red-600 print:text-black">- {formatCurrency(totalDeductions)}</td>
                        <td className="p-3 text-right text-green-700 print:text-black">{formatCurrency(totalNet)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  )}
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