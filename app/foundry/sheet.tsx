// Pourquoi : gabarit de fiche — les blocs communs du catalogue (spec §6.6).
// Chaque fiche compose ces blocs dans le même ordre : concept, aperçu, code,
// contrat, quand l'utiliser, axes d'adaptation, banc d'essai, pièges, prérequis, a11y.

import { type ReactNode, useState } from "react";
import { Bench, type BenchExperiment } from "~/components/layout/bench";
import { CodeBlock } from "~/components/layout/code-block";
import { useStyleEngine } from "~/lib/style-engine";

/* ——— Variante de code : une implémentation (Tailwind ou MUI) ——— */

export interface CodeVariant {
  source: string;
  filename: string;
  depsCode?: string[];
  depsNames?: string[];
}

/** Bloc Code : une ou deux variantes. Si `tw` et `mui` sont fournis,
 *  des onglets suivent le style engine courant (par défaut) et
 *  permettent de forcer l'autre sans changer le moteur global. */
export function Code({
  tw,
  mui,
  source,
  filename,
  depsCode = [],
  depsNames = [],
  children,
}: {
  /** Variante Tailwind (avec onglets si `mui` aussi fourni) */
  tw?: CodeVariant;
  /** Variante MUI */
  mui?: CodeVariant;
  /** Variante unique (notions, recettes, patterns) */
  source?: string;
  filename?: string;
  depsCode?: string[];
  depsNames?: string[];
  children?: ReactNode;
}) {
  const { engine } = useStyleEngine();
  const dual = Boolean(tw && mui);

  // null = suit le moteur global ; sinon choix explicite de l'utilisateur
  const [forced, setForced] = useState<"tailwind" | "mui" | null>(null);

  // Resynchronise le défaut quand le moteur global change. L'ajustement se
  // fait PENDANT le rendu, pas dans un useEffect : avec un effet, le premier
  // rendu après le basculement affichait encore l'ancienne variante et seul
  // le rendu suivant corrigeait — un décalage d'une frame bien visible.
  // React relance le rendu immédiatement, avant le commit (patron officiel
  // « ajuster l'état quand une prop change »).
  const [lastEngine, setLastEngine] = useState(engine);
  if (engine !== lastEngine) {
    setLastEngine(engine);
    setForced(null);
  }

  const active: "tailwind" | "mui" = forced ?? engine;
  const variant: CodeVariant | undefined = dual ? (active === "mui" ? mui : tw) : undefined;

  return (
    <SheetSection id="code" title="Code">
      {children}
      {dual ? (
        <CodeBlockTabs
          tw={tw!}
          mui={mui!}
          active={active}
          onSelect={setForced}
        />
      ) : (
        <CodeBlock
          code={source ?? ""}
          filename={filename ?? ""}
          depsCode={depsCode}
          depsNames={depsNames}
        />
      )}
    </SheetSection>
  );
}

function CodeBlockTabs({
  tw,
  mui,
  active,
  onSelect,
}: {
  tw: CodeVariant;
  mui: CodeVariant;
  active: "tailwind" | "mui";
  onSelect: (e: "tailwind" | "mui") => void;
}) {
  const tabs = [
    { key: "tailwind" as const, label: "Tailwind", variant: tw },
    { key: "mui" as const, label: "MUI", variant: mui },
  ];
  return (
    <div className="flex flex-col gap-2">
      <div role="tablist" aria-label="Implémentation" className="flex w-fit gap-1 rounded-lg border border-border bg-muted/40 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => onSelect(t.key)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              active === t.key
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <CodeBlock
        code={active === "mui" ? mui.source : tw.source}
        filename={active === "mui" ? mui.filename : tw.filename}
        depsCode={active === "mui" ? mui.depsCode ?? [] : tw.depsCode ?? []}
        depsNames={active === "mui" ? mui.depsNames ?? [] : tw.depsNames ?? []}
      />
    </div>
  );
}

/* ——— En-têtes de section (alimentent le sommaire) ——— */

export function SheetSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3">
      <h2 id={id} className="border-b border-border pb-2 text-xl font-semibold">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SheetSubSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h3 id={id} className="text-base font-semibold">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function Concept({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SheetSection id="concept" title="Le concept en trois lignes">
      {children}
    </SheetSection>
  );
}

export function Preview({ id = "apercu", children }: { id?: string; children: ReactNode }) {
  return (
    <SheetSection id={id} title="Aperçu">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-4">
        {children}
      </div>
    </SheetSection>
  );
}

/* ——— Contrat de props ——— */

export function PropsTable({ rows }: { rows: { name: string; type: string; default?: string; description: string }[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="px-3 py-2 font-medium">Prop</th>
            <th scope="col" className="px-3 py-2 font-medium">Type</th>
            <th scope="col" className="px-3 py-2 font-medium">Défaut</th>
            <th scope="col" className="px-3 py-2 font-medium">Rôle</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-b border-border last:border-0">
              <td className="px-3 py-2 font-mono text-[13px] text-primary">{row.name}</td>
              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{row.type}</td>
              <td className="px-3 py-2 font-mono text-xs">{row.default ?? "—"}</td>
              <td className="px-3 py-2 text-[13px] text-muted-foreground">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ——— Contrat de données : deux formes radicalement différentes ——— */

export function DataContract({
  first, second,
}: {
  first: { name: string; shape: string; usage: string };
  second: { name: string; shape: string; usage: string };
}) {
  return (
    <SheetSection id="contrat-donnees" title="Contrat de données">
      <p className="text-sm text-muted-foreground">
        Ce composant ne connaît pas vos données : il reçoit des accesseurs. Deux
        formes radicalement différentes prouvent l'adaptabilité.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {[first, second].map((d) => (
          <div key={d.name} className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {d.name}
            </p>
            <pre className="code-scroll overflow-x-auto pb-2 font-mono text-[11px] leading-relaxed">
              {d.shape}
            </pre>
            <p className="text-xs text-muted-foreground">{d.usage}</p>
          </div>
        ))}
      </div>
    </SheetSection>
  );
}

/* ——— Quand l'utiliser ——— */

export function WhenToUse({ yes, no }: { yes: ReactNode; no: ReactNode }) {
  return (
    <SheetSection id="quand-utiliser" title="Quand l'utiliser / quand surtout pas">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Oui
          </p>
          <ul className="flex flex-col gap-1.5 text-sm">{yes}</ul>
        </div>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-destructive">
            Non
          </p>
          <ul className="flex flex-col gap-1.5 text-sm">{no}</ul>
        </div>
      </div>
    </SheetSection>
  );
}

/* ——— Axes d'adaptation ——— */

export function AdaptationAxes({ axes }: { axes: { title: string; description: ReactNode }[] }) {
  return (
    <SheetSection id="adaptation" title="Axes d'adaptation">
      <ol className="flex flex-col gap-2">
        {axes.map((a, i) => (
          <li key={a.title} className="flex gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-accent font-mono text-xs">
              {i + 1}
            </span>
            <span>
              <strong className="font-medium">{a.title}</strong>
              <span className="text-muted-foreground"> — {a.description}</span>
            </span>
          </li>
        ))}
      </ol>
    </SheetSection>
  );
}

/* ——— Banc d'essai ——— */

export function BenchSection({
  code,
  data,
  scope,
  experiments,
}: {
  code: string;
  data: string;
  scope: Record<string, unknown>;
  /** Expériences commutables : chacune isole UN mécanisme (design §3.2).
   *  Une seule ancre `#banc-essai` → le sommaire reste intact ; chaque
   *  expérience ajoute sa propre sous-ancre `#banc-<id>`. */
  experiments?: BenchExperiment[];
}) {
  return (
    <SheetSection id="banc-essai" title="Banc d'essai">
      <Bench code={code} data={data} scope={scope} experiments={experiments} />
    </SheetSection>
  );
}

/* ——— Pièges ——— */

export function Pitfalls({ items }: { items: { symptom: string; cause: string }[] }) {
  return (
    <SheetSection id="pieges" title="Pièges">
      <ul className="flex flex-col gap-2">
        {items.map((p) => (
          <li key={p.symptom} className="rounded-lg border border-border bg-muted/20 p-3 text-sm">
            <p>
              <strong className="font-medium text-destructive">Symptôme : </strong>
              {p.symptom}
            </p>
            <p className="mt-1 text-muted-foreground">{p.cause}</p>
          </li>
        ))}
      </ul>
    </SheetSection>
  );
}

/* ——— Prérequis & accessibilité ——— */

export function Facts({ facts }: { facts: { label: string; value: string }[] }) {
  return (
    <SheetSection id="prerequis" title="Prérequis & accessibilité">
      <dl className="grid gap-2 sm:grid-cols-2">
        {facts.map((f) => (
          <div key={f.label} className="rounded-lg border border-border bg-muted/20 p-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {f.label}
            </dt>
            <dd className="mt-1 text-sm">{f.value}</dd>
          </div>
        ))}
      </dl>
    </SheetSection>
  );
}