"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
import { Plus, FileCheck, Loader2, AlertCircle, Eye, Pencil, Printer, Trash2 } from "lucide-react";
import { getServiceCompletions, deleteServiceCompletion, type ServiceCompletion } from "@/lib/api/serviceCompletion";

export default function ServiceCompletionsPage() {
  // 👇 NEW: RBAC Hook
  const { canCreate, canEdit, canDelete } = usePermissions();

  const [data, setData] = useState<ServiceCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      const res = await getServiceCompletions();
      setData(res.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this certificate?")) {
      try {
        await deleteServiceCompletion(id);
        // Refresh list after delete
        setData(data.filter(item => item.id !== id));
      } catch (err) {
        alert("Failed to delete certificate.");
      }
    }
  };

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
          
          {/* 👇 NEW: RBAC applied */}
          {canCreate && (
            <Link href="/services/new">
              <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>
                New Completion
              </NeoButton>
            </Link>
          )}
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
              
              {/* 👇 NEW: RBAC applied */}
              {canCreate && (
                <Link href="/services/new">
                  <NeoButton variant="primary">Create Now</NeoButton>
                </Link>
              )}
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
                      <td className="p-3 text-slate-600">
                        {item.completion_date ? item.completion_date.split("-").reverse().join("-") : ""}
                      </td>
                      <td className="p-3">
                        <NeoBadge variant="primary">
                          {item.status.toUpperCase()}
                        </NeoBadge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* View Button */}
                          <Link href={`/services/${item.id}`}>
                            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#e0e5ec] text-blue-600 shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] transition-all">
                              <Eye className="h-4 w-4" />
                            </button>
                          </Link>

                          {/* Print Button */}
                          <Link href={`/services/${item.id}/print`}>
                            <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#e0e5ec] text-purple-600 shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] transition-all">
                              <Printer className="h-4 w-4" />
                            </button>
                          </Link>

                          {/* 👇 NEW: RBAC applied */}
                          {canEdit && (
                            <Link href={`/services/${item.id}/edit`}>
                              <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#e0e5ec] text-amber-600 shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] transition-all">
                                <Pencil className="h-4 w-4" />
                              </button>
                            </Link>
                          )}

                          {/* 👇 NEW: RBAC applied */}
                          {canDelete && (
                            <button 
                              onClick={() => handleDelete(item.id!)}
                              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#e0e5ec] text-red-600 shadow-[3px_3px_6px_#b8bcc2,-3px_-3px_6px_#ffffff] hover:shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] transition-all"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                        </div>
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