"use client";

import React, { memo } from "react";
import { Handle } from "@xyflow/react";

/**
 * ThreeDimensionalHandle
 * Renders a tactile 3D metallic optical port socket for node connection points.
 */
const ACCENT_PALETTES = {
  blue: {
    core: "bg-blue-400",
    glow: "rgba(59, 130, 246, 0.6)",
    ring: "border-blue-400/40",
    activeRing: "hover:border-blue-300",
  },
  emerald: {
    core: "bg-emerald-400",
    glow: "rgba(16, 185, 129, 0.6)",
    ring: "border-emerald-400/40",
    activeRing: "hover:border-emerald-300",
  },
  amber: {
    core: "bg-amber-400",
    glow: "rgba(245, 158, 11, 0.6)",
    ring: "border-amber-400/40",
    activeRing: "hover:border-amber-300",
  },
};

/**
 * ThreeDimensionalHandle
 * Renders a tactile 3D metallic optical port socket for node connection points.
 */
function ThreeDimensionalHandle({
  type,
  position,
  id,
  accentColor = "blue",
  className = "",
  style = {},
}) {
  const palette = ACCENT_PALETTES[accentColor] || ACCENT_PALETTES.blue;

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      className={`!w-3.5 !h-3.5 !rounded-full !border-[1.5px] ${palette.ring} ${palette.activeRing} !bg-gradient-to-b !from-zinc-800 !via-zinc-900 !to-black transition-all duration-200 group/handle hover:!scale-125 !cursor-crosshair flex items-center justify-center z-20 ${className}`}
      style={{
        boxShadow: `0 2px 5px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.35), 0 0 6px ${palette.glow}`,
        ...style,
      }}
    >
      {/* 3D Glowing Core Optical Bead */}
      <div
        className={`w-1.5 h-1.5 rounded-full ${palette.core} shadow-[0_0_6px_currentColor] pointer-events-none transition-transform group-hover/handle:scale-125`}
      />
    </Handle>
  );
}

export default memo(ThreeDimensionalHandle);
