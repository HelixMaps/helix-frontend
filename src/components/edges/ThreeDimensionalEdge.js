"use client";

import React from "react";
import {
  getBezierPath,
  getStraightPath,
  getSmoothStepPath,
} from "@xyflow/react";
import { useMapConfig } from "@/context/MapConfigContext";

/**
 * ThreeDimensionalEdge
 * Renders an elevated 3D fiber-optic cable suspended above the canvas floor,
 * featuring a floor drop-shadow, ambient volumetric neon glow, specular metallic ridge,
 * and animated streaming 3D energy photons.
 */
export default function ThreeDimensionalEdge({
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

  const pathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };

  let edgePath = "";

  if (edgeStyle === "straight") {
    [edgePath] = getStraightPath(pathParams);
  } else if (edgeStyle === "step") {
    [edgePath] = getSmoothStepPath({ ...pathParams, borderRadius: 0 });
  } else if (edgeStyle === "smoothstep") {
    [edgePath] = getSmoothStepPath({ ...pathParams, borderRadius: 20 });
  } else {
    // Default to bezier curved
    [edgePath] = getBezierPath(pathParams);
  }

  // Color config based on source / edge styling
  const strokeColor = data?.color || style?.stroke || "#3b82f6";
  const glowColor = data?.glowColor || "rgba(59, 130, 246, 0.4)";
  const gradientId = `edge-3d-gradient-${id}`;
  const filterId = `edge-3d-blur-${id}`;

  return (
    <g className="react-flow__edge-3d">
      <defs>
        {/* Specular 3D Cable Gradient */}
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93c5fd" />
          <stop offset="45%" stopColor={strokeColor} />
          <stop offset="100%" stopColor="#18181b" />
        </linearGradient>

        {/* Ambient Blur Filter for Floor Shadow */}
        <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" />
        </filter>
      </defs>

      {/* 1. Floor Drop Shadow onto Canvas */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(0, 0, 0, 0.75)"
        strokeWidth={selected ? 7 : 5}
        strokeLinecap="round"
        transform="translate(0, 10)"
        filter={`url(#${filterId})`}
        className="pointer-events-none transition-all duration-300"
      />

      {/* 2. Ambient Volumetric Glow Tube */}
      <path
        d={edgePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth={selected ? 11 : 7}
        strokeOpacity={selected ? 0.5 : 0.22}
        strokeLinecap="round"
        className="pointer-events-none transition-all duration-300"
      />

      {/* 3. Main 3D Fiber-Optic Cable */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth={selected ? 3.5 : 2.5}
        strokeLinecap="round"
        className="cursor-pointer transition-all duration-200"
      />

      {/* 4. Top Specular Ridge Catch-Light */}
      <path
        d={edgePath}
        fill="none"
        stroke="rgba(255, 255, 255, 0.65)"
        strokeWidth={1}
        strokeLinecap="round"
        transform="translate(0, -0.6)"
        className="pointer-events-none opacity-80"
      />

      {/* 5. Animated 3D Flowing Energy Photons */}
      {animated && (
        <>
          {/* Lead Photon with Glow Halo */}
          <circle
            r={3.5}
            fill="#ffffff"
            style={{
              filter: "drop-shadow(0 0 5px #60a5fa) drop-shadow(0 0 8px #3b82f6)",
            }}
          >
            <animateMotion
              path={edgePath}
              dur="2.8s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>

          {/* Secondary Trailing Energy Packet */}
          <circle
            r={2}
            fill="#93c5fd"
            style={{ filter: "drop-shadow(0 0 4px #60a5fa)" }}
          >
            <animateMotion
              path={edgePath}
              dur="2.8s"
              begin="1.4s"
              repeatCount="indefinite"
              rotate="auto"
            />
          </circle>
        </>
      )}
    </g>
  );
}
