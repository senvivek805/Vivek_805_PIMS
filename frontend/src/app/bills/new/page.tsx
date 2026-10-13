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
  NeoBadge,
} from "@/components/neumorphism";
import {
  Receipt,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  FolderKanban,
  Calendar,
  FileText,
  Plus,
  Trash2,
  IndianRupee,
  Landmark,
  Info,
} from "lucide-react";
import {
  createBillEntry,
  type BillEntryCreateUpdate,
  type BillStatus,
} from "@/lib/api/bills";
import { getVendors, type Vendor } from "@/lib/api/vendors";
import { getProjects, type Project } from "@/lib/api/projects";
import { getPurchaseOrders, type PurchaseOrder } from "@/lib/api/purchase";
import { getBudgetHeads, type BudgetHead } from "@/lib/api/funds";

// ============================================
// LINE ITEM ROW
// ============================================

interface LineItemRow {
  id: string;
  date: string;
  particulars: string;
  amount_rs: string;
  amount_paise: string;
  remarks: string;
}

function generateRowId() {
  return `line-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

const STATUS_OPTIONS: BillStatus[] = [
  "draft",
  "submitted",
  "approved",
  "paid",
  "cancelled",
];

export default function NewBillPage() {
  const router = useRouter();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [budgetHeads, setBudgetHeads] = useState<BudgetHead[]>([]);
  const [budgetHeadId, setBudgetHeadId] = useState<number | "">("");
  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Bill Info
  const [billNo, setBillNo] = useState("");
  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [diaryVoucherNo, setDiaryVoucherNo] = useState("");
  const [diaryVoucherDate, setDiaryVoucherDate] = useState("");

  // Relations
  const [projectId, setProjectId] = useState<number | "">("");
  const [vendorId, setVendorId] = useState<number | "">("");
  const [poId, setPoId] = useState<number | "">("");

  // Budget Heads (auto-fill)
  const [majorBudgetHead, setMajorBudgetHead] = useState("");
  const [minorBudgetHead, setMinorBudgetHead] = useState("");
  const [schemeCode, setSchemeCode] = useState("");
  const [componentCode, setComponentCode] = useState("");

  // Recipient & Particulars
  const [recipientName, setRecipientName] = useState("");
  const [particulars, setParticulars] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [absentee, setAbsentee] = useState("");

  // Base amount
  const [billAmount, setBillAmount] = useState("");

  // GST (ADD)
  const [gstType, setGstType] = useState("none");
  const [cgstRate, setCgstRate] = useState("0");
  const [sgstRate, setSgstRate] = useState("0");
  const [igstRate, setIgstRate] = useState("0");

  // TDS under GST (DEDUCT)
  const [tdsGstType, setTdsGstType] = useState("none");
  const [tdsGstRate, setTdsGstRate] = useState("0");

  // TDS Income Tax (DEDUCT)
  const [tdsItType, setTdsItType] = useState("none");
  const [tdsIncomeTaxRate, setTdsIncomeTaxRate] = useState("0");

  // Penalty + PBG
  const [penalty, setPenalty] = useState("0");
  const [penaltyApplicable, setPenaltyApplicable] = useState(false);
  const [pbgSecurity, setPbgSecurity] = useState("0");
  const [pbgApplicable, setPbgApplicable] = useState(false);

  // Other Charges (No Tax)
  const [otherCharges, setOtherCharges] = useState("0");
  const [otherChargesRemarks, setOtherChargesRemarks] = useState("");

  // RTGS Bank Details
  const [bankAccountName, setBankAccountName] = useState("");
  const [bankAccountNo, setBankAccountNo] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankAccountType, setBankAccountType] = useState("Savings");
  const [bankAddress, setBankAddress] = useState("");
  const [rtgsPurpose, setRtgsPurpose] = useState("");

  // Status & Remarks
  const [status, setStatus] = useState<BillStatus>("draft");
  const [remarks, setRemarks] = useState("");

  // Line Items
  const [items, setItems] = useState<LineItemRow[]>([
    {
      id: generateRowId(),
      date: new Date().toISOString().split("T")[0],
      particulars: "",
      amount_rs: "",
      amount_paise: "0",
      remarks: "",
    },
  ]);

  // ============================================
  // LOAD DATA
  // ============================================

  useEffect(() => {
    async function loadData() {
      try {
        const [vendorsData, projectsData, poData, bhData] = await Promise.all([
          getVendors(),
          getProjects(),
          getPurchaseOrders(),
          getBudgetHeads(),
        ]);
        setBudgetHeads(bhData);
        setVendors(vendorsData.results);
        setProjects(projectsData.results);
        setPurchaseOrders(poData.results);
      } catch (err: any) {
        setError("Failed to load dropdowns: " + err.message);
      } finally {
        setLoadingData(false);
      }
    }
    loadData();
  }, []);

  // ============================================
  // AUTO-FILL: PROJECT → MAJOR/MINOR HEADS
  // ============================================

  useEffect(() => {
    if (!projectId) return;
    const proj = projects.find((p) => p.id === Number(projectId));
    if (proj) {
      setMajorBudgetHead((proj as any).major_budget_head || "IITBHU-SLCR");
      // Minor head WITHOUT (Sub Head) — Sub Head baad me add hoga
      setMinorBudgetHead(
        (proj as any).minor_budget_head || `${proj.project_code}`
      );
    }
  }, [projectId, projects]);

  // ============================================
  // AUTO-FILL: VENDOR → BANK DETAILS
  // ============================================

  useEffect(() => {
    if (!vendorId) return;
    const vend = vendors.find((v) => v.id === Number(vendorId));
    if (vend) {
      setRecipientName(vend.vendor_name);
      setBankAccountName(vend.vendor_name);
      setBankName((vend as any).bank_name || "");
      setBankBranch((vend as any).bank_branch || "");
      setBankIfsc((vend as any).ifsc_code || "");
      setBankAccountNo((vend as any).account_number || "");
      setBankAccountType(
        (vend as any).account_type === "savings" ? "Savings" : "Current"
      );
      const addr = [
        (vend as any).address_line1,
        (vend as any).address_line2,
        (vend as any).city,
        (vend as any).state,
        (vend as any).pincode,
      ]
        .filter(Boolean)
        .join(", ");
      setBankAddress(addr);
    }
  }, [vendorId, vendors]);

  // ============================================
  // AUTO-FILL: PO → PARTICULARS
  // ============================================

  useEffect(() => {
    if (!poId) return;
    const po = purchaseOrders.find((p) => p.id === Number(poId));
    if (po) {
      setParticulars(po.subject || "");
      if (!billAmount) setBillAmount(String(po.grand_total || ""));
      if (!recipientName) setRecipientName(po.vendor_name || "");
    }
  }, [poId, purchaseOrders]);

  // ============================================
  // LIVE CALCULATION
  // ============================================

  const baseAmount = parseFloat(billAmount) || 0;

  // GST (ADD to base)
  const cgstAmount = (baseAmount * (parseFloat(cgstRate) || 0)) / 100;
  const sgstAmount = (baseAmount * (parseFloat(sgstRate) || 0)) / 100;
  const igstAmount = (baseAmount * (parseFloat(igstRate) || 0)) / 100;
  const totalGst = cgstAmount + sgstAmount + igstAmount;

  // Total Bill Amount = Base + GST
  const totalBillAmount = baseAmount + totalGst;

  // Deductions (SUBTRACT)
  const tdsGstAmount = (baseAmount * (parseFloat(tdsGstRate) || 0)) / 100;
  const tdsIncomeTaxAmount =
    (baseAmount * (parseFloat(tdsIncomeTaxRate) || 0)) / 100;
  const penaltyAmount = parseFloat(penalty) || 0;
  const pbgAmount = parseFloat(pbgSecurity) || 0;
  const otherChargesAmount = parseFloat(otherCharges) || 0;

  const totalDeductions =
    tdsGstAmount + tdsIncomeTaxAmount + penaltyAmount + pbgAmount;

  const totalPayable =
    totalBillAmount + otherChargesAmount - totalDeductions;

  // ============================================
  // TAX DROPDOWN HANDLERS
  // ============================================

  function handleGstTypeChange(value: string) {
    setGstType(value);
    const presets: Record<
      string,
      { cgst: string; sgst: string; igst: string }
    > = {
      none: { cgst: "0", sgst: "0", igst: "0" },
      gst_5_intra: { cgst: "2.5", sgst: "2.5", igst: "0" },
      gst_12_intra: { cgst: "6", sgst: "6", igst: "0" },
      gst_18_intra: { cgst: "9", sgst: "9", igst: "0" },
      gst_28_intra: { cgst: "14", sgst: "14", igst: "0" },
      gst_5_inter: { cgst: "0", sgst: "0", igst: "5" },
      gst_12_inter: { cgst: "0", sgst: "0", igst: "12" },
      gst_18_inter: { cgst: "0", sgst: "0", igst: "18" },
      gst_28_inter: { cgst: "0", sgst: "0", igst: "28" },
      custom: { cgst: cgstRate, sgst: sgstRate, igst: igstRate },
    };
    const p = presets[value] || presets.none;
    setCgstRate(p.cgst);
    setSgstRate(p.sgst);
    setIgstRate(p.igst);
  }

  function handleTdsGstTypeChange(value: string) {
    setTdsGstType(value);
    const presets: Record<string, string> = {
      none: "0",
      cgst_1: "1",
      sgst_1: "1",
      igst_2: "2",
      cgst_sgst_2: "2",
      custom: tdsGstRate,
    };
    setTdsGstRate(presets[value] || "0");
  }

  function handleTdsItTypeChange(value: string) {
    setTdsItType(value);
    const presets: Record<string, string> = {
      none: "0",
      sec_194j: "10",
      sec_194c_ind: "1",
      sec_194c_co: "2",
      sec_194q: "0.1",
      sec_194h: "5",
      sec_194i: "10",
      sec_195: "20",
      custom: tdsIncomeTaxRate,
    };
    setTdsIncomeTaxRate(presets[value] || "0");
  }

  // ============================================
  // LINE ITEM HANDLERS
  // ============================================

  function addLineItem() {
    setItems([
      ...items,
      {
        id: generateRowId(),
        date: new Date().toISOString().split("T")[0],
        particulars: "",
        amount_rs: "",
        amount_paise: "0",
        remarks: "",
      },
    ]);
  }

  function removeLineItem(id: string) {
    if (items.length === 1) {
      alert("At least one line item is required.");
      return;
    }
    setItems(items.filter((it) => it.id !== id));
  }

  function updateLineItem(
    id: string,
    field: keyof LineItemRow,
    value: string
  ) {
    setItems(
      items.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  }

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!billNo.trim()) {
      setError("Bill No. is required.");
      return;
    }
    if (!billDate) {
      setError("Bill Date is required.");
      return;
    }
    if (!recipientName.trim()) {
      setError("Recipient Name is required.");
      return;
    }
    if (!billAmount || parseFloat(billAmount) <= 0) {
      setError("Bill Amount must be greater than 0.");
      return;
    }

    setLoading(true);
    try {
      const payload: BillEntryCreateUpdate = {
        bill_no: billNo.trim(),
        bill_date: billDate,
        diary_voucher_no: diaryVoucherNo || undefined,
        diary_voucher_date: diaryVoucherDate || null,
        project: projectId ? Number(projectId) : null,
        vendor: vendorId ? Number(vendorId) : null,
        purchase_order: poId ? Number(poId) : null,
        budget_head: budgetHeadId ? Number(budgetHeadId) : null,
        major_budget_head: majorBudgetHead || undefined,
        minor_budget_head: minorBudgetHead || undefined,
        scheme_code: schemeCode || undefined,
        component_code: componentCode || undefined,
        recipient_name: recipientName.trim(),
        particulars: particulars || undefined,
        vendor_bill_no: invoiceNo || undefined,
        vendor_bill_date: invoiceDate || null,
        absentee: absentee || undefined,
        bill_amount: parseFloat(billAmount) || 0,
        cgst_rate: parseFloat(cgstRate) || 0,
        sgst_rate: parseFloat(sgstRate) || 0,
        igst_rate: parseFloat(igstRate) || 0,
        tds_gst_rate: parseFloat(tdsGstRate) || 0,
        tds_income_tax_rate: parseFloat(tdsIncomeTaxRate) || 0,
        penalty: parseFloat(penalty) || 0,
        penalty_applicable: penaltyApplicable,
        pbg_security: parseFloat(pbgSecurity) || 0,
        pbg_applicable: pbgApplicable,
        other_charges: parseFloat(otherCharges) || 0,
        other_charges_remarks: otherChargesRemarks || undefined,
        bank_account_name: bankAccountName || undefined,
        bank_account_no: bankAccountNo || undefined,
        bank_name: bankName || undefined,
        bank_branch: bankBranch || undefined,
        bank_ifsc: bankIfsc || undefined,
        bank_account_type: bankAccountType || undefined,
        bank_address: bankAddress || undefined,
        rtgs_purpose: rtgsPurpose || undefined,
        status: status,
        remarks: remarks || undefined,
        items: items
          .filter((it) => it.particulars.trim())
          .map((it, idx) => ({
            date: it.date || null,
            particulars: it.particulars.trim(),
            amount_rs: parseFloat(it.amount_rs) || 0,
            amount_paise: parseFloat(it.amount_paise) || 0,
            remarks: it.remarks || undefined,
            order: idx + 1,
          })),
      };

      const created = await createBillEntry(payload);
      setSuccess("Bill Entry created successfully! 🎉");

      setTimeout(() => {
        router.push(`/bills/${created.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create bill");
      setLoading(false);
    }
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-blue-600">
              <Receipt className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                New Bill Entry (Form 5)
              </h1>
              <p className="text-sm text-slate-500">
                Bill for Direct Payment by Finance Section
              </p>
            </div>
          </div>
          <Link href="/bills">
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

        {/* SECTION 1: BILL INFO */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Bill Information
              </h2>
              <p className="text-xs text-slate-500">
                Bill No., Date & Diary Voucher
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="bill_no"
              label="Bill No. *"
              placeholder="e.g., IIT(BHU)/CE/SLCR/25-26/001"
              value={billNo}
              onChange={(e) => setBillNo(e.target.value)}
              required
            />
            <NeoInput
              id="bill_date"
              label="Bill Date *"
              type="date"
              value={billDate}
              onChange={(e) => setBillDate(e.target.value)}
              required
            />
            <NeoInput
              id="diary_voucher_no"
              label="Diary Voucher No."
              placeholder="Optional"
              value={diaryVoucherNo}
              onChange={(e) => setDiaryVoucherNo(e.target.value)}
            />
            <NeoInput
              id="diary_voucher_date"
              label="Diary Voucher Date"
              type="date"
              value={diaryVoucherDate}
              onChange={(e) => setDiaryVoucherDate(e.target.value)}
            />

            <div className="md:col-span-2">
              <div
                className="p-3 rounded-xl flex items-center gap-3"
                style={{
                  background: "rgba(79, 109, 245, 0.08)",
                  borderLeft: "3px solid #4f6df5",
                }}
              >
                <Info className="h-4 w-4 text-blue-600" />
                <p className="text-xs text-slate-600">
                  <strong>Document No.</strong> will be auto-generated (e.g.,
                  PIMS/BILL/2026/0001)
                </p>
              </div>
            </div>
          </div>
        </NeoCard>

        {/* SECTION 2: PROJECT & BUDGET HEADS */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-purple-600">
              <FolderKanban className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Project & Budget Heads
              </h2>
              <p className="text-xs text-slate-500">
                Project select karne pe Major/Minor auto-fill hoga
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Project
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

            <NeoInput
              id="major_budget_head"
              label="Major Budget Head"
              placeholder="Auto-filled from project"
              value={majorBudgetHead}
              onChange={(e) => setMajorBudgetHead(e.target.value)}
            />
            <NeoInput
              id="minor_budget_head"
              label="Minor Budget Head"
              placeholder="Auto-filled from project"
              value={minorBudgetHead}
              onChange={(e) => setMinorBudgetHead(e.target.value)}
            />

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Sub Head (Manpower / Travel / Equipment)
              </label>
              <select
                value={budgetHeadId}
                onChange={(e) => {
                  const id = e.target.value ? Number(e.target.value) : "";
                  setBudgetHeadId(id);

                  // Sub Head select hone pe Minor Head update karo
                  if (id) {
                    const bh = budgetHeads.find((b) => b.id === id);
                    if (bh) {
                      const baseProj = projects.find(
                        (p) => p.id === Number(projectId)
                      );
                      const baseMinor =
                        (baseProj as any)?.minor_budget_head ||
                        `${baseProj?.project_code || ""}`;

                      const cleanBase = baseMinor.replace(
                        /\s*\([^)]*\)\s*$/,
                        ""
                      );

                      setMinorBudgetHead(`${cleanBase} (${bh.name})`);
                    }
                  }
                }}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
                disabled={loadingData}
              >
                <option value="">— Select Sub Head —</option>
                {budgetHeads.map((bh) => (
                  <option key={bh.id} value={bh.id}>
                    {bh.name} — {bh.code || ""}
                  </option>
                ))}
              </select>
            </div>

            {/* ============================================
                SCHEME CODE
                ============================================ */}
            <NeoInput
              id="scheme_code"
              label="Scheme Code"
              placeholder="e.g., 4066 (optional)"
              value={schemeCode}
              onChange={(e) => setSchemeCode(e.target.value)}
            />

            {/* ============================================
                COMPONENT CODE
                ============================================ */}
            <NeoInput
              id="component_code"
              label="Component Code"
              placeholder="e.g., 6.2.3 (optional)"
              value={componentCode}
              onChange={(e) => setComponentCode(e.target.value)}
            />
          </div>
        </NeoCard>

        {/* SECTION 3: VENDOR & PO */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-green-600">
              <Building2 className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Vendor & Purchase Order
              </h2>
              <p className="text-xs text-slate-500">
                Vendor select karne pe bank details auto-fill honge
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Vendor
              </label>
              <select
                value={vendorId}
                onChange={(e) =>
                  setVendorId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
                disabled={loadingData}
              >
                <option value="">Select Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vendor_code} — {v.vendor_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Purchase Order
              </label>
              <select
                value={poId}
                onChange={(e) =>
                  setPoId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
                disabled={loadingData}
              >
                <option value="">Select PO (optional)</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_number} — {po.vendor_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <NeoInput
                id="recipient_name"
                label="Name of Recipient *"
                placeholder="Vendor / Employee Name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
              />
            </div>
          </div>
        </NeoCard>

        {/* SECTION 4: PARTICULARS + LINE ITEMS */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-orange-600">
              <Receipt className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Particulars & Line Items
              </h2>
              <p className="text-xs text-slate-500">
                Bill ki details — Form 5 table ke liye
              </p>
            </div>
          </div>

          {/* Main Particulars */}
          <div className="mb-5">
            <label className="text-slate-700 font-medium text-xs pl-2 block mb-1.5">
              Main Particulars
            </label>
            <textarea
              value={particulars}
              onChange={(e) => setParticulars(e.target.value)}
              rows={3}
              placeholder="e.g., Being the payment of Mr. ... for the month of ..."
              className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none resize-none"
              style={{
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            />
          </div>

          {/* Invoice Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <NeoInput
              id="invoice_no"
              label="Invoice No."
              placeholder="e.g., XYZ/2026/001 (optional)"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
            />
            <NeoInput
              id="invoice_date"
              label="Invoice Date"
              type="date"
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
            />
          </div>

          {/* Absentee */}
          <div className="mb-5">
            <NeoInput
              id="absentee"
              label="Absentee (For Manpower Bills)"
              placeholder="e.g., Nil, 2 days (optional)"
              value={absentee}
              onChange={(e) => setAbsentee(e.target.value)}
            />
          </div>

          {/* Line Items Header */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-slate-500 uppercase">
              Line Items ({items.length})
            </p>
            <NeoButton
              type="button"
              variant="success"
              size="sm"
              onClick={addLineItem}
              icon={<Plus className="h-3.5 w-3.5" />}
            >
              Add Line
            </NeoButton>
          </div>

          {/* Line Items */}
          <div className="space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <NeoBadge variant="primary" size="sm">
                    Line #{idx + 1}
                  </NeoBadge>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLineItem(item.id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-red-600 transition-all hover:scale-110"
                      style={{
                        background: "#e0e5ec",
                        boxShadow:
                          "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <NeoInput
                    id={`date_${item.id}`}
                    label="Date"
                    type="date"
                    value={item.date}
                    onChange={(e) =>
                      updateLineItem(item.id, "date", e.target.value)
                    }
                  />
                  <div className="md:col-span-3">
                    <NeoInput
                      id={`part_${item.id}`}
                      label="Particulars"
                      placeholder="Description of this line"
                      value={item.particulars}
                      onChange={(e) =>
                        updateLineItem(item.id, "particulars", e.target.value)
                      }
                    />
                  </div>
                  <NeoInput
                    id={`rs_${item.id}`}
                    label="Amount (Rs.)"
                    type="number"
                    placeholder="0"
                    value={item.amount_rs}
                    onChange={(e) =>
                      updateLineItem(item.id, "amount_rs", e.target.value)
                    }
                  />
                  <NeoInput
                    id={`ps_${item.id}`}
                    label="Amount (Paise)"
                    type="number"
                    placeholder="0"
                    value={item.amount_paise}
                    onChange={(e) =>
                      updateLineItem(item.id, "amount_paise", e.target.value)
                    }
                  />
                  <div className="md:col-span-2">
                    <NeoInput
                      id={`rem_${item.id}`}
                      label="Remarks"
                      placeholder="Optional"
                      value={item.remarks}
                      onChange={(e) =>
                        updateLineItem(item.id, "remarks", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </NeoCard>

        {/* SECTION 5: AMOUNTS & DEDUCTIONS */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-green-600">
              <IndianRupee className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Amounts & Deductions
              </h2>
              <p className="text-xs text-slate-500">
                Base amount, GST (add), deductions (subtract)
              </p>
            </div>
          </div>

          {/* BASE AMOUNT */}
          <div className="mb-5">
            <NeoInput
              id="bill_amount"
              label="Bill Amount (Base) (₹) *"
              type="number"
              placeholder="0"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              required
            />
          </div>

          {/* GST SECTION (ADD) */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: "rgba(34, 197, 94, 0.06)",
              borderLeft: "4px solid #22c55e",
            }}
          >
            <p className="text-xs font-bold text-green-700 uppercase mb-3">
              GST (Add to Base)
            </p>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium text-xs pl-2">
                  GST Type
                </label>
                <select
                  value={gstType}
                  onChange={(e) => handleGstTypeChange(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                  style={{
                    boxShadow:
                      "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                  }}
                >
                  <option value="none">No GST</option>
                  <option value="gst_5_intra">
                    GST 5% (CGST 2.5% + SGST 2.5%)
                  </option>
                  <option value="gst_12_intra">
                    GST 12% (CGST 6% + SGST 6%)
                  </option>
                  <option value="gst_18_intra">
                    GST 18% (CGST 9% + SGST 9%)
                  </option>
                  <option value="gst_28_intra">
                    GST 28% (CGST 14% + SGST 14%)
                  </option>
                  <option value="gst_5_inter">GST 5% (IGST)</option>
                  <option value="gst_12_inter">GST 12% (IGST)</option>
                  <option value="gst_18_inter">GST 18% (IGST)</option>
                  <option value="gst_28_inter">GST 28% (IGST)</option>
                  <option value="custom">Custom (Manual)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 text-center">
                    CGST (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cgstRate}
                    onChange={(e) => setCgstRate(e.target.value)}
                    disabled={gstType !== "custom"}
                    className="w-full h-10 px-2 rounded-lg bg-[#e0e5ec] text-sm text-center text-slate-700 border-0 outline-none disabled:opacity-60"
                    style={{
                      boxShadow:
                        "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                    }}
                  />
                  <p className="text-xs text-green-700 font-bold text-center mt-1">
                    + ₹{cgstAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 text-center">
                    SGST (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={sgstRate}
                    onChange={(e) => setSgstRate(e.target.value)}
                    disabled={gstType !== "custom"}
                    className="w-full h-10 px-2 rounded-lg bg-[#e0e5ec] text-sm text-center text-slate-700 border-0 outline-none disabled:opacity-60"
                    style={{
                      boxShadow:
                        "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                    }}
                  />
                  <p className="text-xs text-green-700 font-bold text-center mt-1">
                    + ₹{sgstAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 text-center">
                    IGST (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={igstRate}
                    onChange={(e) => setIgstRate(e.target.value)}
                    disabled={gstType !== "custom"}
                    className="w-full h-10 px-2 rounded-lg bg-[#e0e5ec] text-sm text-center text-slate-700 border-0 outline-none disabled:opacity-60"
                    style={{
                      boxShadow:
                        "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                    }}
                  />
                  <p className="text-xs text-green-700 font-bold text-center mt-1">
                    + ₹{igstAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-green-200">
                <span className="text-sm font-bold text-slate-700">
                  Total GST
                </span>
                <span className="text-base font-bold text-green-700">
                  + ₹{totalGst.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* TOTAL BILL AMOUNT */}
          <div
            className="mb-4 p-4 rounded-2xl flex items-center justify-between"
            style={{
              background: "rgba(59, 130, 246, 0.08)",
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <span className="text-sm font-bold text-slate-700 uppercase">
              Total Bill Amount (Base + GST)
            </span>
            <span className="text-lg font-bold text-blue-700">
              ₹
              {totalBillAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* TDS UNDER GST (DEDUCT) */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: "rgba(239, 68, 68, 0.06)",
              borderLeft: "4px solid #ef4444",
            }}
          >
            <p className="text-xs font-bold text-red-700 uppercase mb-3">
              TDS under GST (Deduct)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium text-xs pl-2">
                  TDS Type
                </label>
                <select
                  value={tdsGstType}
                  onChange={(e) => handleTdsGstTypeChange(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                  style={{
                    boxShadow:
                      "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                  }}
                >
                  <option value="none">No TDS under GST</option>
                  <option value="cgst_1">CGST (1%)</option>
                  <option value="sgst_1">SGST (1%)</option>
                  <option value="igst_2">IGST (2%)</option>
                  <option value="cgst_sgst_2">CGST + SGST (2%)</option>
                  <option value="custom">Custom (Manual)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 text-center">
                  Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tdsGstRate}
                  onChange={(e) => setTdsGstRate(e.target.value)}
                  disabled={tdsGstType !== "custom"}
                  className="w-full h-11 px-2 rounded-lg bg-[#e0e5ec] text-sm text-center text-slate-700 border-0 outline-none disabled:opacity-60"
                  style={{
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-red-200 mt-3">
              <span className="text-sm font-bold text-slate-700">
                TDS under GST Amount
              </span>
              <span className="text-base font-bold text-red-600">
                − ₹{tdsGstAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* TDS INCOME TAX (DEDUCT) */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: "rgba(239, 68, 68, 0.06)",
              borderLeft: "4px solid #ef4444",
            }}
          >
            <p className="text-xs font-bold text-red-700 uppercase mb-3">
              TDS Income Tax (Deduct)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium text-xs pl-2">
                  TDS Section
                </label>
                <select
                  value={tdsItType}
                  onChange={(e) => handleTdsItTypeChange(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                  style={{
                    boxShadow:
                      "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                  }}
                >
                  <option value="none">No TDS</option>
                  <option value="sec_194j">194J - Professional (10%)</option>
                  <option value="sec_194c_ind">
                    194C - Contractor (Ind) (1%)
                  </option>
                  <option value="sec_194c_co">
                    194C - Contractor (Co) (2%)
                  </option>
                  <option value="sec_194q">194Q - Purchase (0.1%)</option>
                  <option value="sec_194h">194H - Commission (5%)</option>
                  <option value="sec_194i">194I - Rent (10%)</option>
                  <option value="sec_195">195 - NRI (20%)</option>
                  <option value="custom">Custom (Manual)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1 text-center">
                  Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tdsIncomeTaxRate}
                  onChange={(e) => setTdsIncomeTaxRate(e.target.value)}
                  disabled={tdsItType !== "custom"}
                  className="w-full h-11 px-2 rounded-lg bg-[#e0e5ec] text-sm text-center text-slate-700 border-0 outline-none disabled:opacity-60"
                  style={{
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-red-200 mt-3">
              <span className="text-sm font-bold text-slate-700">
                TDS Income Tax Amount
              </span>
              <span className="text-base font-bold text-red-600">
                − ₹{tdsIncomeTaxAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* OTHER CHARGES (No Tax) */}
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              background: "rgba(59, 130, 246, 0.06)",
              borderLeft: "4px solid #3b82f6",
            }}
          >
            <p className="text-xs font-bold text-blue-700 uppercase mb-3">
              Other Charges (Add — No Tax)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium text-xs pl-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={otherCharges}
                  onChange={(e) => setOtherCharges(e.target.value)}
                  placeholder="e.g., Toll, Parking"
                  className="w-full h-11 px-4 rounded-lg bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                  style={{
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-slate-700 font-medium text-xs pl-2">
                  Remarks
                </label>
                <input
                  type="text"
                  value={otherChargesRemarks}
                  onChange={(e) => setOtherChargesRemarks(e.target.value)}
                  placeholder="e.g., Toll Tax"
                  className="w-full h-11 px-4 rounded-lg bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                  style={{
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                />
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-blue-200 mt-3">
              <span className="text-sm font-bold text-slate-700">
                Other Charges Amount
              </span>
              <span className="text-base font-bold text-blue-700">
                + ₹{otherChargesAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* PENALTY & PBG (Conditional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Penalty */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: penaltyApplicable
                  ? "rgba(239, 68, 68, 0.06)"
                  : "rgba(148, 163, 184, 0.06)",
                borderLeft: `4px solid ${
                  penaltyApplicable ? "#ef4444" : "#94a3b8"
                }`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700 uppercase">
                  Penalty / Other
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={penaltyApplicable}
                    onChange={(e) => {
                      setPenaltyApplicable(e.target.checked);
                      if (!e.target.checked) setPenalty("0");
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-600">
                    Applicable
                  </span>
                </label>
              </div>
              <input
                type="number"
                step="0.01"
                value={penalty}
                onChange={(e) => setPenalty(e.target.value)}
                disabled={!penaltyApplicable}
                placeholder="0"
                className="w-full h-11 px-4 rounded-lg bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none disabled:opacity-50"
                style={{
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              />
              <p className="text-[10px] text-slate-500 mt-1 italic">
                As per work/purchase order
              </p>
              {penaltyApplicable && penaltyAmount > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-red-200 mt-2">
                  <span className="text-xs font-bold text-slate-700">
                    Amount
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    − ₹{penaltyAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* PBG Security */}
            <div
              className="rounded-2xl p-4"
              style={{
                background: pbgApplicable
                  ? "rgba(239, 68, 68, 0.06)"
                  : "rgba(148, 163, 184, 0.06)",
                borderLeft: `4px solid ${
                  pbgApplicable ? "#ef4444" : "#94a3b8"
                }`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700 uppercase">
                  PBG Security
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pbgApplicable}
                    onChange={(e) => {
                      setPbgApplicable(e.target.checked);
                      if (!e.target.checked) setPbgSecurity("0");
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-xs font-bold text-slate-600">
                    Applicable
                  </span>
                </label>
              </div>
              <input
                type="number"
                step="0.01"
                value={pbgSecurity}
                onChange={(e) => setPbgSecurity(e.target.value)}
                disabled={!pbgApplicable}
                placeholder="0"
                className="w-full h-11 px-4 rounded-lg bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none disabled:opacity-50"
                style={{
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              />
              <p className="text-[10px] text-slate-500 mt-1 italic">
                As per work/purchase order
              </p>
              {pbgApplicable && pbgAmount > 0 && (
                <div className="flex justify-between items-center pt-2 border-t border-red-200 mt-2">
                  <span className="text-xs font-bold text-slate-700">
                    Amount
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    − ₹{pbgAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* SUMMARY */}
          <div className="space-y-3">
            <div
              className="p-4 rounded-2xl flex items-center justify-between"
              style={{
                background: "rgba(239, 68, 68, 0.08)",
                borderLeft: "4px solid #ef4444",
              }}
            >
              <span className="text-sm font-bold text-slate-700 uppercase">
                Total Deductions
              </span>
              <span className="text-lg font-bold text-red-600">
                ₹
                {totalDeductions.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div
              className="p-5 rounded-2xl flex items-center justify-between"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow:
                  "6px 6px 14px #b8bcc2, -6px -6px 14px #ffffff, inset 0 1px 0 rgba(255,255,255,0.3)",
              }}
            >
              <span className="text-base font-bold text-white uppercase">
                Total Payable Amount
              </span>
              <span className="text-2xl font-bold text-white">
                ₹
                {totalPayable.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </NeoCard>

        {/* SECTION 6: RTGS */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-purple-600">
              <Landmark className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                RTGS — Beneficiary Bank Details
              </h2>
              <p className="text-xs text-slate-500">
                Vendor select karne pe auto-fill, edit kar sakte ho
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="bank_account_name"
              label="Account Name"
              placeholder="Beneficiary Name"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
            />
            <NeoInput
              id="bank_account_no"
              label="Account Number"
              placeholder="Account No."
              value={bankAccountNo}
              onChange={(e) => setBankAccountNo(e.target.value)}
            />
            <NeoInput
              id="bank_name"
              label="Bank Name"
              placeholder="e.g., Bank of Baroda"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
            <NeoInput
              id="bank_branch"
              label="Branch"
              placeholder="Branch Name"
              value={bankBranch}
              onChange={(e) => setBankBranch(e.target.value)}
            />
            <NeoInput
              id="bank_ifsc"
              label="IFSC Code"
              placeholder="e.g., BARB0AITJAL"
              value={bankIfsc}
              onChange={(e) => setBankIfsc(e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Account Type
              </label>
              <select
                value={bankAccountType}
                onChange={(e) => setBankAccountType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="Savings">Savings</option>
                <option value="Current">Current</option>
                <option value="Cash Credit">Cash Credit</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <NeoInput
                id="bank_address"
                label="Bank Address"
                placeholder="Bank Branch Address"
                value={bankAddress}
                onChange={(e) => setBankAddress(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <NeoInput
                id="rtgs_purpose"
                label="RTGS Purpose"
                placeholder="e.g., Payment against bill"
                value={rtgsPurpose}
                onChange={(e) => setRtgsPurpose(e.target.value)}
              />
            </div>
          </div>
        </NeoCard>

        {/* SECTION 7: STATUS */}
        <NeoCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as BillStatus)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <NeoInput
              id="remarks"
              label="Remarks"
              placeholder="Optional notes"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </NeoCard>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href="/bills">
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
            {loading ? "Saving..." : "Save Bill Entry"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}