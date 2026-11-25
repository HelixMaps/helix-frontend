"use client";

import React, { useState, useCallback, useMemo, memo } from "react";
import { Position, useReactFlow } from "@xyflow/react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useMapConfig } from "@/context/MapConfigContext";
import ThreeDimensionalHandle from "./ThreeDimensionalHandle";
import { Check, Clock, Circle, Building2, Eye } from "lucide-react";

// Deterministic window lighting hash based on node ID, story, and column
const getWindowLit = (nodeId, story, col) => {
  let hash = 0;
  const str = `${nodeId}-s${story}-c${col}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % 3 !== 0;
};

const getWindowColor = (nodeId, story, col, theme) => {
  let hash = 0;
  const str = `${nodeId}-c-${story}-${col}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const mod = Math.abs(hash) % 5;
  if (mod === 0) return theme.accent;
  if (mod === 1) return theme.accentLight;
  return "rgba(255, 255, 255, 0.45)";
};

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
  const { nodeShape, viewMode, changeViewMode } = useMapConfig();
  const { fitView } = useReactFlow();
  const is2D = viewMode === "2d" || viewMode === "3d-topdown";
  const isCloseup = viewMode === "3d-closeup";

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

  // Architectural Building Height & Stories calculation
  const buildingHeight = useMemo(() => {
    if (is2D) return 0;
    // Map elevation (e.g. 20m - 100m) to physical 3D skyscraper depth in pixels
    return Math.max(48, Math.min(110, Math.round(Number(elevation || 45) * 1.08)));
  }, [is2D, elevation]);

  const storiesCount = useMemo(() => {
    return Math.max(3, Math.min(6, Math.round(buildingHeight / 16)));
  }, [buildingHeight]);

  const storyList = useMemo(() => {
    return Array.from({ length: storiesCount }, (_, i) => storiesCount - i);
  }, [storiesCount]);

  // Inspect Building in Close-up View handler
  const handleInspectBuilding = useCallback(
    (e) => {
      e.stopPropagation();
      changeViewMode("3d-closeup");
      fitView({
        nodes: [{ id }],
        padding: 0.7,
        maxZoom: 1.8,
        duration: 600,
      });
    },
    [id, fitView, changeViewMode]
  );

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
      // Architectural mid-building horizontal reveal line
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
      {/* ── Street Foundation Plinth (Ground Level Z=0 on the Street) ── */}
      {!is2D && (
        <div
          className="absolute -inset-1.5 rounded-2xl pointer-events-none transition-all duration-300"
          style={{
            transform: "translateZ(0px)",
            background: "radial-gradient(ellipse at center, rgba(14, 16, 22, 0.98) 0%, rgba(9, 10, 14, 0.9) 70%, transparent 100%)",
            border: `1px solid ${selected ? theme.accent : "rgba(255, 255, 255, 0.08)"}`,
            boxShadow: selected
              ? `0 0 35px 8px ${theme.floorGlowHover}, 0 24px 44px rgba(0,0,0,0.95)`
              : tilt.isHovered
              ? `0 0 28px 4px ${theme.floorGlow}, 0 20px 38px rgba(0,0,0,0.9)`
              : `0 0 18px 2px ${theme.floorGlow}, 0 14px 28px rgba(0,0,0,0.85)`,
          }}
        >
          {/* Architectural Foundation Curb Markings */}
          <div className="absolute top-1 left-1.5 w-2 h-2 border-t border-l border-white/20" />
          <div className="absolute top-1 right-1.5 w-2 h-2 border-t border-r border-white/20" />
          <div className="absolute bottom-1 left-1.5 w-2 h-2 border-b border-l border-white/20" />
          <div className="absolute bottom-1 right-1.5 w-2 h-2 border-b border-r border-white/20" />
        </div>
      )}

      {/* ── Main Architectural Roof Deck (Lifted to building height in 3D) ── */}
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
          transform: is2D ? "none" : `translateZ(${buildingHeight}px)`,
          boxShadow: monolithBoxShadow,
        }}
      >
        {/* ── 3D Architectural Skyscraper Tower Body (Extrudes Down to Street Z=0) ── */}
        {!is2D && (
          <>
            {/* 1. South Facade (Front face facing viewer/street) */}
            <div
              className="absolute left-0 right-0 top-full pointer-events-none select-none overflow-hidden flex flex-col justify-between"
              style={{
                height: `${buildingHeight}px`,
                transformOrigin: "top center",
                transform: "rotateX(-90deg)",
                background: "linear-gradient(180deg, #181b22 0%, #0d0f14 100%)",
                borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
                borderRight: "1px solid rgba(255, 255, 255, 0.15)",
                borderBottom: `2px solid ${selected ? theme.accent : theme.accentDark}`,
                boxShadow: `inset 0 0 16px rgba(0, 0, 0, 0.85), 0 0 18px ${theme.floorGlow}`,
              }}
            >
              {/* Floor Stories with Glowing Window Grid */}
              <div className="flex-1 flex flex-col justify-around py-0.5">
                {storyList.map((storyNum) => (
                  <div
                    key={storyNum}
                    className="flex items-center justify-between gap-1.5 px-2 py-0.5 border-b border-white/[0.06]"
                  >
                    <span className="text-[7px] font-mono text-zinc-500 font-bold shrink-0">
                      L{storyNum}
                    </span>
                    {/* Window Row Matrix */}
                    <div className="flex-1 flex items-center justify-end gap-1">
                      {[0, 1, 2, 3, 4, 5].map((col) => {
                        const isLit = getWindowLit(id, storyNum, col);
                        const winColor = getWindowColor(id, storyNum, col, theme);
                        return (
                          <div
                            key={col}
                            className="w-2.5 h-1.5 rounded-[1px] transition-colors"
                            style={{
                              background: isLit ? winColor : "#0b0d13",
                              boxShadow: isLit ? `0 0 6px ${winColor}` : "none",
                              border: isLit ? "none" : "1px solid rgba(255, 255, 255, 0.04)",
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Ground-Level Street Entrance Lobby */}
              <div
                className="h-4.5 px-2.5 flex items-center justify-between border-t border-white/[0.1] shrink-0"
                style={{
                  background: `linear-gradient(90deg, rgba(10,12,16,0.95), ${theme.floorGlow}, rgba(10,12,16,0.95))`,
                }}
              >
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[6.5px] font-mono font-bold tracking-widest text-zinc-300 uppercase">
                    MAIN ENTRANCE
                  </span>
                </div>
                {/* Lit Entrance Portal Doors */}
                <div className="flex items-center gap-0.5">
                  <div
                    className="w-2.5 h-2.5 rounded-[1px] border border-white/40"
                    style={{ background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }}
                  />
                  <div
                    className="w-2.5 h-2.5 rounded-[1px] border border-white/40"
                    style={{ background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. West Wall (Left flank) */}
            <div
              className="absolute top-0 bottom-0 right-full pointer-events-none select-none overflow-hidden flex flex-col justify-around py-1"
              style={{
                width: `${buildingHeight}px`,
                transformOrigin: "right center",
                transform: "rotateY(-90deg)",
                background: "linear-gradient(90deg, #0e1015 0%, #171920 100%)",
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                borderLeft: `1.5px solid ${theme.accentDark}`,
              }}
            >
              <div className="h-full flex items-center justify-around px-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-3/4 w-1 rounded-[1px]"
                    style={{
                      background: i % 2 === 0 ? "rgba(255, 255, 255, 0.08)" : theme.floorGlow,
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 3. East Wall (Right flank) */}
            <div
              className="absolute top-0 bottom-0 left-full pointer-events-none select-none overflow-hidden flex flex-col justify-around py-1"
              style={{
                width: `${buildingHeight}px`,
                transformOrigin: "left center",
                transform: "rotateY(90deg)",
                background: "linear-gradient(270deg, #0e1015 0%, #171920 100%)",
                borderTop: "1px solid rgba(255, 255, 255, 0.12)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                borderRight: `1.5px solid ${theme.accentDark}`,
              }}
            >
              <div className="h-full flex items-center justify-around px-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-3/4 w-1 rounded-[1px]"
                    style={{
                      background: i % 2 === 0 ? "rgba(255, 255, 255, 0.08)" : theme.floorGlow,
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 4. North Wall (Back side) */}
            <div
              className="absolute left-0 right-0 bottom-full pointer-events-none select-none overflow-hidden"
              style={{
                height: `${buildingHeight}px`,
                transformOrigin: "bottom center",
                transform: "rotateX(90deg)",
                background: "linear-gradient(0deg, #181b22 0%, #0d0f14 100%)",
                borderLeft: "1px solid rgba(255, 255, 255, 0.12)",
                borderRight: "1px solid rgba(255, 255, 255, 0.12)",
                borderTop: `1.5px solid ${theme.accentDark}`,
              }}
            />

            {/* 5. Rooftop Communications Spire Antenna with Blinking Aviation Light */}
            <div
              className="absolute -top-6 right-3 pointer-events-none flex flex-col items-center z-30"
              style={{
                transform: "translateZ(18px)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* Blinking Aviation Warning Light Beacon */}
              <div className="relative flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping opacity-75" />
                <span
                  className="absolute w-1.5 h-1.5 rounded-full bg-red-500"
                  style={{ boxShadow: "0 0 8px #ef4444" }}
                />
              </div>
              {/* Vertical Antenna Needle Mast */}
              <div className="w-[1.5px] h-4.5 bg-gradient-to-t from-zinc-500 via-zinc-300 to-white" />
            </div>
          </>
        )}

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
            <div className="flex items-center justify-between gap-1.5 mb-1">
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

              {/* 3D Action & Altitude Badges */}
              {!is2D && (
                <div className="flex items-center gap-1 shrink-0">
                  {/* Inspect / Closeup View Button */}
                  <button
                    onClick={handleInspectBuilding}
                    className="p-1 rounded bg-white/[0.05] hover:bg-white/[0.14] border border-white/[0.08] hover:border-white/20 text-zinc-400 hover:text-white transition-all cursor-pointer active:scale-90 flex items-center gap-1"
                    title="Closeup View: Inspect building architecture"
                  >
                    <Eye size={10} className="text-zinc-300" />
                    <span className="text-[8px] font-mono hidden group-hover:inline">Inspect</span>
                  </button>

                  {/* Building Elevation Badge */}
                  <span
                    className="px-1.5 py-[1px] rounded bg-white/[0.04] border border-white/[0.08] text-[9px] font-mono text-zinc-400 shrink-0"
                    title={`3D Building Elevation: ${elevation}m (${storiesCount} Stories)`}
                  >
                    +{elevation}m
                  </span>
                </div>
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

            {/* Expanded Telemetry in Closeup View */}
            {isCloseup && selected && (
              <div className="mt-1.5 pt-1.5 border-t border-white/[0.08] flex items-center justify-between text-[8px] font-mono text-zinc-400 animate-in fade-in duration-200">
                <span className="flex items-center gap-1 text-zinc-300">
                  <Building2 size={9} className="text-blue-400" />
                  <span>FL {storiesCount} • {elevation}M TOWER</span>
                </span>
                <span className="text-emerald-400 font-bold">OPERATIONAL</span>
              </div>
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