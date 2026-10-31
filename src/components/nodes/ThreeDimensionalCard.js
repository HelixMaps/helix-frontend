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
      floorGlow: "rgba(59, 130, 246, 0.35)",
      floorGlowHover: "rgba(59, 130, 246, 0.65)",
      tagColor: "text-blue-400",
      borderSelected: "border-blue-400 ring-2 ring-blue-500/30",
      borderResting: "border-zinc-700/80 hover:border-zinc-500",
      badgeGradient: "from-blue-500/25 via-blue-600/15 to-transparent",
      badgeBorder: "border-blue-400/40",
      sproutBg: "bg-blue-600 hover:bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.6)]",
    },
    emerald: {
      accent: "#10b981",
      accentLight: "#6ee7b7",
      accentDark: "#047857",
      floorGlow: "rgba(16, 185, 129, 0.35)",
      floorGlowHover: "rgba(16, 185, 129, 0.65)",
      tagColor: "text-emerald-400",
      borderSelected: "border-emerald-400 ring-2 ring-emerald-500/30",
      borderResting: "border-zinc-700/80 hover:border-zinc-500",
      badgeGradient: "from-emerald-500/25 via-emerald-600/15 to-transparent",
      badgeBorder: "border-emerald-400/40",
      sproutBg: "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]",
    },
    amber: {
      accent: "#f59e0b",
      accentLight: "#fde68a",
      accentDark: "#b45309",
      floorGlow: "rgba(245, 158, 11, 0.35)",
      floorGlowHover: "rgba(245, 158, 11, 0.65)",
      tagColor: "text-amber-400",
      borderSelected: "border-amber-400 ring-2 ring-amber-500/30",
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

  // Box shadows with ambient floor glow - Multi-layer thick 3D brick / slab extrusion
  const cardShadows = React.useMemo(() => {
    if (is2D) {
      if (selected) {
        return `0 0 0 2px ${theme.accent}, 0 4px 14px rgba(0, 0, 0, 0.7), 0 0 16px ${theme.floorGlow}`;
      }
      return `0 2px 4px rgba(0, 0, 0, 0.5), 0 8px 18px rgba(0, 0, 0, 0.45)`;
    }

    if (selected) {
      return `
        /* Top specular highlight & bevel */
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.5),
        inset 0 -2px 4px 0 rgba(0, 0, 0, 0.8),
        /* Colored illuminated rim */
        0 1px 0 0 ${theme.accentLight},
        0 2px 0 0 ${theme.accent},
        0 3px 0 0 ${theme.accentDark},
        /* Heavy 22px solid slab brick side walls */
        0 4px 0 0 #3f3f46,
        0 5px 0 0 #3a3a41,
        0 6px 0 0 #36363d,
        0 7px 0 0 #323238,
        0 8px 0 0 #2e2e34,
        0 9px 0 0 #2a2a30,
        0 10px 0 0 #27272c,
        0 11px 0 0 #232328,
        0 12px 0 0 #202025,
        0 13px 0 0 #1d1d22,
        0 14px 0 0 #1a1a1f,
        0 15px 0 0 #18181c,
        0 16px 0 0 #151519,
        0 17px 0 0 #131316,
        0 18px 0 0 #111114,
        0 19px 0 0 #0f0f12,
        0 20px 0 0 #0d0d10,
        0 21px 0 0 #0b0b0e,
        0 22px 0 0 #08080a,
        /* Ground contact occlusion shadow */
        0 25px 2px -1px rgba(0, 0, 0, 0.95),
        /* Floor drop shadow */
        0 34px 44px -4px rgba(0, 0, 0, 0.9),
        0 48px 70px -8px rgba(0, 0, 0, 0.8),
        0 24px 40px -2px ${theme.floorGlowHover},
        0 0 30px 4px ${theme.floorGlow}
      `;
    }

    if (tilt.isHovered) {
      return `
        /* Top specular highlight */
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.45),
        inset 0 -2px 4px 0 rgba(0, 0, 0, 0.8),
        /* Beveled top rim */
        0 1px 0 0 #71717a,
        0 2px 0 0 #52525b,
        0 3px 0 0 #47474f,
        /* Thick 26px elevated slab brick extrusion */
        0 4px 0 0 #3f3f46,
        0 5px 0 0 #3b3b42,
        0 6px 0 0 #37373e,
        0 7px 0 0 #34343a,
        0 8px 0 0 #303036,
        0 9px 0 0 #2d2d33,
        0 10px 0 0 #2a2a30,
        0 11px 0 0 #26262c,
        0 12px 0 0 #232328,
        0 13px 0 0 #202025,
        0 14px 0 0 #1d1d22,
        0 15px 0 0 #1b1b1f,
        0 16px 0 0 #18181c,
        0 17px 0 0 #16161a,
        0 18px 0 0 #131317,
        0 19px 0 0 #111115,
        0 20px 0 0 #0f0f13,
        0 21px 0 0 #0d0d10,
        0 22px 0 0 #0b0b0e,
        0 23px 0 0 #09090c,
        0 24px 0 0 #07070a,
        0 25px 0 0 #050508,
        0 26px 0 0 #040406,
        /* Heavy ground contact & floor shadow */
        0 30px 3px -1px rgba(0, 0, 0, 0.95),
        0 42px 55px -6px rgba(0, 0, 0, 0.9),
        0 56px 85px -10px rgba(0, 0, 0, 0.8),
        0 26px 45px -4px ${theme.floorGlowHover}
      `;
    }

    return `
      /* Resting top specular highlight & bevel */
      inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.8),
      /* Beveled metallic top rim */
      0 1px 0 0 #52525b,
      0 2px 0 0 #3f3f46,
      0 3px 0 0 #38383f,
      /* 20px solid heavy slab brick side walls */
      0 4px 0 0 #333339,
      0 5px 0 0 #2e2e34,
      0 6px 0 0 #2a2a30,
      0 7px 0 0 #26262c,
      0 8px 0 0 #232328,
      0 9px 0 0 #202025,
      0 10px 0 0 #1d1d22,
      0 11px 0 0 #1a1a1f,
      0 12px 0 0 #18181c,
      0 13px 0 0 #151519,
      0 14px 0 0 #131317,
      0 15px 0 0 #111115,
      0 16px 0 0 #0f0f13,
      0 17px 0 0 #0d0d10,
      0 18px 0 0 #0b0b0e,
      0 19px 0 0 #09090c,
      0 20px 0 0 #07070a,
      /* Contact occlusion shadow */
      0 23px 2px -1px rgba(0, 0, 0, 0.95),
      /* Floor shadow */
      0 30px 40px -4px rgba(0, 0, 0, 0.85),
      0 44px 60px -8px rgba(0, 0, 0, 0.75),
      0 18px 32px -4px ${theme.floorGlow}
    `;
  }, [selected, tilt.isHovered, theme, is2D]);

  return (
    <div
      className="relative select-none"
      style={{
        transformStyle: "preserve-3d",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. 3D SOLID HEAVY BRICK / SLAB
         ───────────────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        onMouseMove={handlers.onMouseMove}
        onMouseLeave={handlers.onMouseLeave}
        className={`group relative min-w-[210px] cursor-pointer ${activeShapeClass} transition-all duration-300 ease-out border-[1.5px] ${
          selected ? theme.borderSelected : `${theme.borderResting}`
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(38, 38, 43, 0.98) 0%, rgba(26, 26, 30, 0.99) 50%, rgba(18, 18, 22, 1) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          boxShadow: cardShadows,
          transformStyle: "preserve-3d",
          transform: is2D
            ? "none"
            : tilt.isHovered
            ? `perspective(850px) translateY(-10px) translateZ(24px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.02)`
            : selected
            ? "perspective(850px) translateY(-6px) translateZ(16px) scale(1.01)"
            : "perspective(850px) translateY(-2px) translateZ(8px) rotateX(0deg) rotateY(0deg) scale(1)",
        }}
      >
        {/* Dynamic Specular Sheen (Follows cursor) */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300 z-10"
          style={{
            opacity: tilt.isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 45%, transparent 75%)`,
          }}
        />

        {/* Top Edge Specular Catch Line */}
        <div className="pointer-events-none absolute top-0 left-3 right-3 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent z-10" />

        {/* Bottom Rim Light Highlight */}
        <div className="pointer-events-none absolute bottom-0 left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-zinc-600/30 to-transparent z-10" />

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
              <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/50 text-[8px] font-mono text-zinc-400 font-bold">
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
