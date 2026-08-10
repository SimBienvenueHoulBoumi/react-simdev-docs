// Pourquoi : moteur de style commutable — « tailwind » ou « mui ».
// C'est l'adaptateur de la banque : les composants décident de leur
// implémentation selon la valeur ici. Persisté dans localStorage.

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type StyleEngine = "tailwind" | "mui";

const STORAGE_KEY = "foundry-engine";

interface StyleEngineContextValue {
  engine: StyleEngine;
  setEngine: (engine: StyleEngine) => void;
  toggle: () => void;
}

const StyleEngineContext = createContext<StyleEngineContextValue | null>(null);

export { StyleEngineContext };

function readInitial(): StyleEngine {
  if (typeof window === "undefined") return "tailwind";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "mui" || stored === "tailwind") return stored;
  } catch {
    /* stockage indisponible */
  }
  return "tailwind";
}

export function StyleEngineProvider({ children }: { children: ReactNode }) {
  const [engine, setEngineState] = useState<StyleEngine>(readInitial);

  // Synchronise après montage (si une autre fenêtre a changé la valeur)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === "mui" || e.newValue === "tailwind")) {
        setEngineState(e.newValue);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setEngine = useCallback((next: StyleEngine) => {
    setEngineState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* stockage indisponible — la session garde la valeur */
    }
  }, []);

  const toggle = useCallback(() => {
    setEngineState((prev) => {
      const next = prev === "tailwind" ? "mui" : "tailwind";
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignoré */
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ engine, setEngine, toggle }), [engine, setEngine, toggle]);

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