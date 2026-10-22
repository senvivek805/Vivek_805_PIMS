"use client";

import { useEffect, useState, useRef } from "react";
import { NeoCard, NeoButton, NeoBadge } from "@/components/neumorphism";
import { Paperclip, Upload, Trash2, FileText, Loader2, ExternalLink } from "lucide-react";
import { getDocuments, createDocument, deleteDocument, type Document } from "@/lib/api/documents";
import { usePermissions } from "@/hooks/usePermissions";

export default function BillAttachments({ billId, projectId }: { billId: number; projectId?: number }) {
  const { canCreate, canDelete } = usePermissions();
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadDocuments() {
    try {
      setLoading(true);
      const res = await getDocuments({ bill: billId });
      setDocuments(res.results || []);
    } catch (err: any) {
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (billId) loadDocuments();
  }, [billId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!projectId) {
      setError("Project ID is missing. Cannot upload file.");
      return;
    }

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", file.name);
      formData.append("doc_type", "invoice"); // Default to invoice for bills
      formData.append("project", String(projectId));
      formData.append("bill", String(billId));
      formData.append("file", file);

      await createDocument(formData);
      await loadDocuments(); // Refresh list
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this attachment?")) return;
    
    try {
      await deleteDocument(id);
      setDocuments(documents.filter(d => d.id !== id));
    } catch (err) {
      alert("Failed to delete document.");
    }
  };

  return (
    <NeoCard padding="md" className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <Paperclip className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Attachments</h3>
            <p className="text-xs text-slate-500">Invoices, bills, and other documents</p>
          </div>
        </div>

        {canCreate && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
            />
            <NeoButton
              variant="primary"
              size="sm"
              icon={isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? "Uploading..." : "Upload File"}
            </NeoButton>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-4 border border-red-100">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500">No attachments found for this bill.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {documents.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-8 w-8 text-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 truncate" title={doc.title}>{doc.title}</p>
                  <p className="text-[10px] text-slate-500 uppercase">{doc.doc_type}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {doc.file && typeof doc.file === 'string' && (
                  <a 
                    href={doc.file.startsWith('http') ? doc.file : `http://localhost:8000${doc.file}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View / Download"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {canDelete && (
                  <button 
                    onClick={() => handleDelete(doc.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </NeoCard>
  );
}