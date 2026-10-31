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

    // Drifting starfield particles in infinite space
    const particleCount = 75;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 900 + 100,
      radius: Math.random() * 1.6 + 0.6,
      baseAlpha: Math.random() * 0.5 + 0.25,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      color: Math.random() > 0.4 ? "#60a5fa" : Math.random() > 0.5 ? "#34d399" : "#a78bfa",
    }));

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      const parallaxX = (yaw / 45) * 35;
      const parallaxY = (pitch / 45) * 25;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const depthScale = 450 / p.z;
        const currentRadius = p.radius * depthScale;
        const pulse = Math.sin(time + i * 0.5) * 0.25 + 0.75;
        const alpha = Math.min(1, Math.max(0, p.baseAlpha * pulse * (1 - p.z / 1100)));

        const drawX = p.x + parallaxX * (1 - p.z / 1100);
        const drawY = p.y + parallaxY * (1 - p.z / 1100);

        ctx.beginPath();
        ctx.arc(drawX, drawY, Math.max(0.6, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8 * depthScale;
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
      {/* ── Infinite Cosmic Radial Background Gradient ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 70% at 50% 20%, rgba(30, 58, 138, 0.2) 0%, rgba(15, 23, 42, 0.5) 45%, #05070f 85%)",
        }}
      />

      {/* ── Parallax Starfield Canvas (Boundless Space) ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-70" />

      {/* ── Volumetric Overhead Spotlight ── */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[950px] h-[700px] rounded-full opacity-70 blur-[100px]"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 75%)",
        }}
      />

      {/* ── Deep Vignette ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 55%, rgba(3, 7, 18, 0.8) 100%)",
        }}
      />
    </div>
  );
}
