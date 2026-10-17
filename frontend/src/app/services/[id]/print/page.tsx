"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { getServiceCompletion, type ServiceCompletion } from "@/lib/api/serviceCompletion";

export default function PrintServiceCompletionPage() {
  const params = useParams();
  const [data, setData] = useState<ServiceCompletion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getServiceCompletion(Number(params.id));
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadData();
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin" /></div>;
  if (!data) return <div className="text-center py-20 text-red-600">Certificate not found</div>;

  return (
    <div className="min-h-screen bg-gray-200 py-10 print:bg-white print:py-0 font-serif">
      
      {/* Controls - Hide on Print */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-4 font-sans">
        <Link href={`/services/${data.id}`} className="flex items-center text-slate-700 hover:text-slate-900 bg-white px-4 py-2 rounded-lg shadow">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Details
        </Link>
        <button onClick={handlePrint} className="flex items-center bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700">
          <Printer className="h-4 w-4 mr-2" /> Print Certificate
        </button>
      </div>

      {/* A4 Size Paper (Added flex flex-col for footer) */}
      <div className="max-w-[210mm] mx-auto bg-white p-10 shadow-xl print:shadow-none min-h-[297mm] print:min-h-0 text-black flex flex-col">
        
        {/* Professional Header with Logos */}
        <div className="flex flex-col items-center justify-center border-b-2 border-black pb-4 mb-8 text-center">
          
          {/* Emblem and Text Logo Parallel (Side-by-Side) */}
          <div className="flex items-center justify-center gap-6 mb-3 shrink-0">
            <img 
              src="/iitbhu-emblem.png" 
              alt="IIT BHU Emblem" 
              className="w-20 h-20 object-contain shrink-0" 
            />
            <img 
              src="/iitbhu-text.png" 
              alt="IIT BHU Text" 
              className="w-[280px] h-auto object-contain shrink-0" 
            />
          </div>

          {/* Text Details Below Logos */}
          <h1 className="text-[16px] font-bold uppercase tracking-wide leading-tight">Indian Institute of Technology</h1>
          <h2 className="text-[12px] font-bold uppercase tracking-wide leading-tight">(Banaras Hindu University)</h2>
          <p className="text-[13px] mt-1 font-semibold">Varanasi - 221005</p>
          <h3 className="text-[16px] font-bold mt-3 underline decoration-1 underline-offset-4 uppercase leading-tight">
            Service Completion Certificate
          </h3>
          
        </div>

        {/* Meta Info */}
        <div className="flex justify-between mb-8 text-[15px]">
          <div className="space-y-1">
            <p><strong>Certificate No:</strong> {data.certificate_no}</p>
            <p><strong>Date:</strong> {data.completion_date.split("-").reverse().join("-")}</p>
          </div>
          <div className="text-right space-y-1">
            <p><strong>PO Number:</strong> {data.po_number}</p>
            <p><strong>Vendor:</strong> M/s. {data.vendor_name || "N/A"}</p>
          </div>
        </div>

        {/* Body Content */}
        <div className="space-y-6 text-[16px] leading-relaxed text-justify flex-1">
          <p>
            This is to certify that the services against Purchase Order <strong>{data.po_number}</strong>{" "}
            {data.project_name ? ` for the project "${data.project_name}"` : ""} awarded to M/s.{" "}
            <strong>{data.vendor_name || "the vendor"}</strong>{" "}
            have been successfully completed on <strong>{data.completion_date.split("-").reverse().join("-")}</strong>.
          </p>
          
          <p>
            The work has been inspected and found satisfactory in all respects as per the terms and conditions 
            of the Purchase Order. The vendor has fulfilled all obligations required for the completion of the said work/services.
          </p>

          {data.remarks && (
            <div className="mt-6">
              <p className="font-bold mb-1">Remarks:</p>
              <p className="italic pl-4">{data.remarks}</p>
            </div>
          )}

          <p className="mt-6">
            This certificate is issued for record and further necessary action.
          </p>
        </div>

        {/* Signatures */}
        <div className="mt-32 flex justify-between px-10">
          <div className="text-center w-52">
            <div className="border-t border-black pt-2">
              <p className="font-bold text-[15px]">Prepared By</p>
              <p className="text-[13px] text-gray-700"></p>
            </div>
          </div>
          
          <div className="text-center w-52">
            <div className="border-t border-black pt-2">
              <p className="font-bold text-[15px]">Approved By</p>
              <p className="text-[13px] text-gray-700"></p>
            </div>
          </div>
        </div>

        {/* ================= FOOTER ================= */}
        <div className="mt-auto pt-4 border-t border-gray-300 text-center text-[10px] text-gray-500 font-sans">
          This is a computer-generated document. No signature is required if generated digitally.
        </div>

      </div>
      
    </div>
  );
}