"use client";

import GlobalSearch from "./GlobalSearch";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  LogOut,
  Settings,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import {
  getPendingPurchaseOrders,
  type PendingPOsResponse,
} from "@/lib/api/purchase";
import {
  getLowStockMaterials,
  type LowStockResponse,
} from "@/lib/api/materials";

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingData, setPendingData] = useState<PendingPOsResponse | null>(
    null
  );
  const [lowStockData, setLowStockData] = useState<LowStockResponse | null>(
    null
  );

  // ============================================
  // AUTO FETCH — 60 sec refresh
  // ============================================
  useEffect(() => {
    async function fetchAll() {
      try {
        const [pending, lowStock] = await Promise.all([
          getPendingPurchaseOrders(),
          getLowStockMaterials(),
        ]);
        setPendingData(pending);
        setLowStockData(lowStock);
      } catch {
        // silently ignore
      }
    }
    fetchAll();
    const interval = setInterval(fetchAll, 60000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = pendingData?.count || 0;
  const lowStockCount = lowStockData?.count || 0;
  const totalAlerts = pendingCount + lowStockCount;

  return (
    <header
      className="sticky top-0 z-30 bg-[#e0e5ec] h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between"
      style={{
        boxShadow: "0 8px 20px #b8bcc2, 0 -8px 20px #ffffff",
      }}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden h-10 w-10 rounded-xl flex items-center justify-center text-slate-700 transition-all"
          style={{
            background: "#e0e5ec",
            boxShadow: "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
          }}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page Title */}
        <div className="hidden sm:block">
          <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-xs text-slate-500">Welcome back to PIMS</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        
        {/* Global Search Component */}
        <div className="hidden md:flex relative">
          <GlobalSearch />
        </div>

        {/* ============================================ */}
        {/* NOTIFICATIONS */}
        {/* ============================================ */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative h-11 w-11 rounded-xl flex items-center justify-center text-slate-700 transition-all hover:scale-105"
            style={{
              background: "#e0e5ec",
              boxShadow: "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
            }}
          >
            <Bell className="h-5 w-5" />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalAlerts > 9 ? "9+" : totalAlerts}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {notifOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setNotifOpen(false)}
              />

              {/* Dropdown */}
              <div
                className="absolute right-0 top-14 w-80 sm:w-96 p-2 rounded-2xl bg-[#e0e5ec] z-50"
                style={{
                  boxShadow: "8px 8px 20px #b8bcc2, -8px -8px 20px #ffffff",
                }}
              >
                {/* Header */}
                <div className="px-3 py-3 border-b border-slate-200/50">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800">
                      Notifications
                    </p>
                    <div className="flex items-center gap-1">
                      {pendingCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                          {pendingCount} PO
                        </span>
                      )}
                      {lowStockCount > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                          {lowStockCount} stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="max-h-96 overflow-y-auto py-2">
                  {totalAlerts === 0 ? (
                    <div className="px-3 py-8 text-center">
                      <p className="text-sm text-slate-500">🎉 No alerts</p>
                    </div>
                  ) : (
                    <>
                      {/* Low Stock Section */}
                      {lowStockCount > 0 && (
                        <div className="mb-2">
                          <p className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase">
                            ⚠️ Low Stock ({lowStockCount})
                          </p>
                          <div className="space-y-1">
                            {lowStockData?.low_stock.slice(0, 3).map((item) => (
                              <Link
                                key={`low-${item.id}`}
                                href={`/materials/${item.id}`}
                                onClick={() => setNotifOpen(false)}
                                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[#d1d9e6] transition-all"
                              >
                                <div
                                  className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-orange-600 mt-0.5"
                                  style={{
                                    background: "rgba(245, 158, 11, 0.12)",
                                  }}
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    {item.material_name}
                                  </p>
                                  <p className="text-[10px] text-slate-500">
                                    {item.material_code}
                                  </p>
                                  <p className="text-[10px] text-orange-600 font-semibold mt-0.5">
                                    Stock: {item.current_stock}
                                  </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-2" />
                              </Link>
                            ))}
                            {lowStockData?.out_of_stock
                              .slice(0, 2)
                              .map((item) => (
                                <Link
                                  key={`out-${item.id}`}
                                  href={`/materials/${item.id}`}
                                  onClick={() => setNotifOpen(false)}
                                  className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[#d1d9e6] transition-all"
                                >
                                  <div
                                    className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-red-600 mt-0.5"
                                    style={{
                                      background: "rgba(239, 68, 68, 0.12)",
                                    }}
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                      {item.material_name}
                                    </p>
                                    <p className="text-[10px] text-slate-500">
                                      {item.material_code}
                                    </p>
                                    <p className="text-[10px] text-red-600 font-semibold mt-0.5">
                                      ❌ Out of Stock
                                    </p>
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-2" />
                                </Link>
                              ))}
                            {lowStockCount > 5 && (
                              <Link
                                href="/materials"
                                onClick={() => setNotifOpen(false)}
                                className="block text-center text-xs font-bold text-blue-600 hover:text-blue-700 py-2"
                              >
                                +{lowStockCount - 5} more
                              </Link>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Pending PO Section */}
                      {pendingCount > 0 && (
                        <div>
                          <p className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase">
                            📦 Pending POs ({pendingCount})
                          </p>
                          <div className="space-y-1">
                            {pendingData?.results.slice(0, 5).map((po) => (
                              <Link
                                key={po.id}
                                href={`/purchase/${po.id}`}
                                onClick={() => setNotifOpen(false)}
                                className="flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-[#d1d9e6] transition-all"
                              >
                                <div
                                  className="h-8 w-8 shrink-0 rounded-lg flex items-center justify-center text-orange-600 mt-0.5"
                                  style={{
                                    background: "rgba(245, 158, 11, 0.12)",
                                  }}
                                >
                                  <AlertTriangle className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    {po.po_number}
                                  </p>
                                  <p className="text-[11px] text-slate-600 truncate">
                                    {po.vendor_name}
                                  </p>
                                  <p className="text-[10px] text-orange-600 font-semibold mt-0.5">
                                    {po.pending_count} item
                                    {po.pending_count !== 1 ? "s" : ""} pending
                                  </p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-2" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ============================================ */}
        {/* USER MENU */}
        {/* ============================================ */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="h-11 pl-2 pr-3 rounded-xl flex items-center gap-2 text-slate-700 transition-all"
            style={{
              background: "#e0e5ec",
              boxShadow: "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
            }}
          >
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #4f6df5 0%, #6366f1 100%)",
              }}
            >
              VKS
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                userMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {userMenuOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setUserMenuOpen(false)}
              />

              {/* Menu */}
              <div
                className="absolute right-0 top-14 w-56 p-2 rounded-2xl bg-[#e0e5ec] z-50"
                style={{
                  boxShadow: "8px 8px 20px #b8bcc2, -8px -8px 20px #ffffff",
                }}
              >
                {/* User Info */}
                <div className="px-3 py-3 border-b border-slate-200/50">
                  <p className="text-sm font-bold text-slate-800">
                    Vivek Kumar Sen
                  </p>
                  <p className="text-xs text-slate-500">
                    vivek.pa.civ25@itbhu.ac.in
                  </p>
                </div>

                {/* Menu Items */}
                <div className="py-2 space-y-1">
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-[#d1d9e6] transition-all"
                  >
                    <User className="h-4 w-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-[#d1d9e6] transition-all"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-slate-200/50 pt-2">
                  <Link
                    href="/login"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default AppHeader;