import React, { useEffect, useRef } from "react";
import { Trash2, Edit2 } from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import { NODE_THEME_LIST, getNodeTheme } from "@/config/nodeThemes";

export default function ContextMenu({ id, x, y, node, onClickOutside, onDelete, onEdit }) {
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClickOutside();
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, [onClickOutside]);

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const nodeLabel = node?.data?.label || "Node";
  const currentTheme = getNodeTheme(node?.data?.theme);

  const { setNodes } = useReactFlow();

  const handleSetTheme = (newTheme) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, theme: newTheme } }
          : n
      )
    );
    onClickOutside();
  };

  return (
    <div
      ref={ref}
      style={{
        top: y,
        left: x,
        boxShadow:
          "0 4px 0 0 #18181b, 0 24px 48px -4px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 255, 255, 0.2)",
      }}
      onContextMenu={handleContextMenu}
      className="fixed z-[9999] min-w-[195px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl py-2 animate-in fade-in zoom-in-95 duration-100 select-none cursor-default"
    >
      {/* Node Info Header */}
      <div className="px-3 py-2 flex flex-col gap-0.5 border-b border-zinc-800/50 mb-1">
        <div className="flex items-center justify-between">
          <span className={`text-[9px] font-bold uppercase tracking-wider ${node?.type === "note" ? "text-zinc-400" : currentTheme.drawer.text}`}>
            {node?.type === "note" ? "Canvas Note" : `${currentTheme.label} Theme`}
          </span>
        </div>
        <span className="text-xs font-semibold text-zinc-200 truncate max-w-[160px]" title={nodeLabel}>
          {nodeLabel || (node?.type === "note" ? "Untitled Note" : "Node")}
        </span>
      </div>

      {/* Theme Quick Switcher (standard nodes only) */}
      {node?.type !== "note" && (
        <div className="px-3 py-1.5 flex items-center justify-between border-b border-zinc-800/50 mb-1">
          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
            Theme
          </span>
          <div className="flex items-center gap-1.5">
            {NODE_THEME_LIST.map((t) => (
              <button
                key={t.key}
                onClick={() => handleSetTheme(t.key)}
                title={`Switch to ${t.label} theme`}
                className={`w-3.5 h-3.5 rounded-full ${t.dotClass} cursor-pointer transition-all ${
                  currentTheme.key === t.key
                    ? "ring-2 ring-white scale-110 shadow-sm"
                    : "opacity-40 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Action Items */}
      <div className="px-1 flex flex-col gap-0.5">
        <button
          onClick={() => onEdit(id)}
          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 flex items-center gap-2.5 transition-all duration-150 rounded-lg cursor-pointer group"
        >
          <Edit2 size={13.5} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          <span>{node?.type === "note" ? "Edit Note" : "Edit Title"}</span>
        </button>
        <button
          onClick={() => onDelete(id)}
          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-all duration-150 rounded-lg cursor-pointer group"
        >
          <Trash2 size={13.5} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
          <span>{node?.type === "note" ? "Delete Note" : "Delete Node"}</span>
        </button>
      </div>
    </div>
  );
}
