"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer, Loader2, AlertCircle } from "lucide-react";
import { getBillEntry, type BillEntry } from "@/lib/api/bills";

export default function BillPrintPage() {
  const params = useParams();
  const billId = Number(params.id);

  const [bill, setBill] = useState<BillEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!billId || isNaN(billId)) {
        setError("Invalid bill ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getBillEntry(billId);
        setBill(data);
      } catch (err: any) {
        setError(err.message || "Failed to load bill");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [billId]);

  function formatDate(date?: string) {
    if (!date) return "—";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }

  function splitAmount(amount: any) {
    const num = parseFloat(String(amount)) || 0;
    const rs = Math.floor(num);
    const ps = Math.round((num - rs) * 100);
    return {
      rs: rs.toLocaleString("en-IN"),
      ps: String(ps).padStart(2, "0"),
    };
  }

  function cleanInWords(words?: string) {
    if (!words) return "—";
    return words.replace(/^Rupees\s+/i, "").replace(/\s+Only$/i, "");
  }

  function splitIFSC(ifsc?: string) {
    if (!ifsc) return ["", "", "", "", "", "", "", "", "", "", ""];
    const cleaned = ifsc.replace(/\s+/g, "").toUpperCase();
    const chars = cleaned.split("");
    while (chars.length < 11) chars.push("");
    return chars.slice(0, 11);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4 mx-auto" />
          <p className="text-sm text-slate-500">Loading bill...</p>
        </div>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Bill not found</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            href="/bills"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </div>
    );
  }

  const items = bill.items || [];
  const otherItems = items.slice(1);
  const ifscChars = splitIFSC(bill.bank_ifsc);

  const baseAmount = parseFloat(String(bill.bill_amount)) || 0;
  const cgstRate = parseFloat(String((bill as any).cgst_rate)) || 0;
  const sgstRate = parseFloat(String((bill as any).sgst_rate)) || 0;
  const igstRate = parseFloat(String((bill as any).igst_rate)) || 0;

  const cgstAmount = (baseAmount * cgstRate) / 100;
  const sgstAmount = (baseAmount * sgstRate) / 100;
  const igstAmount = (baseAmount * igstRate) / 100;
  const totalGst = cgstAmount + sgstAmount + igstAmount;

  const otherCharges = parseFloat(String((bill as any).other_charges)) || 0;
  const totalWithGstAndOther = baseAmount + totalGst + otherCharges;

  const billSplit = splitAmount(baseAmount);
  const cgstSplit = splitAmount(cgstAmount);
  const sgstSplit = splitAmount(sgstAmount);
  const igstSplit = splitAmount(igstAmount);
  const otherSplit = splitAmount(otherCharges);
  const totalWithGstOtherSplit = splitAmount(totalWithGstAndOther);
  const totalSplit = splitAmount(bill.total_payable);

  const penaltyApplicable = (bill as any).penalty_applicable || false;
  const pbgApplicable = (bill as any).pbg_applicable || false;

  return (
    <>
      {/* Print Toolbar */}
      <div className="print:hidden sticky top-0 z-50 bg-slate-100 border-b border-slate-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/bills/${bill.id}`}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Print Form 5 + RTGS
              </h1>
              <p className="text-xs text-slate-500">
                {bill.bill_no} — 2 pages
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 inline-flex items-center gap-2 shadow-md"
          >
            <Printer className="h-4 w-4" /> Print Both Pages
          </button>
        </div>
      </div>

      {/* Print Content */}
      <div className="bg-slate-200 py-6 print:bg-white print:py-0 print:m-0">
        {/* PAGE 1 — FORM 5 */}
                <div
          className="print-page bg-white mx-auto"
          style={{
            width: "210mm",
            height: "297mm",
            maxHeight: "297mm",
            padding: "8mm 10mm",
            fontFamily: "'Times New Roman', serif",
            fontSize: "10px",
            lineHeight: "1.25",
            color: "#000",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxSizing: "border-box",
          }}
        >
          {/* FORM NO. 5 */}
          <div
            style={{
              position: "absolute",
              top: "10mm",
              right: "12mm",
              border: "1.5px solid #000",
              padding: "2px 8px",
              fontSize: "10px",
              fontWeight: "bold",
            }}
          >
            Form No. 5
          </div>

          {/* HEADER */}
          <div
            style={{
              borderBottom: "1px solid #000",
              paddingBottom: "5px",
              marginBottom: "8px",
              position: "relative",
              minHeight: "90px",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                display: "flex",
                alignItems: "center",
                height: "90px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/iitbhu-emblem.png"
                alt="IIT BHU Emblem"
                style={{ width: "75px", height: "75px", objectFit: "contain" }}
              />
            </div>

            <div
              style={{
                textAlign: "center",
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                height: "90px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/iitbhu-text.png"
                alt="IIT BHU"
                style={{
                  height: "50px",
                  width: "auto",
                  maxWidth: "280px",
                  objectFit: "contain",
                }}
              />
              <div
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                  fontStyle: "italic",
                  marginTop: "3px",
                  lineHeight: "1.2",
                  color: "#8B0000",
                }}
              >
                INDIAN INSTITUTE OF TECHNOLOGY
              </div>
              <div
                style={{
                  fontSize: "8px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                  color: "#8B0000",
                }}
              >
                (BANARAS HINDU UNIVERSITY)
              </div>
              <div
                style={{ fontSize: "7px", fontStyle: "italic", marginTop: "2px" }}
              >
                (Established since 1919)
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div style={{ textAlign: "center", marginBottom: "10px" }}>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
              }}
            >
              BILL FOR DIRECT PAYMENT BY FINANCE SECTION
            </div>
          </div>

          {/* TOP INFO */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "10px",
              fontSize: "10.5px",
            }}
          >
            <div>
              <div style={{ marginBottom: "2px" }}>
                <strong>Bill No.</strong> {bill.bill_no}
              </div>
              <div style={{ marginBottom: "2px" }}>
                <strong>Name of Department:</strong> Civil Engineering, IIT(BHU)
              </div>
              <div style={{ marginBottom: "2px" }}>
                <strong>Diary voucher No. with date.</strong>{" "}
                {bill.diary_voucher_no || "______"}
              </div>
            </div>
            <div>
              <div style={{ marginBottom: "2px" }}>
                <strong>Major Budget Head:</strong>{" "}
                {bill.major_budget_head || "—"}
              </div>
              <div style={{ marginBottom: "2px" }}>
                <strong>Minor Budget Head:</strong>{" "}
                {bill.minor_budget_head || "—"}
              </div>
                            {(bill as any).scheme_code && (
                <div style={{ marginBottom: "2px" }}>
                  <strong>Scheme Code:</strong>{" "}
                  {(bill as any).scheme_code}
                </div>
              )}
              {(bill as any).component_code && (
                <div style={{ marginBottom: "2px" }}>
                  <strong>Component Code:</strong>{" "}
                  {(bill as any).component_code}
                </div>
              )}
              <div style={{ marginBottom: "2px" }}>
                <strong>Name of Recipient:</strong> {bill.recipient_name}
              </div>
            </div>
          </div>

          {/* TABLE */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "10px",
              marginBottom: "6px",
              border: "1px solid #000",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 3px",
                    textAlign: "center",
                    width: "65px",
                    fontWeight: "bold",
                  }}
                  rowSpan={2}
                >
                  Date
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                  rowSpan={2}
                >
                  Particulars
                </th>
                <th
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "4px 3px",
                    textAlign: "center",
                    width: "100px",
                    fontWeight: "bold",
                  }}
                >
                  Amount
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "center",
                    width: "110px",
                    fontWeight: "bold",
                  }}
                  rowSpan={2}
                >
                  Remarks
                </th>
              </tr>
              <tr>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "2px 3px",
                    textAlign: "center",
                    width: "55px",
                    fontWeight: "bold",
                    fontSize: "9.5px",
                  }}
                >
                  Rs.
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "2px 3px",
                    textAlign: "center",
                    width: "45px",
                    fontWeight: "bold",
                    fontSize: "9.5px",
                  }}
                >
                  P.
                </th>
              </tr>
            </thead>
            <tbody>
              {/* MAIN ROW — Particulars + Amount + Remarks */}
              <tr>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 3px",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  {formatDate(bill.bill_date)}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 8px",
                    textAlign: "left",
                    verticalAlign: "top",
                    whiteSpace: "pre-line",
                    lineHeight: "1.5",
                    height: "150px", 
                    minHeight: "150px",
                    fontSize: "10px",
                  }}
                >
                  {bill.particulars || "—"}
                  {(bill as any).vendor_bill_no && (
                    <>
                      <br />
                      <strong>Invoice No:</strong>{" "}
                      {(bill as any).vendor_bill_no}
                    </>
                  )}
                  {(bill as any).vendor_bill_date && (
                    <>
                      <br />
                      <strong>Invoice Date:</strong>{" "}
                      {formatDate((bill as any).vendor_bill_date)}
                    </>
                  )}
                  {(bill as any).absentee && (
                    <>
                      <br />
                      <strong>Absentee:</strong> {(bill as any).absentee}
                    </>
                  )}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 4px",
                    textAlign: "center",
                    verticalAlign: "top",
                    fontWeight: "bold",
                  }}
                >
                  {billSplit.rs}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 3px",
                    textAlign: "center",
                    verticalAlign: "top",
                  }}
                >
                  {billSplit.ps}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "6px 6px",
                    textAlign: "left",
                    verticalAlign: "top",
                    fontSize: "9.5px",
                    lineHeight: "1.4",
                  }}
                >
                  <strong>Under Rupees:</strong>{" "}
                  {cleanInWords(bill.in_words)}
                  <br />
                  <em>"Aadhar Linked with Pan"</em>
                </td>
              </tr>

              {otherItems.map((it, idx) => {
                const itSplit = splitAmount(it.amount_rs);
                return (
                  <tr key={it.id || idx}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "5px 3px",
                        textAlign: "center",
                      }}
                    >
                      {it.date ? formatDate(it.date) : "—"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "5px 8px",
                        textAlign: "left",
                      }}
                    >
                      {it.particulars}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "5px 4px",
                        textAlign: "right",
                      }}
                    >
                      {itSplit.rs}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "5px 3px",
                        textAlign: "center",
                      }}
                    >
                      {itSplit.ps}
                    </td>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "5px 6px",
                        fontSize: "9.5px",
                      }}
                    >
                      {it.remarks || ""}
                    </td>
                  </tr>
                );
              })}

              {/* Total Amount (Exc. GST) */}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  Total Amount (Exc. GST)
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 4px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {billSplit.rs}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 3px",
                    textAlign: "center",
                  }}
                >
                  {billSplit.ps}
                </td>
                <td style={{ border: "1px solid #000" }}></td>
              </tr>

              {/* CGST */}
              {cgstAmount > 0 && (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "5px 8px",
                      textAlign: "right",
                      fontSize: "10px",
                    }}
                  >
                    Add: CGST @ {cgstRate}%
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 4px",
                      textAlign: "center",
                    }}
                  >
                    {cgstSplit.rs}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 3px",
                      textAlign: "center",
                    }}
                  >
                    {cgstSplit.ps}
                  </td>
                  <td style={{ border: "1px solid #000" }}></td>
                </tr>
              )}

              {/* SGST */}
              {sgstAmount > 0 && (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "5px 8px",
                      textAlign: "right",
                      fontSize: "10px",
                    }}
                  >
                    Add: SGST @ {sgstRate}%
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 4px",
                      textAlign: "center",
                    }}
                  >
                    {sgstSplit.rs}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 3px",
                      textAlign: "center",
                    }}
                  >
                    {sgstSplit.ps}
                  </td>
                  <td style={{ border: "1px solid #000" }}></td>
                </tr>
              )}

              {/* IGST */}
              {igstAmount > 0 && (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "5px 8px",
                      textAlign: "right",
                      fontSize: "10px",
                    }}
                  >
                    Add: IGST @ {igstRate}%
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 4px",
                      textAlign: "right",
                    }}
                  >
                    {igstSplit.rs}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 3px",
                      textAlign: "center",
                    }}
                  >
                    {igstSplit.ps}
                  </td>
                  <td style={{ border: "1px solid #000" }}></td>
                </tr>
              )}

              {/* Other Charges (No Tax) */}
              {otherCharges > 0 && (
                <tr>
                  <td
                    colSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "5px 8px",
                      textAlign: "right",
                      fontSize: "10px",
                    }}
                  >
                    Add: Payable Other Charges (Exc. Tax)
                    {(bill as any).other_charges_remarks
                      ? ` (${(bill as any).other_charges_remarks})`
                      : ""}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 4px",
                      textAlign: "center",
                    }}
                  >
                    {otherSplit.rs}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 3px",
                      textAlign: "center",
                    }}
                  >
                    {otherSplit.ps}
                  </td>
                  <td style={{ border: "1px solid #000" }}></td>
                </tr>
              )}

              {/* Total Bill Amount (Inc. GST + Other) */}
              {(totalGst > 0 || otherCharges > 0) && (
                <tr style={{ background: "#f3f4f6" }}>
                  <td
                    colSpan={2}
                    style={{
                      border: "1px solid #000",
                      padding: "5px 8px",
                      textAlign: "right",
                      fontWeight: "bold",
                    }}
                  >
                    Total Bill Amount (Inc. GST)
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 4px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {totalWithGstOtherSplit.rs}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 3px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {totalWithGstOtherSplit.ps}
                  </td>
                  <td style={{ border: "1px solid #000" }}></td>
                </tr>
              )}

              {/* Less TDS under GST */}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    textAlign: "left",
                    fontSize: "9.5px",
                    lineHeight: "1.3",
                  }}
                >
                  Less TDS under GST (CGST, SGST & IGST) (If applicable) (As per
                  GST Act., 2017 as amended time to time)
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 4px",
                    textAlign: "center",
                  }}
                >
                  {splitAmount(bill.tds_gst).rs}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 3px",
                    textAlign: "center",
                  }}
                >
                  {splitAmount(bill.tds_gst).ps}
                </td>
                <td style={{ border: "1px solid #000" }}></td>
              </tr>

              {/* Less Income Tax */}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    textAlign: "left",
                    fontSize: "9.5px",
                    lineHeight: "1.3",
                  }}
                >
                  Less Income tax deduction (u/s 194J, 194C, 194Q and 195) (As
                  per income tax act, 1961 as amended time to time)
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 4px",
                    textAlign: "center",
                  }}
                >
                  {splitAmount(bill.tds_income_tax).rs}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 3px",
                    textAlign: "center",
                  }}
                >
                  {splitAmount(bill.tds_income_tax).ps}
                </td>
                <td style={{ border: "1px solid #000" }}></td>
              </tr>

              {/* Less Penalty */}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    textAlign: "left",
                    fontSize: "9.5px",
                    lineHeight: "1.3",
                  }}
                >
                  Less Penalty/Other deduction (If applicable) (As per
                  work/purchase order)
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 4px",
                    textAlign: "center",
                  }}
                >
                  {penaltyApplicable
                    ? splitAmount(bill.penalty).rs
                    : "0"}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 3px",
                    textAlign: "center",
                  }}
                >
                  {penaltyApplicable ? splitAmount(bill.penalty).ps : "00"}
                </td>
                <td style={{ border: "1px solid #000" }}></td>
              </tr>

              {/* Less PBG */}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    textAlign: "left",
                    fontSize: "9.5px",
                    lineHeight: "1.3",
                  }}
                >
                  Less PBG security deduction etc. (If applicable) (As per
                  work/purchase order)
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 4px",
                    textAlign: "center",
                  }}
                >
                  {pbgApplicable ? splitAmount(bill.pbg_security).rs : "0"}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 3px",
                    textAlign: "center",
                  }}
                >
                  {pbgApplicable ? splitAmount(bill.pbg_security).ps : "00"}
                </td>
                <td style={{ border: "1px solid #000" }}></td>
              </tr>

              {/* Total Payable */}
              <tr>
                <td
                  colSpan={2}
                  style={{
                    border: "1px solid #000",
                    padding: "5px 8px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  Total Payable Amount
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 4px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {totalSplit.rs}
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "5px 3px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {totalSplit.ps}
                </td>
                <td style={{ border: "1px solid #000" }}></td>
              </tr>
            </tbody>
          </table>

          {/* Rest of the Form 5 (Forwarded, Certifications, Signatures, Finance Office) */}
          <div style={{ marginBottom: "10px", fontSize: "10.5px" }}>
            Forwarded for payment of Rs.{" "}
            <strong>{cleanInWords(bill.in_words)}</strong> only.
          </div>

          <div
            style={{
              marginBottom: "20px",
              fontSize: "9.5px",
              lineHeight: "1.5",
            }}
          >
            <div style={{ marginBottom: "2px" }}>
              (1) Certified that the amount has not been paid earlier and that
              the voucher attached is the original one.
            </div>
            <div>
              (2) Certified that the freight and other charges mentioned in the
              bill have been verified and found to be correct.
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
              fontSize: "10px",
              marginBottom: "30px",
            }}
          >
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  fontStyle: "italic",
                  marginBottom: "40px",
                }}
              >
                Officer forwarding the bill
              </div>
              &nbsp;&nbsp;&nbsp;
              <div style={{ borderTop: "1px solid #000", paddingTop: "3px" }}>
                <strong>
                  <span style={{ color: "rgb(22, 20, 20)" }}>HoD</span>/CoS/Head of
                  Offices, Unit/PI
                </strong>
              </div>
              <div style={{ marginTop: "2px" }}>Date.</div>
            </div>
            <div>
              <div
                style={{
                  fontWeight: "bold",
                  fontStyle: "italic",
                  marginBottom: "40px",
                  textAlign: "Right",
                  paddingRight: "120px",
                }}
              >
                Drawer of the bill
              </div>
              &nbsp;&nbsp;&nbsp;
              <div style={{ borderTop: "1px solid #000", paddingTop: "3px", paddingLeft: "50px" }}>
                <strong>
                  Checked and found within limit's of the Amount sanctioned
                </strong>
              </div>
              <div style={{ marginTop: "2px", paddingLeft: "50px" }}>
                <strong>
                  <span style={{ color: "rgb(24, 22, 22)" }}>HoD</span>/CoS/Head of
                  Offices, Unit/PI
                </strong>
              </div>
              <div style={{ marginTop: "2px", paddingLeft: "50px" }}>Date.</div>
            </div>
          </div>

          <div style={{ flexGrow: 1, minHeight: "10px" }}></div>

          <div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                marginBottom: "4px",
                textDecoration: "underline",
              }}
            >
              FOR USE IN FINANCE OFFICE
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                border: "1px solid #000",
                fontSize: "11px",
              }}
            >
              <div
                style={{
                  borderRight: "1px solid #000",
                  padding: "6px 8px",
                  minHeight: "100px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    marginBottom: "20px",
                  }}
                >
                  PASSED FOR PAYMENT
                </div>
                <div style={{ marginBottom: "16px" }}>For Rupees:</div>
                <div style={{ marginBottom: "16px" }}>&nbsp;</div>
                &nbsp;
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                  }}
                >
                  <span>Asst.</span>
                  <span style={{ color: "#0a4" }}>SO</span>
                  <span style={{ color: "#0a4" }}>AR</span>
                  <span style={{ color: "#0a4" }}>DR</span>
                </div>
              </div>

              <div style={{ padding: "6px 8px", minHeight: "150px" }}>
                <div
                  style={{
                    textAlign: "center",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  PAID
                </div>
                <div style={{ marginBottom: "6px" }}>
                  Cheque No. ...................................
                </div>
                <div style={{ marginBottom: "6px" }}>
                  Dated: ...................................
                </div>
                <div style={{ marginBottom: "6px" }}>
                  For Rs. ...................................
                </div>
                <br />
                <br />
                <div
                
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "11px",
                  }}
                >
                  <span>Asst.</span>
                  <span style={{ color: "#0a4" }}>SO</span>
                  <span style={{ color: "#0a4" }}>AR</span>
                  <span style={{ color: "#0a4" }}>DR</span>
                  <span>Registrar</span>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        {/* ============================================
            PAGE 2 — RTGS FORM (SBI EXACT FORMAT)
            ============================================ */}
                <div
          className="print-page bg-white mx-auto"
          style={{
            width: "210mm",
            height: "297mm",
            maxHeight: "297mm",
            padding: "6mm 8mm",
            fontFamily: "Arial, sans-serif",
            fontSize: "9px",
            lineHeight: "1.25",
            color: "#000",
            marginTop: "0mm",
            marginLeft: "211mm",
            marginRight: "0mm",
            display: "flex",
            flexDirection: "column",
            boxSizing: "border-box",
            overflow: "hidden",
          }}
        >
          {/* HEADER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr 120px",
              alignItems: "center",
              gap: "10px",
              marginBottom: "4px",
            }}
          >
            <div style={{ textAlign: "left" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/sbi-logo.png"
                alt="SBI"
                style={{
                  width: "100px",
                  height: "auto",
                  objectFit: "contain",
                }}
                onError={(e: any) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  letterSpacing: "0.5px",
                }}
              >
                APPLICATION FORM
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  marginTop: "2px",
                }}
              >
                REAL TIME GROSS SETTLEMENT (RTGS) /
              </div>
              <div
                style={{
                  fontSize: "10px",
                  fontWeight: "bold",
                  textDecoration: "underline",
                }}
              >
                NATIONAL ELECTRONIC FUND TRANSFER (NEFT)
              </div>
              <div
                style={{
                  fontSize: "8.5px",
                  marginTop: "3px",
                  fontWeight: "bold",
                }}
              >
                (To be filled by the Applicant in Block Letters)
              </div>
            </div>

            <div style={{ textAlign: "right", fontSize: "10.5px" }}>
              <strong>Date</strong> ____________
            </div>
          </div>

          {/* Branch Line */}
          <div style={{ fontSize: "10.5px", marginBottom: "8px" }}>
            <strong>Branch</strong> _______________________
          </div>

          {/* REMITTER DETAILS */}
          <div style={{ fontSize: "9.5px", marginBottom: "3px" }}>
            <strong style={{ textDecoration: "underline" }}>
              Details of Application (Remitter)
            </strong>{" "}
            — By cheque Transfer for N.E.F.T./RTGS On
          </div>

          <table
            style={{
              width: "100%",
              fontSize: "9.5px",
              marginBottom: "8px",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top", width: "20px" }}>1.</td>
                <td style={{ padding: "4px 0", verticalAlign: "top", width: "160px" }}>
                  Account Name:
                </td>
                <td
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    height: "18px",
                  }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>2.</td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                  Account No.:
                </td>
                <td
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    height: "18px",
                  }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>3.</td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                  Remitter's Name:
                </td>
                <td
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    height: "18px",
                  }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>4.</td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                  Phone No. OR Mobile No.:
                </td>
                <td
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    height: "18px",
                  }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>5.</td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                  E-mail ID:
                </td>
                <td
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    height: "18px",
                  }}
                >
                  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </td>
              </tr>
            </tbody>
          </table>

          {/* BENEFICIARY DETAILS */}
          <div
            style={{
              fontSize: "10.5px",
              fontWeight: "bold",
              textDecoration: "underline",
              marginBottom: "6px",
            }}
          >
            Details of Beneficiary
          </div>

          <table
            style={{
              width: "100%",
              fontSize: "11.5px",
              marginBottom: "12px",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", width: "20px", verticalAlign: "top" }}>(1)</td>
                <td style={{ padding: "4px 0", width: "90px", verticalAlign: "top" }}>
                  Centre:
                </td>
                <td
                  colSpan={3}
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    fontWeight: "bold",
                  }}
                >
                  {bill.bank_branch || "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>(2)</td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>Bank:</td>
                <td
                  colSpan={3}
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    fontWeight: "bold",
                  }}
                >
                  {bill.bank_name || "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0" }}></td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>Address:</td>
                <td
                  colSpan={3}
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    fontWeight: "bold",
                  }}
                >
                  {bill.bank_address || "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>(3)</td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>Branch:</td>
                <td
                  colSpan={3}
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    fontWeight: "bold",
                  }}
                >
                  {bill.bank_branch || "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>(4)</td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                  Beneficiary Name:
                </td>
                <td
                  colSpan={3}
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    fontWeight: "bold",
                  }}
                >
                  {bill.bank_account_name || bill.recipient_name || "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>(5)</td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>Account No.:</td>
                <td
                  colSpan={3}
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    fontWeight: "bold",
                    fontFamily: "monospace",
                  }}
                >
                  {bill.bank_account_no || "—"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>(6)</td>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>Type of A/c:</td>
                <td
                  colSpan={3}
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    fontWeight: "bold",
                  }}
                >
                  {bill.bank_account_type || "Savings"}
                </td>
              </tr>

              {/* IFSC Row with Boxes */}
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "middle" }}>(7)</td>
                <td colSpan={4} style={{ padding: "4px 0", verticalAlign: "middle" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td
                          style={{
                            padding: "4px 6px",
                            border: "1px solid #000",
                            fontSize: "9px",
                            fontWeight: "bold",
                            textAlign: "center",
                            width: "60px",
                            verticalAlign: "middle",
                          }}
                        >
                          IFSC OF
                          <br />
                          BENEFICIARY
                          <br />
                          BANK BRANCH
                        </td>
                        {ifscChars.map((ch, i) => (
                          <td
                            key={i}
                            style={{
                              border: "1px solid #000",
                              width: "26px",
                              height: "30px",
                              textAlign: "center",
                              fontWeight: "bold",
                              fontSize: "15px",
                              verticalAlign: "middle",
                            }}
                          >
                            {ch}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          {/* AMOUNT SECTION */}
          <table
            style={{
              width: "100%",
              fontSize: "10.5px",
              marginBottom: "10px",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", width: "200px" }}>
                  Account to be remitted Rs.
                </td>
                <td style={{ padding: "4px 0", borderBottom: "1px dotted #000" }}>
                  &nbsp;
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0" }}>Bank Charges Rs.</td>
                <td style={{ padding: "4px 0", borderBottom: "1px dotted #000" }}>
                  &nbsp;
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Total Amount Rs.</td>
                <td
                  style={{
                    padding: "4px 0",
                    borderBottom: "1px dotted #000",
                    fontWeight: "bold",
                  }}
                >
                  &nbsp;
                </td>
              </tr>
            </tbody>
          </table>

          {/* Declaration */}
          <div
            style={{
              fontSize: "10px",
              marginBottom: "8px",
              lineHeight: "1.5",
            }}
          >
            Remit the amount as per above details, by debiting my/ our{" "}
            <strong style={{ color: "rgba(14, 13, 13, 0.8)" }}>account</strong>{" "}
            for the amount of remittance plus your charges.
            <br />
            I/We have fully read the terms and conditions of the RTGS
            remittance and
          </div>

          {/* UTR & Purpose */}
          <table
            style={{
              width: "100%",
              fontSize: "10.5px",
              marginBottom: "16px",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", width: "80px" }}>UTR No:</td>
                <td style={{ padding: "4px 0", borderBottom: "1px dotted #000" }}>
                  &nbsp;
                </td>
                <td
                  style={{
                    padding: "4px 0 4px 20px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                  colSpan={2}
                >
                  Bank Officer's Signature
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0" }}>Purpose:</td>
                <td style={{ padding: "4px 0", borderBottom: "1px dotted #000" }}>
                  &nbsp;
                </td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              fontSize: "10.5px",
              marginBottom: "16px",
              marginTop: "20px",
            }}
          >
            <strong>Customer's Signature / Authorized Signatory</strong>
          </div>

          {/* FOR BANK'S USE ONLY */}
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "11px",
              marginBottom: "8px",
              borderTop: "1px solid #000",
              paddingTop: "8px",
            }}
          >
            FOR BANK'S USE ONLY
          </div>

          <table
            style={{
              width: "100%",
              fontSize: "10.5px",
              marginBottom: "20px",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", width: "180px", verticalAlign: "top" }}>
                  Rupees
                </td>
                <td style={{ padding: "4px 0", borderBottom: "1px dotted #000" }}>
                  &nbsp;
                </td>
                <td
                  style={{
                    padding: "4px 0 4px 20px",
                    width: "150px",
                    verticalAlign: "top",
                  }}
                >
                  Date of Transfer:
                </td>
                <td style={{ padding: "4px 0", borderBottom: "1px dotted #000" }}>
                  &nbsp;
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                  Debited Applicant's A/c
                </td>
                <td style={{ padding: "4px 0", borderBottom: "1px dotted #000" }}>
                  &nbsp;
                </td>
                <td style={{ padding: "4px 0" }}></td>
                <td style={{ padding: "4px 0" }}></td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", verticalAlign: "top" }}>
                  Remittance No. (UTR):
                </td>
                <td style={{ padding: "4px 0", borderBottom: "1px dotted #000" }}>
                  &nbsp;
                </td>
                <td style={{ padding: "4px 0" }}></td>
                <td style={{ padding: "4px 0" }}></td>
              </tr>
            </tbody>
          </table>

          <div
            style={{
              textAlign: "right",
              fontSize: "10.5px",
              fontWeight: "bold",
              marginBottom: "20px",
            }}
          >
            Authorized Signature
          </div>

          {/* RTGS CONDITIONS */}
          <div
            style={{
              borderTop: "1px solid #000",
              paddingTop: "6px",
              fontSize: "9.5px",
              lineHeight: "1.35",
              textAlign: "justify",
            }}
          >
            <div
              style={{
                textAlign: "center",
                fontWeight: "bold",
                fontSize: "10px",
                marginBottom: "6px",
                textDecoration: "underline",
              }}
            >
              RTGS CONDITIONS OF TRANSFER
            </div>
            <div style={{ marginBottom: "3px" }}>
              1. All payment instructions should be carefully checked by the
              remitter. As crediting the proceeds of the remittance is based on
              the beneficiary's account number, the name of the other bank and
              its branch, SBI shall not be responsible if these particulars are
              not provided correctly by the remitter.
            </div>
            <div style={{ marginBottom: "3px" }}>
              2. Application/Message received after the business hours will be
              sent on the immediate next working day.
            </div>
            <div style={{ marginBottom: "3px" }}>
              3. SBI shall not be responsible for any delay in processing of the
              payment due to RBI RTGS system not being available/failure of
              internal communication system at the recipient bank/branch/
              incorrect information provided by the remitter/any incorrect
              credit accorded by the recipient bank/branch due to incorrect
              information provided by the remitter.
            </div>
            <div style={{ marginBottom: "3px" }}>
              4. (i) Remitting Branch shall not be liable for any loss or damage
              arising out or resulting from delay in transmission delivery or
              non-delivery of electronic message or any mistake, omission or
              error in transmission or delivery thereof or in
              encrypting/decrypting the messages for any cause whatsoever or
              from misinterpretation when received or for the action of the
              destination bank or for any act beyond the control of the State
              Bank of India.
            </div>
            <div style={{ marginBottom: "3px", paddingLeft: "12px" }}>
              (ii) If the recipient branch is closed for any reason, the account
              shall be credited on the immediate next working day.
            </div>
            <div style={{ marginBottom: "3px", paddingLeft: "12px" }}>
              (iii) Bank is free to recover charges in respect of remittances
              returned on account of faulty/inadequate information.
            </div>
            <div style={{ marginBottom: "3px", paddingLeft: "12px" }}>
              (iv) I/We have fully read the terms and conditions of the RTGS
              remittance and shall abide by the same.
            </div>

            <div
              style={{
                textAlign: "right",
                fontWeight: "bold",
                marginTop: "8px",
                fontSize: "10px",
              }}
            >
              Signature of Applicant
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print-page {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            page-break-after: always;
            page-break-inside: avoid;
            break-after: page;
          }
          .print-page:last-child {
            page-break-after: auto;
            break-after: auto;
          }
        }
        @media screen {
          .print-page {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border-radius: 4px;
            margin-bottom: 24px;
          }
        }
      `}</style>
    </>
  );
}