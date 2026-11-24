import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  Pin, 
  PinOff,
  Edit2, 
  Trash2, 
  Check, 
  X, 
  Settings,
  ChevronDown,
  Box,
  Share2,
  Download,
  Sparkles,
  Users,
  LogOut,
  MoreHorizontal
} from "lucide-react";
import { SignInButton, SignUpButton, Show, UserButton, useUser } from "@clerk/nextjs";
import { shadesOfPurple } from "@clerk/themes";
import { useMapConfig } from "@/context/MapConfigContext";
import Link from "next/link";

const shapes = [
  {
    id: "rounded",
    label: "Rounded",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
      </svg>
    ),
  },
  {
    id: "pill",
    label: "Capsule",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="6" width="18" height="12" rx="6" />
      </svg>
    ),
  },
  {
    id: "sharp",
    label: "Rectangle",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" />
      </svg>
    ),
  },
  {
    id: "leaf",
    label: "Leaf",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3,21 C3,11 11,3 21,3 C21,13 13,21 3,21 Z" />
      </svg>
    ),
  },
  {
    id: "asymmetric",
    label: "Asymmetric",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21,21 C21,11 13,3 3,3 C3,13 11,21 21,21 Z" />
      </svg>
    ),
  },
];

const edgeStyles = [
  {
    id: "bezier",
    label: "Curved",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3,20 C3,10 21,14 21,4" />
      </svg>
    ),
  },
  {
    id: "straight",
    label: "Straight",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3,20 L21,4" />
      </svg>
    ),
  },
  {
    id: "step",
    label: "Step",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3,20 L12,20 L12,4 L21,4" />
      </svg>
    ),
  },
  {
    id: "smoothstep",
    label: "Smooth Step",
    icon: (
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3,20 L10,20 Q12,20 12,18 L12,6 Q12,4 14,4 L21,4" />
      </svg>
    ),
  },
];

export default function Sidebar({ 
  sessions, 
  activeSessionId, 
  onSelectSession, 
  onCreateSession, 
  onRenameSession, 
  onDeleteSession, 
  onTogglePinSession,
  onOpenSearch,
  token,
  onUpdateStyleConfig,
  isGuest,
  onShareSession,
  onExportSession,
  onOpenTeamSession
}) {
  const { user } = useUser();
  const { 
    nodeShape, 
    changeNodeShape, 
    edgeStyle, 
    changeEdgeStyle,
    viewMode,
    changeViewMode,
    enableParallax,
    toggleParallax,
  } = useMapConfig();
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [activeMenuSessionId, setActiveMenuSessionId] = useState(null);

  // Close active dropdown menu when clicking anywhere outside
  useEffect(() => {
    if (!activeMenuSessionId) return;
    const handleClickOutside = (e) => {
      if (!e.target.closest(".sidebar-dropdown-menu") && !e.target.closest(".sidebar-menu-trigger")) {
        setActiveMenuSessionId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuSessionId]);

  const currentActiveSession = sessions.find((s) => s._id === activeSessionId);
  const isCurrentActiveViewer = Boolean(
    currentActiveSession &&
    currentActiveSession.isOwner === false &&
    currentActiveSession.userRole === "viewer"
  );

  const startEditing = (e, session) => {
    e.stopPropagation();
    setEditingId(session._id);
    setEditingTitle(session.title);
  };

  const saveEditing = (e) => {
    e.stopPropagation();
    if (editingTitle.trim()) {
      onRenameSession(editingId, editingTitle.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      saveEditing(e);
    } else if (e.key === "Escape") {
      setEditingId(null);
    }
  };

  const handleNodeShapeChange = (shapeId) => {
    if (isCurrentActiveViewer) return;
    changeNodeShape(shapeId);
    if (onUpdateStyleConfig) {
      onUpdateStyleConfig({ nodeShape: shapeId, edgeStyle });
    }
  };

  const handleEdgeStyleChange = (styleId) => {
    if (isCurrentActiveViewer) return;
    changeEdgeStyle(styleId);
    if (onUpdateStyleConfig) {
      onUpdateStyleConfig({ nodeShape, edgeStyle: styleId });
    }
  };

  const ownedSessions = sessions.filter((s) => s.isOwner !== false);
  const sharedSessions = sessions.filter((s) => s.isOwner === false);

  const pinnedSessions = ownedSessions.filter((s) => s.isPinned);
  const recentSessions = ownedSessions.filter((s) => !s.isPinned);

  const renderSessionItem = (session, isShared = false) => {
    const isActive = session._id === activeSessionId;
    const isEditing = session._id === editingId;
    const isMenuOpen = activeMenuSessionId === session._id;
    const isViewer = isShared && session.userRole === "viewer";

    return (
      <div
        key={session._id}
        onClick={() => !isEditing && onSelectSession(session._id)}
        className={`group flex items-center justify-between h-9 px-3 rounded-lg transition-colors relative cursor-pointer select-none ${
          isActive 
            ? "bg-zinc-800/60 text-zinc-50 font-medium" 
            : "hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
        }`}
      >
        {/* Active Indicator Line */}
        {isActive && (
          <div className={`absolute left-1 top-2 bottom-2 w-[2px] rounded-full ${
            isShared ? "bg-cyan-400" : "bg-zinc-300"
          }`} />
        )}

        {/* Content Area - Maximized title width reaching all the way near the ellipsis */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 mr-2">
          {isEditing ? (
            <input
              type="text"
              value={editingTitle}
              onChange={(e) => setEditingTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
              className="flex h-7 w-full rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 text-zinc-50"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-sm truncate flex-1 leading-snug" title={session.title}>
                {session.title}
              </span>
              {isShared && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 uppercase">
                  {session.userRole || "Member"}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Action: Pin Indicator or Horizontal Ellipsis Menu Trigger */}
        <div className="flex items-center gap-1 shrink-0 relative">
          {isEditing ? (
            <div className="flex items-center gap-0.5">
              <button 
                onClick={saveEditing}
                className="p-1 rounded-md text-emerald-500 hover:bg-zinc-700/50 hover:text-emerald-400 cursor-pointer transition-colors"
                title="Save Title"
              >
                <Check size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                className="p-1 rounded-md text-rose-500 hover:bg-zinc-700/50 hover:text-rose-400 cursor-pointer transition-colors"
                title="Cancel"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              {/* Show Pin icon when pinned and not hovered/menu closed */}
              {session.isPinned && !isMenuOpen && (
                <Pin size={13} className="text-zinc-500 group-hover:hidden" />
              )}

              {/* Horizontal Ellipsis button on hover or when open */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenuSessionId((prev) => (prev === session._id ? null : session._id));
                }}
                className={`sidebar-menu-trigger p-1.5 rounded-md hover:bg-zinc-700/60 cursor-pointer transition-all ${
                  isMenuOpen
                    ? "opacity-100 text-zinc-100 bg-zinc-800"
                    : "opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-zinc-200"
                }`}
                title="Map Options"
              >
                <MoreHorizontal size={15} />
              </button>

              {/* Floating Dropdown Menu */}
              {isMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="sidebar-dropdown-menu absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[#090A0D]/95 border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-0.5 select-none"
                  style={{
                    boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.06), 0 20px 45px -8px rgba(0, 0, 0, 0.95)",
                  }}
                >
                  {/* Team Access */}
                  {onOpenTeamSession && (
                    <button
                      onClick={() => {
                        setActiveMenuSessionId(null);
                        onOpenTeamSession(session);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-cyan-300 hover:bg-cyan-500/10 cursor-pointer transition-colors w-full text-left"
                    >
                      <Users size={14} className="text-cyan-400 shrink-0" />
                      <span>Team & Access</span>
                    </button>
                  )}

                  {/* Share Mind Map */}
                  {onShareSession && (
                    <button
                      onClick={() => {
                        setActiveMenuSessionId(null);
                        onShareSession(session);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-blue-300 hover:bg-blue-500/10 cursor-pointer transition-colors w-full text-left"
                    >
                      <Share2 size={14} className="text-blue-400 shrink-0" />
                      <span>Share Mind Map</span>
                    </button>
                  )}

                  {/* Pin / Unpin (Only for owned maps) */}
                  {!isShared && (
                    <button
                      onClick={() => {
                        setActiveMenuSessionId(null);
                        onTogglePinSession(session._id);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] cursor-pointer transition-colors w-full text-left"
                    >
                      {session.isPinned ? (
                        <>
                          <PinOff size={14} className="text-zinc-400 shrink-0" />
                          <span>Unpin Map</span>
                        </>
                      ) : (
                        <>
                          <Pin size={14} className="text-zinc-400 shrink-0" />
                          <span>Pin to Top</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Export Snapshot */}
                  {onExportSession && (
                    <button
                      onClick={() => {
                        setActiveMenuSessionId(null);
                        onExportSession(session);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-emerald-300 hover:bg-emerald-500/10 cursor-pointer transition-colors w-full text-left"
                    >
                      <Download size={14} className="text-emerald-400 shrink-0" />
                      <span>Export Snapshot</span>
                    </button>
                  )}

                  {/* Rename Map (Only for Owner or Editor, NOT Viewer) */}
                  {!isViewer && (
                    <button
                      onClick={(e) => {
                        setActiveMenuSessionId(null);
                        startEditing(e, session);
                      }}
                      className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-300 hover:text-zinc-100 hover:bg-white/[0.06] cursor-pointer transition-colors w-full text-left"
                    >
                      <Edit2 size={14} className="text-zinc-400 shrink-0" />
                      <span>Rename Map</span>
                    </button>
                  )}

                  <div className="h-[1px] bg-white/[0.06] my-1" />

                  {/* Delete (Owner) or Leave (Shared member) */}
                  <button
                    onClick={() => {
                      setActiveMenuSessionId(null);
                      onDeleteSession(session._id);
                    }}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 cursor-pointer transition-colors w-full text-left"
                  >
                    {isShared ? (
                      <>
                        <LogOut size={14} className="shrink-0" />
                        <span>Leave Map</span>
                      </>
                    ) : (
                      <>
                        <Trash2 size={14} className="shrink-0" />
                        <span>Delete Map</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 text-zinc-50 border-r border-zinc-800/40 font-sans">
      {/* Header / Logo */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/40 shrink-0 select-none">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-md hover:opacity-75 transition-opacity cursor-pointer"
          title="Back to Home"
        >
          <img src="/helix-logo.svg" alt="Helix Logo" className="h-6 w-6 rounded-md object-contain" />
          <span className="text-sm font-semibold tracking-tight">Helix Maps</span>
        </Link>
        {isGuest && (
          <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full select-none animate-pulse">
            Sandbox
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-1 p-3 border-b border-zinc-800/40 shrink-0">
        <button
          onClick={onCreateSession}
          className="inline-flex items-center justify-start gap-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-50 h-9 px-3 py-2 text-zinc-400 w-full"
        >
          <Plus size={16} />
          <span>New Mind Map</span>
        </button>

        <button
          onClick={onOpenSearch}
          className="inline-flex items-center justify-start gap-2.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-50 h-9 px-3 py-2 text-zinc-400 w-full"
        >
          <Search size={16} />
          <span>Search Maps</span>
        </button>
      </div>

      {/* Main List Section */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-6 scrollbar-thin">
        {/* Pinned Sessions */}
        {pinnedSessions.length > 0 && (
          <div className="flex flex-col gap-2">
            <h4 className="px-3 text-xs font-semibold text-zinc-500 flex items-center gap-1.5 select-none uppercase tracking-wider">
              <Pin size={12} className="rotate-45" /> Pinned
            </h4>
            <div className="flex flex-col gap-0.5">
              {pinnedSessions.map((s) => renderSessionItem(s, false))}
            </div>
          </div>
        )}

        {/* Recent / My Mind Maps */}
        <div className="flex flex-col gap-2">
          {(pinnedSessions.length > 0 || sharedSessions.length > 0) && (
            <h4 className="px-3 text-xs font-semibold text-zinc-500 select-none uppercase tracking-wider">
              {sharedSessions.length > 0 ? "My Maps" : "Recent"}
            </h4>
          )}
          <div className="flex flex-col gap-0.5">
            {recentSessions.length > 0 ? (
              recentSessions.map((s) => renderSessionItem(s, false))
            ) : pinnedSessions.length === 0 && sharedSessions.length === 0 ? (
              <div className="py-6 text-center text-sm text-zinc-500 select-none">
                No active maps found.
              </div>
            ) : null}
          </div>
        </div>

        {/* Shared with Me Section */}
        {sharedSessions.length > 0 && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.05]">
            <div className="px-3 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5 select-none uppercase tracking-wider">
                <Users size={12} className="text-cyan-400" />
                <span>Shared with Me</span>
              </h4>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {sharedSessions.length}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              {sharedSessions.map((s) => renderSessionItem(s, true))}
            </div>
          </div>
        )}
      </div>

{/* Map Style Configuration */}
      <div className="px-3 py-3 border-t border-white/[0.06] shrink-0 flex flex-col gap-1.5 bg-transparent select-none">
        <button
          onClick={() => setIsConfigOpen(!isConfigOpen)}
          className={`group flex items-center justify-between rounded-xl text-xs font-medium transition-all h-9 px-3 w-full cursor-pointer ${
            isConfigOpen
              ? "bg-white/[0.06] text-zinc-100 border border-white/[0.07]"
              : "text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200 border border-transparent"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings
              size={14}
              className={`transition-transform duration-300 ${
                isConfigOpen ? "text-emerald-400/90 rotate-45" : "text-zinc-500 group-hover:text-zinc-300"
              }`}
            />
            <span>Map Style</span>
            {isCurrentActiveViewer && (
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                View Only
              </span>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-zinc-500 transition-transform duration-200 ${
              isConfigOpen ? "rotate-180 text-zinc-300" : ""
            }`}
          />
        </button>

        {isConfigOpen && (
          <div
            className="flex flex-col gap-3.5 p-3 rounded-xl border border-white/[0.07] bg-[#090A0D]/90 backdrop-blur-xl mt-1 animate-in fade-in slide-in-from-top-1 duration-200"
            style={{
              boxShadow: "inset 0 1px 0 0 rgba(255, 255, 255, 0.04)",
            }}
          >
            {/* Node Shape Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Node Shape
                </label>
                {isCurrentActiveViewer && (
                  <span className="text-[9px] font-mono text-zinc-500">Locked</span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1 bg-black/60 p-1 rounded-xl border border-white/[0.05]">
                {shapes.map((item) => {
                  const isSelected = nodeShape === item.id;
                  return (
                    <button
                      key={item.id}
                      disabled={isCurrentActiveViewer}
                      onClick={() => handleNodeShapeChange(item.id)}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                        isCurrentActiveViewer
                          ? "cursor-not-allowed opacity-50 text-zinc-600"
                          : isSelected
                          ? "bg-white/[0.09] text-zinc-100 border border-white/[0.08] cursor-pointer"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] cursor-pointer"
                      }`}
                      title={isCurrentActiveViewer ? "Viewers cannot change map node style" : item.label}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edge Style Selector */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Connection Style
                </label>
                {isCurrentActiveViewer && (
                  <span className="text-[9px] font-mono text-zinc-500">Locked</span>
                )}
              </div>
              <div className="grid grid-cols-4 gap-1 bg-black/60 p-1 rounded-xl border border-white/[0.05]">
                {edgeStyles.map((item) => {
                  const isSelected = edgeStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      disabled={isCurrentActiveViewer}
                      onClick={() => handleEdgeStyleChange(item.id)}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-all ${
                        isCurrentActiveViewer
                          ? "cursor-not-allowed opacity-50 text-zinc-600"
                          : isSelected
                          ? "bg-white/[0.09] text-zinc-100 border border-white/[0.08] cursor-pointer"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] cursor-pointer"
                      }`}
                      title={isCurrentActiveViewer ? "Viewers cannot change connection style" : item.label}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3D Spatial / 2D Canvas Mode Selector */}
            <div className="flex flex-col gap-1.5 pt-2.5 border-t border-white/[0.05]">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                  Perspective
                </label>
                <span className="text-[9px] font-mono text-zinc-500 bg-white/[0.03] px-1.5 py-0.5 rounded border border-white/[0.05]">
                  {viewMode === "3d" || viewMode === "3d-perspective" ? "3D" : "2D"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1 bg-black/60 p-1 rounded-xl border border-white/[0.05]">
                <button
                  onClick={() => changeViewMode("3d")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "3d" || viewMode === "3d-perspective"
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="3D Spatial Perspective View"
                >
                  <Box
                    size={12}
                    className={
                      viewMode === "3d" || viewMode === "3d-perspective"
                        ? "text-emerald-400/90"
                        : "text-zinc-500"
                    }
                  />
                  <span>3D Spatial</span>
                </button>

                <button
                  onClick={() => changeViewMode("2d")}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    viewMode === "2d" || viewMode === "3d-topdown"
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                  title="2D Top-Down Canvas Grid"
                >
                  <span>2D Canvas</span>
                </button>
              </div>
            </div>

            {/* Parallax Cursor Reaction Switch */}
            <div
              onClick={toggleParallax}
              className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] cursor-pointer group"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 transition-colors">
                Cursor Parallax
              </span>

              <button
                type="button"
                role="switch"
                aria-checked={enableParallax}
                className={`relative inline-flex h-4 w-8 shrink-0 items-center rounded-full border transition-colors cursor-pointer ${
                  enableParallax
                    ? "bg-emerald-500/20 border-emerald-400/40"
                    : "bg-white/[0.04] border-white/[0.08]"
                }`}
              >
                <span
                  className={`inline-block h-2.5 w-2.5 rounded-full transition-transform ${
                    enableParallax
                      ? "translate-x-4 bg-emerald-400"
                      : "translate-x-1 bg-zinc-500"
                  }`}
                />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer with Auth Controls */}
      <div className="p-4 border-t border-zinc-800/40 shrink-0 bg-zinc-950/50 select-none">
        <Show when="signed-out">
          <div className="flex flex-col gap-2 w-full">
            <SignUpButton fallbackRedirectUrl="/dashboard">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 bg-zinc-50 text-zinc-900 hover:bg-zinc-200 h-9 px-4 py-2 w-full shadow-sm">
                Sign Up
              </button>
            </SignUpButton>
            <SignInButton fallbackRedirectUrl="/dashboard">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 border border-zinc-800 bg-transparent hover:bg-zinc-800/60 text-zinc-300 h-9 px-4 py-2 w-full">
                Sign In
              </button>
            </SignInButton>
          </div>
        </Show>
        <Show when="signed-in">
          <div className="relative flex items-center justify-between w-full rounded-md border border-zinc-800/60 bg-zinc-900/30 p-2.5 hover:bg-zinc-800/50 hover:border-zinc-700/60 transition-all group">
            <div className="flex items-center gap-3 min-w-0">
              {user?.imageUrl ? (
                <img 
                  src={user.imageUrl} 
                  alt={user?.fullName || "User Avatar"} 
                  className="w-7 h-7 rounded-full border border-zinc-800/80 object-cover shrink-0" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-xs font-semibold text-zinc-300 shrink-0">
                  {(user?.fullName || user?.username || user?.firstName || "A").charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-medium leading-none text-zinc-200 truncate group-hover:text-zinc-50 transition-colors">
                  {user?.fullName || user?.username || user?.firstName || "Account"}
                </span>
                <span className="text-xs text-zinc-500 mt-1.5 truncate group-hover:text-zinc-400 transition-colors">
                  {user?.primaryEmailAddress?.emailAddress || ""}
                </span>
              </div>
            </div>
            <Settings 
              size={16} 
              className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0 ml-2" 
            />
            {/* Transparent UserButton overlay to capture clicks and open the default popover */}
            <div className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer">
              <UserButton 
                appearance={{
                  baseTheme: shadesOfPurple,
                  variables: {
                    colorPrimary: "#ffffff",
                    colorBackground: "#09090b",
                    colorText: "#f4f4f5",
                    colorForeground: "#f4f4f5",
                    colorNeutral: "#f4f4f5",
                    colorTextSecondary: "#a1a1aa",
                    colorInputBackground: "#18181b",
                    colorInputText: "#f4f4f5",
                    colorInputForeground: "#f4f4f5",
                    colorBorder: "#27272a",
                    colorTextOnPrimaryBackground: "#09090b",
                  },
                  elements: {
                    rootBox: "!w-full !h-full",
                    userButtonTrigger: "!w-full !h-full !absolute !inset-0 focus:!outline-none focus:!ring-0 focus-visible:!ring-0",
                    userButtonAvatarBox: "!w-full !h-full !opacity-0",
                    cardBox: "!h-[580px] !max-h-[85vh]",
                    userProfileModalContent: "!h-[580px] !max-h-[85vh]"
                  }
                }}
              />
            </div>
          </div>
        </Show>
      </div>

    </div>
  );
}