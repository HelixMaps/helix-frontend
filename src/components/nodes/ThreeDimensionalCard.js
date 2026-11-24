"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
import { Position } from "@xyflow/react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useMapConfig } from "@/context/MapConfigContext";
import ThreeDimensionalHandle from "./ThreeDimensionalHandle";
import { Check, Clock, Circle } from "lucide-react";

// Uniform architectural block proportions preventing dimension jumps across shape modes
const SHAPE_GEOMETRY = {
  rounded: "rounded-xl px-4 py-3.5",
  pill: "rounded-full px-5 py-3.5",
  sharp: "rounded-none px-4 py-3.5",
  leaf: "rounded-[22px_6px_22px_6px] px-4 py-3.5",
  asymmetric: "rounded-[6px_22px_6px_22px] px-4 py-3.5",
};

// Helix Obsidian & Neon Trace Palettes
const THEME_CONFIG = {
  emerald: {
    accent: "#10b981",
    accentLight: "#6ee7b7",
    accentDark: "#065f46",
    floorGlow: "rgba(16, 185, 129, 0.32)",
    floorGlowHover: "rgba(16, 185, 129, 0.6)",
    tagColor: "text-emerald-400",
    dotColor: "bg-emerald-400",
    borderSelected: "border-emerald-400/90 ring-2 ring-emerald-500/30",
    badgeGradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    badgeBorder: "border-emerald-400/30",
  },
  cyan: {
    accent: "#22d3ee",
    accentLight: "#a5f3fc",
    accentDark: "#155e75",
    floorGlow: "rgba(34, 211, 238, 0.32)",
    floorGlowHover: "rgba(34, 211, 238, 0.6)",
    tagColor: "text-cyan-400",
    dotColor: "bg-cyan-400",
    borderSelected: "border-cyan-400/90 ring-2 ring-cyan-500/30",
    badgeGradient: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    badgeBorder: "border-cyan-400/30",
  },
  blue: {
    accent: "#3b82f6",
    accentLight: "#93c5fd",
    accentDark: "#1e40af",
    floorGlow: "rgba(59, 130, 246, 0.32)",
    floorGlowHover: "rgba(59, 130, 246, 0.6)",
    tagColor: "text-blue-400",
    dotColor: "bg-blue-400",
    borderSelected: "border-blue-400/90 ring-2 ring-blue-500/30",
    badgeGradient: "from-blue-500/20 via-blue-500/5 to-transparent",
    badgeBorder: "border-blue-400/30",
  },
  amber: {
    accent: "#f59e0b",
    accentLight: "#fde68a",
    accentDark: "#92400e",
    floorGlow: "rgba(245, 158, 11, 0.32)",
    floorGlowHover: "rgba(245, 158, 11, 0.6)",
    tagColor: "text-amber-400",
    dotColor: "bg-amber-400",
    borderSelected: "border-amber-400/90 ring-2 ring-amber-500/30",
    badgeGradient: "from-amber-500/20 via-amber-500/5 to-transparent",
    badgeBorder: "border-amber-400/30",
  },
};

function ThreeDimensionalCard({
  id,
  type = "idea",
  label = "",
  typeLabel = "Idea",
  icon: Icon,
  accentColor = "emerald",
  isEditing = false,
  isReadOnly = false,
  selected = false,
  elevation = 40,
  children,
  onLabelChange,
  onLabelBlur,
  onLabelKeyDown,
}) {
  const { nodeShape, viewMode } = useMapConfig();
  const is2D = viewMode === "2d" || viewMode === "3d-topdown";

  const { cardRef, tilt, handlers } = use3DTilt({ maxTilt: 6, scale: 1.015 });

  const activeShapeClass = SHAPE_GEOMETRY[nodeShape] || SHAPE_GEOMETRY.rounded;
  const theme = THEME_CONFIG[accentColor] || THEME_CONFIG.emerald;

  // Task Status Toggle state ('todo' -> 'in_progress' -> 'completed')
  const [taskStatus, setTaskStatus] = useState("todo");

  const handleCycleTaskStatus = useCallback((e) => {
    e.stopPropagation();
    if (isReadOnly) return;
    setTaskStatus((prev) => {
      if (prev === "todo") return "in_progress";
      if (prev === "in_progress") return "completed";
      return "todo";
    });
  }, [isReadOnly]);

  // 18px Architectural Monolith / Block Building Extrusion
  const monolithBoxShadow = useMemo(() => {
    if (is2D) {
      return selected
        ? `0 8px 24px -4px rgba(0, 0, 0, 0.85), 0 0 20px ${theme.floorGlowHover}`
        : "0 4px 16px -2px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)";
    }

    const groundShadow = selected
      ? `0 32px 52px -6px rgba(0, 0, 0, 0.96), 0 0 36px 4px ${theme.floorGlowHover}`
      : tilt.isHovered
      ? `0 36px 56px -6px rgba(0, 0, 0, 0.96), 0 0 28px 2px ${theme.floorGlow}`
      : `0 24px 40px -4px rgba(0, 0, 0, 0.92), 0 0 18px ${theme.floorGlow}`;

    return [
      // Roof deck specular glass bevel
      "inset 0 1.5px 0 0 rgba(255, 255, 255, 0.28)",
      "inset 0 -1px 0 0 rgba(0, 0, 0, 0.7)",
      // Upper story facade (1px - 8px)
      "0 1px 0 #262934",
      "0 2px 0 #232630",
      "0 3px 0 #20232c",
      "0 4px 0 #1d2028",
      "0 5px 0 #1a1d24",
      "0 6px 0 #171a20",
      "0 7px 0 #14171c",
      "0 8px 0 #111318",
      // Architectural mid-building horizontal seam / reveal line (9px)
      "0 9px 0 rgba(255, 255, 255, 0.08)",
      // Lower story facade (10px - 16px)
      "0 10px 0 #13151b",
      "0 11px 0 #111318",
      "0 12px 0 #0f1115",
      "0 13px 0 #0d0e12",
      "0 14px 0 #0b0c0f",
      "0 15px 0 #090a0d",
      "0 16px 0 #07080a",
      // Illuminated Foundation Plinth / Baseboard (17px - 18px)
      "0 17px 0 rgba(255, 255, 255, 0.14)",
      `0 18.5px 0 ${selected ? theme.accent : theme.accentDark}`,
      // Ground contact shadow & neon floor reflection
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
          ? `translateY(-7px) rotateX(${tilt.x * 0.6}deg) rotateY(${tilt.y * 0.6}deg)`
          : selected
          ? "translateY(-3px)"
          : "none",
        transition: "transform 0.22s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Main Frosted Obsidian Roof Deck */}
      <div
        className={`group relative min-w-[220px] max-w-[300px] ${activeShapeClass} transition-[border-radius,border-color,box-shadow] duration-200 border ${
          selected
            ? theme.borderSelected
            : "border-white/[0.14] hover:border-white/[0.28]"
        }`}
        style={{
          background:
            "linear-gradient(155deg, rgba(26, 29, 36, 0.96) 0%, rgba(12, 13, 17, 0.99) 100%)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          transformStyle: "preserve-3d",
          transform: is2D ? "none" : "translateZ(20px)",
          boxShadow: monolithBoxShadow,
        }}
      >
        {/* Top Micro-Circuit Roof Edge Light */}
        <div
          className="pointer-events-none absolute top-0 left-5 right-5 h-[1.5px] opacity-80 group-hover:opacity-100 transition-opacity z-10"
          style={{
            background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
          }}
        />

        {/* Cursor-Tracking Specular Glare */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300 z-10"
          style={{
            opacity: tilt.isHovered ? 1 : 0,
            background: `radial-gradient(220px circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.15) 0%, transparent 70%)`,
          }}
        />

        {/* Target Connection Handles */}
        <ThreeDimensionalHandle
          type="target"
          position={Position.Left}
          id="target-left"
          accentColor={accentColor}
          isConnectable={!isReadOnly}
        />
        <ThreeDimensionalHandle
          type="target"
          position={Position.Top}
          id="target-top"
          accentColor={accentColor}
          isConnectable={!isReadOnly}
        />

        {/* Roof Deck Interior */}
        <div
          className="flex items-center gap-3 relative z-20"
          style={{ transform: is2D ? "none" : "translateZ(10px)", transformStyle: "preserve-3d" }}
        >
          {/* Icon Housing OR Interactive Task Checkbox */}
          {type === "task" ? (
            <button
              onClick={handleCycleTaskStatus}
              disabled={isReadOnly}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200 ${
                isReadOnly
                  ? "cursor-default opacity-85"
                  : "cursor-pointer active:scale-90"
              } ${
                taskStatus === "completed"
                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-400/60 shadow-[0_0_14px_rgba(16,185,129,0.35)]"
                  : taskStatus === "in_progress"
                  ? "bg-amber-500/15 text-amber-300 border-amber-400/60 shadow-[0_0_14px_rgba(245,158,11,0.35)]"
                  : "bg-white/[0.03] text-zinc-400 border-white/10 hover:border-white/25 hover:text-zinc-200"
              }`}
              title={
                isReadOnly
                  ? `Task Status: ${taskStatus === "completed" ? "Done" : taskStatus === "in_progress" ? "In Progress" : "Todo"}`
                  : "Click to toggle status: Todo -> In Progress -> Done"
              }
            >
              {taskStatus === "completed" ? (
                <Check size={15} className="stroke-[2.5]" />
              ) : taskStatus === "in_progress" ? (
                <Clock size={15} className="animate-spin" style={{ animationDuration: "8s" }} />
              ) : (
                <Circle size={14} className="stroke-[2]" />
              )}
            </button>
          ) : (
            <div
              className={`h-9 w-9 rounded-lg bg-gradient-to-br ${theme.badgeGradient} ${theme.tagColor} border ${theme.badgeBorder} flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105`}
              style={{
                boxShadow: `inset 0 1px 0 rgba(255, 255, 255, 0.18), 0 0 14px ${theme.floorGlow}`,
              }}
            >
              {Icon && <Icon size={17} />}
            </div>
          )}

          {/* Text & Telemetry */}
          <div className="flex flex-col min-w-0 flex-1">
            {/* Telemetry Row */}
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    type === "task"
                      ? taskStatus === "completed"
                        ? "bg-emerald-400"
                        : taskStatus === "in_progress"
                        ? "bg-amber-400 animate-pulse"
                        : "bg-zinc-500"
                      : theme.dotColor
                  }`}
                />
                <span
                  className={`text-[10px] font-mono uppercase tracking-[0.15em] truncate select-none ${
                    type === "task" && taskStatus === "completed"
                      ? "text-emerald-400"
                      : type === "task" && taskStatus === "in_progress"
                      ? "text-amber-400"
                      : theme.tagColor
                  }`}
                >
                  {type === "task"
                    ? taskStatus === "completed"
                      ? "Done"
                      : taskStatus === "in_progress"
                      ? "Active"
                      : "Todo"
                    : typeLabel}
                </span>
              </div>

              {/* Altitude Badge */}
              {!is2D && (
                <span
                  className="px-1.5 py-[1px] rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-zinc-400 shrink-0"
                  title={`3D Elevation: ${elevation}m`}
                >
                  +{elevation}m
                </span>
              )}
            </div>

            {/* Title / Inline Input */}
            {isEditing ? (
              <input
                type="text"
                value={label}
                onChange={onLabelChange}
                onBlur={onLabelBlur}
                onKeyDown={onLabelKeyDown}
                className="nodrag bg-black/70 border border-white/20 rounded-md px-2 py-0.5 text-sm font-medium text-zinc-100 outline-none focus:border-emerald-400 w-full"
                placeholder={`Enter ${typeLabel.toLowerCase()}...`}
                autoFocus
              />
            ) : (
              <span
                className={`text-sm font-medium tracking-tight truncate select-none transition-colors ${
                  type === "task" && taskStatus === "completed"
                    ? "line-through text-zinc-500"
                    : "text-zinc-100 group-hover:text-white"
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
          isConnectable={!isReadOnly}
        />
        <ThreeDimensionalHandle
          type="source"
          position={Position.Bottom}
          id="source-bottom"
          accentColor={accentColor}
          isConnectable={!isReadOnly}
        />
      </div>
    </div>
  );
}

export default memo(ThreeDimensionalCard);