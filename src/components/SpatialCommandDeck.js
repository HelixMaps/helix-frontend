"use client";

import React, { useState } from "react";
import { 
  Lightbulb, 
  CheckSquare, 
  Link2, 
  Box, 
  Grid, 
  Eye, 
  Sparkles, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Wand2,
  Share2,
  ChevronDown
} from "lucide-react";
import { useMapConfig } from "@/context/MapConfigContext";
import { useReactFlow } from "@xyflow/react";
import { layoutNodesHierarchical } from "@/utils/autoLayout";

/**
 * SpatialCommandDeck
 * Centered floating HUD dock at the bottom of the canvas:
 * - Guaranteed high z-index (z-50) so it NEVER clips or hides behind sidebars
 * - Quick Node Spawners: Idea, Task, Resource
 * - One-click "Auto-Organize Matrix" layout
 * - 3D View Mode Switcher: 3D Matrix, Isometric, Clean Studio
 * - Camera controls: Fit View, Zoom +, Zoom -
 */
export default function SpatialCommandDeck({ onAddNode, onShare }) {
  const { viewMode, changeViewMode } = useMapConfig();
  const { getNodes, getEdges, setNodes, fitView, zoomIn, zoomOut } = useReactFlow();
  const [isOrganizing, setIsOrganizing] = useState(false);

  // Auto-Layout trigger
  const handleAutoLayout = () => {
    setIsOrganizing(true);
    const currentNodes = getNodes();
    const currentEdges = getEdges();
    const { nodes: layouted } = layoutNodesHierarchical(currentNodes, currentEdges);
    setNodes(layouted);

    setTimeout(() => {
      fitView({ padding: 0.35, duration: 600 });
      setIsOrganizing(false);
    }, 100);
  };

  const handleResetCamera = () => {
    fitView({ padding: 0.35, duration: 600 });
  };


  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 select-none pointer-events-auto">
      {/* ── UNIFIED SPATIAL COMMAND ISLAND ── */}
      <div
        className="flex items-center gap-2 px-3 py-2 bg-zinc-900/95 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl transition-all duration-300"
        style={{
          boxShadow:
            "0 4px 0 0 #18181b, 0 20px 48px -4px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {/* Quick Node Spawners */}
        <div className="flex items-center gap-1 pr-2 border-r border-zinc-800">
          <button
            onClick={() => onAddNode("idea")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
            title="Create new Idea Node"
          >
            <Lightbulb size={13} className="text-blue-400" />
            <span className="hidden sm:inline">Idea</span>
          </button>

          <button
            onClick={() => onAddNode("task")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
            title="Create new Task Node"
          >
            <CheckSquare size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">Task</span>
          </button>

          <button
            onClick={() => onAddNode("resource")}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-sm"
            title="Create new Resource Node"
          >
            <Link2 size={13} className="text-amber-400" />
            <span className="hidden sm:inline">Resource</span>
          </button>
        </div>

        {/* Auto-Organize Magic Button */}
        <button
          onClick={handleAutoLayout}
          disabled={isOrganizing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-200 hover:text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all"
          title="Auto-organize nodes into clean hierarchical layout"
        >
          <Wand2 size={13} className={`text-indigo-400 ${isOrganizing ? "animate-spin" : ""}`} />
          <span className="hidden md:inline">Organize</span>
        </button>

        {/* Futuristic Share Button */}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/35 border border-blue-500/40 text-blue-300 hover:text-white text-xs font-semibold cursor-pointer active:scale-95 transition-all shadow-[0_0_12px_rgba(59,130,246,0.25)]"
            title="Share this Mind Map (Generate universal link)"
          >
            <Share2 size={13} className="text-blue-400" />
            <span className="hidden md:inline">Share</span>
          </button>
        )}

        {/* Spatial 3D / 2D Canvas Mode Segmented Pill */}
        <div className="flex items-center gap-0.5 bg-zinc-800/80 p-0.5 rounded-xl border border-zinc-700/60">
          <button
            onClick={() => changeViewMode("3d")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === "3d" || viewMode === "3d-perspective"
                ? "bg-zinc-700 text-white shadow-sm border border-zinc-600"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
            }`}
            title="3D Spatial Perspective View (Without Dots)"
          >
            <Box size={13} className={viewMode === "3d" || viewMode === "3d-perspective" ? "text-white" : "text-zinc-400"} />
            <span>3D Spatial</span>
          </button>

          <button
            onClick={() => changeViewMode("2d")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              viewMode === "2d" || viewMode === "3d-topdown"
                ? "bg-zinc-700 text-white shadow-sm border border-zinc-600"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
            }`}
            title="2D Dotted Canvas Grid"
          >
            <Eye size={13} className={viewMode === "2d" || viewMode === "3d-topdown" ? "text-white" : "text-zinc-400"} />
            <span>2D Canvas</span>
          </button>
        </div>

        {/* Camera Navigation: Zoom & Fit */}
        <div className="flex items-center border-l border-zinc-800 pl-2 gap-0.5">
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => zoomOut({ duration: 300 })}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer transition-colors"
            title="Fit View & Center Map"
          >
            <Maximize2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
