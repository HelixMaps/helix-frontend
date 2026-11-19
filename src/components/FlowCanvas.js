"use client";

import React, { useCallback, useState, useEffect, useRef, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
  useOnViewportChange,
  useUpdateNodeInternals,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import IdeaNode from "./nodes/IdeaNode";
import TaskNode from "./nodes/TaskNode";
import ResourceNode from "./nodes/ResourceNode";
import ThreeDimensionalEdge, { SharedEdgeDefs } from "./edges/ThreeDimensionalEdge";
import SpatialCommandDeck from "./SpatialCommandDeck";
import NodePicker from "./NodePicker";
import ContextMenu from "./ContextMenu";
import DetailsDrawer from "./DetailsDrawer";
import NodeSearchBar from "./NodeSearchBar";
import ExportSnapshotModal from "./ExportSnapshotModal";
import { useMapConfig } from "@/context/MapConfigContext";
import { Map, Minimize2 } from "lucide-react";
import { fetchMap, saveMapGraph, createMap } from "@/service/mapService";

// Helper to determine if a map graph has meaningful user modifications from baseline
const isGraphModified = (currNodes, currEdges, baseline) => {
  if (!baseline || !baseline.nodes) return false;
  const baseNodes = baseline.nodes;
  const baseEdges = baseline.edges || [];

  // Edge count changed
  if (currEdges.length !== baseEdges.length) return true;

  // Node count changed
  if (currNodes.length !== baseNodes.length) return true;

  // Check each node for user modifications
  for (const cn of currNodes) {
    const bn = baseNodes.find((n) => n.id === cn.id);
    if (!bn) return true;
    if (Math.round(cn.position.x) !== Math.round(bn.position.x)) return true;
    if (Math.round(cn.position.y) !== Math.round(bn.position.y)) return true;
    if (cn.data?.label !== bn.data?.label) return true;
    if (cn.data?.summary !== bn.data?.summary) return true;
    if (cn.type !== bn.type) return true;
  }

  // Check edges
  for (const ce of currEdges) {
    const be = baseEdges.find((e) => e.id === ce.id);
    if (!be) return true;
    if (ce.source !== be.source || ce.target !== be.target) return true;
  }

  return false;
};

// Registering our custom 3D nodes
const nodeTypes = {
  idea: IdeaNode,
  task: TaskNode,
  resource: ResourceNode,
};

// Registering our custom 3D edge types
const edgeTypes = {
  threeDimensional: ThreeDimensionalEdge,
  default: ThreeDimensionalEdge,
  bezier: ThreeDimensionalEdge,
  straight: ThreeDimensionalEdge,
  step: ThreeDimensionalEdge,
  smoothstep: ThreeDimensionalEdge,
};

function FlowCanvasInner({ activeSessionId, setActiveSessionId, getToken, isGuest, sessions, setSessions, onShare, triggerExport }) {
  const {
    nodeShape,
    edgeStyle,
    changeNodeShape,
    changeEdgeStyle,
    viewMode,
    canvasPitch,
    canvasYaw,
    enableParallax,
  } = useMapConfig();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, fitView, getViewport, setViewport } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();
  const [menu, setMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeSearch, setActiveSearch] = useState(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(true);
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(true);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Synchronize node handle bounds immediately whenever nodeShape or viewMode changes
  useEffect(() => {
    if (nodes && nodes.length > 0) {
      updateNodeInternals(nodes.map((n) => n.id));
    }
  }, [nodeShape, viewMode, updateNodeInternals]);

  useEffect(() => {
    if (triggerExport && triggerExport > 0) {
      setIsExportModalOpen(true);
    }
  }, [triggerExport]);

  const canvasContainerRef = useRef(null);

  const sessionsRef = useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Baseline snapshot ref to detect changes from initial state
  const initialBaselineRef = useRef(null);
  const isSavingDraftRef = useRef(false);

  // Ref to store latest values for flushing on session switch / unmount
  const latestStateRef = useRef({ nodes, edges, activeSessionId });
  useEffect(() => {
    latestStateRef.current = { nodes, edges, activeSessionId };
  }, [nodes, edges, activeSessionId]);

  // Flush map graph to database immediately when session changes or unmounts
  useEffect(() => {
    return () => {
      const { nodes: ns, edges: es, activeSessionId: prevSessionId } = latestStateRef.current;
      if (!prevSessionId || ns.length === 0 || isGuest) return;

      const isDraft = prevSessionId.startsWith("draft-");
      if (isDraft) {
        // If the draft was untouched, DO NOT write to database
        const hasChanged = isGraphModified(ns, es, initialBaselineRef.current);
        if (!hasChanged) return;

        // If draft was modified, flush create to DB
        const flushCreate = async () => {
          try {
            const token = await getToken();
            if (!token) return;
            const currentSession = sessionsRef.current.find((s) => s._id === prevSessionId);
            const title = currentSession?.title || "Untitled Mind Map";
            const styleConfig = currentSession?.styleConfig || { nodeShape: "rounded", edgeStyle: "smoothstep" };
            const savedMap = await createMap(token, title, null, null, {
              nodes: ns,
              edges: es,
              styleConfig
            });
            setSessions((prev) =>
              prev.map((s) => (s._id === prevSessionId ? { ...savedMap, isDraft: false } : s))
            );
          } catch (err) {
            console.error(`[Unmount Flush] Failed to flush create draft for map ${prevSessionId}:`, err);
          }
        };
        flushCreate();
        return;
      }

      const flushSave = async () => {
        try {
          const token = await getToken();
          if (token) {
            await saveMapGraph(token, prevSessionId, ns, es);
          }
        } catch (err) {
          console.error(`[Unmount Flush] Failed to flush graph for map ${prevSessionId}:`, err);
        }
      };
      flushSave();
    };
  }, [activeSessionId, getToken, isGuest, setSessions]);

  // 1. Load active map details on session change
  useEffect(() => {
    if (!activeSessionId) return;

    // If activeSessionId matches the currently active non-draft baseline (just transitioned from draft), skip re-fetch
    if (
      initialBaselineRef.current &&
      initialBaselineRef.current.sessionId === activeSessionId &&
      !initialBaselineRef.current.isDraft
    ) {
      setIsLoadingCanvas(false);
      return;
    }

    let active = true;

    const loadMapDetails = async () => {
      try {
        setIsLoadingCanvas(true);
        const currentSession = sessionsRef.current.find((s) => s._id === activeSessionId);
        const isDraft = currentSession?.isDraft || activeSessionId.startsWith("draft-");

        if (isGuest || isDraft) {
          if (currentSession && active) {
            const initialNodes = currentSession.nodes || [];
            const initialEdges = currentSession.edges || [];
            setNodes(initialNodes);
            setEdges(initialEdges);

            initialBaselineRef.current = {
              sessionId: activeSessionId,
              nodes: JSON.parse(JSON.stringify(initialNodes)),
              edges: JSON.parse(JSON.stringify(initialEdges)),
              isDraft: true,
            };

            if (currentSession.styleConfig) {
              if (currentSession.styleConfig.nodeShape) {
                changeNodeShape(currentSession.styleConfig.nodeShape);
              }
              if (currentSession.styleConfig.edgeStyle) {
                changeEdgeStyle(currentSession.styleConfig.edgeStyle);
              }
            }
          }
          setIsLoadingCanvas(false);
          return;
        }

        const token = await getToken();
        if (!token) return;
        const mapData = await fetchMap(token, activeSessionId);
        if (active) {
          const loadedNodes = mapData.nodes || [];
          const loadedEdges = mapData.edges || [];
          setNodes(loadedNodes);
          setEdges(loadedEdges);

          initialBaselineRef.current = {
            sessionId: activeSessionId,
            nodes: JSON.parse(JSON.stringify(loadedNodes)),
            edges: JSON.parse(JSON.stringify(loadedEdges)),
            isDraft: false,
          };

          if (mapData.styleConfig) {
            if (mapData.styleConfig.nodeShape) {
              changeNodeShape(mapData.styleConfig.nodeShape);
            }
            if (mapData.styleConfig.edgeStyle) {
              changeEdgeStyle(mapData.styleConfig.edgeStyle);
            }
          }
        }
      } catch (err) {
        console.error("Error loading map details:", err);
      } finally {
        if (active) {
          setIsLoadingCanvas(false);
        }
      }
    };

    loadMapDetails();

    return () => {
      active = false;
    };
  }, [activeSessionId, getToken, isGuest, setNodes, setEdges, changeNodeShape, changeEdgeStyle]);

  // Keep in-memory sessions updated with latest nodes & edges
  useEffect(() => {
    if (!activeSessionId || isLoadingCanvas) return;
    setSessions((prev) =>
      prev.map((s) =>
        s._id === activeSessionId
          ? { ...s, nodes, edges }
          : s
      )
    );
  }, [nodes, edges, activeSessionId, isLoadingCanvas, setSessions]);

  // 2. Debounced auto-save of nodes & edges (only stores in DB when modified)
  useEffect(() => {
    if (!activeSessionId || isLoadingCanvas || isGuest) return;

    const isDraft = activeSessionId.startsWith("draft-") ||
      sessionsRef.current.find((s) => s._id === activeSessionId)?.isDraft;

    // For draft maps, verify if any node, edge, or position was changed
    if (isDraft) {
      const hasChanged = isGraphModified(nodes, edges, initialBaselineRef.current);
      if (!hasChanged) {
        // Untouched empty map: do NOT store in DB
        return;
      }
    }

    const saveTimeout = setTimeout(async () => {
      try {
        const token = await getToken();
        if (!token) return;

        if (isDraft) {
          if (isSavingDraftRef.current) return;
          isSavingDraftRef.current = true;

          const currentSession = sessionsRef.current.find((s) => s._id === activeSessionId);
          const title = currentSession?.title || "Untitled Mind Map";
          const styleConfig = currentSession?.styleConfig || { nodeShape: "rounded", edgeStyle: "smoothstep" };

          const savedMap = await createMap(token, title, null, null, {
            nodes,
            edges,
            styleConfig
          });

          initialBaselineRef.current = {
            sessionId: savedMap._id,
            nodes: JSON.parse(JSON.stringify(nodes)),
            edges: JSON.parse(JSON.stringify(edges)),
            isDraft: false,
          };
          latestStateRef.current.activeSessionId = savedMap._id;

          setSessions((prev) =>
            prev.map((s) => (s._id === activeSessionId ? { ...savedMap, isDraft: false } : s))
          );

          if (setActiveSessionId) {
            setActiveSessionId(savedMap._id);
          }
          isSavingDraftRef.current = false;
        } else {
          await saveMapGraph(token, activeSessionId, nodes, edges);
        }
      } catch (err) {
        console.error("Error auto-saving map layout:", err);
        isSavingDraftRef.current = false;
      }
    }, 1500);

    return () => clearTimeout(saveTimeout);
  }, [nodes, edges, activeSessionId, getToken, isLoadingCanvas, isGuest, setActiveSessionId, setSessions]);

  // Navigate to a node found by search
  const handleSearchNode = useCallback(
    (node) => {
      setHighlightedNodeId(node.id);
      setActiveSearch(node.data?.label || "Node");
      setTimeout(() => {
        fitView({ nodes: [{ id: node.id }], padding: 0.6, duration: 600, maxZoom: 1.2 });
      }, 50);
    },
    [fitView]
  );

  const handleClearSearch = useCallback(() => {
    setActiveSearch(null);
    setHighlightedNodeId(null);
  }, []);

  const handleStartEditNode = useCallback(
    (nodeId) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            return {
              ...n,
              data: {
                ...n.data,
                isEditing: true,
              },
            };
          }
          return n;
        })
      );
      setMenu(null);
    },
    [setNodes]
  );

  const handleDeleteNode = useCallback(
    (nodeId) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
      setMenu(null);
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [setNodes, setEdges, selectedNode]
  );

  const handleUpdateNodeData = useCallback(
    (nodeId, newData) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                ...newData,
              },
            };
          }
          return node;
        })
      );
      setSelectedNode((curr) => {
        if (curr && curr.id === nodeId) {
          return {
            ...curr,
            data: {
              ...curr.data,
              ...newData,
            },
          };
        }
        return curr;
      });
    },
    [setNodes]
  );

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      setMenu({
        id: node.id,
        x: event.clientX,
        y: event.clientY,
        node,
      });
    },
    [setMenu]
  );

  const onPaneClick = useCallback(() => {
    setMenu(null);
    setSelectedNode(null);
    setHighlightedNodeId(null);
  }, [setMenu, setSelectedNode, setHighlightedNodeId]);

  const onMoveStart = useCallback(() => setMenu(null), [setMenu]);

  const onNodeDoubleClick = useCallback((event, node) => {
    setSelectedNode(node);
  }, []);

  const closeDetailsDrawer = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "threeDimensional",
            animated: true,
            style: { stroke: "#3b82f6", strokeWidth: 2.5 },
          },
          eds
        )
      ),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const defaultElevations = { idea: 55, task: 35, resource: 75 };
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          elevation: defaultElevations[type] || 50,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const addNodeAtCenter = useCallback(
    (type) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      const position = screenToFlowPosition({
        x: width / 2,
        y: height / 2,
      });

      const defaultElevations = { idea: 55, task: 35, resource: 75 };
      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { 
          label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
          elevation: defaultElevations[type] || 50,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const fitViewOptions = useMemo(() => ({
    padding: 0.35,
    maxZoom: 0.85,
  }), []);

  // Node highlighting for search matches — memoized to avoid new array refs on every render
  const displayNodes = useMemo(() => {
    if (!highlightedNodeId) return nodes;
    return nodes.map((n) => {
      if (n.id !== highlightedNodeId) return n;
      return { ...n, selected: true };
    });
  }, [nodes, highlightedNodeId]);

  // Always route edges through 3D edge renderer — memoized
  const displayEdges = useMemo(() => {
    return edges.map((e) => ({
      ...e,
      type: "threeDimensional",
    }));
  }, [edges]);

  // Calculate 3D perspective pitch and yaw: 3D Spatial vs 2D Canvas
  const is3D = viewMode === "3d" || viewMode === "3d-perspective";
  const effectivePitch = is3D ? canvasPitch : 0;
  const effectiveYaw = is3D ? canvasYaw : 0;

  // Live synchronous viewport ref to avoid lag or stale state during high-frequency trackpad events
  const activeViewportRef = useRef(null);

  useOnViewportChange({
    onChange: (viewport) => {
      activeViewportRef.current = viewport;
    },
  });

  // Keep latest refs for 3D cursor-anchored zooming without event listener churn
  const latest3DRef = useRef({
    is3D,
    effectivePitch,
    effectiveYaw,
    getViewport,
    setViewport,
  });

  useEffect(() => {
    latest3DRef.current = {
      is3D,
      effectivePitch,
      effectiveYaw,
      getViewport,
      setViewport,
    };
  });

  // Gesture tracking refs for Safari trackpad pinch
  const isGestureActiveRef = useRef(false);
  const lastGestureScaleRef = useRef(1.0);

  // Precise cursor-anchored 3D zooming engine for mouse wheels and trackpad pinch / scroll
  useEffect(() => {
    const apply3DZoom = (clientX, clientY, zoomFactor) => {
      const state = latest3DRef.current;
      if (!state.is3D) return;

      const container = canvasContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      if (!W || !H) return;

      // Cursor position relative to container's perspective center
      const xs = clientX - (rect.left + W / 2);
      const ys = clientY - (rect.top + H / 2);

      const D = 1400; // CSS perspective distance
      const S = 1.45; // 3D stage scale factor
      const pitchRad = (state.effectivePitch * Math.PI) / 180;
      const yawRad = (state.effectiveYaw * Math.PI) / 180;

      const denom = D + ys * Math.tan(pitchRad);
      if (Math.abs(denom) < 0.001) return;

      const t = D / denom;
      const cosPitch = Math.cos(pitchRad);
      if (Math.abs(cosPitch) < 0.001) return;

      const A = (t * xs) / S;
      const B = (t * ys) / (S * cosPitch);

      const cosYaw = Math.cos(yawRad);
      const sinYaw = Math.sin(yawRad);

      const u = A * cosYaw + B * sinYaw;
      const v = -A * sinYaw + B * cosYaw;

      // Local coordinate on the ReactFlow canvas plane
      const localX = u + W / 2;
      const localY = v + H / 2;

      // Synchronous live viewport
      const currentViewport = activeViewportRef.current || state.getViewport();
      const currentZoom = currentViewport.zoom || 1;

      const minZoom = 0.05;
      const maxZoom = 4.0;
      const newZoom = Math.min(Math.max(currentZoom * zoomFactor, minZoom), maxZoom);

      if (Math.abs(newZoom - currentZoom) < 0.0001) return;

      // Calculate graph coordinates under cursor
      const flowX = (localX - currentViewport.x) / currentZoom;
      const flowY = (localY - currentViewport.y) / currentZoom;

      // Solve for new viewport offsets so (flowX, flowY) stays pinned at (localX, localY)
      const newX = localX - flowX * newZoom;
      const newY = localY - flowY * newZoom;

      // Instantly update live ref so successive rapid events read updated coordinates
      activeViewportRef.current = { x: newX, y: newY, zoom: newZoom };

      state.setViewport({ x: newX, y: newY, zoom: newZoom }, { duration: 0 });
    };

    const handleWheel = (e) => {
      const state = latest3DRef.current;
      if (!state.is3D) return;

      const container = canvasContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }

      // Don't intercept zooming if interacting with inputs, textareas, select, button, etc.
      if (e.target?.closest?.("input, textarea, select, button, .nodrag, .nowheel, [role='dialog']")) {
        return;
      }

      // Avoid double zoom on Safari when gesture event is already handling trackpad pinch
      if (isGestureActiveRef.current && e.ctrlKey) return;

      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      else if (e.deltaMode === 2) delta *= 800;

      if (Math.abs(delta) < 0.1) return;

      e.preventDefault();
      e.stopPropagation();

      // Handle trackpad pinch (ctrlKey) vs standard wheel scroll
      const zoomSensitivity = e.ctrlKey ? 0.025 : 0.002;
      const zoomFactor = Math.pow(2, -delta * zoomSensitivity);

      apply3DZoom(e.clientX, e.clientY, zoomFactor);
    };

    // Safari trackpad native pinch gesture support (GestureEvent)
    const handleGestureStart = (e) => {
      const state = latest3DRef.current;
      if (!state.is3D) return;

      const container = canvasContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      if (
        e.clientX < rect.left ||
        e.clientX > rect.right ||
        e.clientY < rect.top ||
        e.clientY > rect.bottom
      ) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      isGestureActiveRef.current = true;
      lastGestureScaleRef.current = 1.0;
    };

    const handleGestureChange = (e) => {
      const state = latest3DRef.current;
      if (!state.is3D || !isGestureActiveRef.current) return;

      e.preventDefault();
      e.stopPropagation();

      const scaleDelta = e.scale / (lastGestureScaleRef.current || 1.0);
      lastGestureScaleRef.current = e.scale;

      apply3DZoom(e.clientX, e.clientY, scaleDelta);
    };

    const handleGestureEnd = (e) => {
      if (isGestureActiveRef.current) {
        e.preventDefault();
        e.stopPropagation();
        isGestureActiveRef.current = false;
        lastGestureScaleRef.current = 1.0;
      }
    };

    // Attach to window in capture phase so listeners are always active
    window.addEventListener("wheel", handleWheel, { capture: true, passive: false });
    window.addEventListener("gesturestart", handleGestureStart, { capture: true, passive: false });
    window.addEventListener("gesturechange", handleGestureChange, { capture: true, passive: false });
    window.addEventListener("gestureend", handleGestureEnd, { capture: true, passive: false });

    return () => {
      window.removeEventListener("wheel", handleWheel, { capture: true });
      window.removeEventListener("gesturestart", handleGestureStart, { capture: true });
      window.removeEventListener("gesturechange", handleGestureChange, { capture: true });
      window.removeEventListener("gestureend", handleGestureEnd, { capture: true });
    };
  }, []);

  return (
    <>
      <div
        ref={canvasContainerRef}
        className="relative w-full h-full bg-[#141414] text-zinc-100 select-none overflow-hidden font-sans transition-colors duration-500"
        style={{
          perspective: is3D ? "1400px" : "none",
          perspectiveOrigin: "50% 50%",
          background: "#141414",
        }}
      >
      {/* ── Loading Overlay during initial workspace initialization ── */}
      {isLoadingCanvas && (
        <div className="absolute inset-0 z-50 bg-[#141414] flex items-center justify-center text-zinc-300 select-none overflow-hidden font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-zinc-300 animate-spin" />
            <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider font-mono">
              Initializing Workspace...
            </span>
          </div>
        </div>
      )}

      {/* ── Minimalist Mode Badge ── */}
      <div className="mode-badge export-exclude absolute top-5 left-16 z-20 pointer-events-none select-none flex items-center gap-2">
        <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-[0.22em] font-mono">
          Helix Workspace
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border transition-colors ${
            is3D
              ? "bg-zinc-800 text-zinc-100 border-zinc-600 shadow-sm"
              : "bg-zinc-850 text-zinc-400 border-zinc-750"
          }`}
        >
          {is3D ? "3D SPATIAL" : "2D CANVAS"}
        </span>
      </div>

      {/* ── Floating Node Picker ── */}
      <div className="node-picker-container export-exclude absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto">
        <NodePicker onAddNode={addNodeAtCenter} />
      </div>

      {/* ── Node Search Bar + Active Badge ── */}
      <div className="node-search-bar export-exclude">
        <NodeSearchBar
          nodes={nodes}
          onSearch={handleSearchNode}
          onClear={handleClearSearch}
          activeSearch={activeSearch}
        />
      </div>

      {/* ── Spatial Command Deck (Centered bottom HUD) ── */}
      <div className="spatial-command-deck export-exclude">
        <SpatialCommandDeck
          onAddNode={addNodeAtCenter}
          onShare={onShare}
          onExport={() => setIsExportModalOpen(true)}
        />
      </div>

      {/* ── Shared SVG filter defs for all edges (mounted once) ── */}
      <SharedEdgeDefs />

      {/* ── 3D Transformed Canvas Stage (Infinite Boundless Tilted Dotted Floor) ── */}
      <div
        className="w-full h-full origin-center transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: is3D
            ? `rotateX(${effectivePitch}deg) rotateZ(${effectiveYaw}deg) scale(1.45)`
            : "none",
        }}
      >
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={fitViewOptions}
          colorMode="dark"
          zoomOnScroll={!is3D}
          zoomOnPinch={!is3D}
          className="w-full h-full"
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          onMoveStart={onMoveStart}
          onNodeDoubleClick={onNodeDoubleClick}
        >
          {/* Dotted canvas background matching commit 92ac7aaf590956498a67daf79b420d16608170f7 */}
          <Background variant="dots" gap={24} size={1.5} color="#27272a" />


          {/* MiniMap — ONLY rendered in 2D mode; completely hidden in 3D */}
          {!is3D && (
            isMiniMapOpen ? (
              <>
                <MiniMap
                  width={160}
                  height={110}
                  className="!bg-zinc-900/95 !backdrop-blur-md !border-zinc-800 !rounded-xl !shadow-2xl"
                  maskColor="rgba(9, 9, 11, 0.75)"
                  nodeColor={(node) => {
                    if (node.type === "idea") return "#1e3a8a";
                    if (node.type === "task") return "#065f46";
                    if (node.type === "resource") return "#78350f";
                    return "#18181b";
                  }}
                  nodeStrokeWidth={1.5}
                  nodeStrokeColor={(node) => {
                    if (node.type === "idea") return "#60a5fa";
                    if (node.type === "task") return "#34d399";
                    if (node.type === "resource") return "#fbbf24";
                    return "#3f3f46";
                  }}
                />
                <button
                  onClick={() => setIsMiniMapOpen(false)}
                  className="absolute bottom-[140px] right-4 z-10 p-1.5 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-zinc-50 text-zinc-400 shadow-xl transition-all cursor-pointer hover:border-zinc-700 active:scale-95 flex items-center justify-center"
                  title="Minimize Map"
                >
                  <Minimize2 size={12} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsMiniMapOpen(true)}
                className="absolute bottom-4 right-4 z-10 p-2.5 bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-zinc-50 text-zinc-400 shadow-xl transition-all cursor-pointer hover:border-zinc-700 active:scale-95 flex items-center justify-center"
                title="Expand MiniMap"
              >
                <Map size={15} />
              </button>
            )
          )}
        </ReactFlow>
      </div>
    </div>

      {/* ── Context Menu ── */}
      {menu && (
        <ContextMenu
          id={menu.id}
          x={menu.x}
          y={menu.y}
          node={menu.node}
          onClickOutside={onPaneClick}
          onDelete={handleDeleteNode}
          onEdit={handleStartEditNode}
        />
      )}

      {/* ── Details Drawer ── */}
      {selectedNode && (
        <DetailsDrawer
          node={selectedNode}
          onClose={closeDetailsDrawer}
          onUpdateData={handleUpdateNodeData}
        />
      )}

      {/* ── Export Snapshot Modal (Works for both logged in and guest users) ── */}
      <ExportSnapshotModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeMap={sessions?.find((s) => s._id === activeSessionId) || sessions?.[0] || { title: "Mind Map" }}
        canvasContainerRef={canvasContainerRef}
        fitView={fitView}
        getViewport={getViewport}
        setViewport={setViewport}
        viewMode={viewMode}
      />
    </>
  );
}

export default function FlowCanvas({ activeSessionId, setActiveSessionId, getToken, isGuest, sessions, setSessions, onShare, triggerExport }) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner
        activeSessionId={activeSessionId}
        setActiveSessionId={setActiveSessionId}
        getToken={getToken}
        isGuest={isGuest}
        sessions={sessions}
        setSessions={setSessions}
        onShare={onShare}
        triggerExport={triggerExport}
      />
    </ReactFlowProvider>
  );
}
