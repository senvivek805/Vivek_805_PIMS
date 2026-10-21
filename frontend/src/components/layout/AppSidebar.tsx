"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  IndianRupee,
  Target,
  Building2,
  Users,
  Package,
  ShoppingCart,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  X,
  Loader2,
  ChevronDown,
  ChevronRight,
  PackageCheck,
  PackageMinus,
  FileCheck,
  FolderOpen,
  FileSpreadsheet,
  Undo2,
  UserCog, // 👇 Naya icon add kiya
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions"; // 👇 Hook import kiya

interface AppSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ============================================
// MENU STRUCTURE
// ============================================

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  children?: { href: string; label: string; icon: any }[];
}

const menuItems: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  {
    href: "/funds",
    label: "Fund Receipts",
    icon: IndianRupee,
    children: [
      { href: "/funds", label: "All Receipts", icon: IndianRupee },
    ],
  },
  { href: "/budget/overview", label: "Budget Overview", icon: Target },
  { href: "/vendors", label: "Vendors", icon: Building2 },
  { href: "/employees", label: "Employees", icon: Users },
  {
    href: "/materials",
    label: "Materials",
    icon: Package,
    children: [
      { href: "/materials", label: "All Materials", icon: Package },
      { href: "/materials/receipts", label: "Material Receipts", icon: PackageCheck },
      { href: "/materials/issues", label: "Material Issues", icon: PackageMinus },
      { href: "/materials/returns", label: "Material Returns", icon: Undo2 },
    ],
  },
  { href: "/purchase", label: "Purchase", icon: ShoppingCart },
  { href: "/bills", label: "Bills", icon: FileText },
  { href: "/services", label: "Service Completions", icon: FileCheck },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/uc", label: "Utilization Cert. (UC)", icon: FileSpreadsheet },
  { href: "/users", label: "User Management", icon: UserCog }, // 👇 Naya Link
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar({ isOpen = true, onClose }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // 👇 Permissions Hook (To hide User Management from non-admins)
  const { isAdmin } = usePermissions();

  // 👇 Filter menu based on role
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.href === "/users" && !isAdmin) return false;
    return true;
  });

  // Auto-expand the parent if child route is active
  useEffect(() => {
    filteredMenuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => pathname === child.href || pathname?.startsWith(child.href + "/")
        );
        if (hasActiveChild) {
          setExpandedItems((prev) => ({ ...prev, [item.href]: true }));
        }
      }
    });
  }, [pathname, isAdmin]);

  // ============================================
  // TOGGLE EXPAND
  // ============================================

  function toggleExpand(href: string) {
    setExpandedItems((prev) => ({
      ...prev,
      [href]: !prev[href],
    }));
  }

  // ============================================
  // LOGOUT
  // ============================================

  function openLogoutConfirm() {
    setShowLogoutConfirm(true);
  }

  function closeLogoutConfirm() {
    if (loggingOut) return;
    setShowLogoutConfirm(false);
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await fetch(`${API_BASE_URL}/auth/logout/?format=json`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch (err) {
      // Ignore errors — still redirect
    } finally {
      router.push("/login");
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 h-screen flex flex-col bg-[#e0e5ec] transition-transform duration-300 overflow-hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          boxShadow: "8px 0 20px #b8bcc2, -8px 0 20px #ffffff",
        }}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-200/50">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div
                className="h-11 w-11 rounded-xl flex items-center justify-center"
                style={{
                  background: "#e0e5ec",
                  boxShadow: "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff",
                }}
              >
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">PIMS</h1>
                <p className="text-[10px] text-slate-500">
                  Project Information System
                </p>
              </div>
            </Link>

            <button
              onClick={onClose}
              className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-slate-600"
              style={{
                background: "#e0e5ec",
                boxShadow: "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff",
              }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <ul className="space-y-1">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedItems[item.href];
              const isActive = pathname === item.href;
              const hasActiveChild =
                hasChildren &&
                item.children!.some(
                  (child) =>
                    pathname === child.href ||
                    pathname?.startsWith(child.href + "/")
                );

              return (
                <li key={item.href}>
                  {hasChildren ? (
                    <>
                      {/* Parent with children — clickable to expand */}
                      <button
                        onClick={() => toggleExpand(item.href)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                        style={
                          hasActiveChild
                            ? {
                                background:
                                  "linear-gradient(135deg, #4f6df5 0%, #6366f1 100%)",
                                color: "#ffffff",
                                boxShadow:
                                  "6px 6px 14px #b8bcc2, -6px -6px 14px #ffffff, inset 0 1px 0 rgba(255,255,255,0.2)",
                              }
                            : {
                                color: "#475569",
                                background: "transparent",
                              }
                        }
                        onMouseEnter={(e) => {
                          if (!hasActiveChild) {
                            e.currentTarget.style.background = "#e0e5ec";
                            e.currentTarget.style.boxShadow =
                              "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff";
                            e.currentTarget.style.color = "#1e293b";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!hasActiveChild) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.boxShadow = "none";
                            e.currentTarget.style.color = "#475569";
                          }
                        }}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        <span className="flex-1 text-left">{item.label}</span>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                      </button>

                      {/* Children */}
                      {isExpanded && (
                        <ul className="mt-1 ml-4 space-y-1 border-l-2 border-slate-300/40 pl-3">
                          {item.children!.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = pathname === child.href;

                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  onClick={onClose}
                                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                                  style={
                                    isChildActive
                                      ? {
                                          background:
                                            "linear-gradient(135deg, #4f6df5 0%, #6366f1 100%)",
                                          color: "#ffffff",
                                          fontWeight: 600,
                                          boxShadow:
                                            "4px 4px 10px #b8bcc2, -4px -4px 10px #ffffff",
                                        }
                                      : {
                                          color: "#64748b",
                                          background: "transparent",
                                        }
                                  }
                                  onMouseEnter={(e) => {
                                    if (!isChildActive) {
                                      e.currentTarget.style.background =
                                        "#e0e5ec";
                                      e.currentTarget.style.boxShadow =
                                        "3px 3px 6px #b8bcc2, -3px -3px 6px #ffffff";
                                      e.currentTarget.style.color = "#1e293b";
                                    }
                                  }}
                                  onMouseLeave={(e) => {
                                    if (!isChildActive) {
                                      e.currentTarget.style.background =
                                        "transparent";
                                      e.currentTarget.style.boxShadow = "none";
                                      e.currentTarget.style.color = "#64748b";
                                    }
                                  }}
                                >
                                  <ChildIcon className="h-4 w-4 flex-shrink-0" />
                                  <span>{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </>
                  ) : (
                    // Simple item without children
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                      style={
                        isActive
                          ? {
                              background:
                                "linear-gradient(135deg, #4f6df5 0%, #6366f1 100%)",
                              color: "#ffffff",
                              boxShadow:
                                "6px 6px 14px #b8bcc2, -6px -6px 14px #ffffff, inset 0 1px 0 rgba(255,255,255,0.2)",
                            }
                          : {
                              color: "#475569",
                              background: "transparent",
                            }
                      }
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#e0e5ec";
                          e.currentTarget.style.boxShadow =
                            "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff";
                          e.currentTarget.style.color = "#1e293b";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.color = "#475569";
                        }
                      }}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200/50">
          <button
            onClick={openLogoutConfirm}
            disabled={loggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            onMouseEnter={(e) => {
              if (!loggingOut) {
                e.currentTarget.style.background = "#e0e5ec";
                e.currentTarget.style.boxShadow =
                  "4px 4px 8px #b8bcc2, -4px -4px 8px #ffffff";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {loggingOut ? (
              <>
                <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin" />
                <span>Logging out...</span>
              </>
            ) : (
              <>
                <LogOut className="h-5 w-5 flex-shrink-0" />
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* ============================================
          LOGOUT CONFIRMATION MODAL
          ============================================ */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={closeLogoutConfirm}
        >
          <div
            className="w-full max-w-sm p-6 rounded-3xl"
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
                <LogOut className="h-7 w-7 text-red-600" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
              Logout?
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              Are you sure you want to logout from PIMS?
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeLogoutConfirm}
                disabled={loggingOut}
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
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex-1 h-11 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                  boxShadow:
                    "4px 4px 12px #b8bcc2, -4px -4px 12px #ffffff, inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  {loggingOut ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Logout
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AppSidebar;