// Pourquoi : Toast MUI — la version Material des notifications éphémères.
// Même contrat : ToastProvider + useToast() + ToastOptions.
// Rend une pile d'Alert MUI (Snackbar un à un) avec aria-live.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import MuiAlert from "@mui/material/Alert";

export type ToastVariant = "default" | "success" | "destructive";

export interface ToastData {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
}

export interface ToastOptions {
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastContextValue {
  toast: (title: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast doit être utilisé dans <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, options?: ToastOptions) => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, title, description: options?.description, variant: options?.variant ?? "default" }]);
      const duration = options?.duration ?? 4000;
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        style={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8, width: 320 }}
      >
        {toasts.map((t) => (
          <MuiAlert
            key={t.id}
            severity={
              t.variant === "success" ? "success" : t.variant === "destructive" ? "error" : "info"
            }
            variant="filled"
            onClose={() => dismiss(t.id)}
            sx={{ width: "100%", boxShadow: 3 }}
          >
            <strong>{t.title}</strong>
            {t.description && <div style={{ fontSize: 12, opacity: 0.9 }}>{t.description}</div>}
          </MuiAlert>
        ))}
      </div>
    </ToastContext.Provider>
  );
}