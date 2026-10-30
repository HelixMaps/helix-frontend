"use client";

import React from "react";
import { Position } from "@xyflow/react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useMapConfig } from "@/context/MapConfigContext";
import ThreeDimensionalHandle from "./ThreeDimensionalHandle";

/**
 * ThreeDimensionalCard
 * Master 3D slab container for nodes, featuring realistic extrusion,
 * multi-tier ambient floor shadows, specular edge catch-lights,
 * floating elevated icon gems, and interactive 3D mouse parallax.
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
  children,
  onLabelChange,
  onLabelBlur,
  onLabelKeyDown,
}) {
  const { nodeShape } = useMapConfig();
  const { cardRef, tilt, handlers } = use3DTilt({ maxTilt: 9, scale: 1.02 });

  // Shape geometry mapping
  const shapeGeometry = {
    rounded: "rounded-2xl px-4 py-3.5",
    pill: "rounded-full px-6 py-3",
    sharp: "rounded-none px-4 py-3.5",
    leaf: "rounded-[24px_6px_24px_6px] px-4 py-3.5",
    asymmetric: "rounded-[6px_24px_6px_24px] px-4 py-3.5",
  };

  const activeShapeClass = shapeGeometry[nodeShape] || shapeGeometry.rounded;

  // Color schemes for each node type
  const themeConfig = {
    blue: {
      accent: "#3b82f6",
      accentLight: "#60a5fa",
      accentDark: "#1d4ed8",
      glowBg: "rgba(59, 130, 246, 0.15)",
      floorGlow: "rgba(59, 130, 246, 0.35)",
      floorGlowHover: "rgba(59, 130, 246, 0.55)",
      iconColor: "text-blue-400",
      tagColor: "text-blue-400",
      borderSelected: "border-blue-400",
      borderResting: "border-zinc-800/90",
      badgeGradient: "from-blue-500/20 via-blue-500/10 to-transparent",
      badgeBorder: "border-blue-500/30",
    },
    emerald: {
      accent: "#10b981",
      accentLight: "#34d399",
      accentDark: "#047857",
      glowBg: "rgba(16, 185, 129, 0.15)",
      floorGlow: "rgba(16, 185, 129, 0.35)",
      floorGlowHover: "rgba(16, 185, 129, 0.55)",
      iconColor: "text-emerald-400",
      tagColor: "text-emerald-400",
      borderSelected: "border-emerald-400",
      borderResting: "border-zinc-800/90",
      badgeGradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      badgeBorder: "border-emerald-500/30",
    },
    amber: {
      accent: "#f59e0b",
      accentLight: "#fbbf24",
      accentDark: "#b45309",
      glowBg: "rgba(245, 158, 11, 0.15)",
      floorGlow: "rgba(245, 158, 11, 0.35)",
      floorGlowHover: "rgba(245, 158, 11, 0.55)",
      iconColor: "text-amber-400",
      tagColor: "text-amber-400",
      borderSelected: "border-amber-400",
      borderResting: "border-zinc-800/90",
      badgeGradient: "from-amber-500/20 via-amber-500/10 to-transparent",
      badgeBorder: "border-amber-500/30",
    },
  };

  const theme = themeConfig[accentColor] || themeConfig.blue;

  // Construct dynamic 3D multi-tier shadow
  const shadowStyles = React.useMemo(() => {
    if (selected) {
      return `
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.45),
        inset 0 -2px 5px 0 rgba(0, 0, 0, 0.7),
        0 1px 0 0 ${theme.accentLight},
        0 2px 0 0 ${theme.accent},
        0 3px 0 0 ${theme.accentDark},
        0 4px 0 0 #18181b,
        0 5px 0 0 #121215,
        0 6px 0 0 #09090b,
        0 12px 18px -2px rgba(0, 0, 0, 0.85),
        0 28px 45px -8px rgba(0, 0, 0, 0.8),
        0 16px 36px -2px ${theme.floorGlowHover},
        0 0 20px 2px ${theme.floorGlow}
      `;
    }

    if (tilt.isHovered) {
      return `
        inset 0 1px 1px 0 rgba(255, 255, 255, 0.35),
        inset 0 -2px 4px 0 rgba(0, 0, 0, 0.7),
        0 1px 0 0 #3f3f46,
        0 2px 0 0 #27272a,
        0 3px 0 0 #202024,
        0 4px 0 0 #18181b,
        0 5px 0 0 #121215,
        0 6px 0 0 #09090b,
        0 12px 16px -2px rgba(0, 0, 0, 0.8),
        0 32px 52px -10px rgba(0, 0, 0, 0.85),
        0 18px 32px -4px ${theme.floorGlowHover}
      `;
    }

    return `
      inset 0 1px 0 0 rgba(255, 255, 255, 0.22),
      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.7),
      0 1px 0 0 #27272a,
      0 2px 0 0 #222226,
      0 3px 0 0 #1c1c20,
      0 4px 0 0 #17171b,
      0 5px 0 0 #101014,
      0 6px 0 0 #09090b,
      0 8px 12px -2px rgba(0, 0, 0, 0.75),
      0 22px 36px -6px rgba(0, 0, 0, 0.7),
      0 12px 24px -4px ${theme.floorGlow}
    `;
  }, [selected, tilt.isHovered, theme]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handlers.onMouseMove}
      onMouseLeave={handlers.onMouseLeave}
      className={`group relative min-w-[170px] select-none cursor-pointer ${activeShapeClass} transition-all duration-300 ease-out border-[1.5px] ${
        selected ? theme.borderSelected : `${theme.borderResting} hover:border-zinc-700`
      }`}
      style={{
        background: "linear-gradient(145deg, rgba(24, 24, 27, 0.98) 0%, rgba(9, 9, 11, 0.99) 100%)",
        boxShadow: shadowStyles,
        transformStyle: "preserve-3d",
        transform: tilt.isHovered
          ? `perspective(750px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-4px) translateZ(10px) scale(1.02)`
          : selected
          ? "perspective(750px) translateY(-3px) translateZ(8px) scale(1.01)"
          : "perspective(750px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)",
      }}
    >
      {/* 3D Dynamic Specular Glare Overlay (Light Catch Effect) */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300"
        style={{
          opacity: tilt.isHovered ? 1 : 0,
          background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.04) 35%, transparent 70%)`,
        }}
      />

      {/* Subtle Top Specular Bevel Catch Line */}
      <div className="pointer-events-none absolute top-0 left-2 right-2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

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

      {/* Card Content Row */}
      <div
        className="flex items-center gap-3.5 relative z-10"
        style={{ transform: "translateZ(12px)", transformStyle: "preserve-3d" }}
      >
        {/* Floating 3D Icon Gem */}
        <div
          className={`p-2 rounded-xl bg-gradient-to-br ${theme.badgeGradient} ${theme.iconColor} border ${theme.badgeBorder} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105`}
          style={{
            transform: "translateZ(14px)",
            boxShadow: `0 4px 10px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.35), 0 0 12px ${theme.floorGlow}`,
          }}
        >
          {Icon && <Icon size={18} className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />}
        </div>

        {/* Text & Content Block */}
        <div className="flex flex-col min-w-0 flex-1 pr-1">
          {/* 3D Micro Type Tag */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={`text-[9px] font-black uppercase tracking-[0.18em] ${theme.tagColor} select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]`}
            >
              {typeLabel}
            </span>
          </div>

          {/* Title / Inline Editor */}
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={onLabelChange}
              onBlur={onLabelBlur}
              onKeyDown={onLabelKeyDown}
              className="nodrag bg-zinc-900/80 border border-zinc-700/80 rounded-md px-2 py-0.5 text-sm font-semibold text-zinc-100 outline-none focus:ring-1 focus:ring-blue-500 w-full shadow-inner"
              placeholder={`Enter ${typeLabel.toLowerCase()}...`}
              autoFocus
            />
          ) : (
            <span
              className="text-sm font-semibold text-zinc-100 truncate select-none tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
              title={label}
            >
              {label || `New ${typeLabel}`}
            </span>
          )}

          {/* Optional extra children (e.g. status or notes snippet) */}
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
  );
}
