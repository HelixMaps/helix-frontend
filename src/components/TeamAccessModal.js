"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  ShieldCheck,
  Trash2,
  X,
  Check,
  AlertCircle,
  Clock,
  LogOut,
} from "lucide-react";
import {
  addMapMember,
  removeMapMember,
  updateMapMemberRole,
  fetchMapMembers,
} from "@/service/mapService";

export default function TeamAccessModal({
  isOpen,
  onClose,
  activeMap,
  currentUserEmail = "",
  isOwner = true,
  onUpdateMap,
  getToken,
  isGuest = false,
}) {
  const [emailInput, setEmailInput] = useState("");
  const [selectedRole, setSelectedRole] = useState("editor");
  const [members, setMembers] = useState([]);
  const [ownerInfo, setOwnerInfo] = useState({ email: "", userId: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Sync state when modal opens or activeMap changes
  useEffect(() => {
    if (!isOpen || !activeMap) return;

    setMembers(activeMap.members || []);
    setOwnerInfo({
      email: activeMap.ownerEmail || (isOwner ? currentUserEmail : "Map Owner"),
      userId: activeMap.userId || "",
    });
    setErrorMessage("");
    setSuccessMessage("");
    setEmailInput("");

    if (!isGuest && activeMap._id && !activeMap._id.startsWith("draft-") && getToken) {
      const loadLatestMembers = async () => {
        try {
          const token = await getToken();
          if (!token) return;
          const data = await fetchMapMembers(token, activeMap._id, currentUserEmail);
          if (data) {
            setMembers(data.members || []);
            if (data.owner?.email) {
              setOwnerInfo(data.owner);
            }
          }
        } catch (err) {
          console.warn("Could not refresh map members:", err.message);
        }
      };
      loadLatestMembers();
    }
  }, [isOpen, activeMap, isOwner, currentUserEmail, isGuest, getToken]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !activeMap) return null;

  const mapId = activeMap._id;
  const isDraftOrGuest = isGuest || !mapId || mapId.startsWith("draft-");

  const handleAddMember = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage("Please enter an email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address");
      return;
    }

    const resolvedOwnerEmail = (
      ownerInfo.email ||
      activeMap.ownerEmail ||
      currentUserEmail ||
      ""
    ).toLowerCase();
    if (resolvedOwnerEmail && trimmedEmail === resolvedOwnerEmail) {
      setErrorMessage("Cannot add the project owner as a team member");
      return;
    }

    if (members.some((m) => m.email && m.email.toLowerCase() === trimmedEmail)) {
      setErrorMessage("This user is already part of the project team");
      return;
    }

    if (isDraftOrGuest) {
      const newMember = {
        _id: `temp-${Date.now()}`,
        email: trimmedEmail,
        role: selectedRole,
        addedAt: new Date().toISOString(),
      };
      const updatedList = [...members, newMember];
      setMembers(updatedList);
      if (onUpdateMap) {
        onUpdateMap({ ...activeMap, members: updatedList });
      }
      setEmailInput("");
      setSuccessMessage(`Added ${trimmedEmail} to team`);
      setTimeout(() => setSuccessMessage(""), 3000);
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await getToken();
      if (!token) throw new Error("Authentication token unavailable");

      const updatedMap = await addMapMember(
        token,
        mapId,
        { email: trimmedEmail, role: selectedRole },
        currentUserEmail
      );

      const updatedMembers = updatedMap.members || [];
      setMembers(updatedMembers);
      if (onUpdateMap) {
        onUpdateMap(updatedMap);
      }
      setEmailInput("");
      setSuccessMessage(`Invited ${trimmedEmail} as ${selectedRole} (email notification sent)`);
      setTimeout(() => setSuccessMessage(""), 3500);
    } catch (err) {
      setErrorMessage(err.message || "Failed to add team member");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (member) => {
    setErrorMessage("");
    setSuccessMessage("");
    const identifier = member._id || member.email;

    if (isDraftOrGuest) {
      const updatedList = members.filter((m) => (m._id || m.email) !== identifier);
      setMembers(updatedList);
      if (onUpdateMap) {
        onUpdateMap({ ...activeMap, members: updatedList });
      }
      return;
    }

    try {
      setActionLoadingId(identifier);
      const token = await getToken();
      if (!token) throw new Error("Authentication token unavailable");

      const updatedMap = await removeMapMember(
        token,
        mapId,
        identifier,
        currentUserEmail
      );
      const updatedMembers = updatedMap.members || [];
      setMembers(updatedMembers);
      if (onUpdateMap) {
        onUpdateMap(updatedMap);
      }
      setSuccessMessage(`Removed access for ${member.email}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to remove member");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRole = async (member) => {
    if (!isOwner) return;
    const nextRole = member.role === "viewer" ? "editor" : "viewer";
    const identifier = member._id || member.email;

    if (isDraftOrGuest) {
      const updatedList = members.map((m) =>
        (m._id || m.email) === identifier ? { ...m, role: nextRole } : m
      );
      setMembers(updatedList);
      if (onUpdateMap) {
        onUpdateMap({ ...activeMap, members: updatedList });
      }
      return;
    }

    try {
      setActionLoadingId(identifier);
      const token = await getToken();
      if (!token) throw new Error("Authentication token unavailable");

      const updatedMap = await updateMapMemberRole(
        token,
        mapId,
        identifier,
        nextRole,
        currentUserEmail
      );
      const updatedMembers = updatedMap.members || [];
      setMembers(updatedMembers);
      if (onUpdateMap) {
        onUpdateMap(updatedMap);
      }
    } catch (err) {
      setErrorMessage(err.message || "Failed to update member role");
    } finally {
      setActionLoadingId(null);
    }
  };

  const resolvedOwnerEmail =
    ownerInfo.email ||
    activeMap.ownerEmail ||
    (isOwner ? currentUserEmail : "Project Owner");

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in-0 duration-200 select-none"
      onClick={onClose}
    >
      {/* ── Stealth Matte Obsidian Dialog ── */}
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/[0.07] bg-[#090A0D]/90 backdrop-blur-xl p-5 overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          boxShadow:
            "inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 24px 48px -12px rgba(0, 0, 0, 0.9)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400 shrink-0">
              <Users size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-zinc-100 tracking-tight">
                  Team & Project Access
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.06]">
                  {isOwner ? "Owner" : "Shared"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[320px]">
                Manage collaborators for{" "}
                <span className="text-zinc-300">
                  &ldquo;{activeMap.title || "Untitled Map"}&rdquo;
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Invite Member Form (Visible to Owner) ── */}
        {isOwner && (
          <form onSubmit={handleAddMember} className="mt-4 flex flex-col gap-2">
            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Invite by Email
            </label>
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5">
              <div className="flex-1 min-w-[180px] flex items-center bg-black/50 border border-white/[0.06] focus-within:border-white/[0.16] rounded-xl px-3 py-2 text-xs text-zinc-300 transition-colors">
                <Mail size={13} className="text-zinc-600 mr-2 shrink-0" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="collaborator@example.com"
                  className="bg-transparent border-none outline-none w-full text-zinc-200 placeholder:text-zinc-600"
                />
              </div>

              {/* Recessed Segmented Role Switcher */}
              <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-black/60 border border-white/[0.05] shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedRole("editor")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${
                    selectedRole === "editor"
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Editor
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole("viewer")}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium cursor-pointer transition-all ${
                    selectedRole === "viewer"
                      ? "bg-white/[0.08] text-zinc-100"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Viewer
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !emailInput.trim()}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all shrink-0 active:scale-95 border ${
                  emailInput.trim()
                    ? "bg-white/[0.08] hover:bg-white/[0.14] border-white/[0.1] text-zinc-100 hover:text-white"
                    : "bg-white/[0.03] border-white/[0.05] text-zinc-600 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-zinc-200 animate-spin" />
                ) : (
                  <>
                    <UserPlus size={13} />
                    <span>Add</span>
                  </>
                )}
              </button>
            </div>

            {/* Feedback Banners */}
            {errorMessage && (
              <div className="flex items-center gap-1.5 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl mt-1 animate-in fade-in-0">
                <AlertCircle size={13} className="shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl mt-1 animate-in fade-in-0">
                <Check size={13} className="shrink-0 text-emerald-400" />
                <span>{successMessage}</span>
              </div>
            )}
          </form>
        )}

        {/* ── People with Access List ── */}
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
              Members ({members.length + 1})
            </span>
            <span className="text-[10px] font-mono text-zinc-600">
              {isOwner ? "Click role to toggle" : "Read / Write permissions"}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
            {/* 1. Owner Row */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/[0.05]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-amber-400/80 shrink-0">
                  <ShieldCheck size={14} />
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-zinc-200 truncate">
                      {resolvedOwnerEmail || "Project Owner"}
                    </span>
                    {isOwner && (
                      <span className="text-[9px] font-mono text-zinc-400 bg-white/[0.04] px-1.5 py-[1px] rounded border border-white/[0.06]">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Full workspace administration
                  </span>
                </div>
              </div>

              <span className="text-[10px] font-mono text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md shrink-0">
                Owner
              </span>
            </div>

            {/* 2. Members List */}
            {members.map((member) => {
              const isCurrent =
                currentUserEmail &&
                member.email &&
                member.email.toLowerCase() === currentUserEmail.toLowerCase();
              const isLoadingThis =
                actionLoadingId === (member._id || member.email);

              return (
                <div
                  key={member._id || member.email}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 hover:bg-white/[0.02] border border-white/[0.05] transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-zinc-400 font-mono text-xs uppercase shrink-0">
                      {member.email?.charAt(0) || "U"}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-200 truncate">
                          {member.email}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] font-mono text-zinc-400 bg-white/[0.04] px-1.5 py-[1px] rounded border border-white/[0.06]">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Clock size={10} className="text-zinc-600" />
                        <span>
                          {member.addedAt
                            ? `Added ${new Date(member.addedAt).toLocaleDateString()}`
                            : "Team Member"}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Role Badge / Toggle */}
                    {isOwner ? (
                      <button
                        onClick={() => handleToggleRole(member)}
                        disabled={isLoadingThis}
                        title="Click to toggle between Editor and Viewer"
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono cursor-pointer transition-all border ${
                          member.role === "editor"
                            ? "bg-white/[0.07] text-zinc-200 border-white/[0.1] hover:bg-white/[0.12]"
                            : "bg-black/40 text-zinc-400 border-white/[0.06] hover:text-zinc-200 hover:bg-white/[0.05]"
                        }`}
                      >
                        {member.role === "editor" ? "Editor" : "Viewer"}
                      </button>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-mono border ${
                          member.role === "editor"
                            ? "bg-white/[0.07] text-zinc-200 border-white/[0.1]"
                            : "bg-black/40 text-zinc-400 border-white/[0.06]"
                        }`}
                      >
                        {member.role === "editor" ? "Editor" : "Viewer"}
                      </span>
                    )}

                    {/* Remove Member / Leave Button */}
                    {(isOwner || isCurrent) && (
                      <button
                        onClick={() => handleRemoveMember(member)}
                        disabled={isLoadingThis}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title={isCurrent ? "Leave this map" : "Remove team member"}
                      >
                        {isLoadingThis ? (
                          <div className="w-3 h-3 rounded-full border border-rose-400 border-t-transparent animate-spin" />
                        ) : isCurrent && !isOwner ? (
                          <LogOut size={13} />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {members.length === 0 && (
              <div className="py-5 px-3 rounded-xl bg-black/25 border border-dashed border-white/[0.06] text-center">
                <p className="text-xs text-zinc-500">No collaborators yet</p>
                <p className="text-[11px] text-zinc-600 mt-0.5">
                  Invite teammates by email above to collaborate on this map.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="mt-4 pt-3.5 border-t border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Permissions update immediately
          </span>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-transparent hover:bg-white/[0.05] border border-white/[0.06] text-zinc-400 hover:text-zinc-200 text-xs font-medium cursor-pointer transition-all active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}