"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
import { Plus, FileCheck, Loader2, AlertCircle, Eye } from "lucide-react";
import { getServiceCompletions, type ServiceCompletion } from "@/lib/api/serviceCompletion";

export default function ServiceCompletionsPage() {
  const [data, setData] = useState<ServiceCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getServiceCompletions();
        setData(res.results || []);
      } catch (err: any) {
        console.error("Full API Error:", err); // <-- Ye console me print karega
        
        // Error ko readable text me convert karo
        let errorMsg = "Failed to load data";
        if (typeof err === 'string') errorMsg = err;
        else if (err?.message) errorMsg = err.message;
        else if (err?.detail) errorMsg = err.detail;
        else errorMsg = JSON.stringify(err);
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-blue-600">
              <FileCheck className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Service Completions</h1>
              <p className="text-sm text-slate-500">Manage service completion certificates</p>
            </div>
          </div>
          <Link href="/services/new">
            <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>
              New Completion
            </NeoButton>
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-slate-500">Loading data...</p>
          </div>
        ) : error ? (
          <NeoCard>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        ) : data.length === 0 ? (
          <NeoCard>
            <div className="text-center py-10">
              <FileCheck className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No completions found</h3>
              <p className="text-sm text-slate-500 mb-4">Create your first service completion certificate.</p>
              <Link href="/services/new">
                <NeoButton variant="primary">Create Now</NeoButton>
              </Link>
            </div>
          </NeoCard>
        ) : (
          <NeoCard>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300/60 text-left">
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs">Certificate No</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs">PO Number</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs">Date</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs">Status</th>
                    <th className="p-3 font-bold text-slate-500 uppercase text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200/40 hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-800">{item.certificate_no}</td>
                      <td className="p-3 text-slate-600">{item.po_number}</td>
                      <td className="p-3 text-slate-600">{item.completion_date}</td>
                      <td className="p-3">
                        <NeoBadge variant="primary">
                          {item.status.toUpperCase()}
                        </NeoBadge>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/services/${item.id}`}>
                          <NeoButton variant="secondary" size="sm" icon={<Eye className="h-4 w-4" />}>
                            View
                          </NeoButton>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </NeoCard>
        )}
      </div>
    </AppLayout>
  );
}