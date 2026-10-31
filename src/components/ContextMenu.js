import React, { useEffect, useRef } from "react";
import { Trash2, Edit2, ArrowUp, ArrowDown } from "lucide-react";
import { useReactFlow } from "@xyflow/react";

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

  const nodeType = node?.type || "node";
  const nodeLabel = node?.data?.label || "Node";

  // Color configurations based on node type
  const typeColors = {
    idea: {
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      label: "Idea",
    },
    task: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      label: "Task",
    },
    resource: {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      label: "Resource",
    },
  };

  const scheme = typeColors[nodeType] || {
    text: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    label: "Node",
  };

  const { setNodes } = useReactFlow();

  const handleElevate = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, elevation: (n.data?.elevation || 45) + 25 } }
          : n
      )
    );
    onClickOutside();
  };

  const handleDescend = () => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === id
          ? { ...n, data: { ...n.data, elevation: Math.max(15, (n.data?.elevation || 45) - 25) } }
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
      className="fixed z-[9999] min-w-[185px] bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl py-2 animate-in fade-in zoom-in-95 duration-100 select-none cursor-default"
    >
      {/* Node Info Header */}
      <div className="px-3 py-2 flex flex-col gap-0.5 border-b border-zinc-800/50 mb-1">
        <span className={`text-[9px] font-bold uppercase tracking-wider ${scheme.text}`}>
          {scheme.label}
        </span>
        <span className="text-xs font-semibold text-zinc-300 truncate max-w-[150px]" title={nodeLabel}>
          {nodeLabel}
        </span>
      </div>

      {/* Action Items */}
      <div className="px-1 flex flex-col gap-0.5">
        <button
          onClick={() => onEdit(id)}
          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 flex items-center gap-2.5 transition-all duration-150 rounded-lg cursor-pointer group"
        >
          <Edit2 size={13.5} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          <span>Edit Title</span>
        </button>
        <button
          onClick={handleElevate}
          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 flex items-center gap-2.5 transition-all duration-150 rounded-lg cursor-pointer group"
        >
          <ArrowUp size={13.5} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
          <span>Levitate Higher (+Z)</span>
        </button>
        <button
          onClick={handleDescend}
          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-zinc-400 hover:text-blue-400 hover:bg-blue-500/10 flex items-center gap-2.5 transition-all duration-150 rounded-lg cursor-pointer group"
        >
          <ArrowDown size={13.5} className="text-zinc-500 group-hover:text-blue-400 transition-colors" />
          <span>Descend Lower (-Z)</span>
        </button>
        <button
          onClick={() => onDelete(id)}
          className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 transition-all duration-150 rounded-lg cursor-pointer group"
        >
          <Trash2 size={13.5} className="text-zinc-500 group-hover:text-red-400 transition-colors" />
          <span>Delete Node</span>
        </button>
      </div>
    </div>
  );
}
