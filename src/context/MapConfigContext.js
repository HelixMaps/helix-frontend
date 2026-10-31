"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const MapConfigContext = createContext();

export const MapConfigProvider = ({ children }) => {
  const [nodeShape, setNodeShape] = useState("rounded");
  const [edgeStyle, setEdgeStyle] = useState("bezier"); // bezier, straight, step, smoothstep

  // View Mode: "3d" (Infinite 3D Space) or "2d" (Dotted Canvas)
  const [viewMode, setViewMode] = useState("3d");
  const [canvasPitch, setCanvasPitch] = useState(20);
  const [canvasYaw, setCanvasYaw] = useState(-4);
  const [shadowIntensity, setShadowIntensity] = useState("sleek");
  const [enableParallax, setEnableParallax] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedShape = localStorage.getItem("helix-node-shape");
      if (savedShape) setNodeShape(savedShape);

      const savedEdge = localStorage.getItem("helix-edge-style");
      if (savedEdge) setEdgeStyle(savedEdge);

      const savedViewMode = localStorage.getItem("helix-view-mode");
      if (savedViewMode) {
        setViewMode(savedViewMode === "2d" || savedViewMode === "3d-topdown" ? "2d" : "3d");
      }

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
    const normalized = mode === "2d" || mode === "3d-topdown" ? "2d" : "3d";
    setViewMode(normalized);
    if (typeof window !== "undefined") {
      localStorage.setItem("helix-view-mode", normalized);
    }
    if (normalized === "3d") {
      setCanvasPitch(20);
      setCanvasYaw(-4);
    } else {
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
