// Pourquoi : layout du catalogue — 3 colonnes (spec §6.1) :
// 17rem nav sticky / contenu max ~48rem / 14rem ancres sticky.
// Responsive : ≥1280 trois colonnes, 960-1280 sans ancres, <960 tiroir.
// Le sommaire de droite est alimenté par la fiche via `setToc` (client-only).

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation } from "react-router";
import { FoundryNav } from "~/components/layout/foundry-nav";
import { SearchModal } from "~/components/layout/search-modal";
import { EngineToggle } from "~/components/layout/engine-toggle";
import { TableOfContents, type TocItem } from "~/components/layout/table-of-contents";
import { ThemeToggle } from "~/components/layout/theme-toggle";

export interface FoundryOutletContext {
  setToc: (items: TocItem[]) => void;
}

// Raccourci global ⌘K — exposé pour la barre haute
export function useCmdK() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return { open, setOpen };
}

export default function FoundryLayout() {
  const { open, setOpen } = useCmdK();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toc, setToc] = useState<TocItem[]>([]);
  const location = useLocation();

  // Fermer tiroir + vider TOC à chaque navigation (évite les résidus)
  useEffect(() => {
    setDrawerOpen(false);
    setToc([]);
  }, [location.pathname]);

  const activeSlug = location.pathname.split("/")[2] ?? "";

  const context = useMemo<FoundryOutletContext>(() => ({ setToc }), []);

  return (
    <div className="min-h-dvh">
      {/* Barre haute */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-[90rem] items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir la navigation"
              className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-accent lg:hidden"
            >
              <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
                <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <Link to="/foundry" className="font-mono text-sm font-semibold tracking-tight">
              react-foundry
            </Link>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              — la banque de composants
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="flex h-8 items-center gap-2 rounded-md border border-border bg-background px-2.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <svg aria-hidden="true" className="size-3.5" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <span className="hidden sm:inline">Rechercher</span>
              <kbd className="hidden rounded border border-border bg-muted px-1 text-[10px] sm:inline">⌘K</kbd>
            </button>
            <EngineToggle className="hidden sm:flex" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Grille : 1 → 2 colonnes (960) → 3 colonnes (1280) */}
      <div className="mx-auto grid max-w-[90rem] gap-x-10 px-4 lg:grid-cols-[17rem_minmax(0,1fr)] xl:grid-cols-[17rem_minmax(0,1fr)_14rem]">
        <aside className="sticky top-16 hidden max-h-[calc(100dvh-5rem)] self-start overflow-y-auto pb-8 lg:block">
          <FoundryNav activeSlug={activeSlug} />
        </aside>

        <main className="min-w-0 py-8">
          <div className="mx-auto w-full max-w-[48rem]">
            <Outlet context={context} />
          </div>
        </main>

        {/* Sommaire — alimenté par la fiche via setToc (client, après montage) */}
        <aside className="sticky top-16 hidden max-h-[calc(100dvh-5rem)] self-start overflow-y-auto pb-8 xl:block">
          {toc.length > 0 && <TableOfContents items={toc} />}
        </aside>
      </div>

      {/* Tiroir mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Fermer la navigation"
            className="absolute inset-0 bg-black/50"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto border-r border-border bg-background p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-mono text-sm font-semibold">react-foundry</span>
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Fermer"
                className="rounded-md p-1 text-muted-foreground hover:bg-accent"
              >
                <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            {/* Bascule du moteur accessible sur mobile — sinon un choix
                persisté (ex. MUI) devenait impossible à annuler (§9.1). */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <EngineToggle />
              <ThemeToggle />
            </div>
            <FoundryNav activeSlug={activeSlug} />
          </div>
        </div>
      )}

      <SearchModal open={open} onOpenChange={setOpen} />
    </div>
  );
}