"use client";

import React, { useState, useEffect, useRef } from "react";
import { FolderPlus, X, Sparkles } from "lucide-react";

/**
 * CreateMapModal
 * Modal prompting user to name their new mind map with default value "Untitled Mind Map".
 * Allows user to change it and save it.
 */
export default function CreateMapModal({ isOpen, onClose, onSubmit }) {
  const [title, setTitle] = useState("Untitled Mind Map");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("Untitled Mind Map");
      // Focus and select the text on open
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalTitle = title.trim() || "Untitled Mind Map";
    onSubmit(finalTitle);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in-0 duration-200 select-none"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-6 shadow-[0_0_50px_rgba(59,130,246,0.18)] duration-200 animate-in zoom-in-95 overflow-hidden"
        style={{
          boxShadow: "0 0 0 1px rgba(255,255,255,0.06), 0 25px 50px -12px rgba(0,0,0,0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-28 bg-blue-500/15 rounded-full blur-3xl" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <FolderPlus size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-zinc-100 tracking-tight">
                New Mind Map
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Enter a title for your mind map to get started
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="map-title-input"
              className="text-xs font-medium text-zinc-300 flex items-center gap-1.5"
            >
              <Sparkles size={13} className="text-blue-400" />
              Mind Map Name
            </label>
            <input
              id="map-title-input"
              ref={inputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Project Roadmap"
              maxLength={80}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-750 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-zinc-850 border border-zinc-800 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white text-xs font-semibold shadow-lg shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              Create Map
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
