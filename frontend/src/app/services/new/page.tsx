"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoInput } from "@/components/neumorphism";
import { ArrowLeft, Save, FileCheck } from "lucide-react";
import { createServiceCompletion } from "@/lib/api/serviceCompletion";
import { getPurchaseOrders } from "@/lib/api/purchase"; // Make sure this API exists in your project

export default function NewServiceCompletionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pos, setPos] = useState<any[]>([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    certificate_no: "",
    purchase_order: "",
    completion_date: new Date().toISOString().split("T")[0],
    remarks: "",
    status: "completed",
  });

  useEffect(() => {
    async function loadPOs() {
      try {
        const res = await getPurchaseOrders();
        
        // Filter: Sirf wahi PO dikhao jisme koi 'service' item ho
        const servicePOs = (res.results || []).filter((po: any) => {
          // Agar PO ke andar items hain, to check karo
          if (po.items && Array.isArray(po.items)) {
            return po.items.some((item: any) => item.item_type === 'service');
          }
          return true; // Agar items nahi hain (API issue), to sab dikhne do
        });
        
        setPos(servicePOs);
      } catch (err) {
        console.error("Failed to load POs", err);
      }
    }
    loadPOs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await createServiceCompletion({
        ...formData,
        purchase_order: Number(formData.purchase_order),
      });
      router.push("/services");
    } catch (err: any) {
      setError(err.message || "Failed to create certificate");
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/services">
            <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </NeoButton>
          </Link>
          <div className="flex items-center gap-3">
            <NeoIconBox size="lg" color="text-green-600">
              <FileCheck className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">New Service Completion</h1>
              <p className="text-sm text-slate-500">Generate a new completion certificate</p>
            </div>
          </div>
        </div>

        {error && (
          <NeoCard padding="sm">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </NeoCard>
        )}

        {/* Form */}
        <NeoCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Certificate No *</label>
                <NeoInput
                  required
                  placeholder="e.g. SC/2024/001"
                  value={formData.certificate_no}
                  onChange={(e) => setFormData({ ...formData, certificate_no: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Completion Date *</label>
                <NeoInput
                  required
                  type="date"
                  value={formData.completion_date}
                  onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Purchase Order *</label>
              <select
                required
                value={formData.purchase_order}
                onChange={(e) => setFormData({ ...formData, purchase_order: e.target.value })}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                style={{
                  boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">Select a Purchase Order</option>
                {pos.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_number} - {po.vendor_name || "Vendor"}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                  style={{
                    boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                  }}
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Remarks</label>
              <textarea
                rows={3}
                placeholder="Any specific remarks or observations..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full p-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium resize-none"
                style={{
                  boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              />
            </div>

            <div className="flex justify-end pt-4">
              <NeoButton type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={loading}>
                {loading ? "Saving..." : "Save Certificate"}
              </NeoButton>
            </div>

          </form>
        </NeoCard>
      </div>
    </AppLayout>
  );
}