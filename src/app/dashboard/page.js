"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchModal from "@/components/SearchModal";
import ShareModal from "@/components/ShareModal";
import FlowCanvas from "@/components/FlowCanvas";
import { fetchProjects, createMap, updateMap, deleteMap } from "@/service/mapService";

function DashboardContent() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuest = searchParams.get("try") === "true";

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetMap, setShareTargetMap] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Redirect to Sign In if signed out and not guest
  useEffect(() => {
    if (isLoaded && !isSignedIn && !isGuest) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, isGuest, router]);

  // 2. Fetch Map Sessions dynamically using fresh token on mount (or load mock sandbox map)
  useEffect(() => {
    if (isGuest) {
      const defaultMap = {
        _id: "local-default",
        title: "My First Mind Map",
        isPinned: false,
        nodes: [
          {
            id: "root-1",
            type: "idea",
            data: { label: "Central Idea", elevation: 60 },
            position: { x: 250, y: 150 },
          },
          {
            id: "child-1",
            type: "task",
            data: { label: "Define Requirements", elevation: 35 },
            position: { x: 100, y: 300 },
          },
          {
            id: "child-2",
            type: "resource",
            data: { label: "React Flow Docs", elevation: 85 },
            position: { x: 400, y: 300 },
          },
        ],
        edges: [
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
        ],
        styleConfig: {
          nodeShape: "rounded",
          edgeStyle: "smoothstep"
        }
      };
      setSessions([defaultMap]);
      setActiveSessionId(defaultMap._id);
      setIsLoading(false);
      return;
    }

    if (!isSignedIn) return;

    const loadSessions = async () => {
      try {
        setIsLoading(true);
        const token = await getToken();
        if (!token) return;
        
        const data = await fetchProjects(token);
        setSessions(data);
        if (data.length > 0) {
          // Load first pinned map or just the first map in list
          const active = data.find((s) => s.isPinned) || data[0];
          setActiveSessionId(active._id);
        } else {
          // If the user has no mind maps, create a default one
          const defaultMap = await createMap(token, "My First Mind Map");
          setSessions([defaultMap]);
          setActiveSessionId(defaultMap._id);
        }
      } catch (err) {
        console.error("Error loading mind maps:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, [isSignedIn, getToken, isGuest]);

  // ⌘K / Ctrl+K → open search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelectSession = (id) => {
    setActiveSessionId(id);
    setIsMobileSidebarOpen(false);
  };

  const handleCreateSession = async () => {
    if (isGuest) {
      const newMap = {
        _id: `local-${Date.now()}`,
        title: `Untitled Mind Map ${sessions.length + 1}`,
        isPinned: false,
        nodes: [
          {
            id: "root-1",
            type: "idea",
            data: { label: "Central Idea", elevation: 60 },
            position: { x: 250, y: 150 },
          }
        ],
        edges: [],
        styleConfig: {
          nodeShape: "rounded",
          edgeStyle: "smoothstep"
        }
      };
      setSessions((prev) => [newMap, ...prev]);
      setActiveSessionId(newMap._id);
      setIsMobileSidebarOpen(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;
      const newMap = await createMap(token, `Untitled Mind Map ${sessions.length + 1}`);
      setSessions((prev) => [newMap, ...prev]);
      setActiveSessionId(newMap._id);
      setIsMobileSidebarOpen(false);
    } catch (err) {
      console.error("Error creating map:", err);
    }
  };

  const handleRenameSession = async (id, newTitle) => {
    // Optimistic state update
    setSessions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, title: newTitle } : s))
    );
    if (isGuest) return;

    try {
      const token = await getToken();
      if (!token) return;
      await updateMap(token, id, { title: newTitle });
    } catch (err) {
      console.error("Error renaming map:", err);
    }
  };

  const handleDeleteSession = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      if (isGuest) {
        setSessions((prev) => {
          const filtered = prev.filter((s) => s._id !== deleteTargetId);
          if (activeSessionId === deleteTargetId) {
            setActiveSessionId(filtered.length > 0 ? filtered[0]._id : null);
          }
          return filtered;
        });
        setDeleteTargetId(null);
        return;
      }

      try {
        const token = await getToken();
        if (!token) return;
        await deleteMap(token, deleteTargetId);
        setSessions((prev) => {
          const filtered = prev.filter((s) => s._id !== deleteTargetId);
          if (activeSessionId === deleteTargetId) {
            setActiveSessionId(filtered.length > 0 ? filtered[0]._id : null);
          }
          return filtered;
        });
      } catch (err) {
        console.error("Error deleting map:", err);
      } finally {
        setDeleteTargetId(null);
      }
    }
  };

  const getDeleteTargetTitle = () =>
    sessions.find((s) => s._id === deleteTargetId)?.title || "";

  const handleTogglePinSession = async (id) => {
    const target = sessions.find((s) => s._id === id);
    if (!target) return;
    const nextPinned = !target.isPinned;
    // Optimistic state update
    setSessions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, isPinned: nextPinned } : s))
    );
    if (isGuest) return;

    try {
      const token = await getToken();
      if (!token) return;
      await updateMap(token, id, { isPinned: nextPinned });
    } catch (err) {
      console.error("Error toggling pin status:", err);
    }
  };

  const handleUpdateStyleConfig = async (newStyleConfig) => {
    if (!activeSessionId) return;
    try {
      const activeSession = sessions.find(s => s._id === activeSessionId);
      const isChanged = !activeSession || 
        activeSession.styleConfig?.nodeShape !== newStyleConfig.nodeShape ||
        activeSession.styleConfig?.edgeStyle !== newStyleConfig.edgeStyle;
        
      if (isChanged) {
        setSessions((prev) =>
          prev.map((s) =>
            s._id === activeSessionId
              ? { ...s, styleConfig: newStyleConfig }
              : s
          )
        );
        if (isGuest) return;

        const token = await getToken();
        if (!token) return;
        await updateMap(token, activeSessionId, { styleConfig: newStyleConfig });
      }
    } catch (err) {
      console.error("Error updating style configuration:", err);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex h-screen w-screen bg-zinc-950 items-center justify-center text-zinc-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500 font-mono">Initializing Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans relative">
      {/* ── 1. Mobile Hamburger ── */}
      <button
        onClick={() => setIsMobileSidebarOpen(true)}
        className="fixed top-4 left-4 z-30 p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 shadow-xl cursor-pointer md:hidden active:scale-95 transition-all"
        title="Open Sidebar"
      >
        <Menu size={16} />
      </button>

      {/* ── 2. Sidebar wrapper ── */}
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isMobileSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 shrink-0 ${
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          isSidebarCollapsed ? "md:w-0 md:opacity-0 md:pointer-events-none" : "md:w-72 md:opacity-100"
        }`}
      >
        {/* Mobile close button */}
        {isMobileSidebarOpen && (
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="absolute top-4 right-4 z-50 p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 cursor-pointer md:hidden"
          >
            <X size={14} />
          </button>
        )}

        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={handleSelectSession}
          onCreateSession={handleCreateSession}
          onRenameSession={handleRenameSession}
          onDeleteSession={handleDeleteSession}
          onTogglePinSession={handleTogglePinSession}
          onOpenSearch={() => setIsSearchOpen(true)}
          token={null} /* Deprecated, getToken is used dynamically */
          onUpdateStyleConfig={handleUpdateStyleConfig}
          isGuest={isGuest}
          onShareSession={(s) => {
            setShareTargetMap(s);
            setIsShareModalOpen(true);
          }}
        />
      </div>

      {/* ── 3. Main workspace ── */}
      <main className="flex-1 h-full relative overflow-hidden bg-[#141414]">
        {/* Desktop sidebar collapse toggle */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute top-4 left-4 z-30 p-2.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 shadow-xl cursor-pointer hidden md:flex active:scale-95 transition-all"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {activeSessionId && (
          <FlowCanvas 
            activeSessionId={activeSessionId} 
            getToken={getToken} 
            isGuest={isGuest}
            sessions={sessions}
            setSessions={setSessions}
            onShare={() => {
              const active = sessions.find((s) => s._id === activeSessionId) || sessions[0];
              setShareTargetMap(active);
              setIsShareModalOpen(true);
            }}
          />
        )}
      </main>

      {/* ── 4. Global Search Modal ── */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectSession}
      />

      {/* ── 5. Share Mind Map Modal ── */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeMap={shareTargetMap || sessions.find((s) => s._id === activeSessionId) || sessions[0]}
      />

      {/* ── 5. Delete Confirmation Modal ── */}
      {deleteTargetId && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] animate-in fade-in-0"
          onClick={() => setDeleteTargetId(null)}
        >
          <div
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-800 bg-zinc-950 p-6 shadow-xl duration-200 animate-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 className="text-lg font-semibold leading-none tracking-tight text-zinc-50">
                Delete Mind Map
              </h2>
              <p className="text-sm text-zinc-400">
                Are you sure you want to delete{" "}
                <span className="font-mono text-zinc-200 font-medium">
                  &ldquo;{getDeleteTargetTitle()}&rdquo;
                </span>
                ? This action cannot be undone.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-zinc-800 bg-transparent hover:bg-zinc-800/60 text-zinc-300 h-9 px-4 py-2 mt-2 sm:mt-0 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-red-900 text-red-100 hover:bg-red-800 h-9 px-4 py-2 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen bg-zinc-950 items-center justify-center text-zinc-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-zinc-800 border-t-zinc-400 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500 font-mono">Initializing Workspace...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

