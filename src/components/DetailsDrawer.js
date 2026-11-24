import React, { useEffect, useRef } from "react";
import { X, Lightbulb, CheckSquare, Link2, FileText, Layers } from "lucide-react";

export default function DetailsDrawer({ node, onClose, onUpdateData, isReadOnly = false }) {
  const drawerRef = useRef(null);

  const handleUpdate = (id, data) => {
    if (isReadOnly) return;
    onUpdateData(id, data);
  };

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
  const elevation = node.data?.elevation || 45;

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
      className="fixed top-0 right-0 h-full w-[380px] bg-zinc-950/95 border-l border-zinc-700/80 backdrop-blur-2xl shadow-[-24px_0_60px_rgba(0,0,0,0.95)] z-40 flex flex-col transition-all duration-300 ease-in-out animate-in slide-in-from-right duration-300"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/40 select-none">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${config.bg} ${config.text} border ${config.border}`}>
            <Icon size={16} />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">{config.label}</span>
          {isReadOnly && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
              Read Only
            </span>
          )}
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
            readOnly={isReadOnly}
            disabled={isReadOnly}
            onChange={(e) => handleUpdate(node.id, { label: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            className={`w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-zinc-100 placeholder-zinc-600 transition-all duration-150 ${
              isReadOnly
                ? "cursor-default opacity-85 select-text"
                : "hover:bg-zinc-900/60 focus:bg-zinc-900/80 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            }`}
            placeholder={isReadOnly ? "Untitled" : "Enter title..."}
          />
        </div>

        {/* 3D Spatial Elevation Control */}
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80 shadow-inner">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 select-none flex items-center gap-1.5 font-mono">
              <Layers size={13} className="text-blue-400" />
              <span>3D Spatial Altitude</span>
            </label>
            <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              +{elevation}m
            </span>
          </div>

          <input
            type="range"
            min="15"
            max="120"
            step="5"
            value={elevation}
            disabled={isReadOnly}
            onChange={(e) => handleUpdate(node.id, { elevation: Number(e.target.value) })}
            className={`w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-lg appearance-none mt-1 ${
              isReadOnly ? "cursor-default opacity-60" : "cursor-pointer"
            }`}
          />

          <div className="grid grid-cols-4 gap-1.5 mt-1">
            {[
              { label: "Ground", val: 15 },
              { label: "Low", val: 40 },
              { label: "Mid", val: 70 },
              { label: "Apex", val: 105 },
            ].map((preset) => (
              <button
                key={preset.label}
                disabled={isReadOnly}
                onClick={() => handleUpdate(node.id, { elevation: preset.val })}
                className={`py-1 text-[10px] font-mono font-bold rounded-lg border transition-all ${
                  isReadOnly ? "cursor-default opacity-60" : "cursor-pointer"
                } ${
                  elevation === preset.val
                    ? "bg-blue-600 border-blue-400 text-white shadow-sm"
                    : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Edit Block */}
        <div className="flex flex-col gap-2 flex-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 select-none">
            Summary & Notes
          </label>
          <textarea
            value={summary}
            readOnly={isReadOnly}
            disabled={isReadOnly}
            onChange={(e) => handleUpdate(node.id, { summary: e.target.value })}
            onKeyDown={(e) => e.stopPropagation()}
            className={`w-full flex-1 bg-zinc-900/40 border border-zinc-800 rounded-xl px-3.5 py-3 text-sm text-zinc-300 placeholder-zinc-600 resize-none transition-all duration-150 min-h-[300px] leading-relaxed scrollbar-thin ${
              isReadOnly
                ? "cursor-default opacity-85 select-text"
                : "hover:bg-zinc-900/60 focus:bg-zinc-900/80 focus:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-700"
            }`}
            placeholder={isReadOnly ? "No notes available for this node." : "Write some details, summaries, or rich notes about this node here..."}
          />
        </div>
      </div>
    </div>
  );
}
