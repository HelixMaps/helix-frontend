"use client";

import React, { useState, useEffect, Suspense, use } from "react";
import { useAuth, useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Share2, 
  Copy, 
  ExternalLink, 
  GitFork, 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  ArrowLeft,
  Eye,
  Box,
  Check
} from "lucide-react";
import FlowCanvas from "@/components/FlowCanvas";
import ShareModal from "@/components/ShareModal";
import { fetchSharedMap, createMap, saveMapGraph } from "@/service/mapService";
import { useMapConfig } from "@/context/MapConfigContext";

function SharedMapContent({ params }) {
  // Unwrap params using React.use for Next.js 15/16 App Router
  const resolvedParams = use(params);
  const mapId = resolvedParams.id;

  const { isLoaded: isAuthLoaded, isSignedIn, userId, getToken } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialViewParam = searchParams.get("view");

  const { viewMode, changeViewMode } = useMapConfig();

  const [mapData, setMapData] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isForking, setIsForking] = useState(false);
  const [forkSuccess, setForkSuccess] = useState(false);

  // Set initial view mode based on query param if present (e.g. ?view=3d)
  useEffect(() => {
    if (initialViewParam === "3d" || initialViewParam === "2d") {
      changeViewMode(initialViewParam);
    }
  }, [initialViewParam, changeViewMode]);

  // Load public shared map details
  useEffect(() => {
    if (!mapId) return;

    let active = true;

    const loadSharedMap = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // If testing with local sandbox map
        if (mapId === "local-default" || mapId === "sandbox") {
          const fallbackData = {
            _id: "sandbox",
            title: "Sandbox Mind Map",
            userId: "sandbox-guest",
            nodes: [
              {
                id: "root-1",
                type: "idea",
                data: { label: "Central Concept", elevation: 55 },
                position: { x: 250, y: 150 },
              },
              {
                id: "child-1",
                type: "task",
                data: { label: "Explore Features", elevation: 35 },
                position: { x: 80, y: 300 },
              },
              {
                id: "child-2",
                type: "resource",
                data: { label: "Interactive 3D Slabs", elevation: 75 },
                position: { x: 420, y: 300 },
              },
            ],
            edges: [
              {
                id: "e-1-2",
                source: "root-1",
                target: "child-1",
                type: "threeDimensional",
                animated: true,
              },
              {
                id: "e-1-3",
                source: "root-1",
                target: "child-2",
                type: "threeDimensional",
                animated: true,
              },
            ],
            styleConfig: { nodeShape: "rounded", edgeStyle: "smoothstep" },
          };
          if (active) {
            setMapData(fallbackData);
            setSessions([fallbackData]);
            setIsLoading(false);
          }
          return;
        }

        const data = await fetchSharedMap(mapId);
        if (active && data) {
          setMapData(data);
          setSessions([data]);
        }
      } catch (err) {
        console.error("Failed to load shared mind map:", err);
        if (active) {
          setError(err.message || "Mind map not found or link has expired");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadSharedMap();

    return () => {
      active = false;
    };
  }, [mapId]);

  // Determine if the currently viewed user is the verified owner/admin of this map
  const isOwner = Boolean(isSignedIn && userId && mapData?.userId && userId === mapData.userId);

  // Fork / Clone Map into Current User's Workspace
  const handleForkMap = async () => {
    if (!mapData) return;

    if (!isSignedIn) {
      // Save map snapshot in sessionStorage for post-signup restore
      try {
        sessionStorage.setItem(
          "helix-pending-fork",
          JSON.stringify({
            title: `${mapData.title} (Forked)`,
            nodes: sessions[0]?.nodes || mapData.nodes,
            edges: sessions[0]?.edges || mapData.edges,
            styleConfig: mapData.styleConfig,
          })
        );
      } catch (e) {
        console.error(e);
      }
      router.push(`/sign-up?redirect_url=/dashboard`);
      return;
    }

    try {
      setIsForking(true);
      const token = await getToken();
      if (!token) return;

      const currentNodes = sessions[0]?.nodes || mapData.nodes || [];
      const currentEdges = sessions[0]?.edges || mapData.edges || [];

      // Create new map under this user's account
      const created = await createMap(token, `${mapData.title} (Forked)`);
      if (created?._id) {
        // Save the current graph to the new map
        await saveMapGraph(token, created._id, currentNodes, currentEdges);
        setForkSuccess(true);
        setTimeout(() => {
          router.push(`/dashboard`);
        }, 1200);
      }
    } catch (err) {
      console.error("Failed to fork map:", err);
    } finally {
      setIsForking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-zinc-950 items-center justify-center text-zinc-300 font-sans select-none">
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin shadow-[0_0_15px_rgba(59,130,246,0.3)]" />
          <span className="text-xs uppercase tracking-widest font-mono text-zinc-400 font-bold">
            Transmitting Neural Mind Map...
          </span>
        </div>
      </div>
    );
  }

  if (error || !mapData) {
    return (
      <div className="flex h-screen w-screen bg-zinc-950 items-center justify-center text-zinc-300 font-sans p-4 select-none">
        <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mx-auto flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
            <Lock size={22} />
          </div>
          <h2 className="text-lg font-bold text-zinc-100">Mind Map Unavailable</h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            {error || "This shared link may have expired or the mind map was removed by its author."}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <ArrowLeft size={14} /> Back to Helix
            </Link>
            <Link
              href="/dashboard?try=true"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            >
              Create New Map
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans select-none">
      {/* ── 1. Futuristic Floating Header HUD ── */}
      <header className="absolute top-4 inset-x-4 z-40 pointer-events-none flex items-center justify-between gap-3">
        {/* Left: Brand + Map Title + Security Badge */}
        <div className="pointer-events-auto flex items-center gap-3 px-3.5 py-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-xl">
          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-100 hover:text-white transition-opacity group cursor-pointer"
            title="Helix Workspace Home"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform shadow-[0_0_10px_rgba(59,130,246,0.3)]">
              <Sparkles size={13} />
            </div>
            <span className="text-xs font-bold font-mono tracking-wider uppercase text-zinc-200">
              Helix
            </span>
          </Link>

          <span className="h-4 w-[1px] bg-zinc-800" />

          <h1 className="text-xs font-semibold text-zinc-100 truncate max-w-[180px] sm:max-w-xs" title={mapData.title}>
            {mapData.title}
          </h1>

          {/* Access Permission Status Badge */}
          {isOwner ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <ShieldCheck size={11} /> Admin Mode (Saving Enabled)
            </span>
          ) : (
            <span
              className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400"
              title="Guest interactions run in local memory and will not overwrite the cloud database."
            >
              <Eye size={11} /> Interactive Sandbox (Local Only)
            </span>
          )}
        </div>

        {/* Right: Actions (Fork, Share, User Profile) */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Owner Dashboard Shortcut OR Fork Clone Button */}
          {isOwner ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-850 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-200 text-xs font-semibold shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <ExternalLink size={13} />
              <span className="hidden sm:inline">Open Full Dashboard</span>
            </Link>
          ) : (
            <button
              onClick={handleForkMap}
              disabled={isForking}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-lg ${
                forkSuccess
                  ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.35)]"
              }`}
              title="Clone this mind map into your own workspace to keep your edits"
            >
              {forkSuccess ? (
                <>
                  <Check size={13} className="stroke-[3]" />
                  <span>Forked to Workspace!</span>
                </>
              ) : (
                <>
                  <GitFork size={13} className={isForking ? "animate-spin" : ""} />
                  <span>{isForking ? "Cloning..." : "Fork Map to Save"}</span>
                </>
              )}
            </button>
          )}

          {/* Share Modal Trigger */}
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-750 text-zinc-200 text-xs font-semibold shadow-lg transition-all active:scale-95 cursor-pointer"
            title="Share this link"
          >
            <Share2 size={13} className="text-blue-400" />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* User Profile or Sign-in */}
          <div className="bg-zinc-900/90 border border-zinc-750 rounded-xl p-1 shadow-lg flex items-center">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <SignInButton mode="modal">
                <button className="px-2.5 py-1 text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. Interactive Mind Map Canvas ── */}
      <main className="w-full h-full">
        <FlowCanvas
          activeSessionId={mapId}
          getToken={getToken}
          isGuest={!isOwner}
          sessions={sessions}
          setSessions={setSessions}
          onShare={() => setIsShareModalOpen(true)}
        />
      </main>

      {/* ── 3. Share Modal ── */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        activeMap={mapData}
      />
    </div>
  );
}

export default function SharedMapPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-screen bg-zinc-950 items-center justify-center text-zinc-300 font-sans">
          <div className="flex flex-col items-center gap-3">
            <div className="w-7 h-7 rounded-full border-2 border-zinc-700 border-t-blue-500 animate-spin" />
            <span className="text-xs uppercase tracking-widest font-mono text-zinc-400 font-bold">
              Loading Shared Map...
            </span>
          </div>
        </div>
      }
    >
      <SharedMapContent params={params} />
    </Suspense>
  );
}
