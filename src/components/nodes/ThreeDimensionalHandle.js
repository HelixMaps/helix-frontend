"use client";

import React, { memo } from "react";
import { Handle } from "@xyflow/react";
import { getNodeTheme } from "@/config/nodeThemes";

function ThreeDimensionalHandle({
  type,
  position,
  id,
  accentColor,
  isConnectable = true,
}) {
  const theme = getNodeTheme(accentColor);
  const palette = theme.handle;

  return (
    <Handle
      type={type}
      position={position}
      id={id}
      isConnectable={isConnectable}
      className={`!w-2.5 !h-2.5 !rounded-full !bg-[#0b0c10] !border-[1.5px] !border-zinc-500 hover:!border-white hover:!scale-125 hover:ring-4 ${palette.ring} transition-all duration-150 z-30 ${
        !isConnectable ? "!pointer-events-none !opacity-0 !hidden" : ""
      }`}
      style={{
        boxShadow: `inset 0 0 0 1px ${palette.core}, ${palette.glow}`,
      }}
    />
  );
}

export default memo(ThreeDimensionalHandle);