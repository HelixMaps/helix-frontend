"use client";

import React, { useState } from "react";
import { 
  Box, 
  Layers, 
  Grid, 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  RotateCcw,
  Sliders,
  Maximize2
} from "lucide-react";
import { useMapConfig } from "@/context/MapConfigContext";
import { useReactFlow } from "@xyflow/react";

/**
 * Canvas3DControls
 * Sleek floating HUD on the canvas allowing users to toggle between
 * 3D Perspective, 3D Isometric, and 3D Studio (Top-Down) modes,
 * adjust camera pitch/tilt, toggle cursor parallax, and reset the 3D camera.
 */
export default function Canvas3DControls() {
  const {
    viewMode,
    changeViewMode,
    canvasPitch,
    changeCanvasPitch,
    enableParallax,
    toggleParallax,
  } = useMapConfig();

  const { fitView } = useReactFlow();
  const [showPitchSlider, setShowPitchSlider] = useState(false);

  const modes = [
    {
      id: "3d-perspective",
      label: "3D Perspective",
      shortLabel: "3D Orbit",
      icon: Box,
      description: "Dynamic perspective with depth vanishing horizon",
    },
    {
      id: "3d-isometric",
      label: "3D Isometric",
      shortLabel: "Isometric",
      icon: Grid,
      description: "Classic architectural 35° isometric projection",
    },
    {
      id: "3d-topdown",
      label: "Top-Down Studio",
      shortLabel: "Studio 2D",
      icon: Eye,
      description: "Overhead camera with full 3D extruded nodes & shadows",
    },
  ];

  const handlePitchStep = (delta) => {
    changeCanvasPitch(canvasPitch + delta);
  };

  const handleResetCamera = () => {
    changeViewMode("3d-perspective");
    fitView({ padding: 0.35, duration: 600 });
  };

  return (
    <div className="fixed bottom-6 left-6 z-30 flex flex-col items-start gap-2 select-none">
      {/* Expanded Pitch Slider Popup */}
      {showPitchSlider && viewMode !== "3d-topdown" && (
        <div className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800/90 rounded-2xl p-3 shadow-2xl flex flex-col gap-2.5 min-w-[200px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400">
            <span>Camera Pitch Angle</span>
            <span className="text-blue-400">{canvasPitch}°</span>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="50"
              step="2"
              value={canvasPitch}
              onChange={(e) => changeCanvasPitch(Number(e.target.value))}
              className="w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/60 text-[9px] text-zinc-500 font-mono">
            <span>Flat (0°)</span>
            <span>Steep (50°)</span>
          </div>
        </div>
      )}

      {/* Main Floating 3D Control Pill */}
      <div className="flex items-center gap-1.5 p-1.5 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/90 rounded-full shadow-[0_16px_32px_-4px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.15)] transition-all">
        {/* Mode Buttons */}
        <div className="flex items-center gap-1 bg-zinc-900/60 p-0.5 rounded-full border border-zinc-800/50">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => changeViewMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.4),inset_0_1px_0_rgba(255,255,255,0.3)]"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
                title={mode.description}
              >
                <Icon size={13} className={isActive ? "text-white" : "text-zinc-400"} />
                <span className="hidden sm:inline">{mode.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Pitch Angle Indicator & Slider Toggle (if in 3D mode) */}
        {viewMode !== "3d-topdown" && (
          <div className="flex items-center gap-0.5 px-1.5 border-l border-zinc-800/80">
            <button
              onClick={() => handlePitchStep(-4)}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 cursor-pointer transition-colors"
              title="Tilt Camera Up"
            >
              <ChevronDown size={13} />
            </button>

            <button
              onClick={() => setShowPitchSlider(!showPitchSlider)}
              className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold cursor-pointer transition-colors ${
                showPitchSlider
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/50"
              }`}
              title="Adjust 3D Tilt Angle"
            >
              {canvasPitch}°
            </button>

            <button
              onClick={() => handlePitchStep(4)}
              className="p-1 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 cursor-pointer transition-colors"
              title="Tilt Camera Down"
            >
              <ChevronUp size={13} />
            </button>
          </div>
        )}

        {/* Parallax Cursor Reaction Toggle */}
        <button
          onClick={toggleParallax}
          className={`p-1.5 rounded-full cursor-pointer transition-all ${
            enableParallax
              ? "text-blue-400 bg-blue-500/10 border border-blue-500/30 shadow-[0_0_8px_rgba(59,130,246,0.2)]"
              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
          }`}
          title={enableParallax ? "Interactive Mouse Parallax: ON" : "Interactive Mouse Parallax: OFF"}
        >
          <Sparkles size={14} />
        </button>

        {/* Reset Camera Position */}
        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/80 cursor-pointer transition-colors"
          title="Reset Camera & Center Map"
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </div>
  );
}
