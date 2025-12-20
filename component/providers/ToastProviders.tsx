/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
 
// ============================================
// Toast Context & Provider
// ============================================
type ToastContextType = {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Array<{ id: number; message: string; type: 'success' | 'error' | 'warning' | 'info'; duration: number }>>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type, duration };
    
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id : number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = {
    success: (message : string, duration = 3000) => addToast(message, 'success', duration),
    error: (message: string, duration = 3000) => addToast(message, 'error', duration),
    warning: (message: string, duration = 3000) => addToast(message, 'warning', duration),
    info: (message: string, duration = 3000) => addToast(message, 'info', duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

// ============================================
// Toast Container with AnimatePresence
// ============================================
function ToastContainer({ toasts, removeToast }: { toasts: any[]; removeToast: (id: number) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function Toast({ toast, onClose }: { toast: { id: number; message: string; type: 'success' | 'error' | 'warning' | 'info'; duration: number }; onClose: () => void }) {
  const { type, message, duration } = toast;

  const config = {
    success: {
      icon: CheckCircle,
      bgClass: 'bg-emerald-50 border-emerald-200',
      iconClass: 'text-emerald-600',
      textClass: 'text-emerald-900',
      progressClass: 'bg-emerald-500',
    },
    error: {
      icon: XCircle,
      bgClass: 'bg-red-50 border-red-200',
      iconClass: 'text-red-600',
      textClass: 'text-red-900',
      progressClass: 'bg-red-500',
    },
    warning: {
      icon: AlertCircle,
      bgClass: 'bg-amber-50 border-amber-200',
      iconClass: 'text-amber-600',
      textClass: 'text-amber-900',
      progressClass: 'bg-amber-500',
    },
    info: {
      icon: Info,
      bgClass: 'bg-blue-50 border-blue-200',
      iconClass: 'text-blue-600',
      textClass: 'text-blue-900',
      progressClass: 'bg-blue-500',
    },
  };

  const { icon: Icon, bgClass, iconClass, textClass, progressClass } = config[type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`
        ${bgClass} border rounded-xl p-4 pr-12 shadow-lg
        min-w-[320px] max-w-md pointer-events-auto
        relative overflow-hidden
      `}
    >
      {/* Progress Bar with Framer Motion */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
        <motion.div
          initial={{ width: "100%" }}
          animate={{ width: "0%" }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className={`h-full ${progressClass}`}
        />
      </div>

      {/* Content */}
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.1 }}
          className={`${iconClass} mt-0.5 shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </motion.div>
        
        <p className={`${textClass} text-sm font-medium flex-1`}>
          {message}
        </p>
        
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="shrink-0 text-gray-400 hover:text-gray-600 transition"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}