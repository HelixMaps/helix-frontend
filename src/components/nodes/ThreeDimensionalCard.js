"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
import { Position } from "@xyflow/react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useMapConfig } from "@/context/MapConfigContext";
import ThreeDimensionalHandle from "./ThreeDimensionalHandle";
import { Check, Clock, Circle, Sparkles, ChevronUp, ChevronDown } from "lucide-react";

// Node Shape Geometry (Thicker, substantial brick slab proportions)
const SHAPE_GEOMETRY = {
  rounded: "rounded-2xl px-5 py-4",
  pill: "rounded-full px-6 py-3.5",
  sharp: "rounded-none px-5 py-4",
  leaf: "rounded-[24px_6px_24px_6px] px-5 py-4",
  asymmetric: "rounded-[6px_24px_6px_24px] px-5 py-4",
};

// Theme palettes
const THEME_CONFIG = {
  blue: {
    accent: "#3b82f6",
    accentLight: "#93c5fd",
    accentDark: "#1d4ed8",
    floorGlow: "rgba(59, 130, 246, 0.4)",
    floorGlowHover: "rgba(59, 130, 246, 0.7)",
    tagColor: "text-blue-400",
    powerRail: "bg-blue-500",
    borderSelected: "border-blue-400 ring-2 ring-blue-500/40",
    borderResting: "border-zinc-700/80 hover:border-zinc-500",
    badgeGradient: "from-blue-500/25 via-blue-600/15 to-transparent",
    badgeBorder: "border-blue-400/40",
  },
  emerald: {
    accent: "#10b981",
    accentLight: "#6ee7b7",
    accentDark: "#047857",
    floorGlow: "rgba(16, 185, 129, 0.4)",
    floorGlowHover: "rgba(16, 185, 129, 0.7)",
    tagColor: "text-emerald-400",
    powerRail: "bg-emerald-500",
    borderSelected: "border-emerald-400 ring-2 ring-emerald-500/40",
    borderResting: "border-zinc-700/80 hover:border-zinc-500",
    badgeGradient: "from-emerald-500/25 via-emerald-600/15 to-transparent",
    badgeBorder: "border-emerald-400/40",
  },
  amber: {
    accent: "#f59e0b",
    accentLight: "#fde68a",
    accentDark: "#b45309",
    floorGlow: "rgba(245, 158, 11, 0.4)",
    floorGlowHover: "rgba(245, 158, 11, 0.7)",
    tagColor: "text-amber-400",
    powerRail: "bg-amber-500",
    borderSelected: "border-amber-400 ring-2 ring-amber-500/40",
    borderResting: "border-zinc-700/80 hover:border-zinc-500",
    badgeGradient: "from-amber-500/25 via-amber-600/15 to-transparent",
    badgeBorder: "border-amber-400/40",
  },
};

/**
 * ThreeDimensionalCard
 * Professional, sleek 3D spatial node:
 * - Crystalline obsidian glass with frosted backdrop blur and specular bevel
 * - Chamfered 3D titanium extrusion and multi-layer ambient floor shadow
 * - Interactive 3D hover levitation and cursor tilt parallax
 * - One-click Quick Sprout ("+") to instantly branch a child node
 * - Interactive task status toggle (Todo -> In Progress -> Completed)
 */
function ThreeDimensionalCard({
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
  const is2D = viewMode === "2d" || viewMode === "3d-topdown";

  // Interactive 3D tilt with smooth mouse tracking
  const { cardRef, tilt, handlers } = use3DTilt({ maxTilt: 8, scale: 1.02 });

  const activeShapeClass = SHAPE_GEOMETRY[nodeShape] || SHAPE_GEOMETRY.rounded;
  const theme = THEME_CONFIG[accentColor] || THEME_CONFIG.blue;

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

  // 3D Brick Depth & Extruded Thickness Below Deck — memoized
  const brickBoxShadow = useMemo(() => {
    if (is2D) {
      return selected
        ? `0 0 0 2px ${theme.accent}, 0 4px 14px rgba(0, 0, 0, 0.7), 0 0 16px ${theme.floorGlow}`
        : "0 2px 0 0 #181920, 0 4px 12px rgba(0, 0, 0, 0.6), 0 8px 20px rgba(0, 0, 0, 0.4)";
    }

    const groundShadow = selected
      ? `0 26px 44px -4px rgba(0, 0, 0, 0.95), 0 0 28px 4px ${theme.floorGlow}`
      : tilt.isHovered
      ? "0 30px 48px -6px rgba(0, 0, 0, 0.95), 0 14px 24px rgba(0, 0, 0, 0.85)"
      : "0 20px 32px -4px rgba(0, 0, 0, 0.9), 0 8px 16px rgba(0, 0, 0, 0.8)";

    return [
      // Top surface inner specular bevel highlight
      "inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.45)",
      "inset 0 -1.5px 2px 0 rgba(0, 0, 0, 0.6)",
      // Top perimeter subtle catch line
      "0 0.5px 0 0 rgba(255, 255, 255, 0.15)",
      // 14px Solid Tangible Brick Extrusion (Vertical thickness below the card)
      "0 1px 0 #242732",
      "0 2px 0 #21232d",
      "0 3px 0 #1e2028",
      "0 4px 0 #1b1d24",
      "0 5px 0 #181a20",
      "0 6px 0 #16171d",
      "0 7px 0 #14151a",
      "0 8px 0 #121317",
      "0 9px 0 #101115",
      "0 10px 0 #0e0f13",
      "0 11px 0 #0c0d11",
      "0 12px 0 #0a0b0f",
      "0 13px 0 #08090d",
      "0 14px 0 #06070a",
      // Bottom bevel rim catch line
      "0 14.5px 0 0 rgba(255, 255, 255, 0.12)",
      // Bottom accent power trim along the brick base
      `0 15px 0 0 ${theme.accentDark || theme.accent}`,
      // Ambient neon underglow reflecting off the canvas floor
      `0 16px 14px -2px ${selected ? theme.floorGlowHover : theme.floorGlow}`,
      groundShadow,
    ].join(", ");
  }, [is2D, selected, tilt.isHovered, theme]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handlers.onMouseMove}
      onMouseLeave={handlers.onMouseLeave}
      className="relative select-none cursor-pointer"
      style={{
        transformStyle: "preserve-3d",
        transform: is2D
          ? "none"
          : tilt.isHovered
          ? `translateY(-6px) rotateX(${tilt.x * 0.65}deg) rotateY(${tilt.y * 0.65}deg)`
          : selected
          ? "translateY(-3px)"
          : "none",
        transition: "transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. 3D BRICK GROUND CONTACT SHADOW & FLOOR GLOW (Floor plane at Z=0)
         ───────────────────────────────────────────────────────────── */}
      {!is2D && (
        <div
          className={`absolute inset-0 ${activeShapeClass} pointer-events-none transition-all duration-300`}
          style={{
            transform: "translateZ(0px) translateY(8px)",
            boxShadow: selected
              ? `0 24px 44px -4px rgba(0, 0, 0, 0.95), 0 0 32px 6px ${theme.floorGlow}`
              : tilt.isHovered
              ? "0 28px 48px -6px rgba(0, 0, 0, 0.95), 0 12px 24px rgba(0, 0, 0, 0.85)"
              : "0 16px 28px -4px rgba(0, 0, 0, 0.9), 0 8px 16px rgba(0, 0, 0, 0.8)",
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. 3D SUB-SURFACE SLAB BASE (Physical 3D Foundation at Z=4px)
         ───────────────────────────────────────────────────────────── */}
      {!is2D && (
        <div
          className={`absolute inset-0 ${activeShapeClass} pointer-events-none transition-all duration-200`}
          style={{
            background: "#090a0d",
            transform: "translateZ(4px) translateY(4px)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            boxShadow: `0 8px 16px -2px rgba(0, 0, 0, 0.9), 0 0 16px ${theme.floorGlow}`,
          }}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. 3D BRICK TOP DECK (Resting at Z=16px)
         ───────────────────────────────────────────────────────────── */}
      <div
        className={`group relative min-w-[215px] ${activeShapeClass} transition-all duration-200 border-[1.5px] ${
          selected ? theme.borderSelected : "border-zinc-600/80 hover:border-zinc-400"
        }`}
        style={{
          background:
            "linear-gradient(150deg, #1c1d25 0%, #13141a 55%, #0d0e13 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          transformStyle: "preserve-3d",
          transform: is2D ? "none" : "translateZ(16px)",
          boxShadow: brickBoxShadow,
        }}
      >
        {/* Micro-chamfer Top Catch Line */}
        <div className="pointer-events-none absolute top-0 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-white/45 to-transparent z-10" />

        {/* Micro-chamfer Bottom Edge Reflection */}
        <div className="pointer-events-none absolute bottom-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent z-10" />

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


      </div>
    </div>
  );
}

export default memo(ThreeDimensionalCard);
