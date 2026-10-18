"use client";

import Link from "next/link";
import AppLayout from "@/components/layout/AppLayout";
import { NeoCard, NeoIconBox, NeoButton } from "@/components/neumorphism";
import { BarChart3, Receipt, Users, FolderKanban, ArrowRight } from "lucide-react";

const reports = [
  {
    title: "Fund Utilization",
    description: "Project-wise & FY-wise funds received, allocated, and spent.",
    icon: BarChart3,
    color: "text-blue-600",
    href: "/reports/fund-utilization",
  },
  {
    title: "Bill & Payments",
    description: "List of all bills with status (Draft, Approved, Paid) and vendors.",
    icon: Receipt,
    color: "text-green-600",
    href: "/reports/bills",
  },
  {
    title: "Vendor Payments",
    description: "Vendor-wise summary of total payments and pending bills.",
    icon: Users,
    color: "text-orange-600",
    href: "/reports/vendors",
  },
  {
    title: "Project Summary",
    description: "Detailed budget vs actual expenditure for each project.",
    icon: FolderKanban,
    color: "text-purple-600",
    href: "/reports/projects",
  },
];

export default function ReportsDashboardPage() {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <NeoIconBox size="lg" color="text-indigo-600">
            <BarChart3 className="h-6 w-6" />
          </NeoIconBox>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
            <p className="text-sm text-slate-500">Generate and print official financial reports</p>
          </div>
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, index) => (
            <NeoCard key={index} padding="lg" className="group hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <NeoIconBox size="lg" color={report.color}>
                  <report.icon className="h-6 w-6" />
                </NeoIconBox>
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">
                    {report.title}
                  </h3>
                  <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                    {report.description}
                  </p>
                  
                  <Link href={report.href}>
                    <NeoButton variant="secondary" size="sm" icon={<ArrowRight className="h-4 w-4" />}>
                      View Report
                    </NeoButton>
                  </Link>
                </div>
              </div>
            </NeoCard>
          ))}
        </div>

      </div>
    </AppLayout>
  );
}