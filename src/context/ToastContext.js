"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info", title = "") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type, title }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    error: (msg, title = "Action Failed") => addToast(msg, "error", title),
    success: (msg, title = "Success") => addToast(msg, "success", title),
    info: (msg, title = "Notice") => addToast(msg, "info", title),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Floating Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm pointer-events-none select-none">
        {toasts.map((t) => {
          const isError = t.type === "error";
          const isSuccess = t.type === "success";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in ${
                isError
                  ? "bg-zinc-950/95 border-rose-500/30 text-rose-200 shadow-rose-950/20"
                  : isSuccess
                  ? "bg-zinc-950/95 border-emerald-500/30 text-emerald-200 shadow-emerald-950/20"
                  : "bg-zinc-950/95 border-zinc-700/50 text-zinc-200 shadow-black/40"
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isError ? (
                  <AlertCircle size={16} className="text-rose-400" />
                ) : isSuccess ? (
                  <CheckCircle2 size={16} className="text-emerald-400" />
                ) : (
                  <Info size={16} className="text-blue-400" />
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                {t.title && (
                  <span className="text-xs font-semibold text-zinc-100 tracking-tight">
                    {t.title}
                  </span>
                )}
                <span className="text-xs text-zinc-400 leading-snug break-words">
                  {t.message}
                </span>
              </div>

              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      error: (msg) => console.error("[Toast Error]", msg),
      success: (msg) => console.log("[Toast Success]", msg),
      info: (msg) => console.log("[Toast Info]", msg),
    };
  }
  return context;
}
