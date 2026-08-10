// Pourquoi : une fiche du catalogue. Gabarit commun (spec §6.6) : la fiche elle-même
// fournit ses blocs via l'entrée du registry ; la route ajoute la coquille
// (badges famille/niveau, navigation Précédent/Suivant, sommaire via setToc).

import { useEffect } from "react";
import { Link, useOutletContext, useParams } from "react-router";
import { entryBySlug, entries, FAMILY_LABELS, LEVEL_LABELS } from "~/foundry/registry";
import { Badge } from "~/components/ui/badge";
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

  // Sommaire : la fiche expose ses h2/h3 tels quels (attendu : id="..." présent)
  useEffect(() => {
    if (!entry) return;
    const headers = Array.from(
      document.querySelectorAll("main h2[id], main h3[id]"),
    );
    const items = headers.map((h) => ({
      id: h.id,
      label: h.textContent ?? "",
      level: (h.tagName === "H2" ? 2 : 3) as 2 | 3,
    }));
    setToc(items);
    return () => setToc([]);
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