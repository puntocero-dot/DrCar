"use client";

import { useState, useEffect, createContext, useContext, useCallback, useRef } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
    warning: (message: string) => void;
    info: (message: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op toast if provider is not mounted
    return {
      toast: {
        success: () => {},
        error: () => {},
        warning: () => {},
        info: () => {},
      },
    };
  }
  return context;
}

const ICONS: Record<ToastType, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS: Record<ToastType, string> = {
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  error: "bg-red-500/10 border-red-500/30 text-red-400",
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.type];
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const duration = toast.duration || 4000;
    const exitTimer = setTimeout(() => setIsExiting(true), duration - 300);
    const removeTimer = setTimeout(() => onDismiss(toast.id), duration);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(removeTimer);
    };
  }, [toast, onDismiss]);

  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 ${
        COLORS[toast.type]
      } ${isExiting ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1 text-white">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-zinc-500 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `toast-${++counterRef.current}`;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg: string) => addToast(msg, "success"),
    error: (msg: string) => addToast(msg, "error"),
    warning: (msg: string) => addToast(msg, "warning"),
    info: (msg: string) => addToast(msg, "info"),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
