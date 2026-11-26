"use client";

import React, { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { Menu, X, ChevronLeft, ChevronRight, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SearchModal from "@/components/SearchModal";
import ShareModal from "@/components/ShareModal";
import TeamAccessModal from "@/components/TeamAccessModal";
import CreateMapModal from "@/components/CreateMapModal";
import FlowCanvas from "@/components/FlowCanvas";
import { fetchProjects, fetchMap, createMap, updateMap, deleteMap, removeMapMember } from "@/service/mapService";
import { useToast } from "@/context/ToastContext";
import { DEFAULT_NODE_THEME } from "@/config/nodeThemes";

// Helper to determine if a map is untouched / empty (initial default state)
const isMapUnmodified = (map) => {
  if (!map) return true;
  const nodes = map.nodes || [];
  const edges = map.edges || [];
  if (edges.length > 0) return false;
  if (nodes.length !== 1) return false;
  const root = nodes[0];
  if (Math.round(root.position?.x) !== 250 || Math.round(root.position?.y) !== 150) return false;
  if (root.data?.label && root.data.label !== map.title && root.data.label !== "Central Idea") return false;
  if (root.data?.summary && root.data.summary.trim() !== "") return false;
  return true;
};

function DashboardContent() {
  const toast = useToast();
  const { isLoaded: isAuthLoaded, isSignedIn, getToken } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const isLoaded = isAuthLoaded && isUserLoaded;
  const currentUserEmail = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";
  const currentUserName =
    (user?.fullName || "").trim() ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
    (user?.username || "").trim();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isGuest = searchParams.get("try") === "true";
  const rawUrlMap = searchParams.get("map") || searchParams.get("mapId") || searchParams.get("id");
  const urlMapId = (rawUrlMap && !rawUrlMap.startsWith("draft-") && rawUrlMap !== "local-default") ? rawUrlMap : null;

  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingMap, setIsCreatingMap] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetMap, setShareTargetMap] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamTargetMap, setTeamTargetMap] = useState(null);
  const [triggerExportCount, setTriggerExportCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const hasLoadedProjectsRef = useRef(false);
  const activeSessionIdRef = useRef(activeSessionId);
  const sessionsRef = useRef(sessions);
  const isInitialSyncRef = useRef(true);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Clean invalid draft parameter from URL immediately
  useEffect(() => {
    if (rawUrlMap && (rawUrlMap.startsWith("draft-") || rawUrlMap === "local-default")) {
      try {
        const params = new URLSearchParams(window.location.search);
        params.delete("map");
        params.delete("mapId");
        params.delete("id");
        const cleanUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
        window.history.replaceState(null, "", cleanUrl);
      } catch (e) {}
    }
  }, [rawUrlMap]);

  // 1. Redirect to Sign In if signed out and not guest (preserving target URL in redirect_url)
  useEffect(() => {
    if (isLoaded && !isSignedIn && !isGuest) {
      const redirectUrl = typeof window !== "undefined" ? window.location.href : "";
      const signInUrl = redirectUrl ? `/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}` : "/sign-in";
      router.replace(signInUrl);
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
            data: { label: "Central Idea", elevation: 60, theme: "blue" },
            position: { x: 250, y: 150 },
          },
          {
            id: "child-1",
            data: { label: "Define Requirements", elevation: 35, theme: "emerald" },
            position: { x: 100, y: 300 },
          },
          {
            id: "child-2",
            data: { label: "React Flow Docs", elevation: 85, theme: "amber" },
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

    // Wait until Clerk auth AND user profile have both finished loading
    if (!isLoaded || !isSignedIn) return;

    // Only load sessions once on initial mount after user credentials resolve
    if (hasLoadedProjectsRef.current) return;

    const loadSessions = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const token = await getToken();
        if (!token) return;

        // Fetch user's own maps and shared maps where user is a team member
        const data = await fetchProjects(token, {}, currentUserEmail);
        let projectList = data || [];
        let selectedId = null;

        // Determine target map ID from urlMapId or directly from window.location
        let targetMapId = urlMapId;
        if (!targetMapId && typeof window !== "undefined") {
          try {
            const params = new URLSearchParams(window.location.search);
            const raw = params.get("map") || params.get("mapId") || params.get("id");
            if (raw && !raw.startsWith("draft-") && raw !== "local-default") {
              targetMapId = raw;
            }
          } catch (e) {}
        }

        // If URL requested a specific map ID, prioritize it
        if (targetMapId) {
          const match = projectList.find((s) => s._id === targetMapId);
          if (match) {
            selectedId = match._id;
          } else {
            try {
              const directMap = await fetchMap(token, targetMapId, currentUserEmail);
              if (directMap) {
                // Ensure permission metadata is set for shared map
                if (directMap.userId !== user?.id && currentUserEmail) {
                  const normalizedEmail = currentUserEmail.toLowerCase().trim();
                  const member = directMap.members?.find((mem) => mem.email && mem.email.toLowerCase().trim() === normalizedEmail);
                  directMap.isOwner = false;
                  directMap.userRole = member?.role || "editor";
                }
                projectList = [directMap, ...projectList];
                selectedId = directMap._id;
              }
            } catch (directErr) {
              console.warn("Direct map fetch failed:", directErr);
              toast.error("Mind map could not be accessed or does not exist.", "Map Unavailable");
              // Clean dead/invalid query parameter from URL so it doesn't cause recurring errors
              try {
                const params = new URLSearchParams(window.location.search);
                params.delete("map");
                params.delete("mapId");
                params.delete("id");
                const cleanUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
                window.history.replaceState(null, "", cleanUrl);
              } catch (e) {}
            }
          }
        }

        setSessions(projectList);
        hasLoadedProjectsRef.current = true;

        if (selectedId) {
          setActiveSessionId(selectedId);
        } else {
          // Check for user's last active map saved in localStorage
          let savedMapId = null;
          try {
            const userKey = user?.id || currentUserEmail || "default";
            savedMapId = localStorage.getItem(`helix_active_map_${userKey}`);
          } catch (e) {}

          const savedMatch = savedMapId ? projectList.find((s) => s._id === savedMapId) : null;
          if (savedMatch) {
            setActiveSessionId(savedMatch._id);
          } else if (projectList.length > 0) {
            // Load first pinned map or just the first map in list
            const active = projectList.find((s) => s.isPinned) || projectList[0];
            setActiveSessionId(active._id);
          } else {
            // If the user has no mind maps, create a default draft (not stored in DB until changed)
            const defaultDraft = {
              _id: `draft-${Date.now()}`,
              title: "My First Mind Map",
              isDraft: true,
              isPinned: false,
              nodes: [
                {
                  id: `root-${Date.now()}`,
                  data: { label: "Central Idea", elevation: 60, theme: DEFAULT_NODE_THEME },
                  position: { x: 250, y: 150 },
                }
              ],
              edges: [],
              styleConfig: {
                nodeShape: "rounded",
                edgeStyle: "smoothstep"
              }
            };
            setSessions([defaultDraft]);
            setActiveSessionId(defaultDraft._id);
          }
        }
      } catch (err) {
        console.error("Error loading mind maps:", err);
        setLoadError(err?.message || "Failed to load mind maps from backend database");
        toast.error(err?.message || "Failed to load mind maps", "Connection Error");
      } finally {
        setIsLoading(false);
      }
    };
    loadSessions();
  }, [isLoaded, isSignedIn, getToken, isGuest, currentUserEmail, urlMapId, toast, user?.id]);

  // Save active map ID to localStorage for this user so re-login or refresh restores their last active map
  useEffect(() => {
    if (!activeSessionId || activeSessionId.startsWith("draft-") || activeSessionId === "local-default") return;
    try {
      const userKey = user?.id || currentUserEmail || "default";
      localStorage.setItem(`helix_active_map_${userKey}`, activeSessionId);
    } catch (e) {}
  }, [activeSessionId, user?.id, currentUserEmail]);

  // Synchronize activeSessionId to the browser URL query parameter (?map=<mapId>)
  useEffect(() => {
    if (!activeSessionId) return; // Do NOT modify URL before active session has resolved!
    try {
      const params = new URLSearchParams(window.location.search);
      const isDraftOrLocal = activeSessionId.startsWith("draft-") || activeSessionId === "local-default";

      if (isDraftOrLocal) {
        if (params.has("map") || params.has("mapId") || params.has("id")) {
          params.delete("map");
          params.delete("mapId");
          params.delete("id");
          const cleanUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname;
          window.history.replaceState(null, "", cleanUrl);
        }
      } else {
        if (params.get("map") !== activeSessionId) {
          params.set("map", activeSessionId);
          params.delete("mapId");
          params.delete("id");
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          if (isInitialSyncRef.current) {
            window.history.replaceState(null, "", newUrl);
            isInitialSyncRef.current = false;
          } else {
            window.history.pushState(null, "", newUrl);
          }
        } else {
          isInitialSyncRef.current = false;
        }
      }
    } catch (e) {
      // browser environment check
    }
  }, [activeSessionId]);

  // Handle browser back / forward navigation (popstate)
  useEffect(() => {
    const handlePopState = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const mapIdFromUrl = params.get("map") || params.get("mapId") || params.get("id");
        if (
          mapIdFromUrl &&
          mapIdFromUrl !== activeSessionIdRef.current &&
          !mapIdFromUrl.startsWith("draft-") &&
          mapIdFromUrl !== "local-default"
        ) {
          const existing = sessionsRef.current.find((s) => s._id === mapIdFromUrl);
          if (existing) {
            setActiveSessionId(existing._id);
          } else {
            (async () => {
              try {
                const token = await getToken();
                if (!token) return;
                const directMap = await fetchMap(token, mapIdFromUrl, currentUserEmail);
                if (directMap) {
                  if (directMap.userId !== user?.id && currentUserEmail) {
                    const normalizedEmail = currentUserEmail.toLowerCase().trim();
                    const member = directMap.members?.find(
                      (mem) => mem.email && mem.email.toLowerCase().trim() === normalizedEmail
                    );
                    directMap.isOwner = false;
                    directMap.userRole = member?.role || "editor";
                  }
                  setSessions((prev) => {
                    if (prev.some((s) => s._id === directMap._id)) return prev;
                    return [directMap, ...prev];
                  });
                  setActiveSessionId(directMap._id);
                }
              } catch (e) {
                console.warn("Could not load map from popstate URL:", e);
              }
            })();
          }
        }
      } catch (e) {}
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [getToken, currentUserEmail, user?.id]);

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
    setSessions((prev) => {
      const activeSession = prev.find((s) => s._id === activeSessionId);
      // Discard active draft if it was never modified
      if (activeSession?.isDraft && isMapUnmodified(activeSession) && activeSession._id !== id) {
        return prev.filter((s) => s._id !== activeSession._id);
      }
      return prev;
    });
    setActiveSessionId(id);
    setIsMobileSidebarOpen(false);
  };

  // Opens the New Mind Map Modal
  const handleCreateSession = () => {
    setIsCreateModalOpen(true);
  };

  // Called when user confirms title in New Mind Map Modal
  const handleConfirmCreateMap = async (chosenTitle) => {
    const title = chosenTitle?.trim() || "Untitled Mind Map";
    setIsCreatingMap(true);

    const initialNode = {
      id: `root-${Date.now()}`,
      data: { label: title, summary: "", elevation: 60, theme: DEFAULT_NODE_THEME },
      position: { x: 250, y: 150 },
    };
    const styleConfig = {
      nodeShape: "rounded",
      edgeStyle: "smoothstep"
    };

    if (isGuest) {
      const draftId = `draft-${Date.now()}`;
      const newDraftMap = {
        _id: draftId,
        title,
        isDraft: true,
        isPinned: false,
        nodes: [initialNode],
        edges: [],
        styleConfig
      };
      setSessions((prev) => [
        newDraftMap,
        ...prev.filter((s) => !s.isDraft || !isMapUnmodified(s))
      ]);
      setActiveSessionId(draftId);
      setIsCreatingMap(false);
      setIsCreateModalOpen(false);
      setIsMobileSidebarOpen(false);
      return;
    }

    try {
      const token = await getToken();
      if (!token) return;

      const created = await createMap(
        token,
        title,
        null,
        null,
        { nodes: [initialNode], edges: [], styleConfig },
        currentUserEmail
      );

      setSessions((prev) => [
        created,
        ...prev.filter((s) => !s.isDraft || !isMapUnmodified(s))
      ]);
      setActiveSessionId(created._id);
      try {
        const params = new URLSearchParams(window.location.search);
        params.set("map", created._id);
        params.delete("mapId");
        params.delete("id");
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.replaceState(null, "", newUrl);
      } catch (e) {}
      toast.success(`Created "${title}"`, "Map Created");
      setIsCreateModalOpen(false);
      setIsMobileSidebarOpen(false);
    } catch (err) {
      console.error("Failed to create map on server:", err);
      toast.error(err.message || "Failed to create mind map", "Creation Error");
    } finally {
      setIsCreatingMap(false);
    }
  };

  const handleRenameSession = async (id, newTitle) => {
    const target = sessions.find((s) => s._id === id);
    if (target?.isOwner === false && target?.userRole === "viewer") {
      toast.error("Viewers have read-only access and cannot rename this map.", "Permission Denied");
      return;
    }

    // Optimistic state update
    setSessions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, title: newTitle } : s))
    );
    if (isGuest || id?.startsWith("draft-")) return;

    try {
      const token = await getToken();
      if (!token) return;
      await updateMap(token, id, { title: newTitle });
    } catch (err) {
      console.error("Error renaming map:", err);
      toast.error(err.message || "Failed to rename map on server", "Rename Failed");
    }
  };

  const handleDeleteSession = (id) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      const createDefaultDraft = () => ({
        _id: `draft-${Date.now()}`,
        title: "My First Mind Map",
        isDraft: true,
        isPinned: false,
        nodes: [
          {
            id: `root-${Date.now()}`,
            data: { label: "Central Idea", elevation: 60, theme: DEFAULT_NODE_THEME },
            position: { x: 250, y: 150 },
          }
        ],
        edges: [],
        styleConfig: {
          nodeShape: "rounded",
          edgeStyle: "smoothstep"
        }
      });

      if (isGuest || deleteTargetId?.startsWith("draft-")) {
        setSessions((prev) => {
          const filtered = prev.filter((s) => s._id !== deleteTargetId);
          if (activeSessionId === deleteTargetId) {
            if (filtered.length > 0) {
              setActiveSessionId(filtered[0]._id);
              return filtered;
            } else {
              const draft = createDefaultDraft();
              setActiveSessionId(draft._id);
              return [draft];
            }
          }
          return filtered;
        });
        setDeleteTargetId(null);
        return;
      }

      try {
        const token = await getToken();
        if (!token) return;
        const targetSession = sessions.find((s) => s._id === deleteTargetId);
        if (targetSession?.isOwner === false) {
          await removeMapMember(token, deleteTargetId, currentUserEmail, currentUserEmail);
          toast.success("Successfully left the shared mind map", "Left Map");
        } else {
          await deleteMap(token, deleteTargetId, currentUserEmail);
          toast.success("Mind map deleted successfully", "Deleted");
        }
        setSessions((prev) => {
          const filtered = prev.filter((s) => s._id !== deleteTargetId);
          if (activeSessionId === deleteTargetId) {
            if (filtered.length > 0) {
              setActiveSessionId(filtered[0]._id);
              return filtered;
            } else {
              const draft = createDefaultDraft();
              setActiveSessionId(draft._id);
              return [draft];
            }
          }
          return filtered;
        });
      } catch (err) {
        console.error("Error deleting or leaving map:", err);
        toast.error(err.message || "Failed to delete or leave map", "Action Failed");
      } finally {
        setDeleteTargetId(null);
      }
    }
  };

  const handleOpenTeamModal = async (s) => {
    let target = s || sessions.find((item) => item._id === activeSessionId) || sessions[0];
    if (target?.isDraft || target?._id?.startsWith("draft-")) {
      try {
        const token = await getToken();
        if (token) {
          const savedMap = await createMap(token, target.title, null, null, {
            nodes: target.nodes || [],
            edges: target.edges || [],
            styleConfig: target.styleConfig
          }, currentUserEmail);
          setSessions((prev) =>
            prev.map((item) => (item._id === target._id ? { ...savedMap, isDraft: false } : item))
          );
          if (activeSessionId === target._id) {
            setActiveSessionId(savedMap._id);
          }
          target = savedMap;
        }
      } catch (e) {
        console.error("Failed to persist map for team modal:", e);
      }
    }
    setTeamTargetMap(target);
    setIsTeamModalOpen(true);
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
    if (isGuest || id?.startsWith("draft-")) return;

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
    const activeSession = sessions.find((s) => s._id === activeSessionId);
    if (activeSession?.isOwner === false && activeSession?.userRole === "viewer") {
      toast.error("Viewers have read-only access and cannot alter map styling.", "Permission Denied");
      return;
    }

    try {
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
        if (isGuest || activeSessionId?.startsWith("draft-")) return;

        const token = await getToken();
        if (!token) return;
        await updateMap(token, activeSessionId, { styleConfig: newStyleConfig });
      }
    } catch (err) {
      console.error("Error updating style configuration:", err);
      toast.error(err.message || "Failed to update style configuration", "Style Error");
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
          onOpenTeamSession={handleOpenTeamModal}
          onShareSession={async (s) => {
            let target = s;
            if (s?.isDraft || s?._id?.startsWith("draft-")) {
              try {
                const token = await getToken();
                if (token) {
                  const savedMap = await createMap(token, s.title, null, null, {
                    nodes: s.nodes || [],
                    edges: s.edges || [],
                    styleConfig: s.styleConfig
                  });
                  setSessions((prev) =>
                    prev.map((item) => (item._id === s._id ? { ...savedMap, isDraft: false } : item))
                  );
                  if (activeSessionId === s._id) {
                    setActiveSessionId(savedMap._id);
                  }
                  target = savedMap;
                }
              } catch (e) {
                console.error("Failed to persist map for sharing:", e);
              }
            }
            setShareTargetMap(target);
            setIsShareModalOpen(true);
          }}
          onExportSession={(s) => {
            if (s._id !== activeSessionId) {
              setActiveSessionId(s._id);
            }
            setTriggerExportCount((c) => c + 1);
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

        {/* Diagnostic Error State if backend or MongoDB fails to load */}
        {loadError && sessions.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-[#141414] select-none z-20">
            <div className="max-w-md w-full bg-zinc-950/95 border border-red-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <AlertTriangle size={22} />
              </div>
              <h2 className="text-base font-bold text-zinc-100">Database Connection Failed</h2>
              <div className="text-xs text-red-300 font-mono mt-2.5 p-2.5 bg-red-950/40 border border-red-900/60 rounded-xl text-left break-words">
                {loadError}
              </div>
              <p className="text-xs text-zinc-400 mt-3 leading-relaxed">
                Ensure <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded">MONGO_URI</code> and <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded">CLERK_SECRET_KEY</code> are configured in <code className="text-zinc-200 bg-zinc-900 px-1 py-0.5 rounded">helix-backend/.env</code>.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-lg active:scale-95"
                >
                  <RefreshCw size={13} />
                  <span>Retry Connection</span>
                </button>
                <button
                  onClick={() => router.push("/dashboard?try=true")}
                  className="px-4 py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-all cursor-pointer border border-zinc-750"
                >
                  Open Sandbox
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSessionId && (
          <FlowCanvas 
            key={activeSessionId}
            activeSessionId={activeSessionId} 
            setActiveSessionId={setActiveSessionId}
            getToken={getToken} 
            isGuest={isGuest}
            sessions={sessions}
            setSessions={setSessions}
            triggerExport={triggerExportCount}
            currentUserEmail={currentUserEmail}
            onOpenTeam={() => handleOpenTeamModal()}
            onShare={async () => {
              let active = sessions.find((s) => s._id === activeSessionId) || sessions[0];
              if (active?.isDraft || active?._id?.startsWith("draft-")) {
                try {
                  const token = await getToken();
                  if (token) {
                    const savedMap = await createMap(token, active.title, null, null, {
                      nodes: active.nodes || [],
                      edges: active.edges || [],
                      styleConfig: active.styleConfig
                    }, currentUserEmail);
                    setSessions((prev) =>
                      prev.map((item) => (item._id === active._id ? { ...savedMap, isDraft: false } : item))
                    );
                    setActiveSessionId(savedMap._id);
                    active = savedMap;
                  }
                } catch (e) {
                  console.error("Failed to persist map for sharing:", e);
                }
              }
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

      {/* ── 5. Share Mind Map Modal (Public Link) ── */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeMap={shareTargetMap || sessions.find((s) => s._id === activeSessionId) || sessions[0]}
      />

      {/* ── 6. Team & Project Access Modal ── */}
      <TeamAccessModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        activeMap={teamTargetMap || sessions.find((s) => s._id === activeSessionId) || sessions[0]}
        currentUserEmail={currentUserEmail}
        currentUserName={currentUserName}
        isOwner={
          (teamTargetMap?.isOwner ?? (sessions.find((s) => s._id === activeSessionId)?.isOwner !== false))
        }
        onUpdateMap={(updated) => {
          setSessions((prev) =>
            prev.map((s) => (s._id === updated._id ? { ...s, ...updated } : s))
          );
          if (teamTargetMap?._id === updated._id) {
            setTeamTargetMap(updated);
          }
        }}
        getToken={getToken}
        isGuest={isGuest}
      />

      {/* ── 7. Create Mind Map Modal ── */}
      <CreateMapModal
        isOpen={isCreateModalOpen}
        isLoading={isCreatingMap}
        onClose={() => {
          if (!isCreatingMap) {
            setIsCreateModalOpen(false);
          }
        }}
        onSubmit={handleConfirmCreateMap}
      />

      {/* ── 8. Delete / Leave Confirmation Modal ── */}
      {deleteTargetId && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-[2px] animate-in fade-in-0"
          onClick={() => setDeleteTargetId(null)}
        >
          <div
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 border border-zinc-800 bg-zinc-950 p-6 shadow-xl duration-200 animate-in zoom-in-95 slide-in-from-left-1/2 slide-in-from-top-[48%] sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const target = sessions.find((s) => s._id === deleteTargetId);
              const isShared = target?.isOwner === false;
              return (
                <>
                  <div className="flex flex-col space-y-2 text-center sm:text-left">
                    <h2 className="text-lg font-semibold leading-none tracking-tight text-zinc-50">
                      {isShared ? "Leave Shared Mind Map" : "Delete Mind Map"}
                    </h2>
                    <p className="text-sm text-zinc-400">
                      {isShared ? (
                        <>
                          Are you sure you want to leave{" "}
                          <span className="font-mono text-zinc-200 font-medium">
                            &ldquo;{getDeleteTargetTitle()}&rdquo;
                          </span>
                          ? You will no longer have access to this shared project.
                        </>
                      ) : (
                        <>
                          Are you sure you want to delete{" "}
                          <span className="font-mono text-zinc-200 font-medium">
                            &ldquo;{getDeleteTargetTitle()}&rdquo;
                          </span>
                          ? This action cannot be undone.
                        </>
                      )}
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
                      {isShared ? "Leave Map" : "Delete"}
                    </button>
                  </div>
                </>
              );
            })()}
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

