"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Printer, Loader2, AlertCircle } from "lucide-react";
import {
  getMaterialReturn,
  RETURN_STATUS_LABELS,
  RETURN_STATUS_EMOJIS,
  CONDITION_LABELS,
  CONDITION_EMOJIS,
  type MaterialReturnNote,
} from "@/lib/api/materials";

export default function MaterialReturnPrintPage() {
  const params = useParams();
  const returnId = Number(params.id);

  const [mrn, setMrn] = useState<MaterialReturnNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!returnId || isNaN(returnId)) {
        setError("Invalid MRN ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getMaterialReturn(returnId);
        setMrn(data);
      } catch (err: any) {
        setError(err.message || "Failed to load MRN");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [returnId]);

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

  // ============================================
  // LOADING / ERROR
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-orange-600 animate-spin mb-4 mx-auto" />
          <p className="text-sm text-slate-500">Loading MRN...</p>
        </div>
      </div>
    );
  }

  if (error || !mrn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Return Note not found</h2>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            href="/materials/returns"
            className="px-6 py-3 bg-orange-600 text-white rounded-lg inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </div>
    );
  }

  const items = mrn.items || [];
  const totalQty = items.reduce(
    (sum, it) => sum + (parseFloat(String(it.quantity)) || 0),
    0
  );

  // ============================================
  // PAGE
  // ============================================

  return (
    <>
      {/* Print Toolbar (hidden on print) */}
      <div className="print:hidden sticky top-0 z-50 bg-slate-100 border-b border-slate-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/materials/returns/${mrn.id}`}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                Print Material Return Note
              </h1>
              <p className="text-xs text-slate-500">
                {mrn.mrn_no} — 1 slip (top half)
              </p>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold hover:bg-orange-700 inline-flex items-center gap-2 shadow-md"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      {/* Print Content — Single Slip (Top Half of A4) */}
      <div className="bg-slate-200 py-6 print:bg-white print:py-0">
        <div
          className="mrn-copy bg-white mx-auto"
          style={{
            width: "210mm",
            height: "148mm",
            padding: "6mm 10mm",
            fontFamily: "'Times New Roman', serif",
            fontSize: "10px",
            lineHeight: "1.35",
            color: "#000",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* ============================================
              HEADER
              ============================================ */}
          <div
            style={{
              borderBottom: "2px solid #000",
              paddingBottom: "4px",
              marginBottom: "5px",
            }}
          >
            {/* Logos */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                alignItems: "center",
              }}
            >
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
                    width: "50px",
                    height: "50px",
                    objectFit: "contain",
                  }}
                />
              </div>

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
                    height: "50px",
                    width: "auto",
                    maxWidth: "170px",
                    objectFit: "contain",
                  }}
                />
              </div>

              <div></div>
            </div>

            {/* Institute Name */}
            <div style={{ textAlign: "center", marginTop: "-8px" }}>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "bold",
                  letterSpacing: "0.4px",
                  lineHeight: "1.2",
                }}
              >
                INDIAN INSTITUTE OF TECHNOLOGY
              </div>
              <div
                style={{
                  fontSize: "9px",
                  fontWeight: "bold",
                  lineHeight: "1.2",
                }}
              >
                (BANARAS HINDU UNIVERSITY)
              </div>
              <div style={{ fontSize: "9px", marginTop: "1px" }}>
                VARANASI — 221005
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div
            style={{
              textAlign: "center",
              marginBottom: "8px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                letterSpacing: "1.2px",
                textDecoration: "underline",
              }}
            >
              MATERIAL RETURN NOTE
            </div>
          </div>

          {/* MRN INFO — 2 Columns */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              marginBottom: "8px",
            }}
          >
            {/* Left */}
            <div>
              <table style={{ fontSize: "10.5px", width: "100%" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        paddingRight: "6px",
                        paddingBottom: "2px",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                        width: "95px",
                      }}
                    >
                      MRN No.
                    </td>
                    <td style={{ paddingBottom: "2px", verticalAlign: "top" }}>
                      : <strong>{mrn.mrn_no}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        paddingRight: "6px",
                        paddingBottom: "2px",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Return Date
                    </td>
                    <td style={{ paddingBottom: "2px", verticalAlign: "top" }}>
                      : <strong>{formatDate(mrn.return_date)}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        paddingRight: "6px",
                        paddingBottom: "2px",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Status
                    </td>
                    <td style={{ paddingBottom: "2px", verticalAlign: "top" }}>
                      : {RETURN_STATUS_EMOJIS[mrn.status]}{" "}
                      {RETURN_STATUS_LABELS[mrn.status]}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Right */}
            <div>
              <table style={{ fontSize: "10.5px", width: "100%" }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        paddingRight: "6px",
                        paddingBottom: "2px",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                        width: "95px",
                      }}
                    >
                      Returned By
                    </td>
                    <td style={{ paddingBottom: "2px", verticalAlign: "top" }}>
                      : <strong>{mrn.returned_by_name || "—"}</strong>
                      {mrn.returned_by_code && (
                        <span> ({mrn.returned_by_code})</span>
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        paddingRight: "6px",
                        paddingBottom: "2px",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Issue No.
                    </td>
                    <td style={{ paddingBottom: "2px", verticalAlign: "top" }}>
                      : {mrn.issue_no || "—"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        paddingRight: "6px",
                        paddingBottom: "2px",
                        verticalAlign: "top",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Project
                    </td>
                    <td style={{ paddingBottom: "2px", verticalAlign: "top" }}>
                      : {mrn.project_name || "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* REASON */}
          {mrn.reason && (
            <div
              style={{
                marginBottom: "8px",
                fontSize: "10.5px",
                display: "flex",
                gap: "5px",
              }}
            >
              <div style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                Reason:
              </div>
              <div>{mrn.reason}</div>
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
                    padding: "4px 3px",
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
                    padding: "4px 6px",
                    textAlign: "left",
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  Material Description
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "center",
                    width: "95px",
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  Material Code
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 3px",
                    textAlign: "center",
                    width: "60px",
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  Qty
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 3px",
                    textAlign: "center",
                    width: "50px",
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  Unit
                </th>
                <th
                  style={{
                    border: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "center",
                    width: "80px",
                    fontWeight: "bold",
                    fontSize: "10px",
                  }}
                >
                  Condition
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 3px",
                      textAlign: "center",
                    }}
                  >
                    {idx + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      textAlign: "left",
                    }}
                  >
                    {item.material_name || "—"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      textAlign: "center",
                      fontSize: "9.5px",
                    }}
                  >
                    {item.material_code || "—"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 3px",
                      textAlign: "center",
                      fontWeight: "bold",
                    }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 3px",
                      textAlign: "center",
                    }}
                  >
                    {item.unit || "—"}
                  </td>
                  <td
                    style={{
                      border: "1px solid #000",
                      padding: "4px 6px",
                      textAlign: "center",
                      fontSize: "9.5px",
                    }}
                  >
                    {CONDITION_EMOJIS[item.condition || "good"]}{" "}
                    {CONDITION_LABELS[item.condition || "good"]}
                  </td>
                </tr>
              ))}

              {/* Empty rows (minimum 4 rows total) */}
              {items.length < 4 &&
                Array.from({ length: 4 - items.length }).map((_, i) => (
                  <tr key={`empty-${i}`}>
                    <td
                      style={{
                        border: "1px solid #000",
                        padding: "5px",
                      }}
                    >
                      &nbsp;
                    </td>
                    <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                    <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                    <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                    <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                    <td style={{ border: "1px solid #000" }}>&nbsp;</td>
                  </tr>
                ))}

              {/* Total Row */}
              <tr style={{ background: "#f3f4f6" }}>
                <td
                  colSpan={3}
                  style={{
                    border: "1px solid #000",
                    padding: "4px 6px",
                    textAlign: "right",
                    fontWeight: "bold",
                  }}
                >
                  Total Quantity
                </td>
                <td
                  style={{
                    border: "1px solid #000",
                    padding: "4px 3px",
                    textAlign: "center",
                    fontWeight: "bold",
                  }}
                >
                  {totalQty}
                </td>
                <td colSpan={2} style={{ border: "1px solid #000" }}></td>
              </tr>
            </tbody>
          </table>

          {/* REMARKS */}
          {mrn.remarks && (
            <div
              style={{
                marginBottom: "8px",
                fontSize: "10.5px",
                display: "flex",
                gap: "5px",
              }}
            >
              <div style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
                Remarks:
              </div>
              <div>{mrn.remarks}</div>
            </div>
          )}

          {/* SPACER — push signatures to bottom */}
          <div style={{ flex: 1 }}></div>

          {/* SIGNATURES — 2 Columns */}
          <div
            style={{
              marginBottom: "6px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "60px",
              fontSize: "10.5px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  borderTop: "1px solid #000",
                  paddingTop: "4px",
                  fontWeight: "bold",
                }}
              >
                Returned By
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  borderTop: "1px solid #000",
                  paddingTop: "4px",
                  fontWeight: "bold",
                }}
              >
                Verified By
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div
            style={{
              paddingTop: "3px",
              borderTop: "1px solid #000",
              display: "flex",
              justifyContent: "space-between",
              fontSize: "9px",
            }}
          >
            <div style={{ fontStyle: "italic" }}>
              This is a system-generated return note.
            </div>
            <div style={{ fontWeight: "bold" }}>IIT(BHU) — PIMS</div>
          </div>
        </div>
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
          .mrn-copy {
            box-shadow: none !important;
            border-radius: 0 !important;
            margin: 0 !important;
            page-break-after: always;
          }
        }
        @media screen {
          .mrn-copy {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            border-radius: 4px;
          }
        }
      `}</style>
    </>
  );
}