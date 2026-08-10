// Pourquoi : moteur de style commutable — « tailwind » ou « mui ».
// C'est l'adaptateur de la banque : les composants décident de leur
// implémentation selon la valeur ici. Persisté dans localStorage.
//
// Note d'implémentation : l'état est lu via useSyncExternalStore, PAS
// useState(readInitial) — pendant l'hydration React utiliserait l'état du
// SSR et ignorerait la valeur stockée (bug « le choix ne persiste pas après
// rechargement »). useSyncExternalStore re-rend après hydration quand la
// snapshot client diffère de celle du serveur.
//
// Le choix vit dans un COOKIE, pas dans localStorage : le serveur doit pouvoir
// le lire pour rendre d'emblée la bonne implémentation. Avec localStorage il
// rendait toujours "tailwind", et la page se re-skinnait entièrement en MUI
// ~55 ms après la première peinture — mesuré, sur chaque page. root.tsx lit le
// cookie dans son loader et le passe en `initialEngine`.

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
/** Un an : le choix d'implémentation n'a pas de raison d'expirer plus tôt. */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
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

/** Lit le cookie dans une chaîne d'en-tête ou de document. Exporté pour que le
 *  loader racine s'en serve : une seule définition du format, côté serveur
 *  comme côté client. */
export function engineFromCookie(cookies: string | null | undefined): StyleEngine | null {
  const found = /(?:^|;\s*)foundry-engine=(tailwind|mui)/.exec(cookies ?? "");
  return (found?.[1] as StyleEngine | undefined) ?? null;
}

function readStored(): StyleEngine {
  if (typeof window === "undefined") return "tailwind";
  const fromCookie = engineFromCookie(document.cookie);
  if (fromCookie) return fromCookie;
  try {
    // Reliquat des versions localStorage : on l'honore, la migration vers le
    // cookie se fait dans le script anti-flash de root.tsx.
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

export function StyleEngineProvider({
  children,
  initialEngine = "tailwind",
}: {
  children: ReactNode;
  /** Valeur lue dans le cookie par le loader racine. C'est ce que rend le
   *  serveur : si elle correspond au client, il n'y a aucun re-rendu visible. */
  initialEngine?: StyleEngine;
}) {
  const engine = useSyncExternalStore(subscribe, readStored, () => initialEngine);

  const setEngine = useCallback((next: StyleEngine) => {
    // Le cookie fait foi (c'est lui que le serveur lit) ; localStorage reste
    // écrit pour les onglets ouverts sur une version antérieure.
    document.cookie = `${STORAGE_KEY}=${next};path=/;max-age=${COOKIE_MAX_AGE};samesite=lax`;
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* stockage indisponible — le cookie suffit */
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