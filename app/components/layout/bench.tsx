// Pourquoi : banc d'essai — éditeur JSX + données + rendu live + console.
// Implémentation : Sucrase transpile JSX/TS dans le navigateur, new Function exécute
// avec un scope explicite (React, hooks, cn, composants, data). Garde-fous :
// 1. Chargé À LA DEMANDE, client-only (jamais en SSR — spec §7).
// 2. Error boundary dédiée, réinitialisée à chaque exécution (clé de remontage).

"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import * as React from "react";
import { cn } from "~/lib/cn";

export interface BenchProps {
  /** Code JSX initial de l'exemple */
  code: string;
  /** JSON initial alimentant le composant */
  data: string;
  /** Composants exposés au scope (ex. { Button }) */
  scope: Record<string, unknown>;
}

// Toujours disponibles dans le sandbox, quel que soit la fiche
const baseScope: Record<string, unknown> = { React, cn };

// Chargement paresseux : Sucrase (~200 Ko) n'arrive qu'au clic sur l'onglet.
const BenchPanel = lazy(() => import("./bench-panel"));

export function Bench({ code, data, scope }: BenchProps) {
  const [open, setOpen] = useState(false);
  const fullScope = useMemo(() => ({ ...baseScope, ...scope }), [scope]);

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium hover:bg-accent/50"
      >
        <span>Banc d'essai — essayez votre propre contrat de données</span>
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
          <BenchPanel code={code} data={data} scope={fullScope} />
        </Suspense>
      )}
    </div>
  );
}

export type { BenchProps as BenchPanelProps };

// Réexport de hooks pour les fiches qui veulent un scope local (ex. useState/useState)
export { useEffect as _keepEffectsAlive };