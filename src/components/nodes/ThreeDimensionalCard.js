"use client";

import React, { useState, useCallback } from "react";
import { Position, useReactFlow } from "@xyflow/react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useMapConfig } from "@/context/MapConfigContext";
import ThreeDimensionalHandle from "./ThreeDimensionalHandle";
import { Plus, Check, Clock, Circle, Sparkles, ChevronUp, ChevronDown } from "lucide-react";

/**
 * ThreeDimensionalCard
 * Professional, sleek 3D spatial node:
 * - Crystalline obsidian glass with frosted backdrop blur and specular bevel
 * - Chamfered 3D titanium extrusion and multi-layer ambient floor shadow
 * - Interactive 3D hover levitation and cursor tilt parallax
 * - One-click Quick Sprout ("+") to instantly branch a child node
 * - Interactive task status toggle (Todo -> In Progress -> Completed)
 */
export default function ThreeDimensionalCard({
  id,
  type = "idea",
  label = "",
  typeLabel = "Idea",
  icon: Icon,
  accentColor = "blue",
  isEditing = false,
  selected = false,
  elevation = 40,
  children,
  onLabelChange,
  onLabelBlur,
  onLabelKeyDown,
}) {
  const { nodeShape, viewMode } = useMapConfig();
  const { setNodes, setEdges } = useReactFlow();
  const is2D = viewMode === "2d" || viewMode === "3d-topdown";

  // Interactive 3D tilt with smooth mouse tracking
  const { cardRef, tilt, handlers } = use3DTilt({ maxTilt: 8, scale: 1.02 });

  // Node Shape Geometry (Thicker, substantial brick slab proportions)
  const shapeGeometry = {
    rounded: "rounded-2xl px-5 py-4",
    pill: "rounded-full px-6 py-3.5",
    sharp: "rounded-none px-5 py-4",
    leaf: "rounded-[24px_6px_24px_6px] px-5 py-4",
    asymmetric: "rounded-[6px_24px_6px_24px] px-5 py-4",
  };
  const activeShapeClass = shapeGeometry[nodeShape] || shapeGeometry.rounded;

  // Theme palettes
  const themeConfig = {
    blue: {
      accent: "#3b82f6",
      accentLight: "#93c5fd",
      accentDark: "#1d4ed8",
      floorGlow: "rgba(59, 130, 246, 0.4)",
      floorGlowHover: "rgba(59, 130, 246, 0.7)",
      tagColor: "text-blue-400",
      powerRail: "bg-blue-500",
      borderSelected: "border-blue-400 ring-2 ring-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.35)]",
      borderResting: "border-zinc-700/80 hover:border-zinc-500",
      badgeGradient: "from-blue-500/25 via-blue-600/15 to-transparent",
      badgeBorder: "border-blue-400/40",
      sproutBg: "bg-blue-600 hover:bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]",
    },
    emerald: {
      accent: "#10b981",
      accentLight: "#6ee7b7",
      accentDark: "#047857",
      floorGlow: "rgba(16, 185, 129, 0.4)",
      floorGlowHover: "rgba(16, 185, 129, 0.7)",
      tagColor: "text-emerald-400",
      powerRail: "bg-emerald-500",
      borderSelected: "border-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.35)]",
      borderResting: "border-zinc-700/80 hover:border-zinc-500",
      badgeGradient: "from-emerald-500/25 via-emerald-600/15 to-transparent",
      badgeBorder: "border-emerald-400/40",
      sproutBg: "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]",
    },
    amber: {
      accent: "#f59e0b",
      accentLight: "#fde68a",
      accentDark: "#b45309",
      floorGlow: "rgba(245, 158, 11, 0.4)",
      floorGlowHover: "rgba(245, 158, 11, 0.7)",
      tagColor: "text-amber-400",
      powerRail: "bg-amber-500",
      borderSelected: "border-amber-400 ring-2 ring-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.35)]",
      borderResting: "border-zinc-700/80 hover:border-zinc-500",
      badgeGradient: "from-amber-500/25 via-amber-600/15 to-transparent",
      badgeBorder: "border-amber-400/40",
      sproutBg: "bg-amber-600 hover:bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]",
    },
  };
  const theme = themeConfig[accentColor] || themeConfig.blue;

  // Task Status Toggle state (todo -> in-progress -> done)
  const [taskStatus, setTaskStatus] = useState("todo"); // 'todo', 'in_progress', 'completed'

  const handleCycleTaskStatus = useCallback((e) => {
    e.stopPropagation();
    setTaskStatus((prev) => {
      if (prev === "todo") return "in_progress";
      if (prev === "in_progress") return "completed";
      return "todo";
    });
  }, []);

  // Quick Sprout: Spawn a connected child node instantly
  const handleQuickSprout = useCallback(
    (e, childType = type) => {
      e.stopPropagation();
      const newId = `${childType}-${Date.now()}`;

      setNodes((nds) => {
        const parent = nds.find((n) => n.id === id);
        const parentPos = parent ? parent.position : { x: 250, y: 150 };

        // Position child slightly to the right with slight vertical offset
        const childNode = {
          id: newId,
          type: childType,
          position: {
            x: parentPos.x + 280,
            y: parentPos.y + (Math.random() * 80 - 40),
          },
          data: {
            label: `New ${childType.charAt(0).toUpperCase() + childType.slice(1)}`,
            elevation: parent?.data?.elevation || 45,
          },
        };
        return nds.concat(childNode);
      });

      // Automatically connect parent to child with 3D edge
      setEdges((eds) =>
        eds.concat({
          id: `edge-${id}-${newId}`,
          source: id,
          target: newId,
          type: "threeDimensional",
          animated: true,
          style: { stroke: theme.accent, strokeWidth: 2.5 },
        })
      );
    },
    [id, type, theme.accent, setNodes, setEdges]
  );

  // Physical 3D Elevation: Node floats off the floor according to its elevation value
  const slabElevation = is2D ? 0 : Math.round(26 + (elevation || 40) * 0.35);
  const activeElevation = is2D
    ? 0
    : tilt.isHovered
    ? slabElevation + 16
    : selected
    ? slabElevation + 6
    : slabElevation;

  return (
    <div
      className="relative select-none"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. GROUND PROJECTION SHADOW & UNDERGLOW (Floor plane at Z=0)
          Provides real 3D parallax proof that the slab is floating high above!
         ───────────────────────────────────────────────────────────── */}
      {!is2D && (
        <div
          className="absolute inset-x-2 -bottom-3 h-12 pointer-events-none transition-all duration-300 rounded-full"
          style={{
            transform: "translateZ(0px)",
            background: `radial-gradient(ellipse at center, rgba(0, 0, 0, ${
              tilt.isHovered ? 0.85 : 0.7
            }) 0%, ${theme.floorGlow} 40%, transparent 75%)`,
            filter: `blur(${tilt.isHovered ? 14 : 10}px)`,
            opacity: tilt.isHovered ? 0.95 : 0.8,
            transformOrigin: "center center",
            transform: `scale(${tilt.isHovered ? 1.12 : 1}) translate(0, ${Math.round(
              activeElevation * 0.22
            )}px)`,
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. ELEVATED SOLID MONOLITHIC SLAB (Hovering at Z=activeElevation)
         ───────────────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        onMouseMove={handlers.onMouseMove}
        onMouseLeave={handlers.onMouseLeave}
        className={`group relative min-w-[215px] cursor-pointer ${activeShapeClass} transition-all duration-200 border-[1.5px] ${
          selected ? theme.borderSelected : "border-zinc-600/70 hover:border-zinc-400"
        }`}
        style={{
          background:
            "linear-gradient(150deg, #2b2d37 0%, #202129 55%, #15161e 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          transformStyle: "preserve-3d",
          transform: is2D
            ? "none"
            : tilt.isHovered
            ? `translateY(-6px) translateZ(${activeElevation}px) rotateX(${tilt.x * 0.7}deg) rotateY(${tilt.y * 0.7}deg)`
            : selected
            ? `translateY(-2px) translateZ(${activeElevation}px)`
            : `translateY(0px) translateZ(${activeElevation}px)`,
          boxShadow: is2D
            ? selected
              ? `0 0 0 2px ${theme.accent}, 0 4px 14px rgba(0, 0, 0, 0.7), 0 0 16px ${theme.floorGlow}`
              : "0 2px 4px rgba(0, 0, 0, 0.5), 0 8px 18px rgba(0, 0, 0, 0.45)"
            : `
              /* Top micro-chamfer specular highlight */
              inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.4),
              /* Bottom inner bevel depth */
              inset 0 -2px 4px 0 rgba(0, 0, 0, 0.7),
              /* Solid 4px machined slab sidewall bevels */
              0 1px 0 0 #464856,
              0 2px 0 0 #363844,
              0 3px 0 0 #272832,
              0 4px 0 0 #1b1c23,
              /* Floating ambient drop shadow */
              0 8px 22px -2px rgba(0, 0, 0, 0.7),
              0 16px 36px -4px rgba(0, 0, 0, 0.55),
              0 0 16px ${theme.floorGlow}
            `,
        }}
      >
        {/* Micro-chamfer Top Catch Line */}
        <div className="pointer-events-none absolute top-0 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-white/45 to-transparent z-10" />

        {/* Illuminated Left Edge Power Rail */}
        <div
          className={`absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full ${theme.powerRail} transition-all duration-300 z-10`}
          style={{
            boxShadow: `0 0 10px ${theme.accent}`,
          }}
        />

        {/* Dynamic Specular Sheen (Follows cursor) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300 z-10"
          style={{
            opacity: tilt.isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.04) 45%, transparent 70%)`,
          }}
        />

        {/* Target Connection Handles */}
        <ThreeDimensionalHandle
          type="target"
          position={Position.Left}
          id="target-left"
          accentColor={accentColor}
        />
        <ThreeDimensionalHandle
          type="target"
          position={Position.Top}
          id="target-top"
          accentColor={accentColor}
        />

        {/* Main Card Content */}
        <div
          className="flex items-center gap-3.5 relative z-20"
          style={{ transform: "translateZ(14px)", transformStyle: "preserve-3d" }}
        >
          {/* Floating Icon Prism OR Interactive Task Checkbox */}
          {type === "task" ? (
            <button
              onClick={handleCycleTaskStatus}
              className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 cursor-pointer transition-all duration-200 active:scale-95 ${
                taskStatus === "completed"
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                  : taskStatus === "in_progress"
                  ? "bg-amber-500/20 text-amber-300 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]"
                  : "bg-zinc-800/80 text-zinc-400 border-zinc-700 hover:border-zinc-500"
              }`}
              style={{
                transform: "translateZ(16px)",
                boxShadow: `0 4px 10px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.35)`,
              }}
              title="Click to toggle status: Todo -> In Progress -> Done"
            >
              {taskStatus === "completed" ? (
                <Check size={16} className="stroke-[3]" />
              ) : taskStatus === "in_progress" ? (
                <Clock size={16} className="animate-spin" style={{ animationDuration: "8s" }} />
              ) : (
                <Circle size={16} className="stroke-[2.5]" />
              )}
            </button>
          ) : (
            <div
              className={`p-2.5 rounded-xl bg-gradient-to-br ${theme.badgeGradient} ${theme.tagColor} border ${theme.badgeBorder} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
              style={{
                transform: "translateZ(16px)",
                boxShadow: `0 4px 10px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 0 16px ${theme.floorGlow}`,
              }}
            >
              {Icon && <Icon size={18} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" />}
            </div>
          )}

          {/* Text Content */}
          <div className="flex flex-col min-w-0 flex-1 pr-1">
            {/* Header Telemetry Row */}
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span
                className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.tagColor} select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]`}
              >
                {type === "task"
                  ? taskStatus === "completed"
                    ? "Completed"
                    : taskStatus === "in_progress"
                    ? "In Progress"
                    : "Todo"
                  : typeLabel}
              </span>

              {/* Elevated Altitude Pill */}
              <span
                className="px-1.5 py-0.5 rounded-md bg-zinc-900/90 border border-zinc-700/70 text-[8px] font-mono text-zinc-300 font-bold shadow-sm"
                title={`3D Elevation: ${elevation}m`}
              >
                +{elevation}m
              </span>
            </div>

            {/* Title / Editor */}
            {isEditing ? (
              <input
                type="text"
                value={label}
                onChange={onLabelChange}
                onBlur={onLabelBlur}
                onKeyDown={onLabelKeyDown}
                className="nodrag bg-zinc-900/90 border border-zinc-700 rounded-md px-2 py-0.5 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-blue-500 w-full shadow-inner"
                placeholder={`Enter ${typeLabel.toLowerCase()}...`}
                autoFocus
              />
            ) : (
              <span
                className={`text-sm font-semibold text-zinc-100 truncate select-none tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)] ${
                  type === "task" && taskStatus === "completed"
                    ? "line-through text-zinc-400"
                    : ""
                }`}
                title={label}
              >
                {label || `New ${typeLabel}`}
              </span>
            )}

            {children}
          </div>
        </div>

        {/* Source Connection Handles */}
        <ThreeDimensionalHandle
          type="source"
          position={Position.Right}
          id="source-right"
          accentColor={accentColor}
        />
        <ThreeDimensionalHandle
          type="source"
          position={Position.Bottom}
          id="source-bottom"
          accentColor={accentColor}
        />

        {/* ─────────────────────────────────────────────────────────────
            2. ONE-CLICK QUICK SPROUT BUTTON ("+")
            Floats on the right edge on hover/selection to spawn branches
           ───────────────────────────────────────────────────────────── */}
        <button
          onClick={(e) => handleQuickSprout(e, type)}
          className={`absolute -right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-white cursor-pointer transition-all duration-200 z-30 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-75 hover:!scale-125 ${theme.sproutBg}`}
          title="Quick Sprout: Click to branch a child node instantly"
        >
          <Plus size={11} className="stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
