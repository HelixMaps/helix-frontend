"use client";

import React, { memo, useMemo } from "react";
import {
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
} from "@xyflow/react";
import { useMapConfig } from "@/context/MapConfigContext";

/**
 * SharedEdgeDefs
 * Renders shared SVG filter definitions once, outside of individual edges.
 * Mount this once inside the ReactFlow <svg> (or a parent <defs>).
 */
export function SharedEdgeDefs() {
  return null;
}

/**
 * ThreeDimensionalEdge
 * High-performance 3D edge renderer:
 * - ZERO CSS transitions on path geometry — edges track node positions instantly during drag
 * - Shared SVG filter (no per-edge <defs> bloat)
 * - Lightweight animated dash-offset for energy flow instead of heavy animateMotion circles
 * - React.memo with custom comparator to skip unnecessary re-renders
 */
function ThreeDimensionalEdgeInner({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  selected,
  animated = true,
  data,
}) {
  const { edgeStyle } = useMapConfig();

  // Compute path — memoized to avoid recalculation when unrelated props change
  const edgePath = useMemo(() => {
    const pathParams = {
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    };

    if (edgeStyle === "straight") {
      return getStraightPath(pathParams)[0];
    } else if (edgeStyle === "step") {
      return getSmoothStepPath({ ...pathParams, borderRadius: 0 })[0];
    } else if (edgeStyle === "smoothstep") {
      return getSmoothStepPath({ ...pathParams, borderRadius: 20 })[0];
    } else {
      return getBezierPath(pathParams)[0];
    }
  }, [sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, edgeStyle]);

  // Color config
  const strokeColor = data?.color || style?.stroke || "#3b82f6";
  const gradientId = `edge-grad-${id}`;

  return (
    <g className="react-flow__edge-3d">
      <defs>
        {/* Per-edge gradient (lightweight — just 3 stops, no filter) */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="45%" stopColor={strokeColor} />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>
      </defs>

      {/* 1. Floor Ambient Contact Shadow (Soft outer penumbra) — 100% GPU vector accelerated */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(0, 0, 0, 0.25)"
        strokeWidth={selected ? 10 : 8}
        strokeLinecap="round"
        transform="translate(0, 10)"
        className="pointer-events-none"
      />
      {/* 1b. Floor Contact Shadow Core */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(0, 0, 0, 0.55)"
        strokeWidth={selected ? 6 : 4}
        strokeLinecap="round"
        transform="translate(0, 10)"
        className="pointer-events-none"
      />

      {/* 2. Ambient Volumetric Glow Tube — NO transition */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={selected ? 11 : 7}
        strokeOpacity={selected ? 0.5 : 0.22}
        strokeLinecap="round"
        className="pointer-events-none"
      />

      {/* 3. Main 3D Fiber-Optic Cable — NO transition */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={selected ? 3.5 : 2.5}
        strokeLinecap="round"
        className="cursor-pointer"
      />

      {/* 4. Top Specular Ridge Catch-Light — NO transition */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth={1}
        strokeLinecap="round"
        transform="translate(0, -0.6)"
        className="pointer-events-none opacity-80"
      />

      {/* 5. Animated Energy Flow — lightweight dash animation instead of animateMotion */}
      {animated && (
        <path
          d={edgePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="6 14"
          className="pointer-events-none edge-energy-flow"
          style={{ opacity: 0.8 }}
        />
      )}
    </g>
  );
}

// Custom comparator: only re-render when geometry, selection, or style actually changes
function areEdgePropsEqual(prev, next) {
  return (
    prev.sourceX === next.sourceX &&
    prev.sourceY === next.sourceY &&
    prev.targetX === next.targetX &&
    prev.targetY === next.targetY &&
    prev.sourcePosition === next.sourcePosition &&
    prev.targetPosition === next.targetPosition &&
    prev.selected === next.selected &&
    prev.animated === next.animated &&
    prev.id === next.id &&
    prev.style?.stroke === next.style?.stroke &&
    prev.data?.color === next.data?.color
  );
}

const ThreeDimensionalEdge = memo(ThreeDimensionalEdgeInner, areEdgePropsEqual);
export default ThreeDimensionalEdge;
