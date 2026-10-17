"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
import { ArrowLeft, Printer, FileCheck, Loader2 } from "lucide-react";
import { getServiceCompletion, type ServiceCompletion } from "@/lib/api/serviceCompletion";

export default function ServiceCompletionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<ServiceCompletion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getServiceCompletion(Number(params.id));
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadData();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <NeoCard><p className="text-red-600 text-center">{error || "Not found"}</p></NeoCard>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/services">
              <NeoButton variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </NeoButton>
            </Link>
            <div className="flex items-center gap-3">
              <NeoIconBox size="lg" color="text-blue-600">
                <FileCheck className="h-6 w-6" />
              </NeoIconBox>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Certificate Details</h1>
                <p className="text-sm text-slate-500">{data.certificate_no}</p>
              </div>
            </div>
          </div>
          
          <Link href={`/services/${data.id}/print`}>
            <NeoButton variant="primary" icon={<Printer className="h-4 w-4" />}>
              Print Certificate
            </NeoButton>
          </Link>
        </div>

        {/* Details Card */}
        <NeoCard padding="lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Certificate No</p>
                <p className="text-lg font-semibold text-slate-800">{data.certificate_no}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Completion Date</p>
                <p className="text-md font-medium text-slate-700">{data.completion_date}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                <NeoBadge variant={data.status === 'completed' ? 'success' : 'warning'}>
                  {data.status.toUpperCase()}
                </NeoBadge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Purchase Order</p>
                <p className="text-md font-medium text-slate-700">{data.po_number}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Vendor</p>
                <p className="text-md font-medium text-slate-700">{data.vendor_name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Project</p>
                <p className="text-md font-medium text-slate-700">{data.project_name || "N/A"}</p>
              </div>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-300/60">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Remarks</p>
            <p className="text-sm text-slate-700 bg-[#e0e5ec] p-4 rounded-xl shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff]">
              {data.remarks || "No remarks provided."}
            </p>
          </div>
        </NeoCard>

      </div>
    </AppLayout>
  );
}