import React, { useState } from "react";
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
  Sparkles
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
  onExportSession
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
    changeNodeShape(shapeId);
    if (onUpdateStyleConfig) {
      onUpdateStyleConfig({ nodeShape: shapeId, edgeStyle });
    }
  };

  const handleEdgeStyleChange = (styleId) => {
    changeEdgeStyle(styleId);
    if (onUpdateStyleConfig) {
      onUpdateStyleConfig({ nodeShape, edgeStyle: styleId });
    }
  };

  const pinnedSessions = sessions.filter((s) => s.isPinned);
  const recentSessions = sessions.filter((s) => !s.isPinned);

  const renderSessionItem = (session) => {
    const isActive = session._id === activeSessionId;
    const isEditing = session._id === editingId;

    return (
      <div
        key={session._id}
        onClick={() => !isEditing && onSelectSession(session._id)}
        className={`group flex items-center justify-between h-9 px-3 rounded-md transition-colors relative cursor-pointer select-none ${
          isActive 
            ? "bg-zinc-800/60 text-zinc-50 font-medium" 
            : "hover:bg-zinc-800/40 text-zinc-400 hover:text-zinc-200"
        }`}
      >
        {/* Active Indicator Line */}
        {isActive && (
          <div className="absolute left-1 top-2 bottom-2 w-[2px] bg-zinc-300 rounded-full" />
        )}

        {/* Content Area */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
            <span className="text-sm truncate">{session.title}</span>
          )}
        </div>

        {/* Inline Actions */}
        <div className="flex items-center gap-0.5 shrink-0 ml-2">
          {isEditing ? (
            <div className="flex items-center gap-0.5">
              <button 
                onClick={saveEditing}
                className="p-1 rounded-md text-emerald-500 hover:bg-zinc-700/50 hover:text-emerald-400 cursor-pointer transition-colors"
              >
                <Check size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                className="p-1 rounded-md text-rose-500 hover:bg-zinc-700/50 hover:text-rose-400 cursor-pointer transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity duration-150">
              <button
                onClick={(e) => { e.stopPropagation(); onTogglePinSession(session._id); }}
                className={`p-1.5 rounded-md hover:bg-zinc-700/50 cursor-pointer transition-colors ${session.isPinned ? "text-zinc-300 hover:text-red-400 hover:bg-red-500/10" : "text-zinc-500 hover:text-zinc-300"}`}
                title={session.isPinned ? "Unpin" : "Pin"}
              >
                {session.isPinned ? (
                  <PinOff size={14} />
                ) : (
                  <Pin size={14} />
                )}
              </button>
              {onShareSession && (
                <button
                  onClick={(e) => { e.stopPropagation(); onShareSession(session); }}
                  className="p-1.5 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-blue-400 cursor-pointer transition-colors"
                  title="Share Mind Map"
                >
                  <Share2 size={14} />
                </button>
              )}
              {onExportSession && (
                <button
                  onClick={(e) => { e.stopPropagation(); onExportSession(session); }}
                  className="p-1.5 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-emerald-400 cursor-pointer transition-colors"
                  title="Export Snapshot (PDF / Image)"
                >
                  <Download size={14} />
                </button>
              )}
              <button
                onClick={(e) => startEditing(e, session)}
                className="p-1.5 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors"
                title="Rename"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteSession(session._id); }}
                className="p-1.5 rounded-md hover:bg-zinc-700/50 text-zinc-500 hover:text-rose-400 cursor-pointer transition-colors"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}

          {/* Show pin indicator if not hovered and pinned */}
          {!isEditing && session.isPinned && (
            <Pin size={14} className="text-zinc-500 group-hover:hidden ml-1" />
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
              {pinnedSessions.map(renderSessionItem)}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        <div className="flex flex-col gap-2">
          {pinnedSessions.length > 0 && recentSessions.length > 0 && (
            <h4 className="px-3 text-xs font-semibold text-zinc-500 select-none uppercase tracking-wider">
              Recent
            </h4>
          )}
          <div className="flex flex-col gap-0.5">
            {recentSessions.length > 0 ? (
              recentSessions.map(renderSessionItem)
            ) : pinnedSessions.length === 0 ? (
              <div className="py-6 text-center text-sm text-zinc-500 select-none">
                No active maps found.
              </div>
            ) : null}
          </div>
        </div>
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
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Node Shape
              </label>
              <div className="grid grid-cols-5 gap-1 bg-black/60 p-1 rounded-xl border border-white/[0.05]">
                {shapes.map((item) => {
                  const isSelected = nodeShape === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNodeShapeChange(item.id)}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white/[0.09] text-zinc-100 border border-white/[0.08]"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                      }`}
                      title={item.label}
                    >
                      {item.icon}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edge Style Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                Connection Style
              </label>
              <div className="grid grid-cols-4 gap-1 bg-black/60 p-1 rounded-xl border border-white/[0.05]">
                {edgeStyles.map((item) => {
                  const isSelected = edgeStyle === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleEdgeStyleChange(item.id)}
                      className={`p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white/[0.09] text-zinc-100 border border-white/[0.08]"
                          : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
                      }`}
                      title={item.label}
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
            <SignUpButton>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 bg-zinc-50 text-zinc-900 hover:bg-zinc-200 h-9 px-4 py-2 w-full shadow-sm">
                Sign Up
              </button>
            </SignUpButton>
            <SignInButton>
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