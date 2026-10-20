"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
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
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import {
  getBillEntry,
  updateBillEntry,
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

export default function EditBillPage() {
  const router = useRouter();
  const params = useParams();
  const billId = Number(params.id);

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
  const [billDate, setBillDate] = useState("");
  const [diaryVoucherNo, setDiaryVoucherNo] = useState("");
  const [diaryVoucherDate, setDiaryVoucherDate] = useState("");
  const [documentNo, setDocumentNo] = useState("");

  // Relations
  const [projectId, setProjectId] = useState<number | "">("");
  const [vendorId, setVendorId] = useState<number | "">("");
  const [poId, setPoId] = useState<number | "">("");

  // Budget Heads
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

  // GST
  const [gstType, setGstType] = useState("none");
  const [cgstRate, setCgstRate] = useState("0");
  const [sgstRate, setSgstRate] = useState("0");
  const [igstRate, setIgstRate] = useState("0");

  // TDS under GST
  const [tdsGstType, setTdsGstType] = useState("none");
  const [tdsGstRate, setTdsGstRate] = useState("0");

  // TDS Income Tax
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

  // NEW: Payment Tracking States
  const [paymentDate, setPaymentDate] = useState("");
  const [utrNumber, setUtrNumber] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");

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
  // LOAD ALL DATA
  // ============================================

  useEffect(() => {
    async function loadAll() {
      if (!billId || isNaN(billId)) {
        setError("Invalid bill ID");
        setLoadingData(false);
        return;
      }
      try {
        const [bill, vendorsData, projectsData, poData, bhData] =
          await Promise.all([
            getBillEntry(billId),
            getVendors(),
            getProjects(),
            getPurchaseOrders(),
            getBudgetHeads(),
          ]);

        // Dropdowns
        setVendors(vendorsData.results);
        setProjects(projectsData.results);
        setPurchaseOrders(poData.results);
        setBudgetHeads(bhData);

        // Bill data
        setDocumentNo(bill.document_no || "");
        setBillNo(bill.bill_no || "");
        setBillDate(bill.bill_date || "");
        setDiaryVoucherNo(bill.diary_voucher_no || "");
        setDiaryVoucherDate(bill.diary_voucher_date || "");

        setProjectId(bill.project || "");
        setVendorId(bill.vendor || "");
        setPoId(bill.purchase_order || "");
        setBudgetHeadId(bill.budget_head || "");

        setMajorBudgetHead(bill.major_budget_head || "");
        setMinorBudgetHead(bill.minor_budget_head || "");
        setSchemeCode((bill as any).scheme_code || "");
        setComponentCode((bill as any).component_code || "");

        setRecipientName(bill.recipient_name || "");
        setParticulars(bill.particulars || "");
        setInvoiceNo((bill as any).vendor_bill_no || "");
        setInvoiceDate((bill as any).vendor_bill_date || "");
        setAbsentee((bill as any).absentee || "");

        setBillAmount(String(bill.bill_amount || ""));

        // Rates
        setCgstRate(String((bill as any).cgst_rate || "0"));
        setSgstRate(String((bill as any).sgst_rate || "0"));
        setIgstRate(String((bill as any).igst_rate || "0"));
        setTdsGstRate(String((bill as any).tds_gst_rate || "0"));
        setTdsIncomeTaxRate(
          String((bill as any).tds_income_tax_rate || "0")
        );
        // Auto-detect GST type from rates
        const cgstR = parseFloat(String((bill as any).cgst_rate || "0"));
        const sgstR = parseFloat(String((bill as any).sgst_rate || "0"));
        const igstR = parseFloat(String((bill as any).igst_rate || "0"));

        if (cgstR === 0 && sgstR === 0 && igstR === 0) {
          setGstType("none");
        } else if (cgstR === 2.5 && sgstR === 2.5) {
          setGstType("gst_5_intra");
        } else if (cgstR === 6 && sgstR === 6) {
          setGstType("gst_12_intra");
        } else if (cgstR === 9 && sgstR === 9) {
          setGstType("gst_18_intra");
        } else if (cgstR === 14 && sgstR === 14) {
          setGstType("gst_28_intra");
        } else if (igstR === 5) {
          setGstType("gst_5_inter");
        } else if (igstR === 12) {
          setGstType("gst_12_inter");
        } else if (igstR === 18) {
          setGstType("gst_18_inter");
        } else if (igstR === 28) {
          setGstType("gst_28_inter");
        } else {
          setGstType("custom");
        }

        // Auto-detect TDS under GST type
        const tdsGstR = parseFloat(
          String((bill as any).tds_gst_rate || "0")
        );
        if (tdsGstR === 0) {
          setTdsGstType("none");
        } else {
          setTdsGstType("custom");
        }

        // Auto-detect TDS Income Tax type
        const tdsItR = parseFloat(
          String((bill as any).tds_income_tax_rate || "0")
        );
        if (tdsItR === 0) {
          setTdsItType("none");
        } else if (tdsItR === 10) {
          setTdsItType("sec_194j");
        } else if (tdsItR === 1) {
          setTdsItType("sec_194c_ind");
        } else if (tdsItR === 2) {
          setTdsItType("sec_194c_co");
        } else if (tdsItR === 0.1) {
          setTdsItType("sec_194q");
        } else if (tdsItR === 5) {
          setTdsItType("sec_194h");
        } else {
          setTdsItType("custom");
        }
        setPenalty(String(bill.penalty || "0"));
        setPenaltyApplicable((bill as any).penalty_applicable || false);
        setPbgSecurity(String(bill.pbg_security || "0"));
        setPbgApplicable((bill as any).pbg_applicable || false);
        setOtherCharges(String((bill as any).other_charges || "0"));
        setOtherChargesRemarks(
          (bill as any).other_charges_remarks || ""
        );

        setBankAccountName(bill.bank_account_name || "");
        setBankAccountNo(bill.bank_account_no || "");
        setBankName(bill.bank_name || "");
        setBankBranch(bill.bank_branch || "");
        setBankIfsc(bill.bank_ifsc || "");
        setBankAccountType(bill.bank_account_type || "Savings");
        setBankAddress(bill.bank_address || "");
        setRtgsPurpose(bill.rtgs_purpose || "");

        setStatus(bill.status || "draft");
        setRemarks(bill.remarks || "");

        // Set Payment Tracking Data
        setPaymentDate((bill as any).payment_date || "");
        setUtrNumber((bill as any).utr_number || "");
        setPaymentRemarks((bill as any).payment_remarks || "");

        // Items
        if (bill.items && bill.items.length > 0) {
          setItems(
            bill.items.map((it, idx) => ({
              id: `existing-${it.id || idx}-${Date.now()}`,
              date: it.date || "",
              particulars: it.particulars || "",
              amount_rs: String(it.amount_rs || "0"),
              amount_paise: String(it.amount_paise || "0"),
              remarks: it.remarks || "",
            }))
          );
        }
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoadingData(false);
      }
    }
    loadAll();
  }, [billId]);

  // ============================================
  // AUTO-FILL: PROJECT → MAJOR/MINOR HEADS
  // ============================================

  useEffect(() => {
    if (!projectId || loadingData) return;
    const proj = projects.find((p) => p.id === Number(projectId));
    if (proj) {
      if (!majorBudgetHead)
        setMajorBudgetHead((proj as any).major_budget_head || "IITBHU-SLCR");
      if (!minorBudgetHead)
        setMinorBudgetHead(
          (proj as any).minor_budget_head ||
            `${proj.project_code} (Manpower)`
        );
    }
  }, [projectId, projects, loadingData]);

  // ============================================
  // AUTO-FILL: VENDOR → BANK DETAILS
  // ============================================

  useEffect(() => {
    if (!vendorId || loadingData) return;
    const vend = vendors.find((v) => v.id === Number(vendorId));
    if (vend) {
      if (!bankAccountName) setBankAccountName(vend.vendor_name);
      if (!bankName) setBankName((vend as any).bank_name || "");
      if (!bankBranch) setBankBranch((vend as any).bank_branch || "");
      if (!bankIfsc) setBankIfsc((vend as any).ifsc_code || "");
      if (!bankAccountNo)
        setBankAccountNo((vend as any).account_number || "");
      const addr = [
        (vend as any).address_line1,
        (vend as any).address_line2,
        (vend as any).city,
        (vend as any).state,
        (vend as any).pincode,
      ]
        .filter(Boolean)
        .join(", ");
      if (!bankAddress) setBankAddress(addr);
    }
  }, [vendorId, vendors, loadingData]);

  // ============================================
  // LIVE CALCULATION
  // ============================================

  const baseAmount = parseFloat(billAmount) || 0;

  const cgstAmount = (baseAmount * (parseFloat(cgstRate) || 0)) / 100;
  const sgstAmount = (baseAmount * (parseFloat(sgstRate) || 0)) / 100;
  const igstAmount = (baseAmount * (parseFloat(igstRate) || 0)) / 100;
  const totalGst = cgstAmount + sgstAmount + igstAmount;

  const totalBillAmount = baseAmount + totalGst;

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
      const payload: Partial<BillEntryCreateUpdate> = {
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
        
        // NEW: Payment Tracking Payload
        payment_date: paymentDate || null,
        utr_number: utrNumber || undefined,
        payment_remarks: paymentRemarks || undefined,
        
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

      await updateBillEntry(billId, payload);
      setSuccess("Bill Entry updated successfully! 🎉");

      setTimeout(() => {
        router.push(`/bills/${billId}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update bill");
      setLoading(false);
    }
  }

  // ============================================
  // LOADING
  // ============================================

  if (loadingData) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading bill...</p>
        </div>
      </AppLayout>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href={`/bills/${billId}`}>
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Cancel
            </NeoButton>
          </Link>
          <div className="flex items-center gap-3">
            <NeoButton
              variant="primary"
              size="md"
              onClick={handleSubmit}
              disabled={loading}
              icon={
                loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )
              }
            >
              {loading ? "Saving..." : "Save Changes"}
            </NeoButton>
          </div>
        </div>

        {/* Hero */}
        <NeoCard>
          <div className="flex flex-wrap items-center gap-5">
            <NeoIconBox size="xl" color="text-blue-600" variant="inset">
              <Receipt className="h-8 w-8" />
            </NeoIconBox>
            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-700">
                  {billNo || "—"}
                </span>
                <NeoBadge variant="info" size="md">
                  Doc: {documentNo || "—"}
                </NeoBadge>
              </div>
              <h1 className="text-2xl font-bold text-slate-800">
                Edit Bill Entry (Form 5)
              </h1>
            </div>
          </div>
        </NeoCard>

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
                  <strong>Document No.:</strong> {documentNo || "—"}{" "}
                  (auto-generated, cannot be changed)
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
              value={majorBudgetHead}
              onChange={(e) => setMajorBudgetHead(e.target.value)}
            />
            <NeoInput
              id="minor_budget_head"
              label="Minor Budget Head"
              value={minorBudgetHead}
              onChange={(e) => setMinorBudgetHead(e.target.value)}
            />

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Sub Head (Manpower / Travel / Equipment)
              </label>
              <select
                value={budgetHeadId}
                onChange={(e) =>
                  setBudgetHeadId(e.target.value ? Number(e.target.value) : "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">— Select Sub Head —</option>
                {budgetHeads.map((bh) => (
                  <option key={bh.id} value={bh.id}>
                    {bh.name} — {bh.code || ""}
                  </option>
                ))}
              </select>
            </div>
                        {/* Scheme Code */}
            <NeoInput
              id="scheme_code"
              label="Scheme Code"
              placeholder="e.g., 4066 (optional)"
              value={schemeCode}
              onChange={(e) => setSchemeCode(e.target.value)}
            />

            {/* Component Code */}
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
            </div>
          </div>

          <div className="mb-5">
            <label className="text-slate-700 font-medium text-xs pl-2 block mb-1.5">
              Main Particulars
            </label>
            <textarea
              value={particulars}
              onChange={(e) => setParticulars(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none resize-none"
              style={{
                boxShadow:
                  "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <NeoInput
              id="invoice_no"
              label="Invoice No."
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

          <div className="mb-5">
            <NeoInput
              id="absentee"
              label="Absentee (For Manpower Bills)"
              value={absentee}
              onChange={(e) => setAbsentee(e.target.value)}
            />
          </div>

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
                    value={item.amount_rs}
                    onChange={(e) =>
                      updateLineItem(item.id, "amount_rs", e.target.value)
                    }
                  />
                  <NeoInput
                    id={`ps_${item.id}`}
                    label="Amount (Paise)"
                    type="number"
                    value={item.amount_paise}
                    onChange={(e) =>
                      updateLineItem(item.id, "amount_paise", e.target.value)
                    }
                  />
                  <div className="md:col-span-2">
                    <NeoInput
                      id={`rem_${item.id}`}
                      label="Remarks"
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
            </div>
          </div>

          <div className="mb-5">
            <NeoInput
              id="bill_amount"
              label="Bill Amount (Base) (₹) *"
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              required
            />
          </div>

          {/* GST SECTION */}
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

          {/* TDS UNDER GST */}
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

          {/* TDS INCOME TAX */}
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
            </div>

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
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="bank_account_name"
              label="Account Name"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
            />
            <NeoInput
              id="bank_account_no"
              label="Account Number"
              value={bankAccountNo}
              onChange={(e) => setBankAccountNo(e.target.value)}
            />
            <NeoInput
              id="bank_name"
              label="Bank Name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
            <NeoInput
              id="bank_branch"
              label="Branch"
              value={bankBranch}
              onChange={(e) => setBankBranch(e.target.value)}
            />
            <NeoInput
              id="bank_ifsc"
              label="IFSC Code"
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
                value={bankAddress}
                onChange={(e) => setBankAddress(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <NeoInput
                id="rtgs_purpose"
                label="RTGS Purpose"
                value={rtgsPurpose}
                onChange={(e) => setRtgsPurpose(e.target.value)}
              />
            </div>
          </div>
        </NeoCard>

        {/* SECTION 7: STATUS & PAYMENT DETAILS (UPDATED) */}
        <NeoCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 border-b border-slate-200 pb-6">
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
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* NEW: PAYMENT DETAILS */}
          <div className="flex items-center gap-3 mb-4">
            <NeoIconBox size="md" color="text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Payment Details</h2>
              <p className="text-xs text-slate-500">Fill these details once the bill is paid</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="payment_date"
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
            <NeoInput
              id="utr_number"
              label="UTR / Transaction Ref No."
              placeholder="e.g. SBI123456789"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
            />
            <div className="md:col-span-2">
              <label className="text-slate-700 font-medium text-xs pl-2">Payment Remarks</label>
              <textarea
                rows={2}
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                className="w-full mt-1.5 p-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none font-medium resize-none"
                style={{ boxShadow: "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff" }}
                placeholder="Any specific payment notes..."
              />
            </div>
          </div>
        </NeoCard>

        {/* Bottom Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href={`/bills/${billId}`}>
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
            {loading ? "Saving..." : "Save Changes"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}