// Pourquoi : boîte de dialogue accessible (piège de focus, Échap, aria-modal).
// Contenu et boutons : de la responsabilité de l'appelant.
// Ne gère PAS le fetch ni le routing — il affiche ce qu'on lui donne.

import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type Ref,
} from "react";
import { cn } from "~/lib/cn";

export interface DialogProps {
  open: boolean;
  /** Appelée à la fermeture (Échap, clic sur fond, bouton) */
  onClose: () => void;
  title: string;
  children?: ReactNode;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Dialog({ open, onClose, title, children, className, ref }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [wasOpen, setWasOpen] = useState(open);

  // Fermeture par Échap
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Focus initial + verrouillage du focus à l'intérieur du panneau
  useEffect(() => {
    if (!open) return;
    setWasOpen(true);
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE);
    (focusables[0] ?? panel).focus();

    const onFocus = (e: FocusEvent) => {
      if (!panel.contains(e.target as Node)) {
        (focusables[0] ?? panel).focus();
      }
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [open]);

  // Éviter le scroll de la page derrière le dialogue
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Ne rien rendre pendant la fermeture ; nettoyer l'état après ouverture
  useEffect(() => {
    if (!open && wasOpen) setWasOpen(false);
  }, [open, wasOpen]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      }}
    >
      {/* Fond cliquable pour fermer */}
      <button
        aria-label="Fermer le dialogue"
        className="absolute inset-0 cursor-default bg-black/50"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Tab" && e.preventDefault()}
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        className={cn(
          "relative z-10 w-full max-w-md rounded-lg border border-border bg-card p-6 text-card-foreground shadow-xl",
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}