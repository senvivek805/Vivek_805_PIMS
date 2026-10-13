"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer, Loader2, AlertCircle } from "lucide-react";
import { getPurchaseOrder, type PurchaseOrder } from "@/lib/api/purchase";

// ============================================
// COPY TYPES
// ============================================

type CopyType = "ORIGINAL" | "DUPLICATE" | "TRIPLICATE";

const COPY_CONFIG: {
  type: CopyType;
  subtitle?: string;
  color: string;
}[] = [
  { type: "ORIGINAL", color: "#1e293b" },
  { type: "DUPLICATE", subtitle: "For Finance", color: "#1e40af" },
  { type: "TRIPLICATE", subtitle: "For Supplier", color: "#065f46" },
];

export default function PurchaseOrderPrintPage() {
  const params = useParams();
  const poId = Number(params.id);

  const [po, setPo] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!poId || isNaN(poId)) {
        setError("Invalid PO ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getPurchaseOrder(poId);
        setPo(data);
      } catch (err: any) {
        setError(err.message || "Failed to load PO");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [poId]);

  // ============================================
  // FORMATTERS
  // ============================================

  function formatDate(date?: string) {
    if (!date) return "—";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  function formatNumber(n: any) {
    const num = parseFloat(String(n)) || 0;
    return num.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  // ============================================
  // LOADING / ERROR
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4 mx-auto" />
          <p className="text-sm text-slate-500">Loading PO...</p>
        </div>
      </div>
    );
  }

  if (error || !po) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">PO not found</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            href="/purchase"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </div>
    );
  }

  const items = po.items || [];
  const isIgst = po.gst_type === "igst";

  // ============================================
  // SINGLE COPY RENDER
  // ============================================

  function renderCopy(config: (typeof COPY_CONFIG)[0]) {
    if (!po) return null;

    return (
      <div
        key={config.type}
        className="po-copy bg-white mx-auto"
        style={{
          width: "210mm",
          minHeight: "297mm",
          padding: "10mm 12mm",
          pageBreakAfter: "always",
          fontFamily: "'Times New Roman', serif",
          fontSize: "11px",
          lineHeight: "1.4",
          color: "#000",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ANNEXURE-IV */}
        <div
          style={{
            textAlign: "right",
            fontSize: "10px",
            fontWeight: "bold",
            marginBottom: "2px",
          }}
        >
          ANNEXURE-IV
        </div>

        {/* ============================================
            HEADER — Logos UPAR (bade), Name NEECHE (chhota)
            ============================================ */}
        <div
          style={{
            borderBottom: "2px solid #000",
            paddingBottom: "6px",
            marginBottom: "8px",
          }}
        >
          {/* Logos Row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              alignItems: "center",
              marginBottom: "0px",
            }}
          >
            {/* Left — Emblem (bada) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/iitbhu-emblem.png"
                alt="IIT BHU Emblem"
                style={{
                  width: "85px",
                  height: "85px",
                  objectFit: "contain",
                }}
              />
            </div>

                        {/* Center — Text Logo (bada, wider) */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/iitbhu-text.png"
                alt="IIT BHU"
                style={{
                  height: "85px",
                  width: "auto",
                  maxWidth: "280px",
                  objectFit: "contain",
                }}
              />
            </div>

            {/* Right — Spacer */}
            <div></div>
          </div>

          {/* Institute Name (chhota) */}
          <div style={{ textAlign: "center", marginTop: "-10px" }}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                letterSpacing: "0.5px",
                lineHeight: "1.2",
              }}
            >
              INDIAN INSTITUTE OF TECHNOLOGY
            </div>
            <div
              style={{
                fontSize: "10px",
                fontWeight: "bold",
                lineHeight: "1.2",
              }}
            >
              (BANARAS HINDU UNIVERSITY)
            </div>
            <div style={{ fontSize: "10px", marginTop: "2px" }}>
              VARANASI — 221005
            </div>
          </div>
        </div>

        {/* COPY TYPE */}
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "bold",
              letterSpacing: "1px",
              color: config.color,
            }}
          >
            ({config.type})
          </div>
          {config.subtitle && (
            <div
              style={{
                fontSize: "11px",
                fontWeight: "bold",
                fontStyle: "italic",
                color: config.color,
              }}
            >
              {config.subtitle}
            </div>
          )}
        </div>

        {/* TOP SECTION — 2 columns */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.3fr",
            gap: "12px",
            marginBottom: "10px",
          }}
        >
          {/* Left */}
          <div>
            <table style={{ fontSize: "11px", width: "100%" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      paddingRight: "8px",
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                      paddingBottom: "2px",
                    }}
                  >
                    Department/School
                  </td>
                  <td style={{ verticalAlign: "top", paddingBottom: "2px" }}>
                    : {po.department_school}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      paddingRight: "8px",
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                      paddingBottom: "2px",
                    }}
                  >
                    Approximate Cost Rs.
                  </td>
                  <td style={{ verticalAlign: "top", paddingBottom: "2px" }}>
                    : {formatNumber(po.approximate_cost)}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      paddingRight: "8px",
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                      paddingBottom: "2px",
                    }}
                  >
                    Major Budget Head
                  </td>
                  <td style={{ verticalAlign: "top", paddingBottom: "2px" }}>
                    : {po.major_budget_head || "—"}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      paddingRight: "8px",
                      verticalAlign: "top",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Minor Budget Head
                  </td>
                  <td style={{ verticalAlign: "top" }}>
                    : {po.minor_budget_head || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right */}
          <div>
            <table style={{ fontSize: "11px", width: "100%" }}>
              <tbody>
                <tr>
                  <td
                    style={{
                      paddingRight: "8px",
                      verticalAlign: "top",
                      paddingBottom: "2px",
                    }}
                  >
                    Order No.
                  </td>
                  <td style={{ verticalAlign: "top", paddingBottom: "2px" }}>
                    : <strong>{po.po_number}</strong>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      paddingRight: "8px",
                      verticalAlign: "top",
                      paddingBottom: "2px",
                    }}
                  >
                    Date
                  </td>
                  <td style={{ verticalAlign: "top", paddingBottom: "2px" }}>
                    : <strong>{formatDate(po.po_date)}</strong>
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      paddingRight: "8px",
                      verticalAlign: "top",
                      paddingBottom: "2px",
                    }}
                  >
                    Budget Grant Rs.
                  </td>
                  <td style={{ verticalAlign: "top", paddingBottom: "2px" }}>
                    : {po.budget_grant || "—"}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      paddingRight: "8px",
                      verticalAlign: "top",
                      paddingBottom: "2px",
                    }}
                  >
                    Amount spent including commitments: Rs.
                  </td>
                  <td style={{ verticalAlign: "top", paddingBottom: "2px" }}>
                    : {po.amount_spent || "—"}
                  </td>
                </tr>
                <tr>
                  <td
                    style={{
                      paddingRight: "8px",
                      verticalAlign: "top",
                    }}
                  >
                    Balance available Rs.
                  </td>
                  <td style={{ verticalAlign: "top" }}>
                    : {po.balance_available || "—"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TO — Vendor */}
        <div style={{ marginBottom: "8px", fontSize: "11px" }}>
          <div style={{ fontWeight: "bold", marginBottom: "2px" }}>To,</div>
          <div style={{ paddingLeft: "16px" }}>
            <div style={{ fontWeight: "bold" }}>
              {po.vendor_detail?.vendor_name || po.vendor_name}
            </div>
            {po.vendor_detail && (
              <>
                <div>{po.vendor_detail.address_line1}</div>
                {po.vendor_detail.address_line2 && (
                  <div>{po.vendor_detail.address_line2}</div>
                )}
                <div>
                  {po.vendor_detail.city}, {po.vendor_detail.state} —{" "}
                  {po.vendor_detail.pincode}
                </div>
                {po.vendor_detail.gst_number && (
                  <div>
                    <strong>GSTIN:</strong> {po.vendor_detail.gst_number}
                  </div>
                )}
                {po.vendor_detail.pan_number && (
                  <div>
                    <strong>PAN:</strong> {po.vendor_detail.pan_number}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* SUBJECT */}
        {po.subject && (
          <div
            style={{
              marginBottom: "8px",
              fontSize: "11px",
              fontWeight: "bold",
            }}
          >
            Sub: {po.subject}
          </div>
        )}

        {/* BODY — SIRF USER'S DESCRIPTION */}
        {po.body_description && (
          <div
            style={{
              marginBottom: "10px",
              fontSize: "11px",
              marginTop: "8px",
            }}
          >
            {po.body_description}
          </div>
        )}

        {/* ITEMS TABLE */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "10px",
            marginBottom: "8px",
            border: "1px solid #000",
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 4px",
                  textAlign: "center",
                  width: "35px",
                  fontWeight: "bold",
                  fontSize: "10px",
                }}
              >
                Sl. No.
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 6px",
                  textAlign: "left",
                  fontWeight: "bold",
                  fontSize: "10px",
                }}
              >
                Item / Service Description
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 4px",
                  textAlign: "center",
                  width: "45px",
                  fontWeight: "bold",
                  fontSize: "10px",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 4px",
                  textAlign: "center",
                  width: "45px",
                  fontWeight: "bold",
                  fontSize: "10px",
                }}
              >
                Unit
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 6px",
                  textAlign: "center",
                  width: "75px",
                  fontWeight: "bold",
                  fontSize: "10px",
                }}
              >
                Rate (₹)
              </th>
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 4px",
                  textAlign: "centre",
                  width: "45px",
                  fontWeight: "bold",
                  fontSize: "10px",
                }}
              >
                GST %
              </th>
              {isIgst ? (
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "5px 6px",
                    textAlign: "center",
                    width: "75px",
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  IGST (₹)
                </th>
              ) : (
                <>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "5px 6px",
                      textAlign: "center",
                      width: "65px",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}
                  >
                    CGST (₹)
                  </th>
                  <th
                    style={{
                      border: "1px solid #000",
                      padding: "5px 6px",
                      textAlign: "center",
                      width: "65px",
                      fontWeight: "bold",
                      fontSize: "10px",
                    }}
                  >
                    SGST (₹)
                  </th>
                </>
              )}
              <th
                style={{
                  border: "1px solid #000",
                  padding: "5px 6px",
                  textAlign: "center",
                  width: "85px",
                  fontWeight: "bold",
                  fontSize: "10px",
                }}
              >
                Amount with GST (₹)
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const qty = parseFloat(String(item.quantity)) || 0;
              const rate = parseFloat(String(item.rate)) || 0;
              const base = qty * rate;
              const gstRate = parseFloat(String(item.gst_rate)) || 0;

              let cgst = 0,
                sgst = 0,
                igst = 0;
              if (isIgst) {
                igst = (base * gstRate) / 100;
              } else {
                cgst = (base * (gstRate / 2)) / 100;
                sgst = (base * (gstRate / 2)) / 100;
              }
              const lineTotal = base + cgst + sgst + igst;

              return (
                <tr key={item.id || idx}>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 4px",
                      textAlign: "center",
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 6px",
                      textAlign: "left",
                    }}
                  >
                    {item.item_name}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 4px",
                      textAlign: "center",
                    }}
                  >
                    {qty}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 4px",
                      textAlign: "center",
                    }}
                  >
                    {item.unit || "—"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 6px",
                      textAlign: "center",
                    }}
                  >
                    {formatNumber(rate)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 4px",
                      textAlign: "center",
                    }}
                  >
                    {gstRate}%
                  </td>
                  {isIgst ? (
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "5px 6px",
                        textAlign: "center",
                      }}
                    >
                      {formatNumber(igst)}
                    </td>
                  ) : (
                    <>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "5px 6px",
                          textAlign: "center",
                        }}
                      >
                        {formatNumber(cgst)}
                      </td>
                      <td
                        style={{
                          border: "1px solid #000",
                          padding: "5px 6px",
                          textAlign: "center",
                        }}
                      >
                        {formatNumber(sgst)}
                      </td>
                    </>
                  )}
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "5px 6px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {formatNumber(lineTotal)}
                  </td>
                </tr>
              );
            })}

            {/* Empty rows */}
            {items.length < 5 &&
              Array.from({ length: 5 - items.length }).map((_, i) => (
                <tr key={`empty-${i}`}>
                  <td style={{ border: "1px solid #000", padding: "8px" }}>
                    &nbsp;
                  </td>
                  <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                  <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                  <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                  <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                  <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                  {isIgst ? (
                    <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                  ) : (
                    <>
                      <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                      <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                    </>
                  )}
                  <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                </tr>
              ))}

            {/* Total Row */}
            <tr style={{ background: "#f3f4f6" }}>
              <td
                colSpan={isIgst ? 7 : 8}
                style={{
                  border: "1px solid #000",
                  padding: "5px 6px",
                  textAlign: "right",
                  fontWeight: "bold",
                }}
              >
                Grnad Total (Rs.)
              </td>
              <td
                style={{
                  border: "1px solid #000",
                  padding: "5px 6px",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                {formatNumber(po.grand_total)}
              </td>
            </tr>
          </tbody>
        </table>

        {/* In Words */}
        <div
          style={{
            fontSize: "11px",
            marginBottom: "10px",
            display: "flex",
            gap: "8px",
          }}
        >
          <div style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
            In word :
          </div>
          <div style={{ fontStyle: "italic" }}>{po.in_words || "—"}</div>
        </div>

        {/* TERMS & CONDITIONS */}
        {po.terms_conditions && (
          <div style={{ marginBottom: "14px", fontSize: "10px" }}>
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              Terms & Conditions:
            </div>
            <div
              style={{
                paddingLeft: "8px",
                whiteSpace: "pre-line",
                lineHeight: "1.6",
              }}
            >
              {po.terms_conditions}
            </div>
          </div>
        )}

        {/* ============================================
            SIGNATURE SECTION
            - Original & Duplicate: Full (CFA + Committee + HOD/PI)
            - Triplicate: Sirf HOD/PI
            ============================================ */}
        <div
          style={{
            marginTop: "40px",
            marginBottom: "24px",
            fontSize: "11px",
            pageBreakInside: "avoid",
          }}
        >
          {config.type !== "TRIPLICATE" ? (
            <>
              <div style={{ fontWeight: "bold", marginBottom: "24px" }}>
                Signature of Purchase Committee Members:
              </div>

              <div style={{ marginBottom: "40px" }}>Sanctioned</div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginTop: "40px",
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                  CFA
                </div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "12px",
                    textAlign: "right",
                  }}
                >
                  HOD/Coordinator/PI
                </div>
              </div>
            </>
          ) : (
            // Triplicate — sirf HOD/PI
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "40px",
              }}
            >
              <div
                style={{
                  fontWeight: "bold",
                  fontSize: "12px",
                  textAlign: "right",
                }}
              >
                HOD/Coordinator/PI
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div
          style={{
            marginTop: "auto",
            paddingTop: "6px",
            borderTop: "1px solid #000",
            display: "flex",
            justifyContent: "space-between",
            fontSize: "10px",
          }}
        >
          <div style={{ fontStyle: "italic" }}>
            Certified that the amount of the order is within the grant.
          </div>
          <div style={{ fontWeight: "bold" }}>IIT Accounts Office</div>
        </div>
      </div>
    );
  }

  // ============================================
  // PAGE
  // ============================================

  return (
    <>
      <div className="print:hidden sticky top-0 z-50 bg-slate-100 border-b border-slate-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/purchase/${po.id}`}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Print Purchase Order
              </h1>
              <p className="text-xs text-slate-500">
                {po.po_number} — 3 copies
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 inline-flex items-center gap-2 shadow-md"
          >
            <Printer className="h-4 w-4" /> Print All 3 Copies
          </button>
        </div>
      </div>

      <div className="bg-slate-200 py-6 print:bg-white print:py-0">
        {COPY_CONFIG.map((config) => renderCopy(config))}
      </div>

      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .po-copy {
            page-break-after: always;
            box-shadow: none !important;
          }
          .po-copy:last-child {
            page-break-after: auto;
          }
        }
        @media screen {
          .po-copy {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border-radius: 4px;
            margin-bottom: 24px;
          }
        }
      `}</style>
    </>
  );
}