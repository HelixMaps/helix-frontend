"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import IdeaNode from "./nodes/IdeaNode";
import TaskNode from "./nodes/TaskNode";
import ResourceNode from "./nodes/ResourceNode";
import ThreeDimensionalEdge from "./edges/ThreeDimensionalEdge";
import SpatialCommandDeck from "./SpatialCommandDeck";
import NodePicker from "./NodePicker";
import ContextMenu from "./ContextMenu";
import DetailsDrawer from "./DetailsDrawer";
import NodeSearchBar from "./NodeSearchBar";
import { useMapConfig } from "@/context/MapConfigContext";
import { Map, Minimize2 } from "lucide-react";
import { fetchMap, saveMapGraph } from "@/service/mapService";

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

function FlowCanvasInner({ activeSessionId, getToken, isGuest, sessions, setSessions }) {
  const {
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
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [menu, setMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeSearch, setActiveSearch] = useState(null);
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(true);
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(true);

  // Dynamic subtle mouse parallax on the 3D canvas stage
  const [mouseParallax, setMouseParallax] = useState({ pitch: 0, yaw: 0 });
  const canvasContainerRef = useRef(null);

  const handleCanvasMouseMove = useCallback(
    (e) => {
      if (!enableParallax || viewMode === "3d-topdown") {
        if (mouseParallax.pitch !== 0 || mouseParallax.yaw !== 0) {
          setMouseParallax({ pitch: 0, yaw: 0 });
        }
        return;
      }
      const width = window.innerWidth;
      const height = window.innerHeight;
      const normX = (e.clientX - width / 2) / (width / 2);
      const normY = (e.clientY - height / 2) / (height / 2);

      // Gentle interactive tilt reaction (±2.5°)
      setMouseParallax({
        pitch: -normY * 2.5,
        yaw: normX * 3,
      });
    },
    [enableParallax, viewMode, mouseParallax]
  );

  const sessionsRef = useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Ref to store latest values for flushing on session switch / unmount
  const latestStateRef = useRef({ nodes, edges, activeSessionId });
  useEffect(() => {
    latestStateRef.current = { nodes, edges, activeSessionId };
  }, [nodes, edges, activeSessionId]);

  // Flush map graph to database immediately when session changes or unmounts
  useEffect(() => {
    return () => {
      const { nodes: ns, edges: es, activeSessionId: prevSessionId } = latestStateRef.current;
      if (prevSessionId && ns.length > 0) {
        if (isGuest) {
          setSessions((prev) =>
            prev.map((s) =>
              s._id === prevSessionId
                ? { ...s, nodes: ns, edges: es }
                : s
            )
          );
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
      }
    };
  }, [activeSessionId, getToken, isGuest, setSessions]);

  // 1. Load active map details on session change
  useEffect(() => {
    if (!activeSessionId) return;

    let active = true;

    const loadMapDetails = async () => {
      try {
        setIsLoadingCanvas(true);
        if (isGuest) {
          const mapData = sessionsRef.current.find((s) => s._id === activeSessionId);
          if (mapData && active) {
            setNodes(mapData.nodes || []);
            setEdges(mapData.edges || []);

            if (mapData.styleConfig) {
              if (mapData.styleConfig.nodeShape) {
                changeNodeShape(mapData.styleConfig.nodeShape);
              }
              if (mapData.styleConfig.edgeStyle) {
                changeEdgeStyle(mapData.styleConfig.edgeStyle);
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
          setNodes(mapData.nodes || []);
          setEdges(mapData.edges || []);

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

  // 2. Debounced auto-save of nodes & edges
  useEffect(() => {
    if (!activeSessionId || isLoadingCanvas) return;

    if (isGuest) {
      const saveTimeout = setTimeout(() => {
        setSessions((prev) =>
          prev.map((s) =>
            s._id === activeSessionId
              ? { ...s, nodes, edges }
              : s
          )
        );
      }, 1500);
      return () => clearTimeout(saveTimeout);
    }

    const saveTimeout = setTimeout(async () => {
      try {
        const token = await getToken();
        if (!token) return;
        await saveMapGraph(token, activeSessionId, nodes, edges);
      } catch (err) {
        console.error("Error auto-saving map layout:", err);
      }
    }, 1500);

    return () => clearTimeout(saveTimeout);
  }, [nodes, edges, activeSessionId, getToken, isLoadingCanvas, isGuest, setSessions]);

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

  const fitViewOptions = {
    padding: 0.35,
    maxZoom: 0.85,
  };

  // Node highlighting for search matches
  const displayNodes = nodes.map((n) => {
    if (n.id !== highlightedNodeId) return n;
    return {
      ...n,
      selected: true,
    };
  });

  // Always route edges through 3D edge renderer
  const displayEdges = edges.map((e) => ({
    ...e,
    type: "threeDimensional",
  }));

  // Calculate 3D perspective pitch and yaw: 3D Spatial vs 2D Canvas
  const is3D = viewMode === "3d" || viewMode === "3d-perspective";
  const effectivePitch = is3D ? Math.max(0, canvasPitch + mouseParallax.pitch) : 0;
  const effectiveYaw = is3D ? canvasYaw + mouseParallax.yaw : 0;

  if (isLoadingCanvas) {
    return (
      <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-400 select-none overflow-hidden font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider font-mono">
            Initializing Workspace...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasContainerRef}
      onMouseMove={handleCanvasMouseMove}
      className="relative w-full h-full bg-zinc-950 text-zinc-100 select-none overflow-hidden font-sans"
      style={{
        perspective: is3D ? "1400px" : "none",
        perspectiveOrigin: "50% 40%",
      }}
    >
      {/* ── Minimalist Mode Badge ── */}
      <div className="absolute top-5 left-16 z-20 pointer-events-none select-none flex items-center gap-2">
        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-[0.22em] font-mono">
          Helix Workspace
        </span>
        <span
          className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold border transition-colors ${
            is3D
              ? "bg-zinc-800/90 text-zinc-200 border-zinc-700 shadow-sm"
              : "bg-zinc-900/90 text-zinc-400 border-zinc-800"
          }`}
        >
          {is3D ? "3D SPATIAL" : "2D CANVAS"}
        </span>
      </div>

      {/* ── Floating 3D Node Picker ── */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-30">
        <NodePicker onAddNode={addNodeAtCenter} />
      </div>

      {/* ── Node Search Bar + Active Badge ── */}
      <NodeSearchBar
        nodes={nodes}
        onSearch={handleSearchNode}
        onClear={handleClearSearch}
        activeSearch={activeSearch}
      />

      {/* ── Spatial Command Deck (Centered bottom HUD) ── */}
      <SpatialCommandDeck onAddNode={addNodeAtCenter} />

      {/* ── 3D Transformed Canvas Stage (Seamless Boundless Grey Space) ── */}
      <div
        className="w-full h-full origin-center transition-transform duration-500 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: is3D
            ? `rotateX(${effectivePitch}deg) rotateZ(${effectiveYaw}deg)`
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
          className="w-full h-full !bg-transparent"
          style={{ background: "transparent", backgroundColor: "transparent" }}
          onNodeContextMenu={onNodeContextMenu}
          onPaneClick={onPaneClick}
          onMoveStart={onMoveStart}
          onNodeDoubleClick={onNodeDoubleClick}
        >
          {/* Dotted canvas background rendered ONLY in 2D mode; in 3D: pure grey without dots */}
          {!is3D && (
            <Background
              variant="dots"
              gap={24}
              size={1.5}
              color="#27272a"
            />
          )}


          {/* 3D MiniMap */}
          {isMiniMapOpen ? (
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
              title="Expand 3D MiniMap"
            >
              <Map size={15} />
            </button>
          )}
        </ReactFlow>
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
    </div>
  );
}

export default function FlowCanvas({ activeSessionId, getToken, isGuest, sessions, setSessions }) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner
        activeSessionId={activeSessionId}
        getToken={getToken}
        isGuest={isGuest}
        sessions={sessions}
        setSessions={setSessions}
      />
    </ReactFlowProvider>
  );
}
