"use client";

import React, { useState } from "react";
import {
  Lightbulb,
  CheckSquare,
  Link2,
  Box,
  Grid,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Wand2,
  Share2,
  Download,
  Users,
  Eye,
  Building2,
} from "lucide-react";
import { useMapConfig } from "@/context/MapConfigContext";
import { useReactFlow } from "@xyflow/react";
import { layoutNodesHierarchical } from "@/utils/autoLayout";

export default function SpatialCommandDeck({
  onAddNode,
  onShare,
  onExport,
  onOpenTeam,
  membersCount,
  isReadOnly = false,
}) {
  const { viewMode, changeViewMode } = useMapConfig();
  const { getNodes, getEdges, setNodes, fitView, zoomIn, zoomOut } = useReactFlow();
  const [isOrganizing, setIsOrganizing] = useState(false);

  const is3DActive = viewMode !== "2d" && viewMode !== "3d-topdown";
  const is2DActive = viewMode === "2d" || viewMode === "3d-topdown";

  const handleSwitchView = (mode) => {
    changeViewMode(mode);
    if (mode === "3d-closeup") {
      const allNodes = getNodes();
      const selected = allNodes.find((n) => n.selected) || allNodes[0];
      if (selected) {
        fitView({ nodes: [{ id: selected.id }], padding: 0.7, maxZoom: 1.8, duration: 600 });
      }
    } else if (mode === "3d-street") {
      fitView({ padding: 0.35, duration: 600 });
    } else if (mode === "3d") {
      fitView({ padding: 0.35, duration: 600 });
    }
  };

  const handleAutoLayout = () => {
    if (isReadOnly) return;
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
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 select-none pointer-events-auto max-w-[95vw]">
      {/* ── Stealth Matte Obsidian Dock ── */}
      <div
        className="flex items-center gap-1.5 px-2.5 py-2 rounded-2xl border border-white/[0.07] bg-[#090A0D]/90 backdrop-blur-xl transition-all duration-200"
        style={{
          boxShadow:
            "inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 16px 36px -8px rgba(0, 0, 0, 0.85)",
        }}
      >
        {!isReadOnly ? (
          <>
            {/* ── 1. Node Spawners ── */}
            <div className="flex items-center gap-1 pr-2 border-r border-white/[0.06]">
              <button
                onClick={() => onAddNode("idea")}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-100 text-xs font-medium cursor-pointer active:scale-95 transition-all"
                title="Spawn Idea Node"
              >
                <Lightbulb size={13} className="text-blue-400/75 group-hover:text-blue-400 transition-colors" />
                <span className="hidden sm:inline">Idea</span>
              </button>

              <button
                onClick={() => onAddNode("task")}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-100 text-xs font-medium cursor-pointer active:scale-95 transition-all"
                title="Spawn Task Node"
              >
                <CheckSquare size={13} className="text-emerald-400/75 group-hover:text-emerald-400 transition-colors" />
                <span className="hidden sm:inline">Task</span>
              </button>

              <button
                onClick={() => onAddNode("resource")}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-100 text-xs font-medium cursor-pointer active:scale-95 transition-all"
                title="Spawn Resource Node"
              >
                <Link2 size={13} className="text-amber-400/75 group-hover:text-amber-400 transition-colors" />
                <span className="hidden sm:inline">Resource</span>
              </button>
            </div>

            {/* ── 2. Auto-Organize ── */}
            <button
              onClick={handleAutoLayout}
              disabled={isOrganizing}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-100 text-xs font-medium cursor-pointer active:scale-95 transition-all"
              title="Auto-organize nodes into hierarchical layout"
            >
              <Wand2
                size={13}
                className={`text-zinc-400 group-hover:text-zinc-200 transition-transform ${
                  isOrganizing ? "animate-spin" : ""
                }`}
              />
              <span className="hidden md:inline">Organize</span>
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 pr-2.5 border-r border-white/[0.06]">
            <span className="flex items-center gap-1.5 text-[11px] font-mono tracking-wider uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/25">
              <Eye size={12} className="text-amber-400" />
              <span>View Only</span>
            </span>
          </div>
        )}

        {/* ── 3. Segmented 2D / 3D Orbit / Street / Closeup Switcher ── */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-black/50 border border-white/[0.05]">
          <button
            onClick={() => handleSwitchView("2d")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              viewMode === "2d" || viewMode === "3d-topdown"
                ? "bg-white/[0.08] text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="2D Top-Down Canvas Grid"
          >
            <Grid size={13} className={viewMode === "2d" || viewMode === "3d-topdown" ? "text-cyan-400/90" : "text-zinc-500"} />
            <span>2D</span>
          </button>

          <button
            onClick={() => handleSwitchView("3d")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              viewMode === "3d" || viewMode === "3d-perspective"
                ? "bg-white/[0.08] text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="3D Spatial Perspective Orbit"
          >
            <Box size={13} className={viewMode === "3d" || viewMode === "3d-perspective" ? "text-emerald-400/90" : "text-zinc-500"} />
            <span>3D</span>
          </button>

          <button
            onClick={() => handleSwitchView("3d-street")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              viewMode === "3d-street"
                ? "bg-blue-600/25 text-blue-200 border border-blue-500/30"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Street View: Low-angle ground level perspective looking up at buildings"
          >
            <Building2 size={13} className={viewMode === "3d-street" ? "text-blue-400" : "text-zinc-500"} />
            <span className="hidden sm:inline">Street</span>
          </button>

          <button
            onClick={() => handleSwitchView("3d-closeup")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
              viewMode === "3d-closeup"
                ? "bg-amber-600/25 text-amber-200 border border-amber-500/30"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            title="Closeup View: Inspect building architecture up close"
          >
            <Eye size={13} className={viewMode === "3d-closeup" ? "text-amber-400" : "text-zinc-500"} />
            <span className="hidden sm:inline">Closeup</span>
          </button>
        </div>

        {/* ── 4. Camera Controls ── */}
        <div className="flex items-center gap-0.5 pl-1.5 border-l border-white/[0.06]">
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] cursor-pointer active:scale-90 transition-all"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => zoomOut({ duration: 300 })}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] cursor-pointer active:scale-90 transition-all"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={handleResetCamera}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] cursor-pointer active:scale-90 transition-all"
            title="Fit View & Center Map"
          >
            <Maximize2 size={14} />
          </button>
        </div>

        {/* ── 5. Subtle Team, Export & Share Actions ── */}
        {(onOpenTeam || onShare || onExport) && (
          <div className="flex items-center gap-1 pl-1.5 border-l border-white/[0.06]">
            {onOpenTeam && (
              <button
                onClick={onOpenTeam}
                className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-cyan-200 text-xs font-medium cursor-pointer active:scale-95 transition-all"
                title="Team Members & Project Access"
              >
                <Users size={13} className="text-cyan-400/80 group-hover:text-cyan-300 transition-colors" />
                <span className="hidden md:inline">Team</span>
                {typeof membersCount === "number" && membersCount > 0 && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
                    {membersCount}
                  </span>
                )}
              </button>
            )}

            {onExport && (
              <button
                onClick={onExport}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] text-zinc-400 hover:text-zinc-100 text-xs font-medium cursor-pointer active:scale-95 transition-all"
                title="Export Snapshot (PNG, JPEG, PDF)"
              >
                <Download size={13} />
                <span className="hidden md:inline">Export</span>
              </button>
            )}

            {onShare && (
              <button
                onClick={onShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.08] text-zinc-200 hover:text-white text-xs font-medium cursor-pointer active:scale-95 transition-all"
                title="Share Mind Map"
              >
                <Share2 size={13} />
                <span className="hidden md:inline">Share</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}