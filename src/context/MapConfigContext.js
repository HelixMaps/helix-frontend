"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const MapConfigContext = createContext();

export const MapConfigProvider = ({ children }) => {
  const [nodeShape, setNodeShape] = useState("rounded");
  const [edgeStyle, setEdgeStyle] = useState("bezier"); // bezier, straight, step, smoothstep

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedShape = localStorage.getItem("helix-node-shape");
      if (savedShape) {
        setNodeShape(savedShape);
      }
      const savedEdge = localStorage.getItem("helix-edge-style");
      if (savedEdge) {
        setEdgeStyle(savedEdge);
      }
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

  return (
    <MapConfigContext.Provider
      value={{
        nodeShape,
        changeNodeShape,
        edgeStyle,
        changeEdgeStyle,
      }}
    >
      {children}
    </MapConfigContext.Provider>
  );
};

export const useMapConfig = () => useContext(MapConfigContext);
