"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  Box, 
  Grid, 
  Eye, 
  Sparkles, 
  RotateCcw,
  Compass,
  Play,
  Pause,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2
} from "lucide-react";
import { useMapConfig } from "@/context/MapConfigContext";
import { useReactFlow } from "@xyflow/react";

/**
 * Canvas3DControls
 * Next-gen 3D Spatial Gimbal HUD:
 * - Interactive 3D Orbit Trackpad (drag to rotate camera in pitch & yaw)
 * - Cinematic Presets (Matrix 3D, Cyber Isometric, Deep Orbit, Studio Top-Down)
 * - Auto-Orbit Cinematic Showcase toggle
 * - Elevation scale booster (1x / 1.5x / 2x)
 * - Zoom & Reset camera actions
 */
export default function Canvas3DControls() {
  const {
    viewMode,
    changeViewMode,
    canvasPitch,
    changeCanvasPitch,
    canvasYaw,
    changeCanvasYaw,
    enableParallax,
    toggleParallax,
  } = useMapConfig();

  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [isGimbalOpen, setIsGimbalOpen] = useState(false);
  const [isAutoOrbit, setIsAutoOrbit] = useState(false);
  const [isDraggingGimbal, setIsDraggingGimbal] = useState(false);
  const gimbalRef = useRef(null);

  // Cinematic Presets
  const presets = [
    {
      id: "3d-perspective",
      label: "Matrix 3D",
      icon: Box,
      pitch: 28,
      yaw: -6,
      desc: "Cinematic perspective with receding horizon",
    },
    {
      id: "3d-isometric",
      label: "Isometric",
      icon: Grid,
      pitch: 42,
      yaw: -28,
      desc: "Architectural 35° isometric matrix",
    },
    {
      id: "deep-orbit",
      label: "Deep Orbit",
      icon: Compass,
      pitch: 46,
      yaw: 14,
      desc: "Steep spatial orbit showcasing high levitation",
    },
    {
      id: "3d-topdown",
      label: "Studio 2D",
      icon: Eye,
      pitch: 0,
      yaw: 0,
      desc: "Overhead studio view for precision editing",
    },
  ];

  // Auto-Orbit cinematic sweep
  useEffect(() => {
    if (!isAutoOrbit || viewMode === "3d-topdown") return;

    let angle = canvasYaw;
    let frameId;
    let startTime = performance.now();

    const loop = (now) => {
      const elapsed = (now - startTime) / 1000;
      // Gentle sine sweep between -15° and +15°
      const newYaw = Math.sin(elapsed * 0.5) * 16;
      const newPitch = 28 + Math.cos(elapsed * 0.4) * 6;
      changeCanvasYaw(Math.round(newYaw));
      changeCanvasPitch(Math.round(newPitch));
      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [isAutoOrbit, viewMode, changeCanvasYaw, changeCanvasPitch]);

  // Interactive Orbit Trackpad Drag Handler
  const handleGimbalMouseDown = (e) => {
    e.preventDefault();
    setIsDraggingGimbal(true);
    setIsAutoOrbit(false);
    updateGimbalAngles(e);
  };

  const updateGimbalAngles = useCallback(
    (e) => {
      if (!gimbalRef.current) return;
      const rect = gimbalRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = (e.clientX - centerX) / (rect.width / 2);
      const deltaY = (e.clientY - centerY) / (rect.height / 2);

      // Clamp between -1 and 1
      const clampedX = Math.max(-1, Math.min(1, deltaX));
      const clampedY = Math.max(-1, Math.min(1, deltaY));

      // Map to pitch (0° to 55°) and yaw (-40° to 40°)
      const newPitch = Math.round(Math.max(0, Math.min(55, (1 - clampedY) * 27.5)));
      const newYaw = Math.round(clampedX * 35);

      changeCanvasPitch(newPitch);
      changeCanvasYaw(newYaw);
    },
    [changeCanvasPitch, changeCanvasYaw]
  );

  useEffect(() => {
    const onMouseMove = (e) => {
      if (isDraggingGimbal) {
        updateGimbalAngles(e);
      }
    };
    const onMouseUp = () => {
      setIsDraggingGimbal(false);
    };

    if (isDraggingGimbal) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDraggingGimbal, updateGimbalAngles]);

  const handleSelectPreset = (preset) => {
    setIsAutoOrbit(false);
    changeViewMode(preset.id);
    changeCanvasPitch(preset.pitch);
    changeCanvasYaw(preset.yaw);
  };

  const handleResetCamera = () => {
    setIsAutoOrbit(false);
    changeViewMode("3d-perspective");
    changeCanvasPitch(28);
    changeCanvasYaw(-6);
    fitView({ padding: 0.35, duration: 600 });
  };

  return (
    <div className="fixed bottom-6 left-6 z-30 flex flex-col items-start gap-3 select-none">
      {/* ── EXPANDED 3D ORBIT GIMBAL TRACKPAD ── */}
      {isGimbalOpen && (
        <div
          className="bg-zinc-950/95 backdrop-blur-2xl border border-zinc-700/80 rounded-2xl p-4 flex flex-col gap-3 min-w-[240px] animate-in fade-in slide-in-from-bottom-3 duration-200"
          style={{
            boxShadow:
              "0 4px 0 0 #18181b, 0 24px 48px -6px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.2)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 uppercase tracking-wider font-mono">
              <Compass size={14} className="text-blue-400" />
              <span>Spatial Orbit Gimbal</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
              P:{canvasPitch}° Y:{canvasYaw}°
            </span>
          </div>

          {/* Interactive 3D Sphere Trackpad */}
          <div className="flex flex-col items-center gap-1.5 py-1">
            <div
              ref={gimbalRef}
              onMouseDown={handleGimbalMouseDown}
              className={`relative w-28 h-28 rounded-full border-2 border-zinc-700/80 bg-gradient-to-b from-zinc-900 to-black cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden transition-all duration-150 ${
                isDraggingGimbal ? "border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]" : "hover:border-zinc-500"
              }`}
              title="Click and drag inside this sphere to orbit in 3D"
            >
              {/* Coordinate Grid Ring */}
              <div className="absolute inset-2 rounded-full border border-dashed border-zinc-700/60 pointer-events-none" />

              {/* Tilted Horizon Ring */}
              <div
                className="absolute w-24 h-8 rounded-full border border-blue-400/40 pointer-events-none transition-transform"
                style={{
                  transform: `rotateX(${canvasPitch}deg) rotateZ(${canvasYaw}deg)`,
                  boxShadow: "0 0 10px rgba(59,130,246,0.3)",
                }}
              />

              {/* Gimbal Center Reticle Needle */}
              <div
                className="absolute w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_12px_#3b82f6] pointer-events-none transition-transform"
                style={{
                  transform: `translate(${canvasYaw * 1.1}px, ${-(canvasPitch - 25) * 1.1}px)`,
                }}
              />

              {/* Compass Cardinal Markers */}
              <span className="absolute top-1 text-[8px] font-mono text-zinc-500 pointer-events-none">N</span>
              <span className="absolute bottom-1 text-[8px] font-mono text-zinc-500 pointer-events-none">S</span>
              <span className="absolute left-1.5 text-[8px] font-mono text-zinc-500 pointer-events-none">W</span>
              <span className="absolute right-1.5 text-[8px] font-mono text-zinc-500 pointer-events-none">E</span>
            </div>

            <span className="text-[9px] text-zinc-500 font-mono">Drag sphere to orbit camera in 3D</span>
          </div>

          {/* Quick Pitch Slider */}
          <div className="flex flex-col gap-1 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Pitch Tilt</span>
              <span className="text-blue-400 font-bold">{canvasPitch}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="55"
              step="1"
              value={canvasPitch}
              onChange={(e) => {
                setIsAutoOrbit(false);
                changeCanvasPitch(Number(e.target.value));
              }}
              className="w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Cinematic Auto-Orbit Toggle Button */}
          <button
            onClick={() => setIsAutoOrbit(!isAutoOrbit)}
            className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              isAutoOrbit
                ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60"
            }`}
          >
            {isAutoOrbit ? <Pause size={12} /> : <Play size={12} />}
            <span>{isAutoOrbit ? "Stop Auto-Orbit" : "Cinematic Auto-Orbit"}</span>
          </button>
        </div>
      )}

      {/* ── MAIN FLOATING 3D DOCK / HUD BAR ── */}
      <div
        className="flex items-center gap-1.5 p-1.5 bg-zinc-950/90 backdrop-blur-2xl border border-zinc-700/80 rounded-full transition-all duration-200"
        style={{
          boxShadow:
            "0 4px 0 0 #18181b, 0 16px 36px -4px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.2)",
        }}
      >
        {/* Preset Camera Mode Selector */}
        <div className="flex items-center gap-1 bg-zinc-900/80 p-0.5 rounded-full border border-zinc-800/80">
          {presets.map((preset) => {
            const Icon = preset.icon;
            const isActive =
              viewMode === preset.id ||
              (preset.id === "deep-orbit" && viewMode === "3d-perspective" && canvasPitch >= 40);

            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60"
                }`}
                title={preset.desc}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-zinc-400"} />
                <span className="hidden md:inline">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Orbit Gimbal Modal Trigger Button */}
        <button
          onClick={() => setIsGimbalOpen(!isGimbalOpen)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-mono font-bold cursor-pointer transition-all ${
            isGimbalOpen
              ? "bg-blue-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.4)]"
              : "text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60"
          }`}
          title="Toggle 3D Orbit Gimbal Trackpad"
        >
          <Compass size={13} className="text-blue-400" />
          <span>{canvasPitch}°</span>
        </button>

        {/* Cursor Parallax Reaction Toggle */}
        <button
          onClick={toggleParallax}
          className={`p-2 rounded-full cursor-pointer transition-all ${
            enableParallax
              ? "text-blue-400 bg-blue-500/10 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
          }`}
          title={enableParallax ? "Interactive Mouse Parallax: ON" : "Interactive Mouse Parallax: OFF"}
        >
          <Sparkles size={14} />
        </button>

        {/* Zoom In & Out */}
        <div className="flex items-center border-l border-zinc-800/80 pl-1 gap-0.5">
          <button
            onClick={() => zoomIn({ duration: 300 })}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => zoomOut({ duration: 300 })}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>
        </div>

        {/* Reset Camera to Default */}
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800/80 cursor-pointer transition-colors border-l border-zinc-800/80"
          title="Reset Camera & Center Map"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}
