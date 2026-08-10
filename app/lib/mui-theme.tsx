// Pourquoi : thème MUI branché sur le mode jour/nuit du catalogue.
// Sans ThemeProvider, MUI rend sa palette claire par défaut : en mode
// nuit les cartes restaient blanches et les textes noirs (bug signalé).
// La source de vérité est la classe .dark sur <html> (pilotée par le
// mini-script anti-flash et le ThemeToggle) — on la suit via
// useSyncExternalStore + MutationObserver, comme le style engine.

"use client";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useMemo, useSyncExternalStore, type ReactNode } from "react";

function isDarkMode(): boolean {
  if (typeof document === "undefined") return true; // SSR : <html class="dark"> par défaut
  return document.documentElement.classList.contains("dark");
}

function subscribeDark(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  // Synchronise les autres onglets lorsque le thème change de leur côté.
  window.addEventListener("storage", onChange);
  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onChange);
  };
}

/** Le SSR émet toujours .dark → la snapshot serveur correspond au rendu. */
const SERVER_DARK = true;

// Palettes alignées sur les tokens de app.css (valeurs hex, MUI ne sait pas
// composer des dérivés à partir d'oklch — on reste en gamut sûr).
const lightTheme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#4f46e5" },
    background: { default: "#ffffff", paper: "#ffffff" },
    text: { primary: "rgba(0, 0, 0, 0.87)", secondary: "rgba(0, 0, 0, 0.6)" },
    divider: "rgba(0, 0, 0, 0.1)",
    error: { main: "#dc2626" },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#818cf8" },
    background: { default: "#23232a", paper: "#2e2e38" },
    text: { primary: "#f2f2f5", secondary: "#a8a8b3" },
    divider: "rgba(255, 255, 255, 0.12)",
    error: { main: "#ef6b6b" },
  },
});

export function MuiThemeProvider({ children }: { children: ReactNode }) {
  const dark = useSyncExternalStore(subscribeDark, isDarkMode, () => SERVER_DARK);
  const theme = useMemo(() => (dark ? darkTheme : lightTheme), [dark]);
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}