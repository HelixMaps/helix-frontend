"use client";

import React from "react";
import { useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Share2,
  Workflow,
  Cpu,
} from "lucide-react";

// ─── Subtle Minimalist Grid & Moving Currents ────────────────────────────────
function BackgroundElements() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[#050505] flex items-center justify-center">
      {/* ── Custom Keyframes ── */}
      <style>
        {`
          @keyframes circuit-h {
            0% { transform: translateX(-100vw); opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { transform: translateX(100vw); opacity: 0; }
          }
          @keyframes circuit-v {
            0% { transform: translateY(-100vh); opacity: 0; }
            5% { opacity: 1; }
            95% { opacity: 1; }
            100% { transform: translateY(100vh); opacity: 0; }
          }
          @keyframes pulse-node {
            0%, 100% { opacity: 0.4; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 12px 2px rgba(16, 185, 129, 0.6); }
          }
        `}
      </style>

      {/* Subtle central ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] rounded-full bg-emerald-900/[0.05] blur-[120px]" />

      {/* ── PCB Grid ── */}
      <div 
        className="absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.15) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(16, 185, 129, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* ── Animated Electrons / Traces ── */}
      <div className="absolute inset-0 overflow-hidden">
        
        {/* Horizontal Trace 1 (L to R) */}
        <div
          className="absolute h-[2px] w-[180px] flex items-center justify-end"
          style={{ top: '240px', left: 0, animation: 'circuit-h 6s linear infinite' }}
        >
          {/* Energy Tail */}
          <div className="w-full h-full bg-gradient-to-r from-transparent via-emerald-500/40 to-emerald-400" />
          {/* Electron Head */}
          <div className="w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_12px_4px_#34d399] absolute right-0 translate-x-1/2" />
        </div>

        {/* Horizontal Trace 2 (R to L) */}
        <div
          className="absolute h-[2px] w-[250px] flex items-center justify-start"
          style={{ top: '480px', right: 0, animation: 'circuit-h 9s linear infinite reverse 2s' }}
        >
          {/* Electron Head */}
          <div className="w-[4px] h-[4px] rounded-full bg-cyan-100 shadow-[0_0_12px_4px_#22d3ee] absolute left-0 -translate-x-1/2" />
          {/* Energy Tail */}
          <div className="w-full h-full bg-gradient-to-l from-transparent via-cyan-500/40 to-cyan-400" />
        </div>
        
        {/* Vertical Trace 1 (Top to Bottom) */}
        <div
          className="absolute w-[2px] h-[150px] flex flex-col items-center justify-end"
          style={{ left: '360px', top: 0, animation: 'circuit-v 7s linear infinite 1s' }}
        >
          <div className="w-full h-full bg-gradient-to-b from-transparent via-emerald-500/40 to-emerald-400" />
          <div className="w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_12px_4px_#34d399] absolute bottom-0 translate-y-1/2" />
        </div>

        {/* Vertical Trace 2 (Top to Bottom) */}
        <div
          className="absolute w-[2px] h-[200px] flex flex-col items-center justify-end"
          style={{ left: '720px', top: 0, animation: 'circuit-v 11s linear infinite 4s' }}
        >
          <div className="w-full h-full bg-gradient-to-b from-transparent via-emerald-500/40 to-emerald-400" />
          <div className="w-[4px] h-[4px] rounded-full bg-white shadow-[0_0_12px_4px_#34d399] absolute bottom-0 translate-y-1/2" />
        </div>
        
        {/* Static Circuit Nodes (Intersections) */}
        <div 
          className="absolute w-[6px] h-[6px] rounded-full bg-emerald-400 border border-emerald-200" 
          style={{ top: '238px', left: '357px', animation: 'pulse-node 3s ease-in-out infinite' }} 
        />
        <div 
          className="absolute w-[6px] h-[6px] rounded-full bg-cyan-400 border border-cyan-200" 
          style={{ top: '478px', left: '717px', animation: 'pulse-node 4s ease-in-out infinite 1s' }} 
        />
      </div>

      {/* ── Vignette Overlay (Masks edges to black) ── */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, #050505 85%)'
        }}
      />
    </div>
  );
}

const features = [
  {
    icon: Workflow,
    title: "Fluid Mapping",
    desc: "Infinite canvas to map your architecture at the speed of thought.",
  },
  {
    icon: Share2,
    title: "Multiplayer",
    desc: "Real-time sync. Collaborate with your team without friction.",
  },
  {
    icon: Cpu,
    title: "Smart Nodes",
    desc: "Auto-organizing layouts that adapt to your data complexity.",
  },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-[#0A0A0A] text-zinc-50 font-sans selection:bg-white/20">
      <BackgroundElements />

      {/* ── Nav Bar ── */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <img src="/helix-logo.svg" alt="Helix Logo" className="h-8 w-8 rounded-lg object-contain" />
          <span className="text-sm font-semibold tracking-wide text-zinc-100 uppercase">
            Helix
          </span>
        </div>

        {isLoaded && !user && (
          <div className="flex items-center gap-6">
            <SignInButton mode="modal">
              <button className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="px-4 py-2 rounded-md text-sm font-medium bg-white text-black hover:bg-zinc-200 active:scale-95 transition-all cursor-pointer">
                Get Started
              </button>
            </SignUpButton>
          </div>
        )}
      </header>

      {/* ── Hero ── */}
      <main className="relative z-10 flex flex-col justify-center flex-1 px-6 py-20 max-w-7xl mx-auto w-full">
        <div className="max-w-3xl">
          {/* Eyebrow badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Helix v1.0 is live
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-medium tracking-tighter leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-6">
            The canvas for the <br /> complex mind.
          </h1>

          {/* Subtext */}
          <p className="max-w-xl text-lg sm:text-xl font-light leading-relaxed text-zinc-400 mb-10">
            Untangle your thoughts. Helix provides a frictionless, infinite workspace to visually architect ideas, systems, and workflows.
          </p>

          {/* ── Auth / CTA Block ── */}
          <div className="w-full max-w-md min-h-[64px]">
            {isLoaded ? (
              user ? (
                /* ── Signed-in state ── */
                <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] backdrop-blur-md p-2 pl-4">
                  <div className="flex items-center gap-3">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full bg-white/10 object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10" />
                    )}
                    <span className="text-sm font-medium text-zinc-300 truncate max-w-[120px]">
                      {user?.fullName || user.username || "User"}
                    </span>
                  </div>
                  <button
                    onClick={() => router.push("/dashboard")}
                    className="group flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-black hover:bg-zinc-200 transition-all cursor-pointer"
                  >
                    Workspace
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              ) : (
                /* ── Guest state ── */
                <div className="flex flex-col gap-2">
                  <div className="flex gap-4">
                    <button
                      onClick={() => router.push("/dashboard?try=true")}
                      className="group flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-200 transition-all cursor-pointer"
                    >
                      Try for Free
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </button>
                    <SignInButton mode="modal">
                      <button className="flex items-center justify-center rounded-lg border border-white/10 bg-transparent px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5 transition-all cursor-pointer">
                        Log In
                      </button>
                    </SignInButton>
                  </div>
                  <span className="text-xs text-zinc-500 font-light pl-1">
                    * No login required, progress is not saved.
                  </span>
                </div>
              )
            ) : (
              /* ── Loading state ── */
              <div className="flex items-center h-full">
                <div className="w-5 h-5 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* ── Feature grid (Bottom aligned for sleekness) ── */}
        <div className="mt-32 pt-10 border-t border-white/10 w-full grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col gap-3 group">
              <Icon size={20} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              <div>
                <h3 className="text-sm font-medium text-zinc-200 mb-1">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed pr-6">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── Minimal Footer ── */}
<footer className="relative z-10 py-6 px-6 max-w-7xl mx-auto w-full flex justify-between items-center text-[11px] text-zinc-600 font-medium">
  <p>© 2026 Helix. Happy Mappings!</p>
  <p>Built with ❤️ by Vish</p>
</footer>
    </div>
  );
}