// Pourquoi : page d'accueil du catalogue — l'index par intention (spec §6.4).
// On ne cherche pas « Dialog » mais « demander confirmation avant de supprimer ».

import { entries, FAMILY_LABELS, FAMILY_ORDER } from "~/foundry/registry";
import { cn } from "~/lib/cn";

export function meta() {
  return [
    { title: "react-foundry — la banque de composants React" },
    { name: "description", content: "Copiez, adaptez, compilez. Des composants React purs branchés sur vos données." },
  ];
}

export default function FoundryIndex() {
  const families = FAMILY_ORDER.filter((f) => entries.some((e) => e.family === f));

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold tracking-tight">
          react-foundry
        </h1>
        <p className="text-muted-foreground">
          Une banque de composants React : comprenez le concept, copiez le code, adaptez-le à
          vos données. Rien à installer — le copier-coller est le modèle de distribution.
        </p>
        <div className="flex flex-wrap gap-2">
          <kbd className="rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
            ⌘K pour chercher
          </kbd>
          <kbd className="rounded border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
            React 19 · Tailwind 4 · aucun routing imposé
          </kbd>
        </div>
      </header>

      {/* Index par intention */}
      <section aria-labelledby="intents-title">
        <h2 id="intents-title" className="mb-3 text-lg font-semibold">
          Je veux…
        </h2>
        <ul className="flex flex-col gap-2">
          {entries.flatMap((e) =>
            e.intents.map((intent) => (
              <li key={`${e.slug}-${intent}`}>
                <a
                  href={`/foundry/${e.slug}`}
                  className="group flex items-baseline justify-between gap-3 rounded-lg border border-border bg-card px-4 py-2.5 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <span>
                    <span className="mr-1.5 text-primary">Je veux…</span>
                    <span className="font-medium">{intent}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                    {e.title} →
                  </span>
                </a>
              </li>
            )),
          )}
        </ul>
      </section>

      {/* Navigation alphabétique par famille */}
      <section aria-labelledby="index-title">
        <h2 id="index-title" className="mb-3 text-lg font-semibold">
          Le catalogue, par famille
        </h2>
        <div className="flex flex-col gap-6">
          {families.map((f) => (
            <div key={f}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {FAMILY_LABELS[f]}
              </h3>
              <ul className="grid gap-1 sm:grid-cols-2">
                {entries
                  .filter((e) => e.family === f)
                  .map((e) => (
                    <li key={e.slug}>
                      <a
                        href={`/foundry/${e.slug}`}
                        className={cn(
                          "flex items-baseline justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent/60",
                        )}
                      >
                        <span className="font-medium">{e.title}</span>
                        <span className="truncate text-xs text-muted-foreground">{e.summary}</span>
                      </a>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}