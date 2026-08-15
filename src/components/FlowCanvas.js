"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
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
import NodePicker from "./NodePicker";
import ContextMenu from "./ContextMenu";
import DetailsDrawer from "./DetailsDrawer";
import NodeSearchBar from "./NodeSearchBar";
import { useMapConfig } from "@/context/MapConfigContext";
import { Map, Minimize2 } from "lucide-react";
import { fetchMap, saveMapGraph } from "@/service/mapService";


// Initial nodes and edges demonstrating the new custom types
const initialNodes = [
  {
    id: "root-1",
    type: "idea",
    data: { label: "Central Idea" },
    position: { x: 250, y: 150 },
  },
  {
    id: "child-1",
    type: "task",
    data: { label: "Define Requirements" },
    position: { x: 100, y: 300 },
  },
  {
    id: "child-2",
    type: "resource",
    data: { label: "React Flow Docs" },
    position: { x: 400, y: 300 },
  },
];

const initialEdges = [
  {
    id: "edge-1",
    source: "root-1",
    target: "child-1",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2 },
  },
  {
    id: "edge-2",
    source: "root-1",
    target: "child-2",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2 },
  },
];

// Registering our custom nodes
const nodeTypes = {
  idea: IdeaNode,
  task: TaskNode,
  resource: ResourceNode,
};

const edgeTypes = {};

function FlowCanvasInner({ activeSessionId, getToken, isGuest, sessions, setSessions }) {
  const { edgeStyle, changeNodeShape, changeEdgeStyle } = useMapConfig();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [menu, setMenu] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeSearch, setActiveSearch] = useState(null);   // { label, id }
  const [highlightedNodeId, setHighlightedNodeId] = useState(null);
  const [isMiniMapOpen, setIsMiniMapOpen] = useState(true);
  const [isLoadingCanvas, setIsLoadingCanvas] = useState(true);

  const sessionsRef = useRef(sessions);
  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Ref to store the latest values for flushing on session switch / unmount
  const latestStateRef = useRef({ nodes, edges, activeSessionId });
  useEffect(() => {
    latestStateRef.current = { nodes, edges, activeSessionId };
  }, [nodes, edges, activeSessionId]);

  // Flush map graph to database immediately when session changes or component unmounts
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

  // 1. Load active map details (nodes, edges, styles) on session change
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
        console.log("Local map layout saved");
      }, 1500);
      return () => clearTimeout(saveTimeout);
    }

    const saveTimeout = setTimeout(async () => {
      try {
        const token = await getToken();
        if (!token) return;
        await saveMapGraph(token, activeSessionId, nodes, edges);
        console.log("Map layout auto-saved successfully");
      } catch (err) {
        console.error("Error auto-saving map layout:", err);
      }
    }, 1500); // Save 1.5s after user stops editing/moving

    return () => clearTimeout(saveTimeout);
  }, [nodes, edges, activeSessionId, getToken, isLoadingCanvas, isGuest, setSessions]);


  // Navigate to a node found by search
  const handleSearchNode = useCallback((node) => {
    setHighlightedNodeId(node.id);
    setActiveSearch(node.data?.label || "Node");
    // Brief delay so state propagates before fitView measures node
    setTimeout(() => {
      fitView({ nodes: [{ id: node.id }], padding: 0.6, duration: 600, maxZoom: 1.2 });
    }, 50);
  }, [fitView]);

  // Clear search highlight
  const handleClearSearch = useCallback(() => {
    setActiveSearch(null);
    setHighlightedNodeId(null);
  }, []);

  const handleStartEditNode = useCallback((nodeId) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === nodeId) {
          return {
            ...n,
            data: {
              ...n.data,
              isEditing: true
            }
          };
        }
        return n;
      })
    );
    setMenu(null);
  }, [setNodes]);

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
    (params) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: "#3b82f6", strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  // Drag and Drop handlers
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      if (!type) {
        return;
      }

      // Convert screen client coordinates to flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  // Click-to-add handler (adds node at the center of the current viewport)
  const addNodeAtCenter = useCallback(
    (type) => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      // Project the center of the viewport to flow coordinates
      const position = screenToFlowPosition({
        x: width / 2,
        y: height / 2,
      });

      const newNode = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setNodes]
  );

  const fitViewOptions = {
    padding: 0.35,
    maxZoom: 0.75,
  };

  // Inject a transient highlight ring into node styles
  const displayNodes = nodes.map((n) => {
    if (n.id !== highlightedNodeId) return n;
    const rings = {
      idea:     "0 0 0 3px #3b82f6, 0 0 24px 4px rgba(59,130,246,0.4)",
      task:     "0 0 0 3px #10b981, 0 0 24px 4px rgba(16,185,129,0.4)",
      resource: "0 0 0 3px #f59e0b, 0 0 24px 4px rgba(245,158,11,0.4)",
    };
    return {
      ...n,
      style: {
        ...n.style,
        boxShadow: rings[n.type] || rings.idea,
        borderRadius: "12px",
        transition: "box-shadow 0.3s ease",
      },
    };
  });

  const displayEdges = edges.map((e) => ({
    ...e,
    type: edgeStyle === "bezier" ? "default" : edgeStyle,
  }));

  if (isLoadingCanvas) {
    return (
      <div className="relative w-full h-full bg-zinc-950 flex items-center justify-center text-zinc-500 select-none overflow-hidden">
        <div className="flex flex-col items-center gap-2.5">
          <div className="w-5 h-5 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider font-mono">Loading Canvas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-zinc-950 text-zinc-100 select-none overflow-hidden">
      {/* Minimalist Watermark */}
      <div className="absolute top-5 left-16 z-10 pointer-events-none select-none">
        <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.25em] font-mono">
          Helix Workspace // v0.1
        </span>
      </div>

      {/* Floating Node Picker */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-20">
        <NodePicker onAddNode={addNodeAtCenter} />
      </div>

      {/* Node Search Bar + active badge */}
      <NodeSearchBar
        nodes={nodes}
        onSearch={handleSearchNode}
        onClear={handleClearSearch}
        activeSearch={activeSearch}
      />

      {/* Main Flow Canvas */}
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
        className="w-full h-full"
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onMoveStart={onMoveStart}
        onNodeDoubleClick={onNodeDoubleClick}
      >
        <Background variant="dots" gap={24} size={1.5} color="#27272a" />
        <Controls 
          className="!bg-zinc-900/95 !border-zinc-800 !text-zinc-200 !shadow-lg [&>button]:!border-zinc-800 [&>button]:!bg-transparent hover:[&>button]:!bg-zinc-800 [&_path]:fill-zinc-200" 
          showInteractive={false}
        />
        {isMiniMapOpen ? (
          <>
            <MiniMap 
              width={160}
              height={110}
              className="!bg-zinc-900/95 !border-zinc-800 !rounded-lg !shadow-lg"
              maskColor="rgba(9, 9, 11, 0.7)"
              nodeColor={(node) => {
                if (node.type === "idea") return "#1e3a8a";
                if (node.type === "task") return "#065f46";
                if (node.type === "resource") return "#78350f";
                return "#18181b";
              }}
              nodeStrokeWidth={1}
              nodeStrokeColor={(node) => {
                if (node.type === "idea") return "#3b82f6";
                if (node.type === "task") return "#10b981";
                if (node.type === "resource") return "#f59e0b";
                return "#27272a";
              }}
            />
            <button
              onClick={() => setIsMiniMapOpen(false)}
              className="absolute bottom-[135px] right-4 z-10 p-1.5 bg-zinc-900/95 border border-zinc-800 rounded-md hover:bg-zinc-800 hover:text-zinc-50 text-zinc-400 shadow-md transition-all cursor-pointer hover:border-zinc-700 active:scale-95 flex items-center justify-center"
              title="Minimize Map"
            >
              <Minimize2 size={12} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsMiniMapOpen(true)}
            className="absolute bottom-4 right-4 z-10 p-2.5 bg-zinc-900/95 border border-zinc-800 rounded-md hover:bg-zinc-800 hover:text-zinc-50 text-zinc-400 shadow-md transition-all cursor-pointer hover:border-zinc-700 active:scale-95 flex items-center justify-center"
            title="Expand Map"
          >
            <Map size={15} />
          </button>
        )}
      </ReactFlow>


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
