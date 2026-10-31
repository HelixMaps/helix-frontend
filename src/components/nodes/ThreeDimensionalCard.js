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
  const isTopDown = viewMode === "3d-topdown";

  // Interactive 3D tilt with smooth mouse tracking
  const { cardRef, tilt, handlers } = use3DTilt({ maxTilt: 8, scale: 1.02 });

  // Node Shape Geometry
  const shapeGeometry = {
    rounded: "rounded-2xl px-4 py-3.5",
    pill: "rounded-full px-6 py-3",
    sharp: "rounded-none px-4 py-3.5",
    leaf: "rounded-[24px_6px_24px_6px] px-4 py-3.5",
    asymmetric: "rounded-[6px_24px_6px_24px] px-4 py-3.5",
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
      borderSelected: "border-blue-400",
      borderResting: "border-blue-500/30",
      badgeGradient: "from-blue-500/25 via-blue-600/15 to-indigo-900/25",
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
      borderSelected: "border-emerald-400",
      borderResting: "border-emerald-500/30",
      badgeGradient: "from-emerald-500/25 via-emerald-600/15 to-teal-900/25",
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
      borderSelected: "border-amber-400",
      borderResting: "border-amber-500/30",
      badgeGradient: "from-amber-500/25 via-amber-600/15 to-orange-900/25",
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

  // Box shadows with ambient floor glow
  const cardShadows = React.useMemo(() => {
    if (selected) {
      return `
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.45),
        inset 0 -2px 4px 0 rgba(0, 0, 0, 0.6),
        0 1px 0 0 ${theme.accentLight},
        0 2px 0 0 ${theme.accent},
        0 3px 0 0 ${theme.accentDark},
        0 4px 0 0 #18181b,
        0 5px 0 0 #121215,
        0 6px 0 0 #09090b,
        0 14px 24px -2px rgba(0, 0, 0, 0.85),
        0 30px 60px -8px rgba(0, 0, 0, 0.85),
        0 16px 36px -2px ${theme.floorGlowHover},
        0 0 20px 2px ${theme.floorGlow}
      `;
    }

    if (tilt.isHovered) {
      return `
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
        inset 0 -2px 4px 0 rgba(0, 0, 0, 0.6),
        0 1px 0 0 #3f3f46,
        0 2px 0 0 #27272a,
        0 3px 0 0 #202024,
        0 4px 0 0 #18181b,
        0 5px 0 0 #121215,
        0 6px 0 0 #09090b,
        0 14px 20px -2px rgba(0, 0, 0, 0.8),
        0 32px 52px -10px rgba(0, 0, 0, 0.9),
        0 18px 32px -4px ${theme.floorGlowHover}
      `;
    }

    return `
      inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.6),
      0 1px 0 0 #27272a,
      0 2px 0 0 #222226,
      0 3px 0 0 #1c1c20,
      0 4px 0 0 #17171b,
      0 5px 0 0 #101014,
      0 6px 0 0 #09090b,
      0 10px 16px -2px rgba(0, 0, 0, 0.8),
      0 22px 38px -6px rgba(0, 0, 0, 0.75),
      0 12px 24px -4px ${theme.floorGlow}
    `;
  }, [selected, tilt.isHovered, theme]);

  return (
    <div
      className="relative select-none"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. 3D FLOATING SLAB CARD
         ───────────────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        onMouseMove={handlers.onMouseMove}
        onMouseLeave={handlers.onMouseLeave}
        className={`group relative min-w-[195px] cursor-pointer ${activeShapeClass} transition-all duration-300 ease-out border-[1.5px] ${
          selected ? theme.borderSelected : `${theme.borderResting} hover:border-zinc-500`
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(22, 26, 36, 0.94) 0%, rgba(12, 15, 23, 0.97) 50%, rgba(6, 8, 14, 0.99) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: cardShadows,
          transformStyle: "preserve-3d",
          transform: isTopDown
            ? "none"
            : tilt.isHovered
            ? `perspective(850px) translateY(-6px) translateZ(12px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : selected
            ? "perspective(850px) translateY(-4px) translateZ(8px) scale(1.01)"
            : "perspective(850px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)",
        }}
      >
        {/* Dynamic Specular Sheen (Follows cursor) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300 z-10"
          style={{
            opacity: tilt.isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 75%)`,
          }}
        />

        {/* Top Edge Specular Catch Line */}
        <div className="pointer-events-none absolute top-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent z-10" />

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

              {/* Subtle Altitude Marker */}
              <span className="text-[9px] font-mono text-zinc-500 font-semibold">
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
