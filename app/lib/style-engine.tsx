// Pourquoi : moteur de style commutable — « tailwind » ou « mui ».
// C'est l'adaptateur de la banque : les composants décident de leur
// implémentation selon la valeur ici. Persisté dans localStorage.
//
// Note d'implémentation : l'état est lu via useSyncExternalStore, PAS
// useState(readInitial) — pendant l'hydration React utiliserait l'état du
// SSR ("tailwind") et ignorerait la valeur stockée (bug « le choix ne
// persiste pas après rechargement »). useSyncExternalStore re-rend après
// hydration quand la snapshot client diffère de celle du serveur.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export type StyleEngine = "tailwind" | "mui";

const STORAGE_KEY = "foundry-engine";
/** Événement local : notifie les abonnés du même onglet après setItem
 *  (l'événement "storage" ne se déclenche pas dans la fenêtre qui écrit). */
const CHANGE_EVENT = "foundry-engine-change";

interface StyleEngineContextValue {
  engine: StyleEngine;
  setEngine: (engine: StyleEngine) => void;
  toggle: () => void;
}

const StyleEngineContext = createContext<StyleEngineContextValue | null>(null);

export { StyleEngineContext };

function readStored(): StyleEngine {
  if (typeof window === "undefined") return "tailwind";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "mui" || stored === "tailwind") return stored;
  } catch {
    /* stockage indisponible */
  }
  return "tailwind";
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

/** Le SSR rend toujours "tailwind" ; le client lira la vraie valeur et
 *  useSyncExternalStore re-rendra si elle diffère (géré par React). */
const SERVER_SNAPSHOT: StyleEngine = "tailwind";

export function StyleEngineProvider({ children }: { children: ReactNode }) {
  const engine = useSyncExternalStore(subscribe, readStored, () => SERVER_SNAPSHOT);

  const setEngine = useCallback((next: StyleEngine) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* stockage indisponible — la session garde la valeur */
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const toggle = useCallback(() => {
    // la valeur courante est celle de la snapshot (engine du scope)
    setEngine(engine === "mui" ? "tailwind" : "mui");
  }, [engine, setEngine]);

  const value = { engine, setEngine, toggle };

  return <StyleEngineContext.Provider value={value}>{children}</StyleEngineContext.Provider>;
}

export function useStyleEngine(): StyleEngineContextValue {
  const ctx = useContext(StyleEngineContext);
  if (!ctx) throw new Error("useStyleEngine doit être utilisé dans <StyleEngineProvider>");
  return ctx;
}

// Utilitaire pour les composants qui ont deux implémentations :
// <EngineSwitch tailwind={<TW/>} mui={<MUI/>} /> rend la bonne.
export function EngineSwitch({
  tailwind,
  mui,
  fallback = null,
}: {
  tailwind: ReactNode;
  mui: ReactNode;
  fallback?: ReactNode;
}) {
  const { engine } = useStyleEngine();
  if (engine === "mui") return mui;
  if (engine === "tailwind") return tailwind;
  return fallback;
}