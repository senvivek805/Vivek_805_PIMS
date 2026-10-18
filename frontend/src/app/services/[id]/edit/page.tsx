"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoInput } from "@/components/neumorphism";
import { ArrowLeft, Save, Edit, Loader2 } from "lucide-react";
import { getServiceCompletion, updateServiceCompletion } from "@/lib/api/serviceCompletion";
import { getPurchaseOrders } from "@/lib/api/purchase";

export default function EditServiceCompletionPage() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pos, setPos] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    certificate_no: "",
    purchase_order: "",
    completion_date: "",
    remarks: "",
    status: "completed",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [certRes, poRes] = await Promise.all([
          getServiceCompletion(Number(params.id)),
          getPurchaseOrders()
        ]);

        // Set form data with existing values
        setFormData({
          certificate_no: certRes.certificate_no,
          purchase_order: String(certRes.purchase_order),
          completion_date: certRes.completion_date,
          remarks: certRes.remarks || "",
          status: certRes.status,
        });

        // Filter service POs
        const servicePOs = (poRes.results || []).filter((po: any) => {
          if (po.items && Array.isArray(po.items)) {
            return po.items.some((item: any) => item.item_type === 'service');
          }
          return true;
        });
        setPos(servicePOs);

      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateServiceCompletion(Number(params.id), {
        ...formData,
        purchase_order: Number(formData.purchase_order),
      });
      router.push("/services");
    } catch (err: any) {
      setError(err.message || "Failed to update certificate");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

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
            <NeoIconBox size="lg" color="text-amber-600">
              <Edit className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Edit Completion</h1>
              <p className="text-sm text-slate-500">Update certificate details</p>
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
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full p-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium resize-none"
                style={{
                  boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              />
            </div>

            <div className="flex justify-end pt-4">
              <NeoButton type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={saving}>
                {saving ? "Updating..." : "Update Certificate"}
              </NeoButton>
            </div>

          </form>
        </NeoCard>
      </div>
    </AppLayout>
  );
}