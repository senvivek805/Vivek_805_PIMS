"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoInput } from "@/components/neumorphism";
import { ArrowLeft, Lock, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { changePassword } from "@/lib/api/profile";

export default function ChangePasswordPage() {
  const router = useRouter();
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await changePassword(formData);
      setSuccess(res.message || "Password changed successfully! 🎉");
      setFormData({ old_password: "", new_password: "", confirm_password: "" });
      
      setTimeout(() => {
        router.push("/settings");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/settings">
            <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
              Back
            </NeoButton>
          </Link>
          <div className="flex items-center gap-3">
            <NeoIconBox size="lg" color="text-amber-600">
              <Lock className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Change Password</h1>
              <p className="text-sm text-slate-500">Update your account password</p>
            </div>
          </div>
        </div>

        {error && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </NeoCard>
        )}

        {success && (
          <NeoCard padding="sm">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{success}</p>
            </div>
          </NeoCard>
        )}

        {/* Form */}
        <NeoCard padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <NeoInput
              label="Current Password *"
              type="password"
              placeholder="Enter current password"
              value={formData.old_password}
              onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
              required
            />

            <NeoInput
              label="New Password *"
              type="password"
              placeholder="Enter new password (min 6 chars)"
              value={formData.new_password}
              onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
              required
            />

            <NeoInput
              label="Confirm New Password *"
              type="password"
              placeholder="Re-enter new password"
              value={formData.confirm_password}
              onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
              required
            />

            <div className="flex justify-end pt-4 border-t border-slate-200">
              <NeoButton type="submit" variant="primary" icon={<Save className="h-4 w-4" />} disabled={saving}>
                {saving ? "Updating..." : "Update Password"}
              </NeoButton>
            </div>

          </form>
        </NeoCard>
      </div>
    </AppLayout>
  );
}