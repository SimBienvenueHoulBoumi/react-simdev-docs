// Pourquoi : recherche globale ⌘K / Ctrl+K (spec §6.8).
// Index construit depuis le registry : titre, résumé, intentions, props, erreurs.
// Client-only : rien ne se rend côté serveur avant interaction.

"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";
import { entries, FAMILY_LABELS } from "~/foundry/registry";
import { cn } from "~/lib/cn";

export interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ref?: Ref<HTMLDivElement>;
}

interface Hit {
  slug: string;
  title: string;
  family: string;
  summary: string;
  match: string;
}

function buildIndex(): Hit[] {
  return entries.flatMap((e) => {
    const fields: string[] = [
      e.title,
      e.summary,
      ...e.intents,
      ...(e.props ?? []),
      ...(e.errors ?? []),
    ];
    return fields.map((field) => ({
      slug: e.slug,
      title: e.title,
      family: FAMILY_LABELS[e.family],
      summary: e.summary,
      match: field,
    }));
  });
}

export function SearchModal({ open, onOpenChange, ref }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const index = useMemo(buildIndex, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return index
      .filter((h) => h.match.toLowerCase().includes(q) || h.title.toLowerCase().includes(q))
      .slice(0, 12);
  }, [query, index]);

  // Focus automatique + remise à zéro à l'ouverture
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Fermeture sur Échap
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  const goTo = (slug: string) => {
    onOpenChange(false);
    window.location.href = `/foundry/${slug}`;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      goTo(results[active].slug);
    }
  };

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label="Recherche dans le catalogue"
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24"
    >
      <button
        aria-label="Fermer la recherche"
        className="absolute inset-0 cursor-default bg-black/50"
        onClick={() => onOpenChange(false)}
        tabIndex={-1}
      />
      <div className="relative z-10 w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-3">
          <svg aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" viewBox="0 0 16 16" fill="none">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Rechercher un composant, une intention, une erreur…"
            aria-label="Recherche"
            className="h-11 w-full bg-transparent text-sm outline-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground"
          />
          <kbd className="shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            Échap
          </kbd>
        </div>
        <div ref={listRef} className="max-h-80 overflow-y-auto">
          {query.trim() === "" && (
            <p className="px-4 py-3 text-xs text-muted-foreground">
              Tapez une intention (« supprimer »), un nom de prop, ou collez un message d'erreur React.
            </p>
          )}
          {query.trim() !== "" && results.length === 0 && (
            <p className="px-4 py-3 text-sm text-muted-foreground">Aucun résultat pour « {query} ».</p>
          )}
          {results.map((r, i) => (
            <button
              key={`${r.slug}-${r.match}`}
              onClick={() => goTo(r.slug)}
              onMouseEnter={() => setActive(i)}
              className={cn(
                "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left",
                i === active && "bg-accent",
              )}
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium">{r.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {r.family} — {r.summary}
                </span>
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">{r.match}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}