"use client";

import React, { useMemo, memo } from "react";
import { Position } from "@xyflow/react";
import { use3DTilt } from "@/hooks/use3DTilt";
import { useMapConfig } from "@/context/MapConfigContext";
import ThreeDimensionalHandle from "./ThreeDimensionalHandle";
import { Workflow } from "lucide-react";
import { getNodeTheme } from "@/config/nodeThemes";

const SHAPE_GEOMETRY = {
  rounded: "rounded-2xl",
  pill: "rounded-full",
  sharp: "rounded-none",
  leaf: "rounded-[26px_4px_26px_4px]",
  asymmetric: "rounded-[4px_26px_4px_26px]",
};

function ThreeDimensionalCard({
  id,
  type = "default",
  label = "",
  icon: Icon,
  accentColor,
  isEditing = false,
  isReadOnly = false,
  selected = false,
  children,
  onLabelChange,
  onLabelBlur,
  onLabelKeyDown,
}) {
  const { nodeShape, viewMode } = useMapConfig();
  const is2D = viewMode === "2d" || viewMode === "3d-topdown";

  const { cardRef, tilt, handlers } = use3DTilt({ maxTilt: 7, scale: 1.02 });

  const activeShapeClass = SHAPE_GEOMETRY[nodeShape] || SHAPE_GEOMETRY.rounded;
  const theme = getNodeTheme(accentColor);

  // Floating VisionOS-style depth shadow
  const floatingShadow = useMemo(() => {
    if (is2D) {
      return selected
        ? `0 12px 30px -4px rgba(0, 0, 0, 0.75), 0 0 24px ${theme.shadowColor}`
        : "0 8px 20px -4px rgba(0, 0, 0, 0.6)";
    }

    return selected
      ? `0 28px 50px -8px rgba(0, 0, 0, 0.95), 0 12px 32px -4px ${theme.shadowColor}, inset 0 1px 1px rgba(255, 255, 255, 0.35)`
      : tilt.isHovered
      ? `0 34px 56px -8px rgba(0, 0, 0, 0.95), 0 14px 34px -4px ${theme.shadowColor}, inset 0 1px 1px rgba(255, 255, 255, 0.3)`
      : `0 22px 38px -8px rgba(0, 0, 0, 0.9), 0 8px 22px -6px ${theme.shadowColor}, inset 0 1px 1px rgba(255, 255, 255, 0.22)`;
  }, [is2D, selected, tilt.isHovered, theme.shadowColor]);

  const HeaderIcon = Icon || Workflow;

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
          ? `translateY(-8px) rotateX(${tilt.x * 0.7}deg) rotateY(${tilt.y * 0.7}deg)`
          : selected
          ? "translateY(-4px)"
          : "none",
        transition: "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      {/* Projected Ground Glow Pad */}
      {!is2D && (
        <div
          className="pointer-events-none absolute -bottom-4 left-4 right-4 h-5 rounded-full blur-xl transition-opacity duration-300"
          style={{
            background: theme.accent,
            opacity: selected ? 0.38 : tilt.isHovered ? 0.32 : 0.14,
            transform: "translateZ(-20px)",
          }}
        />
      )}

      {/* Unified Two-Zone Architectural Glass Tile */}
      <div
        className={`group relative min-w-[240px] max-w-[310px] ${activeShapeClass} overflow-hidden transition-all duration-200 border ${
          selected ? theme.borderSelected : theme.borderIdle
        }`}
        style={{
          background: theme.gradientSurface,
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          transformStyle: "preserve-3d",
          transform: is2D ? "none" : "translateZ(18px)",
          boxShadow: floatingShadow,
        }}
      >
        {/* Specular Glass Glare */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-300 z-10"
          style={{
            opacity: tilt.isHovered ? 1 : 0,
            background: `radial-gradient(220px circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.16) 0%, transparent 70%)`,
          }}
        />

        <ThreeDimensionalHandle
          type="target"
          position={Position.Left}
          id="target-left"
          accentColor={theme.key}
          isConnectable={!isReadOnly}
        />
        <ThreeDimensionalHandle
          type="target"
          position={Position.Top}
          id="target-top"
          accentColor={theme.key}
          isConnectable={!isReadOnly}
        />

        {/* ZONE 1: Sleek Top Micro-Header Bar */}
        <div
          className="flex items-center justify-between px-3.5 py-2 border-b border-white/[0.08] relative z-20"
          style={{ background: theme.headerBg }}
        >
          <div className="flex items-center gap-2">
            <HeaderIcon size={13} className={theme.textAccent} />
            <span
              className={`text-[10px] font-bold uppercase tracking-[0.14em] ${theme.textAccent}`}
            >
              Node
            </span>
          </div>
        </div>

        {/* ZONE 2: Main Content Body */}
        <div
          className="px-4 py-3.5 flex items-center gap-3 relative z-20"
          style={{
            transform: is2D ? "none" : "translateZ(10px)",
            transformStyle: "preserve-3d",
          }}
        >
          <div className="flex flex-col min-w-0 flex-1">
            {isEditing ? (
              <input
                type="text"
                value={label}
                onChange={onLabelChange}
                onBlur={onLabelBlur}
                onKeyDown={onLabelKeyDown}
                className="nodrag bg-black/60 border border-white/25 rounded-lg px-2.5 py-1 text-sm font-medium text-white outline-none focus:border-white w-full"
                placeholder="Enter node title..."
                autoFocus
              />
            ) : (
              <span
                className="text-[14px] font-medium leading-snug tracking-[-0.01em] truncate select-none transition-colors text-zinc-100 group-hover:text-white"
                title={label}
              >
                {label || "New Node"}
              </span>
            )}

            {children}
          </div>
        </div>

        <ThreeDimensionalHandle
          type="source"
          position={Position.Right}
          id="source-right"
          accentColor={theme.key}
          isConnectable={!isReadOnly}
        />
        <ThreeDimensionalHandle
          type="source"
          position={Position.Bottom}
          id="source-bottom"
          accentColor={theme.key}
          isConnectable={!isReadOnly}
        />
      </div>
    </div>
  );
}

export default memo(ThreeDimensionalCard);