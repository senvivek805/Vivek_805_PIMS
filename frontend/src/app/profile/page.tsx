"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox, NeoBadge } from "@/components/neumorphism";
// 👇 Pencil icon add kiya hai
import { ArrowLeft, User, Mail, Phone, Shield, Building2, Briefcase, Loader2, Pencil } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <AppLayout>
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!user) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-slate-500">Please login to view profile.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        {/* 👇 Header me justify-between kiya aur Edit button add kiya */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <NeoButton variant="secondary" size="md" icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </NeoButton>
            </Link>
            <div className="flex items-center gap-3">
              <NeoIconBox size="lg" color="text-blue-600">
                <User className="h-6 w-6" />
              </NeoIconBox>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
                <p className="text-sm text-slate-500">View your account details</p>
              </div>
            </div>
          </div>

          <Link href="/profile/edit">
            <NeoButton variant="primary" size="md" icon={<Pencil className="h-4 w-4" />}>
              Edit Profile
            </NeoButton>
          </Link>
        </div>

        {/* Profile Card */}
        <NeoCard>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            
            {/* Avatar & Basic Info */}
            <div className="flex flex-col items-center gap-4 text-center md:text-left md:w-1/3">
              <div 
                className="h-32 w-32 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-lg"
                style={{ background: "linear-gradient(135deg, #4f6df5 0%, #6366f1 100%)" }}
              >
                {user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">{user.full_name || user.username}</h2>
                <p className="text-slate-500 text-sm">@{user.username}</p>
                <div className="mt-2">
                  <NeoBadge variant={user.is_superuser ? "danger" : "primary"} size="md">
                    {user.is_superuser ? "Super Admin" : (user.role_name || "User")}
                  </NeoBadge>
                </div>
              </div>
            </div>

            {/* Detailed Info */}
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-4 w-4 text-blue-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Email</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800 break-all">{user.email || "Not provided"}</p>
                </div>

                <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="h-4 w-4 text-green-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Phone</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.phone || "Not provided"}</p>
                </div>

                <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-orange-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Department</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.department || "Not provided"}</p>
                </div>

                <div className="p-4 rounded-2xl" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase className="h-4 w-4 text-purple-600" />
                    <p className="text-xs font-bold text-slate-500 uppercase">Designation</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">{user.designation || "Not provided"}</p>
                </div>

              </div>

              {/* Status Info */}
              <div className="p-4 rounded-2xl flex items-center justify-between" style={{ background: "#e0e5ec", boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <p className="text-sm font-bold text-slate-700">Account Status</p>
                </div>
                <NeoBadge variant={user.is_active ? "success" : "danger"}>
                  {user.is_active ? "Active" : "Inactive"}
                </NeoBadge>
              </div>
            </div>
          </div>
        </NeoCard>
      </div>
    </AppLayout>
  );
}