"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  History,
  PlusCircle,
  Edit,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { getAuditLogs, type AuditLog } from "@/lib/api/auditLogs";

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  async function loadData() {
    setLoading(true);
    try {
      const res = await getAuditLogs(page);
      setLogs(res.results || []);
      setTotalCount(res.count || 0);
    } catch (err: any) {
      setError(err.message || "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [page]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  function getActionBadge(action: string) {
    if (action === "CREATE") {
      return (
        <NeoBadge variant="success" size="sm">
          <PlusCircle className="h-3 w-3 mr-1 inline" /> Created
        </NeoBadge>
      );
    }
    if (action === "UPDATE") {
      return (
        <NeoBadge variant="warning" size="sm">
          <Edit className="h-3 w-3 mr-1 inline" /> Updated
        </NeoBadge>
      );
    }
    return (
      <NeoBadge variant="danger" size="sm">
        <Trash2 className="h-3 w-3 mr-1 inline" /> Deleted
      </NeoBadge>
    );
  }

  const totalPages = Math.ceil(totalCount / 20); // Assuming 20 per page

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </NeoButton>
            </Link>
            <div className="flex items-center gap-3">
              <NeoIconBox size="lg" color="text-indigo-600">
                <History className="h-6 w-6" />
              </NeoIconBox>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Activity Logs</h1>
                <p className="text-sm text-slate-500">Track all changes made in the system</p>
              </div>
            </div>
          </div>
          <NeoButton
            variant="secondary"
            onClick={loadData}
            icon={<RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />}
          >
            Refresh
          </NeoButton>
        </div>

        {/* Content */}
        {loading && logs.length === 0 ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <NeoCard>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        ) : logs.length === 0 ? (
          <NeoCard>
            <div className="text-center py-16">
              <History className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-700">No activity found</h3>
              <p className="text-sm text-slate-500">Changes will appear here once you start making updates.</p>
            </div>
          </NeoCard>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <NeoCard key={log.id} className="p-4 sm:p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Left Side: Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getActionBadge(log.action)}
                    </div>
                    <div>
                      <p className="text-sm text-slate-800 font-bold">
                        {log.object_repr}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {log.model_name} • ID: {log.object_id}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <span className="font-semibold text-indigo-600">
                          {log.user_name || "System"}
                        </span>
                        <span>•</span>
                        <span>{formatDate(log.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Changes */}
                  {log.action === "UPDATE" && log.changes && Object.keys(log.changes).length > 0 && (
                    <div
                      className="w-full md:w-1/2 p-3 rounded-xl text-xs"
                      style={{
                        background: "#e0e5ec",
                        boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff",
                      }}
                    >
                      <p className="font-bold text-slate-600 mb-2 uppercase text-[10px]">Changes:</p>
                      <ul className="space-y-1">
                        {Object.entries(log.changes).map(([field, values]) => (
                          <li key={field} className="flex flex-wrap items-center gap-1">
                            <span className="font-semibold text-slate-700 capitalize">{field.replace(/_/g, " ")}:</span>
                            <span className="line-through text-red-500">{values.old || "Empty"}</span>
                            <span>→</span>
                            <span className="text-green-600 font-bold">{values.new || "Empty"}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </NeoCard>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4">
                <NeoButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </NeoButton>
                <span className="text-sm font-medium text-slate-500">
                  Page {page} of {totalPages}
                </span>
                <NeoButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </NeoButton>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}