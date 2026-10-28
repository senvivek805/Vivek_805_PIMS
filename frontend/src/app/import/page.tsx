"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox } from "@/components/neumorphism";
import { importExcelData } from "@/lib/api/import";
import {
  ArrowLeft,
  UploadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileUp,
} from "lucide-react";

export default function ImportPage() {
  const [importType, setImportType] = useState("projects");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (
        selected.name.endsWith(".xlsx") ||
        selected.name.endsWith(".xls") ||
        selected.name.endsWith(".csv")
      ) {
        setFile(selected);
        setErrorMsg("");
      } else {
        setErrorMsg("Please select a valid Excel or CSV file.");
        setFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) {
      if (
        dropped.name.endsWith(".xlsx") ||
        dropped.name.endsWith(".xls") ||
        dropped.name.endsWith(".csv")
      ) {
        setFile(dropped);
        setErrorMsg("");
      } else {
        setErrorMsg("Please drop a valid Excel or CSV file.");
      }
    }
  };

  const handleDownloadTemplate = () => {
    const templates: Record<string, string> = {
      vendors: "vendor_name,vendor_type,phone,city,state,address_line1,contact_person,email,gst_number,pan_number,tan_number,bank_name,account_number,ifsc_code,bank_branch,account_type\nSample Vendor,supplier,9876543210,Varanasi,UP,123 Main Road,Ramesh,sample@test.com,09AAAAA1111A1Z1,AAAAA1111A,TAN123,SBI,1234567890,SBIN0001234,Lanka Branch,savings",
      
      projects: "project_code,project_name,agency_code,department_code,pi_name,co_pi_name,start_date,end_date,sanctioned_amount,status,description\nTEST-PRJ-001,Sample Project,NMCG,CIVIL,Dr. Test Kumar,Dr. Co-PI,2024-01-01,2026-12-31,5000000,active,Sample description",
      
      materials: "material_code,material_name,category_name,unit,hsn_code,gst_rate,description\nMAT-001,Sample Item,Electronics,Piece,8471,18,Sample item description",
      
      employees: "employee_code,reference_no,full_name,designation,department,employee_type,phone,email,address,joining_date,leaving_date,assigned_project_code,project_role,manpower_type,bank_name,account_number,ifsc_code,bank_branch,account_type\nEMP-001,REF-001,Ramesh Kumar,Assistant Professor,Civil,staff,9876543210,ramesh@test.com,Varanasi,2024-01-01,,TEST-PRJ-001,Research Associate,full_time,SBI,1234567890,SBIN0001234,Lanka Branch,savings",
      
    };

    const csvContent = templates[importType];
    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${importType}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleUpload = async () => {
    if (!file) {
      setErrorMsg("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", importType);

      const res = await importExcelData(formData);
      
      setSuccessMsg(res.message || "Data imported successfully!");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </NeoButton>
          </Link>
          <div className="flex items-center gap-3">
            <NeoIconBox size="lg" color="text-blue-600">
              <FileSpreadsheet className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Bulk Data Import</h1>
              <p className="text-sm text-slate-500">Import master data using Excel or CSV</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: Instructions & Template */}
          <div className="md:col-span-1 space-y-6">
            <NeoCard>
              <h2 className="text-lg font-bold text-slate-800 mb-4">1. Select Data Type</h2>
              <div className="space-y-2">
                {[
                  { id: "projects", label: "Projects" },
                  { id: "vendors", label: "Vendors" },
                  { id: "materials", label: "Materials" },
                  { id: "employees", label: "Employees" },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setImportType(type.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      importType === type.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-[#e0e5ec] text-slate-700 hover:bg-slate-200"
                    }`}
                    style={
                      importType !== type.id
                        ? { boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }
                        : {}
                    }
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </NeoCard>

            <NeoCard>
              <h2 className="text-lg font-bold text-slate-800 mb-2">2. Download Template</h2>
              <p className="text-xs text-slate-500 mb-4">
                Download the sample Excel file for the selected data type, fill in your data, and upload it.
              </p>
              <NeoButton
                variant="secondary"
                className="w-full"
                icon={<Download className="h-4 w-4" />}
                onClick={handleDownloadTemplate}
              >
                Download Template
              </NeoButton>
            </NeoCard>
          </div>

          {/* Right Column: Upload Area */}
          <div className="md:col-span-2">
            <NeoCard className="h-full flex flex-col justify-center">
              <h2 className="text-lg font-bold text-slate-800 mb-6">3. Upload Your File</h2>
              
              {/* Error Message */}
              {errorMsg && (
                <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="font-medium">{errorMsg}</p>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="mb-4 p-4 rounded-xl bg-green-50 border border-green-100 text-green-700 text-sm flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <p className="font-medium">{successMsg}</p>
                </div>
              )}

              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-slate-50 hover:border-blue-400 group"
                style={{ background: "#e0e5ec" }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx, .xls, .csv"
                  className="hidden"
                />
                <div className="h-20 w-20 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-10 w-10 text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">
                  {file ? file.name : "Click or Drag & Drop to Upload"}
                </h3>
                <p className="text-sm text-slate-500">
                  {file
                    ? `${(file.size / 1024).toFixed(2)} KB - Ready to import`
                    : "Supports .xlsx, .xls, and .csv files"}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                {file && (
                  <NeoButton
                    variant="secondary"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    disabled={isUploading}
                  >
                    Clear
                  </NeoButton>
                )}
                <NeoButton
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!file || isUploading}
                  icon={isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />}
                >
                  {isUploading ? "Importing..." : "Start Import"}
                </NeoButton>
              </div>
            </NeoCard>
          </div>
        </div>

      </div>
    </AppLayout>
  );
}