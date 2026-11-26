import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { NODE_THEME_LIST, getNodeTheme } from "@/config/nodeThemes";

export default function DetailsDrawer({
  node,
  onClose,
  onUpdateData,
  isReadOnly = false,
}) {
  const drawerRef = useRef(null);

  const handleUpdate = (id, data) => {
    if (isReadOnly) return;
    onUpdateData(id, data);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        drawerRef.current &&
        !drawerRef.current.contains(event.target) &&
        !event.target.closest(".react-flow__node")
      ) {
        onClose();
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!node) return null;

  const title = node.data?.label || "";
  const summary = node.data?.summary || "";
  const currentTheme = getNodeTheme(node.data?.theme);

  return (
    <aside
      ref={drawerRef}
      aria-label="Node Details"
      className="fixed top-0 right-0 h-full w-[360px] max-w-full bg-[#0a0a0b]/95 backdrop-blur-xl border-l border-zinc-800/70 z-40 flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Minimal Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b border-zinc-800/60 select-none">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-medium text-zinc-400">Details</span>
          {isReadOnly && (
            <span className="text-[11px] text-zinc-500">· Read only</span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 -mr-1.5 text-zinc-500 hover:text-zinc-200 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} strokeWidth={1.75} />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col divide-y divide-zinc-800/60 scrollbar-thin">
        {/* Title */}
        <div className="pb-6">
          <input
            type="text"
            value={title}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            onChange={(e) => handleUpdate(node.id, { label: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={isReadOnly ? "Untitled" : "Node title"}
            className="w-full bg-transparent text-base font-medium text-zinc-100 placeholder-zinc-600 focus:outline-none"
          />
        </div>

        {/* Color */}
        <div className="py-5 flex items-center justify-between">
          <span className="text-xs text-zinc-400 select-none">Color</span>
          <div className="flex items-center gap-2">
            {NODE_THEME_LIST.map((t) => {
              const isActive = currentTheme.key === t.key;
              return (
                <button
                  key={t.key}
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => handleUpdate(node.id, { theme: t.key })}
                  title={t.label}
                  aria-label={t.label}
                  className={`w-4 h-4 rounded-full transition-transform ${
                    isReadOnly
                      ? "cursor-default opacity-60"
                      : "cursor-pointer hover:scale-110"
                  } ${
                    isActive
                      ? "ring-2 ring-zinc-200 ring-offset-2 ring-offset-[#0a0a0b]"
                      : "opacity-75 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: t.accent }}
                />
              );
            })}
          </div>
        </div>

        {/* Notes */}
        <div className="pt-5 flex-1 flex flex-col">
          <textarea
            value={summary}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            onChange={(e) => handleUpdate(node.id, { summary: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            placeholder={isReadOnly ? "No notes." : "Add notes..."}
            className="w-full flex-1 min-h-[280px] bg-transparent text-sm text-zinc-300 placeholder-zinc-600 resize-none leading-relaxed focus:outline-none scrollbar-thin"
          />
        </div>
      </div>
    </aside>
  );
}