"use client";

import { useState } from "react";
import { NeoCard, NeoButton, NeoInput, NeoBadge, NeoIconBox } from "@/components/neumorphism";
import { FolderKanban, Mail, Lock, Shield, Zap, BarChart3, Plus, Search } from "lucide-react";

export default function NeoDemoPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-[#e0e5ec] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">
            Neumorphism Design System
          </h1>
          <p className="text-slate-500">
            PIMS ke saare reusable components — ek jagah
          </p>
        </div>

        <div className="space-y-8">

          {/* Cards */}
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">📦 Cards</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NeoCard variant="raised" hover>
                <h3 className="font-bold text-slate-800 mb-2">Raised Card</h3>
                <p className="text-sm text-slate-500">
                  Default neumorphism card. Hover pe lift hoga.
                </p>
              </NeoCard>

              <NeoCard variant="flat" hover>
                <h3 className="font-bold text-slate-800 mb-2">Flat Card</h3>
                <p className="text-sm text-slate-500">
                  Chhota shadow, subtle look.
                </p>
              </NeoCard>

              <NeoCard variant="inset">
                <h3 className="font-bold text-slate-800 mb-2">Inset Card</h3>
                <p className="text-sm text-slate-500">
                  Andar dhansa hua effect.
                </p>
              </NeoCard>
            </div>
          </section>

          {/* Buttons */}
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">🔘 Buttons</h2>
            <NeoCard>
              <div className="flex flex-wrap gap-4 items-center">
                <NeoButton variant="primary">Primary</NeoButton>
                <NeoButton variant="success">Success</NeoButton>
                <NeoButton variant="danger">Danger</NeoButton>
                <NeoButton variant="secondary">Secondary</NeoButton>
                <NeoButton variant="primary" icon={<Plus className="h-4 w-4" />}>
                  With Icon
                </NeoButton>
                <NeoButton
                  variant="primary"
                  loading={loading}
                  onClick={() => {
                    setLoading(true);
                    setTimeout(() => setLoading(false), 2000);
                  }}
                >
                  {loading ? "Loading..." : "Click to Load"}
                </NeoButton>
              </div>
            </NeoCard>
          </section>

          {/* Inputs */}
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">📝 Inputs</h2>
            <NeoCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NeoInput
                  id="name"
                  label="Full Name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <NeoInput
                  id="email"
                  label="Email Address"
                  placeholder="you@email.com"
                  icon={<Mail className="h-3.5 w-3.5" />}
                />
                <NeoInput
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  icon={<Lock className="h-3.5 w-3.5" />}
                />
                <NeoInput
                  id="search"
                  label="Search"
                  placeholder="Search projects..."
                  icon={<Search className="h-3.5 w-3.5" />}
                />
                <NeoInput
                  id="error"
                  label="With Error"
                  placeholder="Invalid input"
                  error="This field is required"
                />
              </div>
            </NeoCard>
          </section>

          {/* Badges */}
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">🏷️ Badges</h2>
            <NeoCard>
              <div className="flex flex-wrap gap-3 items-center">
                <NeoBadge variant="primary">Active</NeoBadge>
                <NeoBadge variant="success">Completed</NeoBadge>
                <NeoBadge variant="warning">On Hold</NeoBadge>
                <NeoBadge variant="danger">Cancelled</NeoBadge>
                <NeoBadge variant="info">Pending</NeoBadge>
                <NeoBadge variant="neutral">Draft</NeoBadge>
                <NeoBadge variant="primary" size="sm">Small</NeoBadge>
              </div>
            </NeoCard>
          </section>

          {/* Icon Boxes */}
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">🎨 Icon Boxes</h2>
            <NeoCard>
              <div className="flex flex-wrap gap-4 items-center">
                <NeoIconBox size="sm" color="text-blue-600">
                  <FolderKanban className="h-4 w-4" />
                </NeoIconBox>
                <NeoIconBox size="md" color="text-purple-600">
                  <Shield className="h-5 w-5" />
                </NeoIconBox>
                <NeoIconBox size="lg" shape="circle" color="text-green-600">
                  <Zap className="h-7 w-7" />
                </NeoIconBox>
                <NeoIconBox size="xl" color="text-pink-600" variant="inset">
                  <BarChart3 className="h-8 w-8" />
                </NeoIconBox>
              </div>
            </NeoCard>
          </section>

          {/* Combined Example */}
          <section>
            <h2 className="text-xl font-bold text-slate-700 mb-4">🎯 Combined Example</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NeoCard hover>
                <div className="flex items-start gap-4">
                  <NeoIconBox color="text-blue-600">
                    <FolderKanban className="h-5 w-5" />
                  </NeoIconBox>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">Total Projects</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
                    <NeoBadge variant="success" size="sm">+3 this month</NeoBadge>
                  </div>
                </div>
              </NeoCard>

              <NeoCard hover>
                <div className="flex items-start gap-4">
                  <NeoIconBox color="text-green-600">
                    <BarChart3 className="h-5 w-5" />
                  </NeoIconBox>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">Total Fund</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">₹12.5L</p>
                    <NeoBadge variant="info" size="sm">Updated</NeoBadge>
                  </div>
                </div>
              </NeoCard>

              <NeoCard hover>
                <div className="flex items-start gap-4">
                  <NeoIconBox color="text-purple-600">
                    <Shield className="h-5 w-5" />
                  </NeoIconBox>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">Active Users</h3>
                    <p className="text-2xl font-bold text-slate-900 mt-1">8</p>
                    <NeoBadge variant="warning" size="sm">2 online</NeoBadge>
                  </div>
                </div>
              </NeoCard>
            </div>
          </section>

          {/* Footer */}
          <div className="text-center py-8 text-sm text-slate-500">
            🎨 PIMS Neumorphism Design System — Reusable across all pages
          </div>
        </div>
      </div>
    </div>
  );
}