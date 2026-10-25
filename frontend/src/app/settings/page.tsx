"use client";

import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoButton, NeoIconBox } from "@/components/neumorphism";
// 👇 Lock icon add kiya hai
import { ArrowLeft, Settings as SettingsIcon, Shield, Bell, Database, Monitor, ChevronRight, Lock } from "lucide-react";

export default function SettingsPage() {
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
            <NeoIconBox size="lg" color="text-indigo-600">
              <SettingsIcon className="h-6 w-6" />
            </NeoIconBox>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
              <p className="text-sm text-slate-500">Manage system preferences</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* System Info */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-6">
              <NeoIconBox size="md" color="text-blue-600">
                <Monitor className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">System Information</h2>
                <p className="text-xs text-slate-500">Details about the PIMS platform</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Version</span>
                <span className="text-sm font-bold text-slate-800">1.0.0 (Stable)</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Last Update</span>
                <span className="text-sm font-bold text-slate-800">Oct 2026</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-sm font-medium text-slate-600">Environment</span>
                <span className="text-sm font-bold text-green-600">Production Ready</span>
              </div>
            </div>
          </NeoCard>

          {/* Quick Links */}
          <NeoCard>
            <div className="flex items-center gap-3 mb-6">
              <NeoIconBox size="md" color="text-purple-600">
                <Shield className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Account & Security</h2>
                <p className="text-xs text-slate-500">Manage your account settings</p>
              </div>
            </div>

            <div className="space-y-2">
              <Link href="/profile/edit">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#e0e5ec] hover:bg-slate-200 transition-colors cursor-pointer" style={{ boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-bold text-slate-700">Update Profile</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
              
              {/* 👇 Yahan Change Password ka Link laga diya hai */}
              <Link href="/profile/change-password">
                <div className="flex items-center justify-between p-4 rounded-xl bg-[#e0e5ec] hover:bg-slate-200 transition-colors cursor-pointer" style={{ boxShadow: "inset 2px 2px 4px #b8bcc2, inset -2px -2px 4px #ffffff" }}>
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-bold text-slate-700">Change Password</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
              
            </div>
          </NeoCard>

          {/* Notification Settings (Dummy UI for now) */}
          <NeoCard className="md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <NeoIconBox size="md" color="text-orange-600">
                <Bell className="h-5 w-5" />
              </NeoIconBox>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Notification Preferences</h2>
                <p className="text-xs text-slate-500">Control what alerts you receive</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Low Stock Alerts</p>
                  <p className="text-xs text-slate-500">Notify me when material stock is low.</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                <input type="checkbox" defaultChecked className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Pending PO Alerts</p>
                  <p className="text-xs text-slate-500">Notify me for pending purchase orders.</p>
                </div>
              </label>
            </div>
          </NeoCard>

        </div>
      </div>
    </AppLayout>
  );
}