import React, { useState, useEffect, useRef } from "react";
import { Lightbulb, CheckSquare, Link2, Plus, GripVertical, ChevronDown } from "lucide-react";

const nodeTypes = [
  {
    type: "idea",
    label: "Idea Node",
    icon: Lightbulb,
    colorClass: "text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/30",
    iconColor: "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20",
  },
  {
    type: "task",
    label: "Task Node",
    icon: CheckSquare,
    colorClass: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30",
    iconColor: "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20",
  },
  {
    type: "resource",
    label: "Resource Node",
    icon: Link2,
    colorClass: "text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/30",
    iconColor: "text-amber-400 bg-amber-500/10 hover:bg-amber-500/20",
  },
];

export default function NodePicker({ onAddNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside, true);
    document.addEventListener("touchstart", handleClickOutside, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      document.removeEventListener("touchstart", handleClickOutside, true);
    };
  }, []);

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-center select-none">
      {/* Tiny Rounded Capsule Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-2.5 bg-zinc-950/90 hover:bg-zinc-900 border border-zinc-800 rounded-full flex items-center gap-3 cursor-pointer shadow-2xl hover:border-zinc-700 active:scale-95 transition-all duration-200 text-xs font-bold text-zinc-300 tracking-wide"
      >
        <span>Add Nodes</span>
        <ChevronDown
          size={14}
          className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180 text-zinc-300" : ""}`}
        />
      </button>

      {/* Wide Horizontal Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-14 backdrop-blur-md bg-zinc-950/95 border border-zinc-800/80 rounded-2xl p-3.5 shadow-2xl flex flex-row gap-3 items-center whitespace-nowrap animate-in fade-in slide-in-from-top-3 duration-200">
          {nodeTypes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                draggable
                onDragStart={(event) => onDragStart(event, item.type)}
                className={`group flex items-center gap-3 border rounded-xl px-3 py-2 cursor-grab active:cursor-grabbing transition-all duration-200 ${item.colorClass}`}
              >
                {/* Drag Handle */}
                <GripVertical size={13} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                
                {/* Node Type Label */}
                <div className="flex items-center gap-2">
                  <Icon size={14} />
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-zinc-100">{item.label}</span>
                </div>

                {/* Direct Click Spawner */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNode(item.type);
                  }}
                  className={`p-1.5 rounded-lg border border-zinc-800/50 cursor-pointer shadow-sm hover:scale-[1.05] transition-transform ${item.iconColor}`}
                  title={`Spawn ${item.type} node`}
                >
                  <Plus size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
