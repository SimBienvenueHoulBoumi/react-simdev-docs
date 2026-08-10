// Pourquoi : une fiche du catalogue. Gabarit commun (spec §6.6) : la fiche elle-même
// fournit ses blocs via l'entrée du registry ; la route ajoute la coquille
// (badges famille/niveau, navigation Précédent/Suivant, sommaire via setToc).

import { useEffect } from "react";
import { Link, useOutletContext, useParams } from "react-router";
import { entryBySlug, entries, FAMILY_LABELS, LEVEL_LABELS } from "~/foundry/registry";
import { Badge } from "~/components/ui/badge";
import type { TocItem } from "~/components/layout/table-of-contents";
import type { FoundryOutletContext } from "./layout";

export function meta({ params }: { params: { slug?: string } }) {
  const entry = entryBySlug.get(params.slug ?? "");
  return [
    {
      title: entry
        ? `${entry.title} — react-foundry`
        : "Entrée inconnue — react-foundry",
    },
  ];
}

export default function FoundryEntryPage() {
  const { slug } = useParams();
  const { setToc } = useOutletContext<FoundryOutletContext>();
  const entry = entryBySlug.get(slug ?? "");

  // Sommaire VIVANT : la fiche expose ses h2/h3 (id="..." attendu) et, pour ce
  // qui n'est pas un titre, tout élément portant `data-toc` + `id` — par exemple
  // les onglets d'expériences du banc.
  //
  // Pourquoi un MutationObserver et non un scan unique : le banc est replié par
  // défaut ET chargé paresseusement, donc ses ancres n'existent pas au montage.
  // Avec l'ancien scan unique elles n'entraient JAMAIS dans le sommaire.
  useEffect(() => {
    if (!entry) return;
    const main = document.querySelector("main");
    if (!main) return;

    let frame = 0;
    let signature = "";

    const scan = () => {
      const nodes = Array.from(
        main.querySelectorAll<HTMLElement>("h2[id], h3[id], [data-toc][id]"),
      );
      const items: TocItem[] = nodes.map((el) => ({
        id: el.id,
        label: el.dataset.toc ?? el.textContent ?? "",
        level: el.dataset.toc ? 3 : el.tagName === "H2" ? 2 : 3,
      }));

      // Garde-fou obligatoire : setToc → re-rendu → mutation → setToc…
      // Sans cette comparaison, la boucle ne s'arrête jamais.
      const next = items.map((i) => `${i.level}|${i.id}|${i.label}`).join("\n");
      if (next === signature) return;
      signature = next;
      setToc(items);
    };

    scan();
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });
    observer.observe(main, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["id", "data-toc"],
    });

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      setToc([]);
    };
  }, [entry, setToc]);

  if (!entry) {
    return (
      <div className="flex flex-col items-start gap-3">
        <h1 className="text-2xl font-bold">Entrée inconnue</h1>
        <p className="text-muted-foreground">
          « {slug} » n'est pas (encore) dans le registry.
        </p>
        <Link
          to="/foundry"
          className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          ← Retour au catalogue
        </Link>
      </div>
    );
  }

  const index = entries.findIndex((e) => e.slug === entry.slug);
  const prev = entries[index - 1];
  const next = entries[index + 1];

  return (
    <article className="flex flex-col gap-8">
      {/* En-tête */}
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{FAMILY_LABELS[entry.family]}</Badge>
          <Badge variant="outline">niveau {LEVEL_LABELS[entry.level]}</Badge>
        </div>
        <h1 id="apercu" className="text-3xl font-bold tracking-tight">
          {entry.title}
        </h1>
        <p className="text-lg text-muted-foreground">{entry.summary}</p>
      </header>

      <entry.Doc />

      {/* Liens croisés notions utilisées */}
      {entry.uses.length > 0 && (
        <section aria-labelledby="uses-title" className="flex flex-col gap-2">
          <h2 id="uses-title" className="text-lg font-semibold">
            Utilise
          </h2>
          <ul className="flex flex-wrap gap-2">
            {entry.uses.map((slug) => {
              const used = entryBySlug.get(slug);
              if (!used) return null;
              return (
                <li key={slug}>
                  <Link
                    to={`/foundry/${slug}`}
                    className="rounded-full border border-border px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    {used.title} →
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Précédent / Suivant — ordre du registry */}
      <nav
        aria-label="Navigation entre fiches"
        className="flex items-center justify-between gap-3 border-t border-border pt-4"
      >
        {prev ? (
          <Link
            to={`/foundry/${prev.slug}`}
            className="group flex flex-col rounded-lg border border-border px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <span className="text-xs text-muted-foreground">← Précédent</span>
            <span className="text-sm font-medium">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            to={`/foundry/${next.slug}`}
            className="group flex flex-col items-end rounded-lg border border-border px-3 py-2 transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <span className="text-xs text-muted-foreground">Suivant →</span>
            <span className="text-sm font-medium">{next.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}