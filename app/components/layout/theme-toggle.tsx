// Pourquoi : bascule clair/sombre ☾ — un seul état, persisté, appliqué avant paint.
// Composant shell du catalogue uniquement ; les fiches n'en ont pas besoin.

import { useEffect, useState } from "react";
import { cn } from "~/lib/cn";

export interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* stockage indisponible — le thème vit pendant la session */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Passer au thème clair" : "Passer au thème sombre"}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
        className,
      )}
    >
      {dark ? (
        <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
          <path
            d="M8 1v2M8 13v2M1 8h2M13 8h2M2.5 2.5l1.4 1.4M12.1 12.1l1.4 1.4M13.5 2.5l-1.4 1.4M3.9 12.1l-1.4 1.4"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
          <path
            d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}