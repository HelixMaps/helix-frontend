"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  FileText,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { exportMapImage, exportMapPdf } from "@/utils/exportMap";

export default function ExportSnapshotModal({
  isOpen,
  onClose,
  activeMap,
  canvasContainerRef,
  fitView,
  getViewport,
  setViewport,
  viewMode,
}) {
  const [mounted, setMounted] = useState(false);
  const [format, setFormat] = useState("png"); // "png" | "jpeg" | "pdf"
  const [resolution, setResolution] = useState(2); // 1 = Standard, 2 = Ultra HD
  const [framing, setFraming] = useState("current"); // "current" | "fit"
  const [transparent, setTransparent] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && activeMap) {
      setCustomTitle(activeMap.title || "Mind Map");
      setExportSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen, activeMap]);

  // Dismiss on Escape
  useEffect(() => {
    if (!isOpen || isExporting) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isExporting, onClose]);

  if (!isOpen || !mounted) return null;

  const handleDownload = async () => {
    if (!canvasContainerRef?.current) {
      setErrorMessage("Canvas container not found. Please try again.");
      return;
    }

    setIsExporting(true);
    setErrorMessage(null);
    setExportSuccess(false);

    let savedViewport = null;

    try {
      if (framing === "fit" && fitView && getViewport && setViewport) {
        savedViewport = getViewport();
        fitView({ padding: 0.3, duration: 0 });
      }

      // Hide modal before capturing snapshot
      setIsCapturing(true);
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const title = customTitle.trim() || activeMap?.title || "Mind Map";
      const element = canvasContainerRef.current;

      if (format === "pdf") {
        await exportMapPdf({
          element,
          title,
          pixelRatio: resolution,
          backgroundColor: "#050505",
        });
      } else {
        await exportMapImage({
          element,
          title,
          format,
          transparent: format === "png" ? transparent : false,
          pixelRatio: resolution,
          backgroundColor: "#050505",
        });
      }

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Export snapshot error:", err);
      setErrorMessage(err?.message || "Failed to generate snapshot. Please try again.");
    } finally {
      setIsCapturing(false);
      if (savedViewport && setViewport) {
        setViewport(savedViewport, { duration: 0 });
      }
      setIsExporting(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`export-modal export-exclude fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none transition-opacity duration-150 ${
        isCapturing
          ? "opacity-0 pointer-events-none"
          : "opacity-100 animate-in fade-in-0 duration-200"
      }`}
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
              <Download size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-zinc-100 tracking-tight">
                  Export Snapshot
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.06]">
                  {viewMode === "3d" ? "3D Spatial" : "2D Canvas"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Save a high-resolution snapshot of your workspace
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

        {/* ── Content Body ── */}
        <div className="mt-4 space-y-4">
          {/* Format Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
              Format
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: "png", label: "PNG", sub: "Lossless", icon: ImageIcon },
                { id: "jpeg", label: "JPEG", sub: "Compact", icon: ImageIcon },
                { id: "pdf", label: "PDF", sub: "A4 Landscape", icon: FileText },
              ].map(({ id, label, sub, icon: Icon }) => {
                const isSelected = format === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormat(id)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? "bg-white/[0.08] border-white/[0.14] text-zinc-100"
                        : "bg-black/40 border-white/[0.05] text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon
                      size={15}
                      className={isSelected ? "text-emerald-400/90" : "text-zinc-500"}
                    />
                    <span>{label}</span>
                    <span className="text-[10px] text-zinc-500">{sub}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filename Input */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
              File Name
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-black/50 border border-white/[0.06] focus-within:border-white/[0.16] rounded-xl transition-colors">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter snapshot title..."
                className="bg-transparent text-xs text-zinc-200 placeholder-zinc-600 outline-none w-full"
              />
              <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                .{format === "jpeg" ? "jpg" : format}
              </span>
            </div>
          </div>

          {/* Resolution & Framing Row */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Resolution */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
                Scale
              </label>
              <div className="flex bg-black/60 p-0.5 rounded-xl border border-white/[0.05]">
                <button
                  type="button"
                  onClick={() => setResolution(1)}
                  className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    resolution === 1
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  1x
                </button>
                <button
                  type="button"
                  onClick={() => setResolution(2)}
                  className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    resolution === 2
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  2x HD
                </button>
              </div>
            </div>

            {/* Framing */}
            <div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block mb-1.5">
                Bounds
              </label>
              <div className="flex bg-black/60 p-0.5 rounded-xl border border-white/[0.05]">
                <button
                  type="button"
                  onClick={() => setFraming("current")}
                  className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    framing === "current"
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Capture current viewport"
                >
                  Viewport
                </button>
                <button
                  type="button"
                  onClick={() => setFraming("fit")}
                  className={`flex-1 py-1.5 text-center text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    framing === "fit"
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="Auto-fit all nodes into frame"
                >
                  Fit All
                </button>
              </div>
            </div>
          </div>

          {/* Transparent Background Switch (PNG only) */}
          {format === "png" && (
            <div
              onClick={() => setTransparent((prev) => !prev)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-black/30 border border-white/[0.05] hover:border-white/[0.09] cursor-pointer transition-colors"
            >
              <div>
                <span className="text-xs font-medium text-zinc-300">
                  Transparent Background
                </span>
                <p className="text-[11px] text-zinc-500">
                  Omit dark canvas backdrop for standalone assets
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={transparent}
                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors cursor-pointer ${
                  transparent
                    ? "bg-emerald-500/25 border-emerald-400/50"
                    : "bg-white/[0.05] border-white/[0.1]"
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full transition-transform ${
                    transparent
                      ? "translate-x-4 bg-emerald-400"
                      : "translate-x-1 bg-zinc-500"
                  }`}
                />
              </button>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
              <AlertCircle size={14} className="shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="mt-5 flex items-center justify-end gap-2 pt-4 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-3.5 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all active:scale-95 border ${
              exportSuccess
                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                : "bg-white/[0.08] hover:bg-white/[0.14] border-white/[0.1] text-zinc-100 hover:text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isExporting ? (
              <>
                <div className="w-3 h-3 border-2 border-white/20 border-t-zinc-200 rounded-full animate-spin" />
                <span>Rendering...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check size={13} />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span>Download {format.toUpperCase()}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}