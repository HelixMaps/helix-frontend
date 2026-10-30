"use client";

import { useState, useRef, useCallback } from "react";

/**
 * use3DTilt hook
 * Creates interactive 3D card tilt and specular glare that responds to cursor movement.
 */
export function use3DTilt({ maxTilt = 10, scale = 1.025, enabled = true } = {}) {
  const [tilt, setTilt] = useState({
    x: 0,
    y: 0,
    glareX: 50,
    glareY: 50,
    isHovered: false,
  });

  const cardRef = useRef(null);
  const rafRef = useRef(null);

  const onMouseMove = useCallback(
    (e) => {
      if (!enabled || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Normalized coordinates from -1 to 1
      const normX = Math.max(-1, Math.min(1, (x - centerX) / centerX));
      const normY = Math.max(-1, Math.min(1, (y - centerY) / centerY));

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        // Inverted normY for natural 3D tilt towards mouse
        const rotateX = -normY * maxTilt;
        const rotateY = normX * maxTilt;
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;

        setTilt({
          x: rotateX,
          y: rotateY,
          glareX,
          glareY,
          isHovered: true,
        });
      });
    },
    [enabled, maxTilt]
  );

  const onMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    setTilt({
      x: 0,
      y: 0,
      glareX: 50,
      glareY: 50,
      isHovered: false,
    });
  }, []);

  return {
    cardRef,
    tilt,
    handlers: {
      onMouseMove,
      onMouseLeave,
    },
  };
}
