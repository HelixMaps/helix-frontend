"use client";

import React, { useState, useEffect } from "react";
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Eye, 
  Box, 
  Sparkles,
  Lock,
  Globe
} from "lucide-react";

/**
 * ShareModal
 * Futuristic, sleek modal to generate and manage public share links for mind maps.
 * Enforces permission logic:
 * - Public shared links can be viewed and interactively tweaked anywhere by anyone
 * - Guest changes are in-memory (local sandbox) and cannot overwrite the owner's database
 * - Only the verified map owner can persist edits
 */
export default function ShareModal({ isOpen, onClose, activeMap }) {
  const [copied, setCopied] = useState(false);
  const [preferredView, setPreferredView] = useState("2d"); // 2d by default, 3d optional

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  if (!isOpen || !activeMap) return null;

  const mapId = activeMap._id || activeMap.id || "sandbox";
  const origin = typeof window !== "undefined" ? window.location.origin : "https://helix.workspace";
  const shareUrl = `${origin}/share/${mapId}${preferredView === "3d" ? "?view=3d" : ""}`;

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        // Fallback
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
    window.open(shareUrl, "_blank");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-0 duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(59,130,246,0.18)] duration-200 animate-in zoom-in-95 overflow-hidden"
        style={{
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Futuristic Ambient Glow Ribbon */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-28 bg-blue-500/15 rounded-full blur-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <Share2 size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-100 tracking-tight">
                  Share Mind Map
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Universal Link
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Anyone with this link can view and interact with{" "}
                <span className="font-medium text-zinc-200">
                  &ldquo;{activeMap.title || "Untitled Map"}&rdquo;
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* View Mode Selector for Shared Link */}
        <div className="mt-4 flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/90 border border-zinc-800">
          <span className="text-xs text-zinc-300 font-medium flex items-center gap-1.5">
            <Sparkles size={13} className="text-blue-400" />
            Launch Experience
          </span>
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setPreferredView("2d")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                preferredView === "2d"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
              }`}
            >
              <Eye size={12} />
              <span>2D Canvas</span>
            </button>
            <button
              onClick={() => setPreferredView("3d")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                preferredView === "3d"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
              }`}
            >
              <Box size={12} />
              <span>3D Spatial</span>
            </button>
          </div>
        </div>

        {/* Link Field with Quick Copy */}
        <div className="mt-3">
          <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1.5 block">
            Public Share URL
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center bg-zinc-900/95 border border-zinc-700/80 rounded-xl px-3 py-2 text-xs font-mono text-zinc-200 overflow-hidden shadow-inner">
              <Globe size={13} className="text-zinc-500 mr-2 shrink-0" />
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
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all shrink-0 active:scale-95 shadow-md ${
                copied
                  ? "bg-emerald-600 text-white shadow-[0_0_14px_rgba(16,185,129,0.5)]"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_14px_rgba(59,130,246,0.4)]"
              }`}
            >
              {copied ? (
                <>
                  <Check size={13} className="stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy Link</span>
                </>
              )}
            </button>

            <button
              onClick={handleOpenLink}
              className="p-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-750 text-zinc-400 hover:text-zinc-100 cursor-pointer transition-colors active:scale-95"
              title="Open shared link in new tab"
            >
              <ExternalLink size={14} />
            </button>
          </div>
        </div>

        {/* Security & Access Privilege Details Card */}
        <div className="mt-5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/90 flex flex-col gap-2.5">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-zinc-200">Interactive Guest Sandbox:</span>
              <p className="text-zinc-400 mt-0.5 leading-relaxed text-[11px]">
                Recipients can freely pan, zoom, expand nodes, and organize layouts in their browser session.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 pt-2 border-t border-zinc-850">
            <Lock size={15} className="text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold text-zinc-200">Owner-Only Save Protection:</span>
              <p className="text-zinc-400 mt-0.5 leading-relaxed text-[11px]">
                Guest edits are local and never overwrite your cloud map. Only you (the verified map administrator) can save permanent changes.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-800/90 hover:bg-zinc-750 text-zinc-200 text-xs font-semibold cursor-pointer transition-colors active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
