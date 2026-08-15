import React, { useState, useEffect, useRef } from "react";
import { Search, X, FolderOpen } from "lucide-react";

export default function SearchModal({ isOpen, onClose, sessions, onSelectSession }) {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      // Focus the search input when modal opens
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Close on Escape press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-top-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Area */}
        <div className="flex items-center gap-3 px-4 border-b border-zinc-800/80">
          <Search size={18} className="text-zinc-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search mind maps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 bg-transparent border-none outline-none text-sm text-zinc-100 placeholder-zinc-500"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1 select-none">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
              <div
                key={session._id}
                onClick={() => {
                  onSelectSession(session._id);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800/50 cursor-pointer text-zinc-300 hover:text-zinc-100 transition-all duration-150 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FolderOpen size={16} className="text-zinc-500 group-hover:text-zinc-300 transition-colors shrink-0" />
                  <span className="text-xs font-medium truncate">{session.title}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {session.isPinned && (
                    <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700 text-zinc-400 font-medium">
                      Pinned
                    </span>
                  )}
                  <span className="text-[10px] text-zinc-600 font-semibold group-hover:text-zinc-400 transition-colors">
                    Open →
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 px-4 text-center text-xs text-zinc-600">
              No mind maps found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-500 font-medium">
          <span>{filteredSessions.length} results</span>
          <span className="flex items-center gap-1">
            <span className="bg-zinc-800 border border-zinc-700 px-1 rounded shadow-sm">ESC</span> to close
          </span>
        </div>
      </div>
    </div>
  );
}
