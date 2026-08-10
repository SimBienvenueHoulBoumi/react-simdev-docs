// Pourquoi : navigation gauche du catalogue — groupée par famille, entrée active
// surlignée au survol. Les sections ne sont pas repliables en v1 (peu d'entrées).

import { useMemo, useState, type Ref } from "react";
import {
  entries,
  entryBySlug,
  FAMILY_LABELS,
  FAMILY_ORDER,
  LEVEL_LABELS,
  type Family,
} from "~/foundry/registry";
import { cn } from "~/lib/cn";

export interface FoundryNavProps {
  activeSlug: string;
  ref?: Ref<HTMLElement>;
}

export function FoundryNav({ activeSlug, ref }: FoundryNavProps) {
  const [collapsed, setCollapsed] = useState<Set<Family>>(new Set());

  const groups = useMemo(
    () =>
      FAMILY_ORDER.filter((f) => entries.some((e) => e.family === f)).map((family) => ({
        family,
        items: entries.filter((e) => e.family === family),
      })),
    [],
  );

  const toggle = (family: Family) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(family)) next.delete(family);
      else next.add(family);
      return next;
    });
  };

  return (
    <nav ref={ref} aria-label="Navigation du catalogue" className="flex flex-col gap-4">
      {groups.map(({ family, items }) => (
        <div key={family}>
          <button
            onClick={() => toggle(family)}
            aria-expanded={!collapsed.has(family)}
            className="flex w-full items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
          >
            <span>{FAMILY_LABELS[family]}</span>
            <span aria-hidden="true" className="text-[10px]">
              {collapsed.has(family) ? "▸" : "▾"}
            </span>
          </button>
          {!collapsed.has(family) && (
            <ul className="mt-1 flex flex-col gap-0.5">
              {items.map((e) => (
                <li key={e.slug}>
                  <a
                    href={`/foundry/${e.slug}`}
                    aria-current={e.slug === activeSlug ? "page" : undefined}
                    className={cn(
                      "flex items-baseline justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors",
                      e.slug === activeSlug
                        ? "bg-accent font-medium text-foreground"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}
                  >
                    <span>{e.title}</span>
                    <span className="text-[10px] text-muted-foreground/70">
                      {LEVEL_LABELS[e.level]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </nav>
  );
}