"use client";

import { useState, ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import AppSidebar from "./AppSidebar";
import AppHeader from "./AppHeader";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, FolderKanban } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

// Public routes — inhe auth check nahi chahiye
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

export function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { loading, authenticated } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

  // ============================================
  // REDIRECT LOGIC
  // ============================================

  useEffect(() => {
    if (loading) return;

    // If on public route and authenticated → go to dashboard
    if (isPublicRoute && authenticated) {
      router.push("/dashboard");
      return;
    }

    // If not public route and not authenticated → go to login
    if (!isPublicRoute && !authenticated) {
      router.push("/login");
      return;
    }
  }, [loading, authenticated, isPublicRoute, router]);

  // ============================================
  // PUBLIC ROUTES — render children directly
  // ============================================

  if (isPublicRoute) {
    return <>{children}</>;
  }

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#e0e5ec]">
        <div
          className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
          style={{
            background: "#e0e5ec",
            boxShadow: "6px 6px 12px #b8bcc2, -6px -6px 12px #ffffff",
          }}
        >
          <FolderKanban className="h-10 w-10 text-blue-600" />
        </div>
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">Loading PIMS...</p>
      </div>
    );
  }

  // ============================================
  // NOT AUTHENTICATED
  // ============================================

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#e0e5ec]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
        <p className="text-sm text-slate-500 font-medium">
          Redirecting to login...
        </p>
      </div>
    );
  }

  // ============================================
  // AUTHENTICATED — Main Layout
  // ============================================

  return (
    <div className="min-h-screen bg-[#e0e5ec] flex">
      <AppSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;