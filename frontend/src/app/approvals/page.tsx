"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoBadge, NeoIconBox } from "@/components/neumorphism";
import { Loader2, AlertCircle, FileText, ShoppingCart, CheckCircle2, ChevronRight } from "lucide-react";
import { getPendingApprovals, type PendingApprovalsResponse } from "@/lib/api/approvals";
import { formatCurrency } from "@/lib/api/funds";

export default function ApprovalsPage() {
  const [data, setData] = useState<PendingApprovalsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPendingApprovals();
        setData(res);
      } catch (err: any) {
        setError(err.message || "Failed to load approvals");
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
        <div className="flex items-center gap-4 mb-8">
          <NeoIconBox size="lg" color="text-indigo-600">
            <CheckCircle2 className="h-6 w-6" />
          </NeoIconBox>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Pending Approvals</h1>
            <p className="text-sm text-slate-500">Review and approve pending Bills and Purchase Orders</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <NeoCard>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Pending Bills */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Pending Bills</h2>
                </div>
                <NeoBadge variant="warning">{data?.pending_bills.count || 0} Pending</NeoBadge>
              </div>

              {data?.pending_bills.results.length === 0 ? (
                <NeoCard className="text-center py-10">
                  <p className="text-slate-500">No pending bills at the moment.</p>
                </NeoCard>
              ) : (
                data?.pending_bills.results.map((bill) => (
                  <NeoCard key={bill.id} className="hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-500">{bill.bill_no}</span>
                        <h3 className="font-bold text-slate-800 mt-1">{bill.vendor_name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{bill.project_code}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <NeoBadge variant={bill.status === 'approved' ? 'primary' : 'warning'} size="sm">
                            {bill.status.toUpperCase()}
                          </NeoBadge>
                          <span className="text-sm font-bold text-green-600 ml-2">
                            {formatCurrency(bill.total_payable)}
                          </span>
                        </div>
                      </div>
                      <Link href={`/bills/${bill.id}/edit`}>
                        <NeoButton variant="primary" size="sm" icon={<ChevronRight className="h-4 w-4" />}>
                          Review
                        </NeoButton>
                      </Link>
                    </div>
                  </NeoCard>
                ))
              )}
            </div>

            {/* Pending POs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-800">Pending Purchase Orders</h2>
                </div>
                <NeoBadge variant="warning">{data?.pending_pos.count || 0} Pending</NeoBadge>
              </div>

              {data?.pending_pos.results.length === 0 ? (
                <NeoCard className="text-center py-10">
                  <p className="text-slate-500">No pending POs at the moment.</p>
                </NeoCard>
              ) : (
                data?.pending_pos.results.map((po) => (
                  <NeoCard key={po.id} className="hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-slate-500">{po.po_number}</span>
                        <h3 className="font-bold text-slate-800 mt-1">{po.vendor_name}</h3>
                        <p className="text-xs text-slate-500 mt-1">{po.subject || "No subject"}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <NeoBadge variant="info" size="sm">
                            {po.status.toUpperCase()}
                          </NeoBadge>
                          <span className="text-sm font-bold text-slate-800 ml-2">
                            {formatCurrency(po.grand_total)}
                          </span>
                        </div>
                      </div>
                      <Link href={`/purchase/${po.id}/edit`}>
                        <NeoButton variant="primary" size="sm" icon={<ChevronRight className="h-4 w-4" />}>
                          Review
                        </NeoButton>
                      </Link>
                    </div>
                  </NeoCard>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}