"use client";

import React from "react";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Share2,
  Workflow,
  Cpu,
  Sparkles,
  GitBranch,
  Layers,
} from "lucide-react";

// ─── Grid-Snapped PCB Background & Ambient Lighting ──────────────────────────
function BackgroundElements() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050505]">
      <style>
        {`
          @keyframes circuit-h {
            0% { transform: translateX(-200px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(100vw); opacity: 0; }
          }
          @keyframes circuit-h-rev {
            0% { transform: translateX(100vw); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateX(-250px); opacity: 0; }
          }
          @keyframes circuit-v {
            0% { transform: translateY(-200px); opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes pulse-node {
            0%, 100% { opacity: 0.3; transform: scale(0.85); }
            50% { opacity: 1; transform: scale(1.25); box-shadow: 0 0 14px 3px rgba(16, 185, 129, 0.5); }
          }
          @keyframes float-slow {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-6px); }
          }
        `}
      </style>

      {/* Top radial spotlight */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[450px] rounded-full bg-emerald-500/[0.07] blur-[130px]" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/[0.04] blur-[140px]" />

      {/* 40px PCB Grid */}
      <div
        className="absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Animated Electrons (Snapped to 40px multiples) */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Horizontal Trace 1 (y = 240px) */}
        <div
          className="absolute h-[1.5px] w-[180px] flex items-center justify-end"
          style={{ top: "240px", left: 0, animation: "circuit-h 7s linear infinite" }}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-500/40 to-emerald-400" />
          <div className="w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_12px_3px_#34d399] absolute right-0 translate-x-1/2" />
        </div>

        {/* Horizontal Trace 2 (y = 520px) */}
        <div
          className="absolute h-[1.5px] w-[240px] flex items-center justify-start"
          style={{ top: "520px", left: 0, animation: "circuit-h-rev 10s linear infinite 2s" }}
        >
          <div className="w-[4px] h-[4px] rounded-full bg-cyan-100 shadow-[0_0_12px_3px_#22d3ee] absolute left-0 -translate-x-1/2" />
          <div className="w-full h-full bg-gradient-to-l from-transparent via-cyan-500/40 to-cyan-400" />
        </div>

        {/* Vertical Trace 1 (x = 360px) */}
        <div
          className="absolute w-[1.5px] h-[160px] flex flex-col items-center justify-end"
          style={{ left: "360px", top: 0, animation: "circuit-v 8s linear infinite 1s" }}
        >
          <div className="w-full h-full bg-gradient-to-b from-transparent via-emerald-500/40 to-emerald-400" />
          <div className="w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_12px_3px_#34d399] absolute bottom-0 translate-y-1/2" />
        </div>

        {/* Vertical Trace 2 (x = 840px) */}
        <div
          className="absolute w-[1.5px] h-[200px] flex flex-col items-center justify-end"
          style={{ left: "840px", top: 0, animation: "circuit-v 11s linear infinite 3.5s" }}
        >
          <div className="w-full h-full bg-gradient-to-b from-transparent via-cyan-500/30 to-cyan-400" />
          <div className="w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_12px_3px_#22d3ee] absolute bottom-0 translate-y-1/2" />
        </div>

        {/* Grid Intersection Nodes */}
        <div
          className="absolute w-[5px] h-[5px] rounded-full bg-emerald-400"
          style={{ top: "238px", left: "358px", animation: "pulse-node 3s ease-in-out infinite" }}
        />
        <div
          className="absolute w-[5px] h-[5px] rounded-full bg-cyan-400"
          style={{ top: "518px", left: "838px", animation: "pulse-node 4s ease-in-out infinite 1.5s" }}
        />
      </div>

      {/* Radial Vignette Mask */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, transparent 15%, #050505 85%)",
        }}
      />
    </div>
  );
}

// ─── Sleek Interactive Canvas Preview (Hero Visual) ──────────────────────────
function CanvasPreview() {
  return (
    <div className="relative hidden lg:block w-full max-w-[500px] ml-auto select-none">
      {/* Outer Ambient Glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-white/5 to-cyan-500/20 blur-xl opacity-70" />

      {/* Main Window Frame */}
      <div className="relative rounded-2xl border border-white/10 bg-[#0A0A0C]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Window Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-700" />
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            system-architecture.hlx
          </div>
          <div className="flex -space-x-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-[9px] text-emerald-300 font-medium">
              V
            </div>
            <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-[9px] text-cyan-300 font-medium">
              A
            </div>
          </div>
        </div>

        {/* Mini Infinite Canvas */}
        <div
          className="relative h-[340px] w-full p-6 overflow-hidden"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* SVG Bezier Connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <defs>
              <linearGradient id="edge-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            {/* Node 1 to Node 2 */}
            <path
              d="M 185 88 C 235 88, 235 165, 285 165"
              fill="none"
              stroke="url(#edge-grad-1)"
              strokeWidth="1.5"
            />
            {/* Node 1 to Node 3 */}
            <path
              d="M 115 122 C 115 175, 115 185, 115 225"
              fill="none"
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Node 1: Root Concept */}
          <div
            className="absolute top-12 left-7 w-44 rounded-xl border border-emerald-500/40 bg-[#111315] p-3.5 shadow-[0_0_25px_-5px_rgba(16,185,129,0.25)]"
            style={{ animation: "float-slow 5s ease-in-out infinite" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
                <Sparkles size={11} /> Core Engine
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs font-medium text-zinc-100">Neural Sync v2</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">CRDT state engine</p>
          </div>

          {/* Node 2: Connected Branch */}
          <div
            className="absolute top-32 right-6 w-44 rounded-xl border border-white/10 bg-[#111315]/95 p-3.5 shadow-xl hover:border-cyan-400/40 transition-colors"
            style={{ animation: "float-slow 6s ease-in-out infinite 1s" }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                <GitBranch size={11} /> Edge Worker
              </span>
            </div>
            <p className="text-xs font-medium text-zinc-100">Sub-12ms Latency</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">Global mesh routing</p>
          </div>

          {/* Node 3: Sub-node */}
          <div className="absolute bottom-7 left-7 w-44 rounded-xl border border-white/[0.08] bg-[#111315]/80 p-3 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
              <Layers size={11} /> Canvas Layer
            </div>
            <p className="text-xs font-medium text-zinc-300">Infinite Spatial Grid</p>
          </div>

          {/* Floating Multiplayer Cursor */}
          <div className="absolute bottom-14 right-16 flex items-center gap-1.5 pointer-events-none">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 1L5.5 12.5L7.5 7.5L12.5 5.5L1 1Z"
                fill="#34d399"
                stroke="#050505"
                strokeWidth="1.2"
              />
            </svg>
            <span className="rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-semibold text-black shadow-lg">
              Alex
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Workflow,
    title: "Fluid Mapping",
    desc: "Infinite spatial canvas engineered to map complex architecture at the speed of thought.",
  },
  {
    icon: Share2,
    title: "Multiplayer Sync",
    desc: "Zero-latency presence and live cursors. Brainstorm with your team without friction.",
  },
  {
    icon: Cpu,
    title: "Smart Nodes",
    desc: "Auto-organizing layouts and magnetic connectors that adapt to your graph complexity.",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#050505] text-zinc-50 font-sans selection:bg-emerald-500/30 selection:text-emerald-200 overflow-x-hidden">
      <BackgroundElements />

      {/* ── Frosted Glass Nav Bar ── */}
      <header className="sticky top-0 z-30 border-b border-white/[0.05] bg-[#050505]/70 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/")}>
            <div className="relative flex items-center justify-center h-8 w-8 rounded-lg bg-white/[0.04] border border-white/10 group-hover:border-emerald-500/40 transition-colors">
              <img src="/helix-logo.svg" alt="Helix Logo" className="h-5 w-5 object-contain" />
            </div>
            <span className="text-sm font-semibold tracking-widest text-zinc-100 uppercase">
              Helix
            </span>
          </div>

          {isLoaded && !user && (
            <div className="flex items-center gap-5">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_20px_rgba(255,255,255,0.15)] hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer">
                  Get Started
                </button>
              </SignUpButton>
            </div>
          )}
        </div>
      </header>

      {/* ── Hero Section (2-Column Split on Desktop) ── */}
      <main className="relative z-10 flex flex-col justify-center flex-1 px-6 pt-16 pb-20 lg:py-24 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 max-w-2xl">
            {/* Eyebrow Pill */}
            <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-emerald-500/20 bg-emerald-500/[0.06] px-3.5 py-1.5 text-[11px] font-medium tracking-wider text-emerald-300 uppercase shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Helix v1.0 is now live
            </div>

            {/* Display Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-medium tracking-tight leading-[1.06] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-zinc-400 mb-6">
              The canvas for the <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-white via-emerald-100 to-zinc-400 bg-clip-text text-transparent">
                complex mind.
              </span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-xl text-base sm:text-lg font-normal leading-relaxed text-zinc-400 mb-10">
              Untangle your thoughts. Helix provides a frictionless, infinite spatial workspace to visually architect ideas, systems, and workflows.
            </p>

            {/* Auth / CTA Block */}
            <div className="w-full max-w-md min-h-[68px]">
              {isLoaded ? (
                user ? (
                  /* Signed-in Card */
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-2 pl-3.5 shadow-xl">
                    <div className="flex items-center gap-3">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full ring-1 ring-white/20 object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs text-zinc-500">Welcome back</span>
                        <span className="text-sm font-medium text-zinc-200 truncate max-w-[140px]">
                          {user?.fullName || user.username || "User"}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push("/dashboard")}
                      className="group flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      Open Workspace
                      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                ) : (
                  /* Guest CTAs */
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap sm:flex-nowrap gap-3.5">
                      <button
                        onClick={() => router.push("/dashboard?try=true")}
                        className="group flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6),0_0_30px_-5px_rgba(255,255,255,0.25)] hover:bg-zinc-200 active:scale-[0.98] transition-all cursor-pointer"
                      >
                        Try for Free
                        <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                      </button>
                      <SignInButton mode="modal">
                        <button className="flex-1 sm:flex-initial flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.02] px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-white/[0.06] hover:border-white/20 hover:text-white transition-all cursor-pointer">
                          Log In
                        </button>
                      </SignInButton>
                    </div>
                    <span className="text-xs text-zinc-500 flex items-center gap-1.5 pl-0.5">
                      <span className="w-1 h-1 rounded-full bg-zinc-600" />
                      Instant sandbox access — no account required.
                    </span>
                  </div>
                )
              ) : (
                <div className="flex items-center h-12">
                  <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Interactive Product Preview */}
          <div className="lg:col-span-5">
            <CanvasPreview />
          </div>
        </div>

        {/* ── Glassmorphic Feature Grid ── */}
        <div className="mt-28 lg:mt-36 w-full grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative rounded-2xl border border-white/[0.07] bg-white/[0.015] p-6 backdrop-blur-sm hover:border-emerald-500/30 hover:bg-white/[0.03] transition-all duration-300"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 group-hover:border-emerald-500/30 group-hover:text-emerald-400 group-hover:shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] transition-all">
                <Icon size={18} />
              </div>
              <h3 className="text-base font-medium text-zinc-100 mb-1.5">{title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* ── Minimal Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-6 px-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row gap-2 justify-between items-center text-xs text-zinc-500">
        <p>© 2026 Helix. Happy Mappings!</p>
        <p>
          Built with <span className="text-red-400">♥</span> by Vish
        </p>
      </footer>
    </div>
  );
}