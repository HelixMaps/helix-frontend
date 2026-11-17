"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Download, 
  FileText, 
  Image as ImageIcon, 
  X, 
  Check, 
  Sparkles, 
  Layers, 
  Sliders, 
  Maximize2,
  AlertCircle
} from "lucide-react";
import { exportMapImage, exportMapPdf, sanitizeFilename } from "@/utils/exportMap";

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
      // 1. If "fit" framing selected, save current viewport and fit view
      if (framing === "fit" && fitView && getViewport && setViewport) {
        savedViewport = getViewport();
        fitView({ padding: 0.3, duration: 0 });
      }

      // 2. Hide modal completely before taking the snapshot so it cannot appear in the image
      setIsCapturing(true);

      // Wait 2 animation frame ticks for DOM to flush visibility and framing
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

      const title = customTitle.trim() || activeMap?.title || "Mind Map";
      const element = canvasContainerRef.current;

      if (format === "pdf") {
        await exportMapPdf({
          element,
          title,
          pixelRatio: resolution,
          backgroundColor: "#141414",
        });
      } else {
        await exportMapImage({
          element,
          title,
          format,
          transparent: format === "png" ? transparent : false,
          pixelRatio: resolution,
          backgroundColor: "#141414",
        });
      }

      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
        onClose();
      }, 1400);
    } catch (err) {
      console.error("Export snapshot error:", err);
      setErrorMessage(err?.message || "Failed to generate snapshot. Please try again.");
    } finally {
      setIsCapturing(false);
      // Restore previous viewport if we adjusted framing
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
      className={`export-modal export-exclude fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none transition-opacity duration-150 ${
        isCapturing ? "opacity-0 pointer-events-none" : "opacity-100 animate-in fade-in-0 duration-200"
      }`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(16,185,129,0.15)] duration-200 animate-in zoom-in-95 overflow-hidden"
        style={{
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Emerald/Blue Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-24 bg-emerald-500/15 rounded-full blur-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Download size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-zinc-100 tracking-tight">
                  Export Snapshot
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  {viewMode === "3d" ? "3D Spatial" : "2D Canvas"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Download a high-resolution snapshot to your system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 space-y-4">
          {/* Format Selector */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-2 font-mono">
              Export Format
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat("png")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  format === "png"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <ImageIcon size={18} />
                <span>PNG Image</span>
                <span className="text-[9px] opacity-70">Lossless 4K</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("jpeg")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  format === "jpeg"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <ImageIcon size={18} />
                <span>JPEG Image</span>
                <span className="text-[9px] opacity-70">Compressed</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  format === "pdf"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <FileText size={18} />
                <span>PDF Document</span>
                <span className="text-[9px] opacity-70">Landscape A4</span>
              </button>
            </div>
          </div>

          {/* Filename Input */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1.5 font-mono">
              File Name
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-xl focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/40">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Enter snapshot title..."
                className="bg-transparent text-xs text-zinc-200 placeholder-zinc-500 outline-none w-full"
              />
              <span className="text-[11px] font-mono text-zinc-500 shrink-0">
                .{format === "jpeg" ? "jpg" : format}
              </span>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Resolution */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1 font-mono">
                Resolution
              </label>
              <div className="flex bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setResolution(1)}
                  className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    resolution === 1
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  1x Standard
                </button>
                <button
                  type="button"
                  onClick={() => setResolution(2)}
                  className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    resolution === 2
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  2x Ultra HD
                </button>
              </div>
            </div>

            {/* Framing */}
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1 font-mono">
                Framing
              </label>
              <div className="flex bg-zinc-900 p-0.5 rounded-xl border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setFraming("current")}
                  className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    framing === "current"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Capture what is currently visible on your screen"
                >
                  Current View
                </button>
                <button
                  type="button"
                  onClick={() => setFraming("fit")}
                  className={`flex-1 py-1.5 text-center text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    framing === "fit"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                  title="Auto-fit all nodes within the snapshot"
                >
                  Fit Content
                </button>
              </div>
            </div>
          </div>

          {/* Transparent Background Toggle (PNG only) */}
          {format === "png" && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-850 text-xs">
              <div>
                <span className="font-semibold text-zinc-300">Transparent Background</span>
                <p className="text-[10px] text-zinc-500">Remove dark canvas grid for standalone graphic</p>
              </div>
              <input
                type="checkbox"
                checked={transparent}
                onChange={(e) => setTransparent(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
              <AlertCircle size={14} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-zinc-850">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl border border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all shadow-lg active:scale-95 ${
              exportSuccess
                ? "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)]"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Rendering Snapshot...</span>
              </>
            ) : exportSuccess ? (
              <>
                <Check size={14} className="stroke-[3]" />
                <span>Downloaded!</span>
              </>
            ) : (
              <>
                <Download size={14} />
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
