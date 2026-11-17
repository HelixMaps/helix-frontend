"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lightbulb, CheckSquare, Link2, Plus, GripVertical, ChevronDown, Sparkles } from "lucide-react";

const nodeTypes = [
  {
    type: "idea",
    label: "Idea Node",
    icon: Lightbulb,
    colorClass: "text-blue-400 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-400/50 shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_#18181b,inset_0_1px_0_rgba(255,255,255,0.15)]",
    iconColor: "text-blue-300 bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30",
  },
  {
    type: "task",
    label: "Task Node",
    icon: CheckSquare,
    colorClass: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-400/50 shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_#18181b,inset_0_1px_0_rgba(255,255,255,0.15)]",
    iconColor: "text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-400/30",
  },
  {
    type: "resource",
    label: "Resource Node",
    icon: Link2,
    colorClass: "text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 hover:border-amber-400/50 shadow-[0_4px_12px_rgba(0,0,0,0.5),0_1px_0_#18181b,inset_0_1px_0_rgba(255,255,255,0.15)]",
    iconColor: "text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border-amber-400/30",
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
      {/* 3D Elevated Capsule Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-5 py-2.5 bg-gradient-to-b from-zinc-900 to-zinc-950 hover:from-zinc-850 hover:to-zinc-900 border border-zinc-700/80 rounded-full flex items-center gap-3 cursor-pointer active:translate-y-0.5 transition-all duration-150 text-xs font-bold text-zinc-200 tracking-wide"
        style={{
          boxShadow: isOpen
            ? "0 2px 0 0 #18181b, 0 6px 14px -2px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.25)"
            : "0 4px 0 0 #18181b, 0 12px 24px -4px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-blue-400" />
          <span>Add Node</span>
        </span>
        <ChevronDown
          size={14}
          className={`text-zinc-400 transition-transform duration-300 ${isOpen ? "rotate-180 text-zinc-100" : ""}`}
        />
      </button>

      {/* 3D Floating Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute top-14 backdrop-blur-xl bg-zinc-950/95 border border-zinc-800/90 rounded-2xl p-3.5 flex flex-row gap-3 items-center whitespace-nowrap animate-in fade-in slide-in-from-top-3 duration-200"
          style={{
            boxShadow:
              "0 4px 0 0 #18181b, 0 24px 48px -8px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          {nodeTypes.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.type}
                draggable
                onDragStart={(event) => onDragStart(event, item.type)}
                className={`group flex items-center gap-3 border rounded-xl px-3.5 py-2.5 cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-0.5 ${item.colorClass}`}
              >
                {/* Drag Handle */}
                <GripVertical size={13} className="text-zinc-500 group-hover:text-zinc-300 transition-colors" />

                {/* Node Type Label */}
                <div className="flex items-center gap-2">
                  <Icon size={14} />
                  <span className="text-xs font-semibold text-zinc-100">{item.label}</span>
                </div>

                {/* Direct Click Spawner */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddNode(item.type);
                  }}
                  className={`p-1.5 rounded-lg border cursor-pointer shadow-md hover:scale-110 active:scale-95 transition-all ${item.iconColor}`}
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
