// Pourquoi : sommaire de droite — ancres h2/h3 de la fiche,
// ancre active révélée au défilement via IntersectionObserver (spec §6.1).
// Client-only de fait (hooks DOM) ; rendu vide côté serveur.

import { useEffect, useState, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface TocItem {
  id: string;
  label: string;
  level: 2 | 3;
}

export interface TableOfContentsProps {
  items: TocItem[];
  ref?: Ref<HTMLElement>;
}

export function TableOfContents({ items, ref }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (items.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        // On garde la section la plus haute visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav ref={ref} aria-label="Sommaire de la page" className="flex flex-col gap-0.5">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            "rounded px-2 py-1 text-[13px] leading-snug transition-colors",
            item.level === 3 && "pl-4 text-xs",
            activeId === item.id
              ? "bg-accent font-medium text-foreground"
              : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          )}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}