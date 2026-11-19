"use client";

import React, { useState, useEffect } from "react";
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  X,
  ShieldCheck,
  Grid,
  Box,
  Lock,
  Globe,
} from "lucide-react";

export default function ShareModal({ isOpen, onClose, activeMap }) {
  const [copied, setCopied] = useState(false);
  const [preferredView, setPreferredView] = useState("2d");

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeMap) return null;

  const mapId = activeMap._id || activeMap.id || "sandbox";
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://helix.workspace";
  const shareUrl = `${origin}/share/${mapId}${preferredView === "3d" ? "?view=3d" : ""}`;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  const handleOpenLink = () => {
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-0 duration-200 select-none"
      onClick={onClose}
    >
      {/* ── Stealth Matte Obsidian Dialog ── */}
      <div
        className="relative w-full max-w-md rounded-2xl border border-white/[0.07] bg-[#090A0D]/90 backdrop-blur-xl p-5 overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          boxShadow:
            "inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 24px 48px -12px rgba(0, 0, 0, 0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400 shrink-0">
              <Share2 size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-zinc-100 tracking-tight">
                  Share Mind Map
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.06]">
                  Public Link
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[270px]">
                Anyone with the link can view{" "}
                <span className="text-zinc-300">
                  &ldquo;{activeMap.title || "Untitled Map"}&rdquo;
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Quiet Segmented View Mode Switcher ── */}
        <div className="mt-4 flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/40 border border-white/[0.05]">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-zinc-300">Launch Perspective</span>
            <span className="text-[11px] text-zinc-500">Default view when opened</span>
          </div>

          <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-black/60 border border-white/[0.05]">
            <button
              onClick={() => setPreferredView("2d")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                preferredView === "2d"
                  ? "bg-white/[0.08] text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Grid size={12} className={preferredView === "2d" ? "text-cyan-400/90" : "text-zinc-500"} />
              <span>2D</span>
            </button>

            <button
              onClick={() => setPreferredView("3d")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                preferredView === "3d"
                  ? "bg-white/[0.08] text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Box size={12} className={preferredView === "3d" ? "text-emerald-400/90" : "text-zinc-500"} />
              <span>3D</span>
            </button>
          </div>
        </div>

        {/* ── Share URL & Copy Bar ── */}
        <div className="mt-4">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-1.5 block">
            Shareable URL
          </label>
          <div className="flex items-center gap-1.5">
            <div className="flex-1 flex items-center bg-black/50 border border-white/[0.06] focus-within:border-white/[0.15] rounded-xl px-3 py-2 text-xs font-mono text-zinc-400 overflow-hidden transition-colors">
              <Globe size={13} className="text-zinc-600 mr-2 shrink-0" />
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="bg-transparent border-none outline-none w-full text-zinc-300 truncate cursor-text select-all"
                onClick={(e) => e.target.select()}
              />
            </div>

            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all shrink-0 active:scale-95 border ${
                copied
                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                  : "bg-white/[0.07] hover:bg-white/[0.12] border-white/[0.08] text-zinc-200 hover:text-white"
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenLink}
              className="p-2 rounded-xl bg-transparent hover:bg-white/[0.05] border border-white/[0.06] text-zinc-500 hover:text-zinc-200 cursor-pointer transition-colors active:scale-95"
              title="Open in new tab"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* ── Quiet Permission Summary ── */}
        <div className="mt-4 p-3 rounded-xl bg-black/30 border border-white/[0.05] space-y-2.5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={14} className="text-emerald-400/80 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-zinc-300">Interactive Guest Sandbox</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                Viewers can freely pan, zoom, and explore nodes locally in their browser.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2.5 border-t border-white/[0.05]">
            <Lock size={13} className="text-amber-400/80 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-zinc-300">Owner-Only Save Protection</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">
                Guest edits stay in-memory and never overwrite your saved map.
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 text-xs font-medium cursor-pointer transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}