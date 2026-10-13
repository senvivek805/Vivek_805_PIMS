"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import AppLayout from "@/components/layout/AppLayout";
import {
  NeoCard,
  NeoButton,
  NeoBadge,
  NeoIconBox,
} from "@/components/neumorphism";
import {
  Building2,
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Landmark,
  Percent,
  AlertCircle,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import {
  getVendor,
  deleteVendor,
  VENDOR_TYPE_LABELS,
  VENDOR_TYPE_EMOJIS,
  ACCOUNT_TYPE_LABELS,
  type Vendor,
} from "@/lib/api/vendors";

export default function VendorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vendorId = Number(params.id);

  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ============================================
  // LOAD
  // ============================================

  useEffect(() => {
    async function load() {
      if (!vendorId || isNaN(vendorId)) {
        setError("Invalid vendor ID");
        setLoading(false);
        return;
      }
      try {
        const data = await getVendor(vendorId);
        setVendor(data);
      } catch (err: any) {
        setError(err.message || "Failed to load vendor");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [vendorId]);

  // ============================================
  // DELETE
  // ============================================

  async function handleDelete() {
    if (!vendor) return;
    setDeleting(true);
    try {
      await deleteVendor(vendor.id);
      router.push("/vendors");
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
      setDeleting(false);
    }
  }

  // ============================================
  // FORMATTERS
  // ============================================

  function formatDate(date?: string) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // ============================================
  // LOADING / ERROR
  // ============================================

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-600 animate-spin mb-4" />
          <p className="text-sm text-slate-500">Loading vendor...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !vendor) {
    return (
      <AppLayout>
        <NeoCard>
          <div className="text-center py-10">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Vendor not found
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <Link href="/vendors">
              <NeoButton
                variant="primary"
                icon={<ArrowLeft className="h-4 w-4" />}
              >
                Back to Vendors
              </NeoButton>
            </Link>
          </div>
        </NeoCard>
      </AppLayout>
    );
  }

  const vendorTypeEmoji = VENDOR_TYPE_EMOJIS[vendor.vendor_type] || "🏢";
  const vendorTypeLabel =
    vendor.vendor_type_display || VENDOR_TYPE_LABELS[vendor.vendor_type];

  // ============================================
  // PAGE
  // ============================================

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/vendors">
            <NeoButton
              variant="secondary"
              size="md"
              icon={<ArrowLeft className="h-4 w-4" />}
            >
              Back
            </NeoButton>
          </Link>

          <div className="flex items-center gap-3">
            <Link href={`/vendors/${vendor.id}/edit`}>
              <NeoButton
                variant="primary"
                size="md"
                icon={<Pencil className="h-4 w-4" />}
              >
                Edit
              </NeoButton>
            </Link>
            <NeoButton
              variant="danger"
              size="md"
              onClick={() => setShowDelete(true)}
              icon={<Trash2 className="h-4 w-4" />}
            >
              Delete
            </NeoButton>
          </div>
        </div>

        {/* Hero Card */}
        <NeoCard>
          <div className="flex flex-wrap items-start gap-5">
            <NeoIconBox size="xl" color="text-blue-600" variant="inset">
              <Building2 className="h-8 w-8" />
            </NeoIconBox>

            <div className="flex-1 min-w-[240px]">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <span className="text-sm font-bold text-slate-500 tracking-wide">
                  {vendor.vendor_code}
                </span>
                {vendor.reference_no && (
                  <span className="text-xs text-slate-400">
                    Ref: {vendor.reference_no}
                  </span>
                )}
                <NeoBadge variant="primary" size="md">
                  {vendorTypeEmoji} {vendorTypeLabel}
                </NeoBadge>
                {vendor.is_active ? (
                  <NeoBadge variant="success" size="md">
                    ✅ Active
                  </NeoBadge>
                ) : (
                  <NeoBadge variant="warning" size="md">
                    ⚠️ Inactive
                  </NeoBadge>
                )}
              </div>

              <h1 className="text-3xl font-bold text-slate-800 mb-3">
                {vendor.vendor_name}
              </h1>

              {vendor.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {vendor.description}
                </p>
              )}
            </div>
          </div>
        </NeoCard>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-green-600">
                <User className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Contact</h2>
                <p className="text-xs text-slate-500">
                  Vendor se contact details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Contact Person
                  </p>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {vendor.contact_person}
                </p>
              </div>

              <div
                className="p-4 rounded-2xl"
                style={{
                  background: "#e0e5ec",
                  boxShadow:
                    "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Phone className="h-4 w-4 text-green-600" />
                  <p className="text-xs font-bold text-slate-500 uppercase">
                    Phone
                  </p>
                </div>
                <p className="text-base font-bold text-slate-800">
                  {vendor.phone}
                </p>
                {vendor.alternate_phone && (
                  <p className="text-xs text-slate-500 mt-1">
                    Alt: {vendor.alternate_phone}
                  </p>
                )}
              </div>

              {vendor.email && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-purple-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase">
                      Email
                    </p>
                  </div>
                  <a
                    href={`mailto:${vendor.email}`}
                    className="text-base font-bold text-blue-600 hover:underline break-all"
                  >
                    {vendor.email}
                  </a>
                </div>
              )}
            </div>
          </NeoCard>

          {/* Address */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-purple-600">
                <MapPin className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Address</h2>
                <p className="text-xs text-slate-500">Vendor ka address</p>
              </div>
            </div>

            <div
              className="p-4 rounded-2xl"
              style={{
                background: "#e0e5ec",
                boxShadow:
                  "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
              }}
            >
              <p className="text-sm text-slate-800 leading-relaxed">
                {vendor.address_line1}
                {vendor.address_line2 && (
                  <>
                    <br />
                    {vendor.address_line2}
                  </>
                )}
                <br />
                {vendor.city}, {vendor.state}
                <br />
                {vendor.pincode}, {vendor.country}
              </p>
            </div>
          </NeoCard>
        </div>

        {/* Tax Info */}
        {(vendor.gst_number || vendor.pan_number || vendor.tan_number) && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-orange-600">
                <Percent className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Tax Information
                </h2>
                <p className="text-xs text-slate-500">
                  GST, PAN, TAN details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vendor.gst_number && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    GST Number
                  </p>
                  <p className="text-sm font-bold text-slate-800 font-mono break-all">
                    {vendor.gst_number}
                  </p>
                </div>
              )}

              {vendor.pan_number && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    PAN Number
                  </p>
                  <p className="text-sm font-bold text-slate-800 font-mono break-all">
                    {vendor.pan_number}
                  </p>
                </div>
              )}

              {vendor.tan_number && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    TAN Number
                  </p>
                  <p className="text-sm font-bold text-slate-800 font-mono break-all">
                    {vendor.tan_number}
                  </p>
                </div>
              )}
            </div>
          </NeoCard>
        )}

        {/* Bank Details */}
        {(vendor.bank_name || vendor.account_number || vendor.ifsc_code) && (
          <NeoCard>
            <div className="flex items-center gap-3 mb-5">
              <NeoIconBox size="md" color="text-cyan-600">
                <Landmark className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Bank Details
                </h2>
                <p className="text-xs text-slate-500">
                  Payment ke liye bank info
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vendor.bank_name && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Bank Name
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {vendor.bank_name}
                  </p>
                </div>
              )}

              {vendor.account_number && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Account Number
                  </p>
                  <p className="text-sm font-bold text-slate-800 font-mono break-all">
                    {vendor.account_number}
                  </p>
                </div>
              )}

              {vendor.ifsc_code && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    IFSC Code
                  </p>
                  <p className="text-sm font-bold text-slate-800 font-mono">
                    {vendor.ifsc_code}
                  </p>
                </div>
              )}

              {vendor.bank_branch && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Bank Branch
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {vendor.bank_branch}
                  </p>
                </div>
              )}

              {vendor.account_type && (
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#e0e5ec",
                    boxShadow:
                      "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                  }}
                >
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                    Account Type
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {vendor.account_type_display ||
                      ACCOUNT_TYPE_LABELS[vendor.account_type]}
                  </p>
                </div>
              )}
            </div>
          </NeoCard>
        )}

        {/* Audit Info */}
        <NeoCard padding="sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span>
              Created:{" "}
              <strong className="text-slate-700">
                {formatDate(vendor.created_at)}
              </strong>
            </span>
            <span>
              Last Updated:{" "}
              <strong className="text-slate-700">
                {formatDate(vendor.updated_at)}
              </strong>
            </span>
          </div>
        </NeoCard>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => !deleting && setShowDelete(false)}
        >
          <div
            className="w-full max-w-md p-6 rounded-3xl"
            style={{
              background: "#e0e5ec",
              boxShadow:
                "20px 20px 60px rgba(0,0,0,0.3), -10px -10px 30px rgba(255,255,255,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
              Delete Vendor?
            </h2>
            <p className="text-sm text-slate-600 text-center mb-1">
              Ye vendor delete ho jayega:
            </p>
            <p className="text-sm font-bold text-slate-800 text-center mb-6">
              {vendor.vendor_name}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDelete(false)}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl font-bold text-sm text-slate-700 disabled:opacity-50"
                style={{
                  background: "#e0e5ec",
                  boxShadow: "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </span>
              </button>

              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  boxShadow:
                    "4px 4px 12px #b8bcc2, -4px -4px 12px #ffffff",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  {deleting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}