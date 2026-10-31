"use client";

import React, { useCallback } from "react";
import { Position, useReactFlow } from "@xyflow/react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useMapConfig } from "@/context/MapConfigContext";
import ThreeDimensionalHandle from "./ThreeDimensionalHandle";
import { ChevronUp, ChevronDown, Layers } from "lucide-react";

/**
 * ThreeDimensionalCard
 * Master Spatial 3D Node:
 * - Real Z-axis elevation with interactive levitation
 * - Vertical glowing laser plumb line connecting floating card to the floor
 * - Holographic floor reticle projection with altitude telemetry
 * - Smoked glassmorphic acrylic slab with neon perimeter and specular bevel
 * - Floating 3D icon prism
 * - Interactive 3D cursor tilt with dynamic light sheen
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
  elevation = 45,
  children,
  onLabelChange,
  onLabelBlur,
  onLabelKeyDown,
}) {
  const { nodeShape, viewMode } = useMapConfig();
  const { setNodes } = useReactFlow();
  const isTopDown = viewMode === "3d-topdown";

  // Real 3D mouse parallax tilt
  const { cardRef, tilt, handlers } = use3DTilt({ maxTilt: 10, scale: 1.02 });

  // Shape geometry mapping
  const shapeGeometry = {
    rounded: "rounded-2xl px-4 py-3.5",
    pill: "rounded-full px-6 py-3",
    sharp: "rounded-none px-4 py-3.5",
    leaf: "rounded-[24px_6px_24px_6px] px-4 py-3.5",
    asymmetric: "rounded-[6px_24px_6px_24px] px-4 py-3.5",
  };

  const activeShapeClass = shapeGeometry[nodeShape] || shapeGeometry.rounded;

  // Theme palettes per node type
  const themeConfig = {
    blue: {
      accent: "#3b82f6",
      accentLight: "#93c5fd",
      accentDark: "#1d4ed8",
      glowBg: "rgba(59, 130, 246, 0.15)",
      floorGlow: "rgba(59, 130, 246, 0.4)",
      floorGlowHover: "rgba(59, 130, 246, 0.7)",
      reticleRing: "border-blue-400/40 bg-blue-500/10",
      reticleText: "text-blue-400",
      laserBeam: "from-blue-400 via-blue-500 to-transparent",
      iconColor: "text-blue-300",
      tagColor: "text-blue-400",
      borderSelected: "border-blue-400",
      borderResting: "border-blue-500/30",
      badgeGradient: "from-blue-500/30 via-blue-600/20 to-indigo-900/30",
      badgeBorder: "border-blue-400/40",
      pulseColor: "shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    },
    emerald: {
      accent: "#10b981",
      accentLight: "#6ee7b7",
      accentDark: "#047857",
      glowBg: "rgba(16, 185, 129, 0.15)",
      floorGlow: "rgba(16, 185, 129, 0.4)",
      floorGlowHover: "rgba(16, 185, 129, 0.7)",
      reticleRing: "border-emerald-400/40 bg-emerald-500/10",
      reticleText: "text-emerald-400",
      laserBeam: "from-emerald-400 via-emerald-500 to-transparent",
      iconColor: "text-emerald-300",
      tagColor: "text-emerald-400",
      borderSelected: "border-emerald-400",
      borderResting: "border-emerald-500/30",
      badgeGradient: "from-emerald-500/30 via-emerald-600/20 to-teal-900/30",
      badgeBorder: "border-emerald-400/40",
      pulseColor: "shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    },
    amber: {
      accent: "#f59e0b",
      accentLight: "#fde68a",
      accentDark: "#b45309",
      glowBg: "rgba(245, 158, 11, 0.15)",
      floorGlow: "rgba(245, 158, 11, 0.4)",
      floorGlowHover: "rgba(245, 158, 11, 0.7)",
      reticleRing: "border-amber-400/40 bg-amber-500/10",
      reticleText: "text-amber-400",
      laserBeam: "from-amber-400 via-amber-500 to-transparent",
      iconColor: "text-amber-300",
      tagColor: "text-amber-400",
      borderSelected: "border-amber-400",
      borderResting: "border-amber-500/30",
      badgeGradient: "from-amber-500/30 via-amber-600/20 to-orange-900/30",
      badgeBorder: "border-amber-400/40",
      pulseColor: "shadow-[0_0_15px_rgba(245,158,11,0.5)]",
    },
  };

  const theme = themeConfig[accentColor] || themeConfig.blue;

  // Elevation steps: 20px (Ground Orbit), 45px (Low Orbit), 75px (High Orbit), 110px (Stratum Apex)
  const currentElevation = isTopDown ? 0 : Math.max(10, Math.min(130, elevation));

  // Quick altitude change handlers
  const handleElevate = useCallback(
    (e) => {
      e.stopPropagation();
      const nextElev = currentElevation >= 100 ? 25 : currentElevation + 25;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, elevation: nextElev } }
            : n
        )
      );
    },
    [currentElevation, id, setNodes]
  );

  const handleDescend = useCallback(
    (e) => {
      e.stopPropagation();
      const nextElev = currentElevation <= 25 ? 100 : currentElevation - 25;
      setNodes((nds) =>
        nds.map((n) =>
          n.id === id
            ? { ...n, data: { ...n.data, elevation: nextElev } }
            : n
        )
      );
    },
    [currentElevation, id, setNodes]
  );

  // Multi-tier box shadow with ambient floor glow
  const cardShadows = React.useMemo(() => {
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
        0 14px 24px -2px rgba(0, 0, 0, 0.85),
        0 30px 60px -8px rgba(0, 0, 0, 0.85),
        0 18px 40px -2px ${theme.floorGlowHover},
        0 0 24px 3px ${theme.floorGlow}
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
        0 14px 20px -2px rgba(0, 0, 0, 0.8),
        0 34px 58px -10px rgba(0, 0, 0, 0.9),
        0 20px 36px -4px ${theme.floorGlowHover}
      `;
    }

    return `
      inset 0 1px 0 0 rgba(255, 255, 255, 0.25),
      inset 0 -2px 4px 0 rgba(0, 0, 0, 0.7),
      0 1px 0 0 #27272a,
      0 2px 0 0 #222226,
      0 3px 0 0 #1c1c20,
      0 4px 0 0 #17171b,
      0 5px 0 0 #101014,
      0 6px 0 0 #09090b,
      0 10px 16px -2px rgba(0, 0, 0, 0.8),
      0 24px 42px -6px rgba(0, 0, 0, 0.75),
      0 14px 28px -4px ${theme.floorGlow}
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
          1. HOLOGRAPHIC FLOOR RETICLE & PROJECTION TARGET (GROUND ZERO)
          Positioned on the ground plane directly below the floating node
         ───────────────────────────────────────────────────────────── */}
      {!isTopDown && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center transition-all duration-500 ease-out z-0"
          style={{
            bottom: "-30px",
            width: "180px",
            height: "60px",
            transform: `translateZ(0px) rotateX(65deg) scale(${1 + currentElevation * 0.003})`,
          }}
        >
          {/* Floor Contact Drop Shadow (Expands and softens as altitude increases) */}
          <div
            className="absolute rounded-full transition-all duration-500"
            style={{
              width: `${120 + currentElevation * 0.4}px`,
              height: `${40 + currentElevation * 0.25}px`,
              background: `radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 45%, transparent 75%)`,
              filter: `blur(${Math.max(4, currentElevation * 0.18)}px)`,
            }}
          />

          {/* Holographic Glowing Reticle Ring */}
          <div
            className={`absolute inset-0 rounded-full border border-dashed ${theme.reticleRing} opacity-70 transition-all duration-500 animate-pulse`}
            style={{
              boxShadow: `0 0 16px ${theme.floorGlow}`,
            }}
          />

          {/* Crosshair Center Reticle */}
          <div className="relative w-3 h-3 flex items-center justify-center">
            <div className={`w-1.5 h-1.5 rounded-full ${theme.reticleText} bg-current opacity-80`} />
            <div className="absolute w-5 h-[1px] bg-white/30" />
            <div className="absolute h-5 w-[1px] bg-white/30" />
          </div>

          {/* Coordinate Tag on the Floor */}
          <span
            className={`absolute -bottom-4 text-[8px] font-mono font-bold tracking-widest ${theme.reticleText} opacity-80 uppercase`}
          >
            ALT: +{currentElevation}m
          </span>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          2. VERTICAL LASER PLUMB LINE (LIGHT TETHER)
          Connects the floating card down to its floor reticle
         ───────────────────────────────────────────────────────────── */}
      {!isTopDown && (
        <div
          className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-full flex flex-col items-center z-0 transition-all duration-500 ease-out"
          style={{
            height: `${currentElevation + 20}px`,
            width: "2px",
            transformOrigin: "top center",
          }}
        >
          {/* Laser Core */}
          <div
            className={`w-[1.5px] h-full bg-gradient-to-b ${theme.laserBeam} opacity-85 shadow-[0_0_8px_currentColor]`}
          />

          {/* Flowing Energy Bead */}
          <div
            className="w-2 h-2 rounded-full bg-white absolute top-0 shadow-[0_0_10px_#ffffff] animate-ping opacity-60"
            style={{ animationDuration: "2s" }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. FLOATING 3D SLAB CARD (AT Z-HEIGHT)
         ───────────────────────────────────────────────────────────── */}
      <div
        ref={cardRef}
        onMouseMove={handlers.onMouseMove}
        onMouseLeave={handlers.onMouseLeave}
        className={`group relative min-w-[185px] cursor-pointer ${activeShapeClass} transition-all duration-300 ease-out border-[1.5px] ${
          selected ? theme.borderSelected : `${theme.borderResting} hover:border-zinc-500`
        }`}
        style={{
          background:
            "linear-gradient(135deg, rgba(20, 24, 33, 0.94) 0%, rgba(10, 13, 20, 0.97) 55%, rgba(5, 7, 15, 0.99) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: cardShadows,
          transformStyle: "preserve-3d",
          transform: isTopDown
            ? "none"
            : tilt.isHovered
            ? `perspective(850px) translateZ(${currentElevation + 12}px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(1.025)`
            : selected
            ? `perspective(850px) translateZ(${currentElevation + 10}px) scale(1.02)`
            : `perspective(850px) translateZ(${currentElevation}px) rotateX(0deg) rotateY(0deg) scale(1)`,
        }}
      >
        {/* Dynamic Specular Glare Sheen across the Glass Face */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden transition-opacity duration-300 z-10"
          style={{
            opacity: tilt.isHovered ? 1 : 0,
            background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.05) 40%, transparent 75%)`,
          }}
        />

        {/* Specular Top Edge Catch Line */}
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

        {/* Card Content Row */}
        <div
          className="flex items-center gap-3.5 relative z-20"
          style={{ transform: "translateZ(14px)", transformStyle: "preserve-3d" }}
        >
          {/* Floating 3D Icon Prism */}
          <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${theme.badgeGradient} ${theme.iconColor} border ${theme.badgeBorder} flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110`}
            style={{
              transform: "translateZ(16px)",
              boxShadow: `0 4px 12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.4), 0 0 16px ${theme.floorGlow}`,
            }}
          >
            {Icon && <Icon size={18} className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />}
          </div>

          {/* Text & Content Block */}
          <div className="flex flex-col min-w-0 flex-1 pr-1">
            {/* Header Telemetry Row */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9px] font-black uppercase tracking-[0.2em] ${theme.tagColor} select-none drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]`}
                >
                  {typeLabel}
                </span>
              </div>

              {/* Altitude Telemetry Capsule with Quick Levitation Buttons */}
              {!isTopDown && (
                <div
                  className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-zinc-900/80 border border-zinc-700/60 text-[9px] font-mono font-bold text-zinc-300 shadow-sm"
                  title="Node Elevation (Click arrows to change altitude)"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={handleDescend}
                    className="text-zinc-500 hover:text-zinc-200 cursor-pointer p-0.5"
                    title="Lower altitude"
                  >
                    <ChevronDown size={10} />
                  </button>
                  <span className={`${theme.tagColor}`}>{currentElevation}m</span>
                  <button
                    onClick={handleElevate}
                    className="text-zinc-500 hover:text-zinc-200 cursor-pointer p-0.5"
                    title="Raise altitude"
                  >
                    <ChevronUp size={10} />
                  </button>
                </div>
              )}
            </div>

            {/* Title / Inline Editor */}
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
                className="text-sm font-semibold text-zinc-100 truncate select-none tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.95)]"
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
