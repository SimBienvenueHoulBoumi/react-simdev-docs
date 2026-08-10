// Pourquoi : banc d'essai — éditeur JSX + données + rendu live + console.
// Implémentation : Sucrase transpile JSX/TS dans le navigateur, new Function exécute
// avec un scope explicite (React, hooks, cn, composants, data). Garde-fous :
// 1. Chargé À LA DEMANDE, client-only (jamais en SSR — spec §7).
// 2. Error boundary dédiée, réinitialisée à chaque exécution (clé de remontage).
//
// Expériences : une fiche peut fournir plusieurs codes commutables, chacun
// isolant UN mécanisme (design §3.2). L'expérience active vient du hash de
// l'URL quand il est présent — `#banc-le-cache` déplie le banc et sélectionne
// « Le cache », donc chaque expérience est adressable et partageable.

"use client";

import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import * as React from "react";
import { cn } from "~/lib/cn";
import type { BenchExperiment } from "./bench-panel";

export type { BenchExperiment };

export interface BenchProps {
  /** Code JSX initial de l'exemple */
  code: string;
  /** JSON initial alimentant le composant */
  data: string;
  /** Composants exposés au scope (ex. { Button }) */
  scope: Record<string, unknown>;
  /** Expériences commutables — la première est active par défaut */
  experiments?: BenchExperiment[];
}

// Toujours disponibles dans le sandbox, quel que soit la fiche
const baseScope: Record<string, unknown> = { React, cn };

// Chargement paresseux : Sucrase (~200 Ko) n'arrive qu'au clic sur l'onglet.
const BenchPanel = lazy(() => import("./bench-panel"));

/** `#banc-le-cache` → `le-cache`, si l'id correspond à une expérience connue. */
function experimentFromHash(experiments: BenchExperiment[] | undefined): string | null {
  if (!experiments || experiments.length === 0) return null;
  if (typeof window === "undefined") return null;
  const id = window.location.hash.replace(/^#banc-/, "");
  return experiments.some((x) => x.id === id) ? id : null;
}

export function Bench({ code, data, scope, experiments }: BenchProps) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(
    () => experiments?.[0]?.id ?? null,
  );
  const fullScope = useMemo(() => ({ ...baseScope, ...scope }), [scope]);

  // Le hash pilote le banc : il le déplie ET sélectionne l'expérience, au
  // montage comme à chaque navigation par ancre (clic dans le sommaire).
  const syncFromHash = useCallback(() => {
    const id = experimentFromHash(experiments);
    if (!id) return;
    setActiveId(id);
    setOpen(true);
  }, [experiments]);

  useEffect(() => {
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [syncFromHash]);

  const active = experiments?.find((x) => x.id === activeId) ?? experiments?.[0];

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm font-medium hover:bg-accent/50"
      >
        <span>
          Banc d'essai — essayez votre propre contrat de données
          {experiments && experiments.length > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {experiments.length} expériences
            </span>
          )}
        </span>
        <span aria-hidden="true" className="text-muted-foreground">
          {open ? "▾" : "▸"}
        </span>
      </button>
      {open && (
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
              Chargement du banc d'essai…
            </div>
          }
        >
          <BenchPanel
            // Changer d'expérience remonte le panneau : le code, les données,
            // la console et le tracé des hooks repartent propres.
            key={active?.id ?? "defaut"}
            code={active?.code ?? code}
            data={active?.data ?? data}
            thesis={active?.thesis}
            scope={fullScope}
            experiments={experiments}
            activeId={active?.id}
            onSelect={setActiveId}
          />
        </Suspense>
      )}
    </div>
  );
}
