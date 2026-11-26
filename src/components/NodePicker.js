"use client";

import React from "react";
import { Plus } from "lucide-react";

export default function NodePicker({ onAddNode }) {
  const onDragStart = (event) => {
    event.dataTransfer.setData("application/reactflow", "default");
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* 3D Elevated Capsule Spawner Button */}
      <div
        draggable
        onDragStart={onDragStart}
        className="flex items-center bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-700/80 rounded-full overflow-hidden hover:border-zinc-500 cursor-grab active:cursor-grabbing transition-all duration-200"
        style={{
          boxShadow:
            "0 4px 0 0 #18181b, 0 12px 24px -4px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.25)",
        }}
      >
        <button
          onClick={() => onAddNode()}
          className="px-5 py-2.5 flex items-center gap-2 cursor-pointer active:translate-y-0.5 transition-all duration-150 text-xs font-bold text-zinc-200 tracking-wide hover:text-white"
          title="Click to add a node or drag onto canvas"
        >
          <Plus size={13} className="text-zinc-300" />
          <span>Add Node</span>
        </button>
      </div>
    </div>
  );
}
