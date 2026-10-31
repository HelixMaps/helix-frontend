"use client";

import React, { useEffect, useRef } from "react";
import { useMapConfig } from "@/context/MapConfigContext";

/**
 * Spatial3DEnvironment
 * Renders a high-performance spatial 3D background featuring:
 * 1. An infinite perspective wireframe grid floor receding into a cyber horizon
 * 2. An atmospheric particle starfield with depth parallax that responds to camera rotation
 * 3. Volumetric top lighting spotlight and horizon depth fog
 */
export default function Spatial3DEnvironment({ pitch = 20, yaw = -4 }) {
  const canvasRef = useRef(null);
  const { viewMode } = useMapConfig();
  const isTopDown = viewMode === "3d-topdown";

  useEffect(() => {
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

    // Generate 3D spatial particles
    const particleCount = 65;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 800 + 100, // Depth from camera
      radius: Math.random() * 1.5 + 0.6,
      baseAlpha: Math.random() * 0.5 + 0.2,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      color: Math.random() > 0.4 ? "#60a5fa" : Math.random() > 0.5 ? "#34d399" : "#fbbf24",
    }));

    let time = 0;

    const render = () => {
      time += 0.01;
      ctx.clearRect(0, 0, width, height);

      // Parallax shift based on camera yaw & pitch
      const parallaxX = (yaw / 45) * 40;
      const parallaxY = (pitch / 45) * 30;

      // Render floating cyber particles with depth scale
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Scale and opacity inversely proportional to depth
        const depthScale = 400 / p.z;
        const currentRadius = p.radius * depthScale;
        const pulse = Math.sin(time + i) * 0.2 + 0.8;
        const alpha = Math.min(1, Math.max(0, p.baseAlpha * pulse * (1 - p.z / 1000)));

        const drawX = p.x + parallaxX * (1 - p.z / 1000);
        const drawY = p.y + parallaxY * (1 - p.z / 1000);

        ctx.beginPath();
        ctx.arc(drawX, drawY, Math.max(0.6, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 6 * depthScale;
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
  }, [pitch, yaw]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none">
      {/* ── Deep Cyber Spatial Background Gradient ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 65% at 50% 10%, rgba(30, 58, 138, 0.18) 0%, rgba(15, 23, 42, 0.45) 45%, #05070f 85%)",
        }}
      />

      {/* ── 3D Horizon Grid Lines (Floor Plane) ── */}
      {!isTopDown && (
        <div
          className="absolute inset-x-0 bottom-0 h-[65%] opacity-35"
          style={{
            backgroundImage: `
              linear-gradient(to top, rgba(59, 130, 246, 0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: "60px 40px",
            transformOrigin: "bottom center",
            transform: `perspective(600px) rotateX(${Math.max(25, pitch)}deg)`,
            maskImage: "linear-gradient(to top, black 25%, transparent 95%)",
            WebkitMaskImage: "linear-gradient(to top, black 25%, transparent 95%)",
          }}
        />
      )}

      {/* ── Animated Cyber Particle Starfield Canvas ── */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-60" />

      {/* ── Volumetric Overhead Conical Spotlight ── */}
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[650px] rounded-full opacity-70 blur-[90px]"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.22) 0%, rgba(99, 102, 241, 0.1) 40%, transparent 75%)",
        }}
      />

      {/* ── Vanishing Horizon Glow Line ── */}
      {!isTopDown && (
        <div className="absolute top-[28%] inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500/40 to-transparent blur-[1px] opacity-75" />
      )}

      {/* ── Deep Vignette Edges ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 55%, rgba(3, 7, 18, 0.75) 100%)",
        }}
      />
    </div>
  );
}
