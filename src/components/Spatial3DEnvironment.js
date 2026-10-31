"use client";

import React, { useEffect, useRef } from "react";
import { useMapConfig } from "@/context/MapConfigContext";

/**
 * Spatial3DEnvironment
 * Renders an unbounded infinite space environment for 3D mode:
 * - Floating cyber starfield particles with camera depth parallax
 * - Volumetric overhead ambient lighting
 * - Zero artificial floor bounding box
 */
export default function Spatial3DEnvironment({ pitch = 20, yaw = -4 }) {
  const canvasRef = useRef(null);
  const { viewMode } = useMapConfig();
  const is3D = viewMode === "3d" || viewMode === "3d-perspective";

  useEffect(() => {
    if (!is3D) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Drifting starfield particles in infinite blue space
    const particleCount = 110;
    const starColors = ["#60a5fa", "#93c5fd", "#38bdf8", "#818cf8", "#bfdbfe", "#ffffff"];
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 950 + 50,
      radius: Math.random() * 1.8 + 0.5,
      baseAlpha: Math.random() * 0.6 + 0.35,
      speedX: (Math.random() - 0.5) * 0.2,
      speedY: (Math.random() - 0.5) * 0.2,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    let time = 0;

    const render = () => {
      time += 0.012;
      ctx.clearRect(0, 0, width, height);

      const parallaxX = (yaw / 45) * 40;
      const parallaxY = (pitch / 45) * 30;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const depthScale = 500 / p.z;
        const currentRadius = p.radius * depthScale;
        const pulse = Math.sin(time * 1.5 + i * 0.4) * 0.3 + 0.7;
        const alpha = Math.min(1, Math.max(0, p.baseAlpha * pulse * (1 - p.z / 1200)));

        const drawX = p.x + parallaxX * (1 - p.z / 1200);
        const drawY = p.y + parallaxY * (1 - p.z / 1200);

        ctx.beginPath();
        ctx.arc(drawX, drawY, Math.max(0.6, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 10 * depthScale;
        ctx.shadowColor = p.color;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [pitch, yaw, is3D]);

  if (!is3D) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none">
      {/* ── 1. Boundless Cosmic Blue Space Atmosphere ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 95% at 50% 20%, #0d2a63 0%, #081d47 30%, #03102c 65%, #020718 100%)",
        }}
      />

      {/* ── 2. Luminous Blue Nebula Clouds ── */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 55% 40% at 20% 30%, rgba(37, 99, 235, 0.3) 0%, transparent 70%),
            radial-gradient(ellipse 65% 45% at 80% 55%, rgba(30, 64, 175, 0.25) 0%, transparent 70%),
            radial-gradient(ellipse 90% 50% at 50% 12%, rgba(59, 130, 246, 0.28) 0%, transparent 80%)
          `,
        }}
      />

      {/* ── 3. Parallax 3D Starfield Canvas (Boundless Blue Celestial Space) ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-90" />

      {/* ── 4. Overhead Volumetric Blue Spotlight (brings 3D nodes to life) ── */}
      <div
        className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[800px] rounded-full opacity-75 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(96, 165, 250, 0.32) 0%, rgba(37, 99, 235, 0.22) 40%, rgba(29, 78, 216, 0.06) 70%, transparent 85%)",
        }}
      />

      {/* ── 5. Subtle Midnight Blue Vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 55%, rgba(2, 7, 24, 0.55) 100%)",
        }}
      />
    </div>
  );
}
