"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Lightbulb, CheckSquare, Link2 } from "lucide-react";

const typeConfig = {
  idea:     { icon: Lightbulb,    color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"   },
  task:     { icon: CheckSquare,  color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  resource: { icon: Link2,        color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"  },
};

// ─── Search Modal ────────────────────────────────────────────────────────────
function SearchModal({ nodes, onSearch, onClose }) {
  const [rawQuery, setRawQuery] = useState("");
  const [query, setQuery]       = useState("");
  const inputRef                = useRef(null);
  const containerRef            = useRef(null);
  const debounceTimer           = useRef(null);

  // Debounce the live query (200 ms)
  const handleInput = (e) => {
    const val = e.target.value;
    setRawQuery(val);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setQuery(val), 200);
  };

  // Cleanup debounce on unmount
  useEffect(() => () => clearTimeout(debounceTimer.current), []);

  // Auto-focus on open
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    return () => document.removeEventListener("mousedown", handleClickOutside, true);
  }, [onClose]);

  const results = query.trim().length > 0
    ? nodes.filter((n) =>
        (n.data?.label || "").toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  const handleSelect = (node) => {
    onSearch(node);
    onClose();
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === "Enter" && results.length > 0) {
      handleSelect(results[0]);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-[3px] flex items-start justify-center pt-24 px-4">
      {/* Modal Card */}
      <div
        ref={containerRef}
        className="w-full max-w-md bg-zinc-900/95 border border-zinc-800/80 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/50">
          <Search size={16} className="text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={rawQuery}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Search nodes by title..."
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
          />
          {rawQuery && (
            <button
              onClick={() => { setRawQuery(""); setQuery(""); }}
              className="text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Results */}
        {query.trim().length > 0 && (
          <div className="max-h-72 overflow-y-auto py-1.5">
            {results.length > 0 ? (
              results.map((node) => {
                const cfg = typeConfig[node.type] || typeConfig.idea;
                const Icon = cfg.icon;
                const label = node.data?.label || "Untitled";
                const q = query.trim().toLowerCase();
                const lowerLabel = label.toLowerCase();
                const idx = lowerLabel.indexOf(q);

                return (
                  <button
                    key={node.id}
                    onClick={() => handleSelect(node)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/60 transition-colors cursor-pointer group text-left"
                  >
                    {/* Icon */}
                    <div className={`p-1 rounded-md ${cfg.bg} ${cfg.color} border ${cfg.border} shrink-0`}>
                      <Icon size={12} />
                    </div>
                    {/* Label with highlighted match */}
                    <span className="text-sm text-zinc-300 truncate">
                      {idx >= 0 ? (
                        <>
                          {label.slice(0, idx)}
                          <span className="text-white font-semibold bg-zinc-700/60 rounded px-0.5">
                            {label.slice(idx, idx + q.length)}
                          </span>
                          {label.slice(idx + q.length)}
                        </>
                      ) : label}
                    </span>
                    {/* Type badge */}
                    <span className={`ml-auto text-[9px] font-bold uppercase tracking-wider ${cfg.color} shrink-0`}>
                      {node.type}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-6 text-center text-sm text-zinc-600 select-none">
                No nodes match &ldquo;{query}&rdquo;
              </div>
            )}
          </div>
        )}

        {/* Hint footer */}
        <div className="px-4 py-2 border-t border-zinc-800/40 flex items-center gap-3 text-[10px] text-zinc-600 select-none">
          <span><kbd className="font-mono bg-zinc-800 px-1 py-0.5 rounded">↵</kbd> jump to first match</span>
          <span><kbd className="font-mono bg-zinc-800 px-1 py-0.5 rounded">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  );
}

// ─── Search Trigger + Active Badge ───────────────────────────────────────────
export default function NodeSearchBar({ nodes, onSearch, onClear, activeSearch }) {
  const [isOpen, setIsOpen] = useState(false);

  // Global ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleSearch = useCallback((node) => {
    onSearch(node);
  }, [onSearch]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <>
      {/* ── Top-right toolbar ── */}
      <div className="fixed top-5 right-5 z-[200] flex items-center gap-2">
        {/* Active search badge */}
        {activeSearch && (
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900/90 border border-zinc-800 rounded-full text-xs text-zinc-300 backdrop-blur-sm shadow-lg animate-in fade-in slide-in-from-right-3 duration-200">
            <Search size={11} className="text-zinc-500 shrink-0" />
            <span className="font-medium max-w-[120px] truncate" title={activeSearch}>
              {activeSearch}
            </span>
            <button
              onClick={onClear}
              className="ml-1 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Search trigger button */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2.5 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-full text-zinc-400 hover:text-zinc-200 shadow-xl cursor-pointer active:scale-95 transition-all duration-200"
          title="Search nodes (⌘K)"
        >
          <Search size={15} />
        </button>
      </div>

      {/* ── Search Modal ── */}
      {isOpen && (
        <SearchModal
          nodes={nodes}
          onSearch={handleSearch}
          onClose={handleClose}
        />
      )}
    </>
  );
}
