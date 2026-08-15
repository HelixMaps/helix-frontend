import React, { useEffect, useRef } from "react";
import { X, Lightbulb, CheckSquare, Link2, FileText } from "lucide-react";

export default function DetailsDrawer({ node, onClose, onUpdateData }) {
  const drawerRef = useRef(null);

  // Close the drawer when clicking outside it (but not if clicking on another node)
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
    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, [onClose]);

  if (!node) return null;

  const nodeType = node.type || "idea";
  const title = node.data?.label || "";
  const summary = node.data?.summary || "";

  // Styling configs for node types
  const typeConfig = {
    idea: {
      text: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      icon: Lightbulb,
      label: "Idea Node",
    },
    task: {
      text: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      icon: CheckSquare,
      label: "Task Node",
    },
    resource: {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      icon: Link2,
      label: "Resource Node",
    },
  };

  const config = typeConfig[nodeType] || {
    text: "text-zinc-400",
    bg: "bg-zinc-500/10",
    border: "border-zinc-500/20",
    icon: FileText,
    label: "Node Detail",
  };

  const Icon = config.icon;

  return (
    <div
      ref={drawerRef}
      className="fixed top-0 right-0 h-full w-[380px] bg-zinc-950/95 border-l border-zinc-800/80 backdrop-blur-md shadow-2xl z-40 flex flex-col transition-all duration-300 ease-in-out animate-in slide-in-from-right duration-300"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/40 select-none">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.bg} ${config.text} border ${config.border}`}>
            <Icon size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">{config.label}</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
          title="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6 scrollbar-thin">
        {/* Title Edit Block */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 select-none">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onUpdateData(node.id, { label: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full bg-zinc-900/40 hover:bg-zinc-900/60 focus:bg-zinc-900/80 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all duration-150"
            placeholder="Enter title..."
          />
        </div>

        {/* Summary Edit Block */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 select-none">
            Summary & Notes
          </label>
          <textarea
            value={summary}
            onChange={(e) => onUpdateData(node.id, { summary: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            className="w-full flex-1 bg-zinc-900/40 hover:bg-zinc-900/60 focus:bg-zinc-900/80 border border-zinc-800 focus:border-zinc-700 rounded-xl px-3.5 py-3 text-sm text-zinc-300 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-700 resize-none transition-all duration-150 min-h-[300px] leading-relaxed scrollbar-thin"
            placeholder="Write some details, summaries, or rich notes about this node here..."
          />
        </div>
      </div>
    </div>
  );
}
