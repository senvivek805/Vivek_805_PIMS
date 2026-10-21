"use client";

import { usePermissions } from "@/hooks/usePermissions";
import { useEffect, useState, useRef } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
import { FolderOpen, Upload, Trash2, FileText, Loader2, X, AlertCircle } from "lucide-react";
import { getDocuments, createDocument, deleteDocument, type Document } from "@/lib/api/documents";
import { getProjects, type Project } from "@/lib/api/projects";

export default function DocumentsPage() {
  // 👇 NEW: RBAC Hook
  const { canCreate, canDelete } = usePermissions();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: "",
    doc_type: "other",
    project: "",
    remarks: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  async function loadData() {
    try {
      const [docsRes, projRes] = await Promise.all([
        getDocuments(),
        getProjects()
      ]);
      setDocuments(docsRes.results || []);
      setProjects(projRes.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.project) {
      setUploadError("Please select a file and a project.");
      return;
    }

    setUploading(true);
    setUploadError("");

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("doc_type", formData.doc_type);
      data.append("project", formData.project);
      data.append("remarks", formData.remarks);
      data.append("file", selectedFile);

      await createDocument(data);
      
      // Reset & Reload
      setIsModalOpen(false);
      setFormData({ title: "", doc_type: "other", project: "", remarks: "" });
      setSelectedFile(null);
      loadData();
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDocument(id);
        setDocuments(documents.filter(d => d.id !== id));
      } catch (err) {
        alert("Failed to delete document.");
      }
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NeoIconBox size="lg" color="text-indigo-600">
              <FolderOpen className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Documents</h1>
              <p className="text-sm text-slate-500">Manage project files and certificates</p>
            </div>
          </div>
          
          {/* 👇 NEW: RBAC applied */}
          {canCreate && (
            <NeoButton variant="primary" icon={<Upload className="h-4 w-4" />} onClick={() => setIsModalOpen(true)}>
              Upload Document
            </NeoButton>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-indigo-600" /></div>
        ) : error ? (
          <NeoCard><p className="text-red-600">{error}</p></NeoCard>
        ) : documents.length === 0 ? (
          <NeoCard>
            <div className="text-center py-16">
              <FolderOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No documents found</h3>
              <p className="text-sm text-slate-500 mb-6">Upload files like UC, Invoices, Agreements etc.</p>
              
              {/* 👇 NEW: RBAC applied */}
              {canCreate && (
                <NeoButton variant="primary" onClick={() => setIsModalOpen(true)}>Upload First Document</NeoButton>
              )}
            </div>
          </NeoCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <NeoCard key={doc.id} className="relative group">
                <div className="flex items-start gap-3 mb-4">
                  <NeoIconBox color="text-blue-600"><FileText className="h-5 w-5" /></NeoIconBox>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-slate-800 truncate" title={doc.title}>{doc.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{doc.project_name || "No Project"}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <NeoBadge variant="primary">{doc.doc_type.toUpperCase()}</NeoBadge>
                  <div className="flex items-center gap-2">
                    {doc.file && typeof doc.file === 'string' && (
                        <a 
                        href={doc.file.startsWith('http') ? doc.file : `http://localhost:8000${doc.file}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-blue-600 hover:underline"
                        >
                        View File
                        </a>
                    )}
                    
                    {/* 👇 NEW: RBAC applied */}
                    {canDelete && (
                      <button onClick={() => handleDelete(doc.id!)} className="h-8 w-8 rounded-lg flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </NeoCard>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-[#e0e5ec] shadow-2xl relative">
            <button onClick={() => !uploading && setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-slate-800">
              <X className="h-5 w-5" />
            </button>
            
            <h2 className="text-xl font-bold text-slate-800 mb-6">Upload Document</h2>
            
            {uploadError && (
              <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {uploadError}
              </div>
            )}

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Document Title *</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full h-10 px-3 rounded-xl bg-[#e0e5ec] text-sm shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] outline-none" placeholder="e.g. UC Certificate 2024" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Project *</label>
                <select required value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="w-full h-10 px-3 rounded-xl bg-[#e0e5ec] text-sm shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] outline-none">
                  <option value="">Select a Project</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.project_code} - {p.project_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Document Type *</label>
                  <select required value={formData.doc_type} onChange={e => setFormData({...formData, doc_type: e.target.value})} className="w-full h-10 px-3 rounded-xl bg-[#e0e5ec] text-sm shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] outline-none">
                    <option value="uc">Utilization Certificate</option>
                    <option value="invoice">Invoice / Bill</option>
                    <option value="po">Purchase Order</option>
                    <option value="agreement">Agreement</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Choose File *</label>
                  <input required type="file" ref={fileInputRef} onChange={e => setSelectedFile(e.target.files?.[0] || null)} className="w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Remarks</label>
                <textarea rows={2} value={formData.remarks} onChange={e => setFormData({...formData, remarks: e.target.value})} className="w-full p-3 rounded-xl bg-[#e0e5ec] text-sm shadow-[inset_2px_2px_4px_#b8bcc2,inset_-2px_-2px_4px_#ffffff] outline-none resize-none" placeholder="Optional notes..." />
              </div>

              <button type="submit" disabled={uploading} className="w-full h-11 mt-2 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                {uploading ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4" /> Upload File</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}