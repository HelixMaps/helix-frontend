"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const MapConfigContext = createContext();

export const MapConfigProvider = ({ children }) => {
  const [nodeShape, setNodeShape] = useState("rounded");
  const [edgeStyle, setEdgeStyle] = useState("bezier"); // bezier, straight, step, smoothstep

  // 3D Visual and Spatial Perspective Configuration
  const [viewMode, setViewMode] = useState("3d-perspective"); // "3d-perspective", "3d-isometric", "3d-topdown"
  const [canvasPitch, setCanvasPitch] = useState(20); // Degrees of X tilt
  const [canvasYaw, setCanvasYaw] = useState(-4); // Degrees of Z rotation
  const [shadowIntensity, setShadowIntensity] = useState("sleek"); // "ultra", "sleek", "subtle"
  const [enableParallax, setEnableParallax] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedShape = localStorage.getItem("helix-node-shape");
      if (savedShape) setNodeShape(savedShape);

      const savedEdge = localStorage.getItem("helix-edge-style");
      if (savedEdge) setEdgeStyle(savedEdge);

      const savedViewMode = localStorage.getItem("helix-view-mode");
      if (savedViewMode) setViewMode(savedViewMode);

      const savedPitch = localStorage.getItem("helix-canvas-pitch");
      if (savedPitch) setCanvasPitch(Number(savedPitch));

      const savedYaw = localStorage.getItem("helix-canvas-yaw");
      if (savedYaw) setCanvasYaw(Number(savedYaw));

      const savedShadow = localStorage.getItem("helix-shadow-intensity");
      if (savedShadow) setShadowIntensity(savedShadow);

      const savedParallax = localStorage.getItem("helix-enable-parallax");
      if (savedParallax !== null) setEnableParallax(savedParallax === "true");
    }
  }, []);

  const changeNodeShape = (shape) => {
    setNodeShape(shape);
    if (typeof window !== "undefined") {
      localStorage.setItem("helix-node-shape", shape);
    }
  };

  const changeEdgeStyle = (style) => {
    setEdgeStyle(style);
    if (typeof window !== "undefined") {
      localStorage.setItem("helix-edge-style", style);
    }
  };

  const changeViewMode = (mode) => {
    setViewMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem("helix-view-mode", mode);
    }
    // Set matching default pitch and yaw for mode
    if (mode === "3d-perspective") {
      setCanvasPitch(20);
      setCanvasYaw(-4);
    } else if (mode === "3d-isometric") {
      setCanvasPitch(35);
      setCanvasYaw(-18);
    } else if (mode === "3d-topdown") {
      setCanvasPitch(0);
      setCanvasYaw(0);
    }
  };

  const changeCanvasPitch = (pitch) => {
    const val = Math.max(0, Math.min(60, pitch));
    setCanvasPitch(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("helix-canvas-pitch", String(val));
    }
  };

  const changeCanvasYaw = (yaw) => {
    const val = Math.max(-45, Math.min(45, yaw));
    setCanvasYaw(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("helix-canvas-yaw", String(val));
    }
  };

  const changeShadowIntensity = (intensity) => {
    setShadowIntensity(intensity);
    if (typeof window !== "undefined") {
      localStorage.setItem("helix-shadow-intensity", intensity);
    }
  };

  const toggleParallax = () => {
    setEnableParallax((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("helix-enable-parallax", String(next));
      }
      return next;
    });
  };

  return (
    <MapConfigContext.Provider
      value={{
        nodeShape,
        changeNodeShape,
        edgeStyle,
        changeEdgeStyle,
        viewMode,
        changeViewMode,
        canvasPitch,
        changeCanvasPitch,
        canvasYaw,
        changeCanvasYaw,
        shadowIntensity,
        changeShadowIntensity,
        enableParallax,
        toggleParallax,
      }}
    >
      {children}
    </MapConfigContext.Provider>
  );
};

export const useMapConfig = () => useContext(MapConfigContext);
