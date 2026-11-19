"use client";

import React, { memo, useMemo } from "react";
import {
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
  useInternalNode,
  Position,
} from "@xyflow/react";
import { useMapConfig } from "@/context/MapConfigContext";

export function SharedEdgeDefs() {
  return null;
}

/**
 * Calculates exact local handle anchor coordinates on the physical node boundary.
 * Immune to CSS 3D perspective distortion and shape switching.
 */
function getHandleCoord(node, position, fallbackX, fallbackY) {
  if (!node || !node.internals?.positionAbsolute) {
    return { x: fallbackX, y: fallbackY };
  }
  const x = node.internals.positionAbsolute.x ?? node.position?.x ?? 0;
  const y = node.internals.positionAbsolute.y ?? node.position?.y ?? 0;
  const width = node.measured?.width ?? node.width ?? 220;
  const height = node.measured?.height ?? node.height ?? 66;

  switch (position) {
    case Position.Right:
      return { x: x + width, y: y + height / 2 };
    case Position.Left:
      return { x, y: y + height / 2 };
    case Position.Top:
      return { x: x + width / 2, y };
    case Position.Bottom:
      return { x: x + width / 2, y: y + height };
    default:
      return { x: fallbackX, y: fallbackY };
  }
}

function ThreeDimensionalEdgeInner({
  id,
  source,
  target,
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
  const { edgeStyle, viewMode } = useMapConfig();
  const is2D = viewMode === "2d" || viewMode === "3d-topdown";

  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  const { x: exactSourceX, y: exactSourceY } = useMemo(
    () => getHandleCoord(sourceNode, sourcePosition, sourceX, sourceY),
    [sourceNode, sourcePosition, sourceX, sourceY]
  );

  const { x: exactTargetX, y: exactTargetY } = useMemo(
    () => getHandleCoord(targetNode, targetPosition, targetX, targetY),
    [targetNode, targetPosition, targetX, targetY]
  );

  const edgePath = useMemo(() => {
    const pathParams = {
      sourceX: exactSourceX,
      sourceY: exactSourceY,
      sourcePosition,
      targetX: exactTargetX,
      targetY: exactTargetY,
      targetPosition,
    };

    if (edgeStyle === "straight") {
      return getStraightPath(pathParams)[0];
    } else if (edgeStyle === "step") {
      return getSmoothStepPath({ ...pathParams, borderRadius: 6 })[0];
    } else if (edgeStyle === "smoothstep") {
      return getSmoothStepPath({ ...pathParams, borderRadius: 16 })[0];
    } else {
      return getBezierPath(pathParams)[0];
    }
  }, [
    exactSourceX,
    exactSourceY,
    sourcePosition,
    exactTargetX,
    exactTargetY,
    targetPosition,
    edgeStyle,
  ]);

  // Default to Helix Emerald -> Cyan trace unless overridden by data.color or style.stroke
  const primaryColor = data?.color || style?.stroke || "#10b981";
  const secondaryColor = data?.color ? primaryColor : "#22d3ee";
  const gradientId = `helix-edge-grad-${id}`;

  return (
    <g className="react-flow__edge-3d">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.95" />
          <stop offset="50%" stopColor={secondaryColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={primaryColor} stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* 1. 3D Floor Drop Shadow (Hidden in flat 2D mode for crispness) */}
      {!is2D && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(0, 0, 0, 0.7)"
          strokeWidth={selected ? 6 : 4}
          strokeLinecap="round"
          transform="translate(0, 18)"
          className="pointer-events-none"
        />
      )}

      {/* 2. Ambient PCB Trace Under-Glow */}
      <path
        d={edgePath}
        fill="none"
        stroke={primaryColor}
        strokeWidth={selected ? 10 : 6}
        strokeOpacity={selected ? 0.35 : 0.14}
        strokeLinecap="round"
        className="pointer-events-none"
      />

      {/* 3. Base Dark Conduit Core (Gives crisp contrast against grid) */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke="#0b0c10"
        strokeWidth={selected ? 4.5 : 3.5}
        strokeLinecap="round"
        className="cursor-pointer"
      />

      {/* 4. Luminous Trace Line */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={selected ? 2.5 : 1.75}
        strokeLinecap="round"
        className="pointer-events-none"
      />

      {/* 5. Specular Top Highlight */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.35)"
        strokeWidth={0.75}
        strokeLinecap="round"
        transform="translate(0, -0.5)"
        className="pointer-events-none"
      />

      {/* 6. Animated Electron Pulse */}
      {animated && (
        <path
          d={edgePath}
          fill="none"
          stroke="#ffffff"
          strokeWidth={selected ? 2.5 : 2}
          strokeLinecap="round"
          strokeDasharray="4 22"
          className="pointer-events-none edge-energy-flow"
          style={{ opacity: selected ? 0.95 : 0.75 }}
        />
      )}

      {/* 7. Terminal Circuit Node Solder Points */}
      <circle
        cx={exactSourceX}
        cy={exactSourceY}
        r={selected ? 3.5 : 2.5}
        fill={primaryColor}
        className="pointer-events-none"
      />
      <circle
        cx={exactTargetX}
        cy={exactTargetY}
        r={selected ? 3.5 : 2.5}
        fill={secondaryColor}
        className="pointer-events-none"
      />
    </g>
  );
}

function areEdgePropsEqual(prev, next) {
  return (
    prev.id === next.id &&
    prev.source === next.source &&
    prev.target === next.target &&
    prev.sourceX === next.sourceX &&
    prev.sourceY === next.sourceY &&
    prev.targetX === next.targetX &&
    prev.targetY === next.targetY &&
    prev.sourcePosition === next.sourcePosition &&
    prev.targetPosition === next.targetPosition &&
    prev.selected === next.selected &&
    prev.animated === next.animated &&
    prev.style?.stroke === next.style?.stroke &&
    prev.data?.color === next.data?.color
  );
}

const ThreeDimensionalEdge = memo(ThreeDimensionalEdgeInner, areEdgePropsEqual);
export default ThreeDimensionalEdge;