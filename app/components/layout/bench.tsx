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
import { Spinner } from "~/components/ui/tw/spinner";
import { Skeleton } from "~/components/ui/tw/skeleton";
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

/**
 * Squelette du banc : garde la FORME du panneau pendant le chargement du chunk.
 *
 * Le fallback précédent était un spinner de 20 px dans une boîte `p-6` : le
 * dépliant se réduisait à une bande de ~68 px puis bondissait d'un coup à sa
 * taille réelle. Le spinner s'affichait bien (~300 ms, mesuré), mais il passait
 * pour un flash au lieu de tenir la place du rendu. Ici la scène garde sa
 * hauteur par défaut et le spinner attend exactement là où le rendu apparaîtra.
 */
function BenchLoading() {
  return (
    <div className="flex flex-col" aria-busy="true">
      {/* barre d'outils */}
      <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-3 py-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="ml-auto h-6 w-32" />
      </div>

      {/* atelier : code | données */}
      <div className="grid border-t border-border md:grid-cols-2">
        <div className="flex flex-col gap-2 border-b border-border p-3 md:border-b-0 md:border-r">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="p-3">
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>

      {/* la scène — le spinner attend à la place du rendu */}
      <div className="flex min-h-[18rem] items-center justify-center border-t border-border text-muted-foreground">
        {/* Une seule annonce : le label du role=status porte le message */}
        <Spinner size={24} label="Chargement du banc d'essai…" />
      </div>
    </div>
  );
}

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
        <Suspense fallback={<BenchLoading />}>
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
