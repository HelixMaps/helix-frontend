"use client";

import React, { memo } from "react";
import { Handle } from "@xyflow/react";

const HANDLE_COLORS = {
  emerald: {
    ring: "hover:ring-emerald-400/50",
    glow: "0 0 10px rgba(16, 185, 129, 0.85)",
    core: "#34d399",
  },
  cyan: {
    ring: "hover:ring-cyan-400/50",
    glow: "0 0 10px rgba(34, 211, 238, 0.85)",
    core: "#22d3ee",
  },
  blue: {
    ring: "hover:ring-blue-400/50",
    glow: "0 0 10px rgba(59, 130, 246, 0.85)",
    core: "#60a5fa",
  },
  amber: {
    ring: "hover:ring-amber-400/50",
    glow: "0 0 10px rgba(245, 158, 11, 0.85)",
    core: "#fbbf24",
  },
};

function ThreeDimensionalHandle({
  type,
  position,
  id,
  accentColor = "emerald",
  isConnectable = true,
}) {
  const palette = HANDLE_COLORS[accentColor] || HANDLE_COLORS.emerald;

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      isConnectable={isConnectable}
      className={`!w-2.5 !h-2.5 !rounded-full !bg-[#0b0c10] !border-[1.5px] !border-zinc-500 hover:!border-white hover:!scale-125 hover:ring-4 ${palette.ring} transition-all duration-150 z-30`}
      style={{
        boxShadow: `inset 0 0 0 1px ${palette.core}, ${palette.glow}`,
      }}
    />
  );
}

export default memo(ThreeDimensionalHandle);