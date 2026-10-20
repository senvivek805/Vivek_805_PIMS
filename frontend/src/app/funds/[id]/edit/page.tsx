"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoInput } from "@/components/neumorphism";
import { ArrowLeft, Save, IndianRupee, Loader2, AlertCircle, FileText } from "lucide-react";
import { getFundReceipt, updateFundReceipt, FUND_TYPE_LABELS, type FundType } from "@/lib/api/funds";
import { getProjects, type Project } from "@/lib/api/projects";

export default function EditFundReceiptPage() {
  const params = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);

  const [formData, setFormData] = useState({
    project: "",
    receipt_reference_no: "",
    amount_received: "",
    receipt_date: "",
    financial_year: "",
    fund_type: "grant" as FundType, // Default lowercase
    remarks: "",
  });

  const fyOptions = [
    "2022-23", "2023-24", "2024-25", "2025-26", "2026-27", "2027-28", "2028-29", "2029-30",
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const [receiptRes, projectsRes] = await Promise.all([
          getFundReceipt(Number(params.id)),
          getProjects()
        ]);

        setProjects(projectsRes.results || []);
        
        setFormData({
          project: String(receiptRes.project || ""),
          receipt_reference_no: receiptRes.receipt_reference_no || "",
          amount_received: String(receiptRes.amount_received || ""),
          receipt_date: receiptRes.receipt_date || "",
          financial_year: receiptRes.financial_year || "2026-27",
          fund_type: (receiptRes.fund_type || "grant") as FundType,
          remarks: receiptRes.remarks || "",
        });
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
      await updateFundReceipt(Number(params.id), {
        ...formData,
        project: Number(formData.project),
        amount_received: Number(formData.amount_received),
      });
      router.push(`/funds/${params.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to update receipt");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-blue-600" /></div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href={`/funds/${params.id}`}>
            <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </NeoButton>
          </Link>
          <div className="flex items-center gap-3">
            <NeoIconBox size="lg" color="text-amber-600">
              <IndianRupee className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Edit Fund Receipt</h1>
              <p className="text-sm text-slate-500">Update receipt details</p>
            </div>
          </div>
        </div>

        {error && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {/* Form */}
        <NeoCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Project *</label>
                <select
                  required
                  value={formData.project}
                  onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                  style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.project_code} - {p.project_name}</option>
                  ))}
                </select>
              </div>

              <NeoInput
                label="Reference No *"
                value={formData.receipt_reference_no}
                onChange={(e) => setFormData({ ...formData, receipt_reference_no: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <NeoInput
                label="Amount Received (₹) *"
                type="number"
                step="0.01"
                value={formData.amount_received}
                onChange={(e) => setFormData({ ...formData, amount_received: e.target.value })}
                required
              />

              <NeoInput
                label="Receipt Date *"
                type="date"
                value={formData.receipt_date}
                onChange={(e) => setFormData({ ...formData, receipt_date: e.target.value })}
                required
              />

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Financial Year *</label>
                <select
                  required
                  value={formData.financial_year}
                  onChange={(e) => setFormData({ ...formData, financial_year: e.target.value })}
                  className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                  style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
                >
                  {fyOptions.map((fy) => (
                    <option key={fy} value={fy}>{fy}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Fund Type *</label>
              <select
                required
                value={formData.fund_type}
                onChange={(e) => setFormData({ ...formData, fund_type: e.target.value as FundType })}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium"
                style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
              >
                {Object.entries(FUND_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Remarks</label>
              <textarea
                rows={3}
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                className="w-full p-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium resize-none"
                style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <NeoButton type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={saving}>
                {saving ? "Updating..." : "Update Receipt"}
              </NeoButton>
            </div>

          </form>
        </NeoCard>
      </div>
    </AppLayout>
  );
}