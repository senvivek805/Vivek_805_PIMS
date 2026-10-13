"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  NeoCard,
  NeoButton,
  NeoIconBox,
  NeoInput,
} from "@/components/neumorphism";
import {
  IndianRupee,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  FileText,
  Calendar,
  Building2,
} from "lucide-react";
import {
  createFundReceipt,
  FUND_TYPE_LABELS,
  type FundReceiptCreateUpdate,
  type FundType,
} from "@/lib/api/funds";
import { getProjects, type Project } from "@/lib/api/projects";

export default function NewFundReceiptPage() {
  const router = useRouter();

  // States
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form
  const [projectId, setProjectId] = useState<number | "">("");
  const [financialYear, setFinancialYear] = useState("2026-27");
  const [fundType, setFundType] = useState<FundType>("grant");
  const [receiptDate, setReceiptDate] = useState("");
  const [receiptRef, setReceiptRef] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  // ============================================
  // LOAD PROJECTS
  // ============================================

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getProjects();
        setProjects(data.results);
      } catch (err: any) {
        setError("Failed to load projects: " + err.message);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // ============================================
  // FY OPTIONS
  // ============================================

  const fyOptions = [
    "2022-23",
    "2023-24",
    "2024-25",
    "2025-26",
    "2026-27",
    "2027-28",
    "2028-29",
    "2029-30",
  ];

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    // Validation
    if (!projectId) {
      setError("Project select karo.");
      return;
    }
    if (!financialYear) {
      setError("Financial Year zaroori hai.");
      return;
    }
    if (!receiptDate) {
      setError("Receipt Date zaroori hai.");
      return;
    }
    if (!receiptRef.trim()) {
      setError("Reference No. zaroori hai.");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount zaroori hai (0 se zyada).");
      return;
    }

    setLoading(true);
    try {
      const payload: FundReceiptCreateUpdate = {
        project: Number(projectId),
        financial_year: financialYear,
        receipt_date: receiptDate,
        receipt_reference_no: receiptRef.trim(),
        fund_type: fundType,
        amount_received: parseFloat(amount),
        remarks: remarks,
      };

      const created = await createFundReceipt(payload);
      setSuccess("Fund Receipt successfully create ho gaya! 🎉");

      setTimeout(() => {
        router.push(`/funds/${created.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create fund receipt");
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-green-600">
              <IndianRupee className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                New Fund Receipt
              </h1>
              <p className="text-sm text-slate-500">
                Record a new fund received for a project
              </p>
            </div>
          </div>
          <Link href="/funds">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<X className="h-4 w-4" />}
            >
              Cancel
            </NeoButton>
          </Link>
        </div>

        {/* Error */}
        {error && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {/* Success */}
        {success && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          </NeoCard>
        )}

        {/* Form */}
        <NeoCard>
          {/* Section 1: Project */}
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <Building2 className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Project Selection
              </h2>
              <p className="text-xs text-slate-500">
                Kis project ka fund hai
              </p>
            </div>
          </div>

          <div className="space-y-1.5 mb-8">
            <label className="text-slate-700 font-medium text-xs pl-2">
              Project *
            </label>
            <select
              value={projectId}
              onChange={(e) =>
                setProjectId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
              style={{
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
              disabled={loadingData}
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.project_code} — {p.project_name}
                </option>
              ))}
            </select>
          </div>

          {/* Section 2: Receipt Info */}
          <div className="flex items-center gap-3 mb-6 pt-6 border-t border-slate-200/40">
            <NeoIconBox size="md" color="text-green-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Receipt Information
              </h2>
              <p className="text-xs text-slate-500">
                Fund details
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Financial Year */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Financial Year *
              </label>
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {fyOptions.map((fy) => (
                  <option key={fy} value={fy}>
                    {fy}
                  </option>
                ))}
              </select>
            </div>

            {/* Fund Type */}
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Fund Type *
              </label>
              <select
                value={fundType}
                onChange={(e) => setFundType(e.target.value as FundType)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {Object.entries(FUND_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Receipt Date */}
            <NeoInput
              id="receipt_date"
              label="Receipt Date *"
              type="date"
              value={receiptDate}
              onChange={(e) => setReceiptDate(e.target.value)}
              required
            />

            {/* Reference No */}
            <NeoInput
              id="receipt_ref"
              label="Reference No. *"
              placeholder="e.g., Cheque/12345, NEFT/ABC"
              value={receiptRef}
              onChange={(e) => setReceiptRef(e.target.value)}
              required
            />

            {/* Amount */}
            <div className="md:col-span-2">
              <NeoInput
                id="amount"
                label="Amount Received (₹) *"
                type="number"
                placeholder="e.g., 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Remarks */}
            <div className="md:col-span-2">
              <NeoInput
                id="remarks"
                label="Remarks"
                placeholder="Any additional notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </NeoCard>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href="/funds">
            <NeoButton
              type="button"
              variant="secondary"
              size="lg"
              icon={<X className="h-4 w-4" />}
            >
              Cancel
            </NeoButton>
          </Link>
          <NeoButton
            type="button"
            variant="primary"
            size="lg"
            loading={loading}
            onClick={handleSubmit}
            icon={<Save className="h-4 w-4" />}
          >
            {loading ? "Saving..." : "Save Fund Receipt"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}