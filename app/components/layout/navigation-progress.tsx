// Pourquoi : indicateur global de navigation. Sans lui, cliquer une fiche ne
// donne aucun signe de vie tant que la route suivante n'est pas prête — l'app
// paraît figée. Monté une fois dans root.tsx, il couvre toutes les pages.

"use client";

import { useEffect, useState } from "react";
import { useNavigation } from "react-router";
import { Spinner } from "~/components/ui/tw/spinner";

/** Seuil anti-clignotement. Une navigation instantanée ne doit pas faire
 *  apparaître puis disparaître un indicateur en 30 ms : ça se lit comme un
 *  défaut d'affichage, pas comme un chargement. Au-delà de ce délai l'attente
 *  devient perceptible, et l'indicateur devient utile. */
const SEUIL_MS = 150;

export function NavigationProgress() {
  const navigation = useNavigation();
  const enCours = navigation.state !== "idle";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enCours) {
      setVisible(false);
      return;
    }
    const t = setTimeout(() => setVisible(true), SEUIL_MS);
    return () => clearTimeout(t);
  }, [enCours]);

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60]">
      {/* Barre indéterminée : on ne connaît pas la progression réelle, on ne
          la simule donc pas avec un pourcentage inventé. */}
      <div className="h-0.5 w-full overflow-hidden bg-primary/20">
        <div className="nav-progress-bar h-full w-1/3 bg-primary" />
      </div>
      <div className="flex justify-end p-3">
        <span className="flex items-center gap-2 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs shadow-sm backdrop-blur">
          <Spinner size={14} label="Chargement de la page…" />
          {/* Le libellé du role=status porte déjà l'annonce : ce texte est
              décoratif pour les lecteurs d'écran. */}
          <span aria-hidden="true">Chargement…</span>
        </span>
      </div>
    </div>
  );
}
