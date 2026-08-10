// Pourquoi : notification éphémère pilotée par un contexte.
// useToast() renvoie { toast } ; Toaster() rend la pile.
// Accessible : aria-live="polite" pour lecteurs d'écran.

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "~/lib/cn";

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
  /** Durée d'affichage en ms (défaut 4000) */
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
      const variant = options?.variant ?? "default";
      setToasts((prev) => [...prev, { id, title, description: options?.description, variant }]);
      const duration = options?.duration ?? 4000;
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastOverlay toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastOverlay({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "pointer-events-auto flex items-start justify-between gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-lg",
            t.variant === "success" && "border-emerald-500/50",
            t.variant === "destructive" && "border-destructive/50",
          )}
        >
          <div>
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => onDismiss(t.id)}
            aria-label="Fermer la notification"
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <svg aria-hidden="true" className="size-3.5" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}