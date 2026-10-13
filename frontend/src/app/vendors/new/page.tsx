"use client";

import { useState } from "react";
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
  Building2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Landmark,
  Percent,
} from "lucide-react";
import {
  createVendor,
  VENDOR_TYPE_LABELS,
  ACCOUNT_TYPE_LABELS,
  type VendorCreateUpdate,
  type VendorType,
  type AccountType,
} from "@/lib/api/vendors";

export default function NewVendorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Basic
  const [referenceNo, setReferenceNo] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorType, setVendorType] = useState<VendorType>("supplier");
  const [description, setDescription] = useState("");

  // Tax
  const [gstNumber, setGstNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");
  const [tanNumber, setTanNumber] = useState("");

  // Address
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");

  // Contact
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [alternatePhone, setAlternatePhone] = useState("");

  // Bank
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [bankBranch, setBankBranch] = useState("");
  const [accountType, setAccountType] = useState<AccountType | "">("");

  // Status
  const [isActive, setIsActive] = useState(true);

  // ============================================
  // SUBMIT
  // ============================================

  async function handleSubmit() {
    setError("");
    setSuccess("");

    // Validation
    if (!vendorName.trim()) {
      setError("Vendor Name zaroori hai.");
      return;
    }
    if (!contactPerson.trim()) {
      setError("Contact Person zaroori hai.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone zaroori hai.");
      return;
    }
    if (!addressLine1.trim()) {
      setError("Address Line 1 zaroori hai.");
      return;
    }
    if (!city.trim()) {
      setError("City zaroori hai.");
      return;
    }
    if (!state.trim()) {
      setError("State zaroori hai.");
      return;
    }
    if (!pincode.trim()) {
      setError("Pincode zaroori hai.");
      return;
    }

    // GST validation (if provided)
    if (gstNumber && gstNumber.length !== 15) {
      setError("GST number 15 characters ka hona chahiye.");
      return;
    }

    // PAN validation (if provided)
    if (panNumber && panNumber.length !== 10) {
      setError("PAN number 10 characters ka hona chahiye.");
      return;
    }

    setLoading(true);
    try {
      const payload: VendorCreateUpdate = {
        reference_no: referenceNo || undefined,
        vendor_name: vendorName.trim(),
        vendor_type: vendorType,
        description: description || undefined,
        gst_number: gstNumber.toUpperCase() || undefined,
        pan_number: panNumber.toUpperCase() || undefined,
        tan_number: tanNumber.toUpperCase() || undefined,
        address_line1: addressLine1.trim(),
        address_line2: addressLine2 || undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        country: country.trim() || "India",
        contact_person: contactPerson.trim(),
        email: email || undefined,
        phone: phone.trim(),
        alternate_phone: alternatePhone || undefined,
        bank_name: bankName || undefined,
        account_number: accountNumber || undefined,
        ifsc_code: ifscCode.toUpperCase() || undefined,
        bank_branch: bankBranch || undefined,
        account_type: accountType || undefined,
        is_active: isActive,
      };

      const created = await createVendor(payload);
      setSuccess("Vendor successfully create ho gaya! 🎉");

      setTimeout(() => {
        router.push(`/vendors/${created.id}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create vendor");
      setLoading(false);
    }
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-blue-600">
              <Building2 className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                New Vendor
              </h1>
              <p className="text-sm text-slate-500">
                Register a new vendor / supplier
              </p>
            </div>
          </div>
          <Link href="/vendors">
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

        {/* ============================================
            SECTION 1: BASIC INFO
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-blue-600">
              <Building2 className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Basic Information
              </h2>
              <p className="text-xs text-slate-500">
                Vendor ka naam aur type
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <div
                className="p-3 rounded-xl text-xs text-slate-600 flex items-center gap-2"
                style={{
                  background: "rgba(79, 109, 245, 0.08)",
                  borderLeft: "3px solid #4f6df5",
                }}
              >
                <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p>
                  Vendor Code <strong>auto-generate</strong> hoga save karne
                  par (VND-000001)
                </p>
              </div>
            </div>

            <NeoInput
              id="reference_no"
              label="Reference No. (Optional)"
              placeholder="Department/Agency ka code"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
            />

            <NeoInput
              id="vendor_name"
              label="Vendor Name *"
              placeholder="e.g., ABC Suppliers Pvt Ltd"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Vendor Type *
              </label>
              <select
                value={vendorType}
                onChange={(e) => setVendorType(e.target.value as VendorType)}
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                {Object.entries(VENDOR_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <NeoInput
              id="description"
              label="Description"
              placeholder="Short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </NeoCard>

        {/* ============================================
            SECTION 2: CONTACT
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-green-600">
              <User className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Contact</h2>
              <p className="text-xs text-slate-500">
                Vendor se contact kaise karein
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="contact_person"
              label="Contact Person *"
              placeholder="e.g., Rajesh Kumar"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              required
            />

            <NeoInput
              id="phone"
              label="Phone *"
              placeholder="e.g., 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <NeoInput
              id="email"
              label="Email"
              type="email"
              placeholder="e.g., info@vendor.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <NeoInput
              id="alternate_phone"
              label="Alternate Phone"
              placeholder="e.g., 9876543211"
              value={alternatePhone}
              onChange={(e) => setAlternatePhone(e.target.value)}
            />
          </div>
        </NeoCard>

        {/* ============================================
            SECTION 3: ADDRESS
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-purple-600">
              <MapPin className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Address</h2>
              <p className="text-xs text-slate-500">
                Vendor ka pura address
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <NeoInput
                id="address_line1"
                label="Address Line 1 *"
                placeholder="e.g., 123 Main Street"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
              />
            </div>

            <div className="md:col-span-2">
              <NeoInput
                id="address_line2"
                label="Address Line 2"
                placeholder="Landmark, Area"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </div>

            <NeoInput
              id="city"
              label="City *"
              placeholder="e.g., Varanasi"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />

            <NeoInput
              id="state"
              label="State *"
              placeholder="e.g., Uttar Pradesh"
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />

            <NeoInput
              id="pincode"
              label="Pincode *"
              placeholder="e.g., 221005"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              required
            />

            <NeoInput
              id="country"
              label="Country"
              placeholder="India"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            />
          </div>
        </NeoCard>

        {/* ============================================
            SECTION 4: TAX INFO
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-orange-600">
              <Percent className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Tax Information
              </h2>
              <p className="text-xs text-slate-500">
                GST, PAN, TAN (optional)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <NeoInput
              id="gst_number"
              label="GST Number"
              placeholder="15 characters"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
            />

            <NeoInput
              id="pan_number"
              label="PAN Number"
              placeholder="10 characters"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            />

            <NeoInput
              id="tan_number"
              label="TAN Number"
              placeholder="10 characters"
              value={tanNumber}
              onChange={(e) => setTanNumber(e.target.value.toUpperCase())}
            />
          </div>
        </NeoCard>

        {/* ============================================
            SECTION 5: BANK DETAILS
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-6">
            <NeoIconBox size="md" color="text-cyan-600">
              <Landmark className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Bank Details
              </h2>
              <p className="text-xs text-slate-500">
                Payment ke liye (optional)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <NeoInput
              id="bank_name"
              label="Bank Name"
              placeholder="e.g., State Bank of India"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />

            <NeoInput
              id="account_number"
              label="Account Number"
              placeholder="e.g., 1234567890"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />

            <NeoInput
              id="ifsc_code"
              label="IFSC Code"
              placeholder="e.g., SBIN0001234"
              value={ifscCode}
              onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
            />

            <NeoInput
              id="bank_branch"
              label="Bank Branch"
              placeholder="e.g., Varanasi Main"
              value={bankBranch}
              onChange={(e) => setBankBranch(e.target.value)}
            />

            <div className="space-y-1.5">
              <label className="text-slate-700 font-medium text-xs pl-2">
                Account Type
              </label>
              <select
                value={accountType}
                onChange={(e) =>
                  setAccountType(e.target.value as AccountType | "")
                }
                className="w-full h-11 px-4 rounded-xl bg-[#e0e5ec] text-sm text-slate-700 border-0 outline-none"
                style={{
                  boxShadow:
                    "inset 3px 3px 6px #b8bcc2, inset -3px -3px 6px #ffffff",
                }}
              >
                <option value="">Select Account Type</option>
                {Object.entries(ACCOUNT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </NeoCard>

        {/* ============================================
            SECTION 6: STATUS
            ============================================ */}
        <NeoCard>
          <div className="flex items-center gap-3 mb-5">
            <NeoIconBox size="md" color="text-purple-600">
              <FileText className="h-5 w-5" />
            </NeoIconBox>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Status</h2>
              <p className="text-xs text-slate-500">
                Vendor active hai ya nahi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <label
              htmlFor="is_active"
              className="text-sm font-medium text-slate-700 cursor-pointer"
            >
              Vendor is Active
            </label>
          </div>
        </NeoCard>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-4">
          <Link href="/vendors">
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
            {loading ? "Saving..." : "Save Vendor"}
          </NeoButton>
        </div>
      </div>
    </AppLayout>
  );
}