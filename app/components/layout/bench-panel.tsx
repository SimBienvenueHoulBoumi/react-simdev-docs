// Pourquoi : panneau interne du banc d'essai (chargé à la demande, client-only).
// Mise en page B — grammaire CodePen : on écrit en haut, on voit en bas.
//
//   ┌──────────────────────────────────────────────┐
//   │ [expériences]            ● état  ▶ ⌘↵  ↺  ⤢ │  barre d'outils
//   ├───────────────────────┬──────────────────────┤
//   │ Code (+ gouttière)    │ Données (JSON)       │
//   ├───────────────────────┴──────────────────────┤
//   │ ▬▬▬ poignée ▬▬▬                              │
//   │            SCÈNE — pleine largeur            │
//   ├──────────────────────────────────────────────┤
//   │ [Hooks n][Console n]  chronologie dépliée    │
//   └──────────────────────────────────────────────┘
//
// Le contrat d'exécution (expression vs programme, injection de `data`,
// ToastProvider, error boundary remontée à chaque run) est INCHANGÉ — il est
// verrouillé par tests/bench-contract.test.ts (spec §7).

"use client";

import {
  Component,
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import { transform } from "sucrase";
import { cn } from "~/lib/cn";
import {
  EMPTY_NAMING,
  extractHookNames,
  type HookNaming,
} from "./bench-hook-names";

/** Une expérience du banc : un mécanisme isolé, sa thèse, son code. */
export interface BenchExperiment {
  /** Identifiant d'ancre — l'URL `#banc-<id>` sélectionne cette expérience */
  id: string;
  label: string;
  /** La phrase que l'expérience démontre, affichée au-dessus du code */
  thesis: string;
  code: string;
  data?: string;
}

export interface BenchPanelProps {
  code: string;
  data: string;
  scope: Record<string, unknown>;
  experiments?: BenchExperiment[];
  activeId?: string;
  onSelect?: (id: string) => void;
  thesis?: string;
}

interface LogEntry {
  type: "log" | "warn" | "error";
  args: unknown[];
}

/** Trois états honnêtes : le rendu correspond-il au code affiché ? */
type RunStatus = "vierge" | "modifie" | "erreur" | "ajour";

const STAGE_KEY = "foundry-bench-stage";
const STAGE_MIN = 160;
const STAGE_DEFAULT = 288;

export default function BenchPanel({
  code,
  data,
  scope,
  experiments,
  activeId,
  onSelect,
  thesis,
}: BenchPanelProps) {
  const [codeValue, setCodeValue] = useState(code);
  const [dataValue, setDataValue] = useState(data);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [execution, setExecution] = useState<{ key: number } | null>(null);
  /** Instantané du code au moment du dernier run — sert à détecter « modifié ». */
  const [ranWith, setRanWith] = useState<{ code: string; data: string } | null>(null);
  const [tab, setTab] = useState<"hooks" | "console">("hooks");

  const codeRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  // Traqueur des hooks use*** — vit pendant toute la session du banc et
  // se vide à chaque exécution (comme la console et la boundary).
  const trackerRef = useRef<Tracker | null>(null);
  if (!trackerRef.current) trackerRef.current = new Tracker();
  const tracker = trackerRef.current;

  const run = useCallback(() => {
    setLogs([]);
    tracker.reset();
    tracker.setNaming(extractHookNames(codeValue));
    setRanWith({ code: codeValue, data: dataValue });
    // Nouvelle clé → le RenderedView est remonté → erreurs de la run précédente purgées
    setExecution({ key: Date.now() });
  }, [tracker, codeValue, dataValue]);

  // Exécuter au clic, ⌘↵ ou Ctrl+↵
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") run();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [run]);

  const reset = () => {
    setCodeValue(code);
    setDataValue(data);
    setLogs([]);
    tracker.reset();
    setRanWith(null);
    setExecution(null);
  };

  const errorCount = logs.filter((l) => l.type === "error").length;

  // Une erreur doit se voir : rester sur un tracé de hooks muet pendant que la
  // console porte le message exact est le pire des deux mondes.
  useEffect(() => {
    if (errorCount > 0) setTab("console");
  }, [errorCount]);

  const status: RunStatus = !execution
    ? "vierge"
    : ranWith && (ranWith.code !== codeValue || ranWith.data !== dataValue)
      ? "modifie"
      : errorCount > 0
        ? "erreur"
        : "ajour";

  const dataState = useMemo(() => checkJson(dataValue), [dataValue]);

  return (
    <div ref={rootRef} className="flex flex-col bg-background">
      <Toolbar
        experiments={experiments}
        activeId={activeId}
        onSelect={onSelect}
        status={status}
        onRun={run}
        onReset={reset}
        rootRef={rootRef}
      />

      {thesis && (
        <p className="border-t border-border bg-primary/5 px-3 py-2 text-sm text-foreground">
          {thesis}
        </p>
      )}

      {/* ——— Atelier : code | données ——— */}
      <div className="grid border-t border-border md:grid-cols-2">
        <div className="flex flex-col border-b border-border md:border-b-0 md:border-r">
          <PaneHeader label="Code (JSX)">
            <span className="text-[10px] text-muted-foreground">JSX + TS supporté</span>
          </PaneHeader>
          <div className="relative flex h-48">
            <div
              ref={gutterRef}
              aria-hidden="true"
              className="select-none overflow-hidden bg-muted/30 py-3 pl-3 pr-2 text-right font-mono text-[13px] leading-relaxed text-muted-foreground/50"
            >
              {codeValue.split("\n").map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            <textarea
              ref={codeRef}
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              onScroll={(e) => {
                if (gutterRef.current) gutterRef.current.scrollTop = e.currentTarget.scrollTop;
              }}
              spellCheck={false}
              // Sans wrap="off", une ligne source longue occupe deux lignes à
              // l'écran et la gouttière se décale : les numéros désignent alors
              // la mauvaise ligne. Défilement horizontal, comme tout éditeur.
              wrap="off"
              aria-label="Code JSX du banc d'essai"
              className="code-scroll h-full flex-1 resize-none overflow-auto bg-background p-3 font-mono text-[13px] leading-relaxed outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col">
          <PaneHeader label="Données (JSON) — remplacez par VOS données">
            <span
              className={cn(
                "max-w-[14rem] truncate text-[10px]",
                dataState.ok ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
              )}
            >
              {dataState.ok ? `✓ ${dataState.label}` : `✗ ${dataState.label}`}
            </span>
          </PaneHeader>
          <textarea
            value={dataValue}
            onChange={(e) => setDataValue(e.target.value)}
            spellCheck={false}
            aria-label="Données JSON du banc d'essai"
            className="code-scroll h-48 w-full resize-none bg-background p-3 font-mono text-[13px] leading-relaxed outline-none"
          />
        </div>
      </div>

      <Stage
        status={status}
        onRun={run}
        execution={execution}
        codeValue={codeValue}
        dataValue={dataValue}
        scope={scope}
        tracker={tracker}
        onLog={(type, args) => setLogs((prev) => [...prev, { type, args }])}
      />

      {/* ——— Inspecteur : hooks | console ——— */}
      <div className="border-t border-border bg-muted/20">
        <div role="tablist" aria-label="Inspecteur" className="flex items-center gap-1 px-3 pt-2">
          <InspectorTab active={tab === "hooks"} onClick={() => setTab("hooks")}>
            Hooks <HookCount tracker={tracker} />
          </InspectorTab>
          <InspectorTab active={tab === "console"} onClick={() => setTab("console")}>
            Console{" "}
            {logs.length > 0 && (
              <span className={cn("ml-1", errorCount > 0 && "text-destructive")}>
                {logs.length}
              </span>
            )}
          </InspectorTab>
          {tab === "console" && logs.length > 0 && (
            <button
              onClick={() => setLogs([])}
              className="ml-auto text-[10px] text-muted-foreground underline hover:text-foreground"
            >
              effacer
            </button>
          )}
        </div>
        {tab === "hooks" ? (
          <HookMonitor tracker={tracker} />
        ) : (
          <div className="code-scroll h-28 overflow-y-auto px-3 py-2 font-mono text-xs">
            {logs.length === 0 && (
              <p className="text-muted-foreground/60">console.log capturé ici…</p>
            )}
            {logs.map((l, i) => (
              <p
                key={i}
                className={cn(
                  "py-0.5",
                  l.type === "error" && "text-destructive",
                  l.type === "warn" && "text-amber-500",
                )}
              >
                {l.type === "error" ? "✗ " : l.type === "warn" ? "⚠ " : "› "}
                {formatArgs(l.args)}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ——— Barre d'outils ——— */

const STATUS_LABEL: Record<RunStatus, string> = {
  vierge: "jamais exécuté",
  modifie: "modifié — non exécuté",
  erreur: "erreur à la dernière exécution",
  ajour: "à jour",
};

const STATUS_TONE: Record<RunStatus, string> = {
  vierge: "text-muted-foreground",
  modifie: "text-amber-600 dark:text-amber-400",
  erreur: "text-destructive",
  ajour: "text-emerald-600 dark:text-emerald-400",
};

function Toolbar({
  experiments,
  activeId,
  onSelect,
  status,
  onRun,
  onReset,
  rootRef,
}: {
  experiments?: BenchExperiment[];
  activeId?: string;
  onSelect?: (id: string) => void;
  status: RunStatus;
  onRun: () => void;
  onReset: () => void;
  rootRef: React.RefObject<HTMLDivElement | null>;
}) {
  const toggleFullscreen = () => {
    const el = rootRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen?.();
    else void el.requestFullscreen?.();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/40 px-3 py-2">
      {experiments && experiments.length > 0 && (
        <div role="tablist" aria-label="Expériences" className="flex flex-wrap gap-1">
          {experiments.map((x) => (
            <button
              key={x.id}
              id={`banc-${x.id}`}
              data-toc={x.label}
              role="tab"
              aria-selected={activeId === x.id}
              onClick={() => onSelect?.(x.id)}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                activeId === x.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {x.label}
            </button>
          ))}
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        <span
          role="status"
          className={cn("flex items-center gap-1.5 text-[11px]", STATUS_TONE[status])}
        >
          <span aria-hidden="true">●</span>
          {STATUS_LABEL[status]}
        </span>
        <button
          onClick={onRun}
          className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
        >
          ▶ Exécuter <kbd className="ml-1 font-sans text-[10px] opacity-70">⌘↵</kbd>
        </button>
        <button
          onClick={onReset}
          className="rounded-md border border-border bg-background px-2.5 py-1 text-xs font-medium hover:bg-accent"
        >
          Réinit.
        </button>
        <button
          onClick={toggleFullscreen}
          aria-label="Basculer le banc en plein écran"
          title="Plein écran"
          className="rounded-md border border-border bg-background px-2 py-1 text-xs hover:bg-accent"
        >
          ⤢
        </button>
      </div>
    </div>
  );
}

function PaneHeader({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function InspectorTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-selected={active}
      role="tab"
      className={cn(
        "rounded-t-md px-2.5 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-background text-foreground shadow-[inset_0_1px_0_theme(colors.border),inset_1px_0_0_theme(colors.border),inset_-1px_0_0_theme(colors.border)]"
          : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/* ——— La scène : le rendu, pleine largeur et redimensionnable ——— */

function Stage({
  status,
  onRun,
  execution,
  codeValue,
  dataValue,
  scope,
  tracker,
  onLog,
}: {
  status: RunStatus;
  onRun: () => void;
  execution: { key: number } | null;
  codeValue: string;
  dataValue: string;
  scope: Record<string, unknown>;
  tracker: Tracker;
  onLog: (type: "log" | "warn" | "error", args: unknown[]) => void;
}) {
  const [height, setHeight] = useState<number>(() => readStageHeight());
  const drag = useRef<{ y: number; h: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = { y: e.clientY, h: height };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!drag.current) return;
    setHeight(Math.max(STAGE_MIN, drag.current.h + (e.clientY - drag.current.y)));
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    drag.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
    try {
      localStorage.setItem(STAGE_KEY, String(height));
    } catch {
      /* stockage indisponible : la hauteur reste locale à la session */
    }
  };

  return (
    <>
      <div
        role="separator"
        aria-label="Redimensionner la scène"
        aria-orientation="horizontal"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="group flex h-2 cursor-row-resize items-center justify-center border-y border-border bg-muted/40"
      >
        <span className="h-0.5 w-9 rounded-full bg-border group-hover:bg-muted-foreground/50" />
      </div>

      <PaneHeader label="Rendu" />
      <div
        style={{ height }}
        className="code-scroll overflow-auto bg-background p-4"
      >
        {execution ? (
          <RenderedView
            key={execution.key}
            code={codeValue}
            data={dataValue}
            scope={scope}
            tracker={tracker}
            onLog={onLog}
            onError={(message) => onLog("error", [message])}
          />
        ) : (
          <button
            onClick={onRun}
            className="flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            <span className="text-lg" aria-hidden="true">
              ▶
            </span>
            Appuyez sur Exécuter <kbd className="font-mono text-xs">⌘↵</kbd> pour lancer
          </button>
        )}
        {status === "modifie" && execution && (
          <p className="mt-3 text-[11px] text-amber-600 dark:text-amber-400">
            Ce rendu ne correspond plus au code affiché — ré-exécutez (⌘↵).
          </p>
        )}
      </div>
    </>
  );
}

function readStageHeight(): number {
  try {
    const stored = Number(localStorage.getItem(STAGE_KEY));
    return Number.isFinite(stored) && stored >= STAGE_MIN ? stored : STAGE_DEFAULT;
  } catch {
    return STAGE_DEFAULT;
  }
}

/** Validation JSON en direct : on n'attend pas l'exécution pour dire que le
 *  contrat de données ne passe pas. */
function checkJson(value: string): { ok: boolean; label: string } {
  if (value.trim() === "") return { ok: true, label: "vide" };
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return { ok: true, label: `${parsed.length} éléments` };
    return { ok: true, label: "valide" };
  } catch (err) {
    return { ok: false, label: err instanceof Error ? err.message : "JSON invalide" };
  }
}

function formatArgs(args: unknown[]): string {
  return args.map(formatValue).join(" ");
}

export function formatValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "function") return "[fn]";
  // Nœud DOM (ref) : afficher le tag, pas l'objet géant
  if (typeof value === "object" && "nodeType" in (value as object)) {
    return `<${(value as HTMLElement).tagName?.toLowerCase() ?? "element"}>`;
  }
  try {
    return JSON.stringify(value, null, 0);
  } catch {
    return String(value);
  }
}

// ——— Tracé des hooks use*** ———

/** Un hook observé à une passe de rendu donnée. */
export interface HookSample {
  /** Le vrai nom de variable (`count`) si connu, sinon `useState[0]` */
  name: string;
  kind: string;
  value: string;
  /** Différent de la même position à la passe précédente */
  changed: boolean;
}

/** Une passe de rendu : ce que React a fait, et pourquoi. */
export interface RenderPass {
  /** 1, 2, 3… */
  index: number;
  /** Le setter qui a déclenché cette passe — null au montage */
  trigger: string | null;
  samples: HookSample[];
}

/**
 * Tracker : enregistre chaque appel de hook du code du banc et les regroupe
 * par PASSE DE RENDU, avec le déclencheur qui l'a provoquée. Notifie les
 * abonnés après chaque commit — le panneau re-rend via useSyncExternalStore.
 *
 * Les pushes sont bufferisés : une passe de rendu React peut être suivie
 * d'une re-passe identique (StrictMode en dev, re-rendu parent sans
 * changement) — la redite est détectée à l'enregistrement (séquence divisée
 * en deux moitiés égales) et fusionnée, sinon chaque interaction créerait
 * des hooks fantômes. Le commit réel se fait à la microtâche suivante ;
 * beginRender() (setter / run) commite immédiatement.
 * Instances stables (arrow properties) pour ne jamais casser l'abonnement.
 */
export class Tracker {
  private passes: RenderPass[] = [];
  private buffer: { kind: string; value: unknown }[] = [];
  private listeners = new Set<() => void>();
  private version = 0;
  private scheduled = false;
  private naming: HookNaming = EMPTY_NAMING;
  /** Compteur d'appels par kind DANS la passe en cours — sert à nommer le setter. */
  private liveCounts = new Map<string, number>();
  private pendingTrigger: string | null = null;

  /** Noms de variables relevés dans le code du banc (design §5.2). */
  setNaming(naming: HookNaming): void {
    this.naming = naming;
  }

  /** Appelé PENDANT le rendu du composant sandbox (effet de bord bénin :
   *  ni setState React, ni DOM — juste un échantillon + notification).
   *  Renvoie l'index de cet appel pour son kind, afin de nommer son setter. */
  push(kind: string, value: unknown): number {
    const declared = this.naming.values.get(kind)?.length ?? 0;
    const seen = this.liveCounts.get(kind) ?? 0;
    this.liveCounts.set(kind, seen + 1);
    this.buffer.push({ kind, value });
    this.scheduleCommit();
    // Modulo : une re-passe StrictMode rejoue la même séquence, l'index doit
    // repartir de 0 au lieu de déborder sur des noms inexistants.
    return declared > 0 ? seen % declared : seen;
  }

  /** Nom du setter du k-ième hook de ce kind, s'il est connu. */
  setterName(kind: string, index: number): string | null {
    return this.naming.setters.get(kind)?.[index] ?? null;
  }

  /** Nouvelle passe de rendu (setter appelé, ré-exécution) : la passe en
   *  cours est commitée immédiatement, la suivante repart des index 0 et
   *  retiendra `trigger` comme cause. */
  beginRender(trigger: string | null = null): void {
    this.commitNow();
    this.pendingTrigger = trigger;
  }

  reset(): void {
    this.passes = [];
    this.buffer = [];
    this.liveCounts.clear();
    this.pendingTrigger = null;
    this.version++;
    this.emit();
  }

  /** Commit synchrone — exposé pour les tests (déterministe, sans timer). */
  flush(): void {
    this.commitNow();
  }

  snapshot(): RenderPass[] {
    return this.passes;
  }

  get isEmpty(): boolean {
    return this.passes.length === 0;
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getSnapshot = (): number => this.version;

  private scheduleCommit(): void {
    if (this.scheduled) return;
    this.scheduled = true;
    setTimeout(() => {
      this.scheduled = false;
      this.commitNow();
    }, 0);
  }

  private commitNow(): void {
    if (this.buffer.length === 0) return;
    const seq = this.buffer;
    this.buffer = [];
    this.liveCounts.clear();

    // Re-passe identique (StrictMode) : la séquence d'une passe de rendu
    // suit exactement celle de la précédente → enregistrer une seule fois.
    const half = seq.length / 2;
    const isRedite =
      Number.isInteger(half) &&
      seq.slice(0, half).every((s, i) => s.kind === seq[half + i].kind && s.value === seq[half + i].value);
    const finalSeq = isRedite ? seq.slice(0, half) : seq;

    const previous = this.passes[this.passes.length - 1];
    const counters = new Map<string, number>();
    const samples: HookSample[] = finalSeq.map((entry, position) => {
      const index = counters.get(entry.kind) ?? 0;
      counters.set(entry.kind, index + 1);
      const declared = this.naming.values.get(entry.kind)?.[index];
      const value = formatValue(entry.value);
      const before = previous?.samples[position];
      return {
        name: declared ?? `${entry.kind}[${index}]`,
        kind: entry.kind,
        value,
        // Au montage rien n'a « changé » : tout naît. Le marqueur ne prend
        // son sens qu'à partir de la deuxième passe.
        changed: previous ? !before || before.value !== value : false,
      };
    });

    this.passes = [
      ...this.passes,
      { index: this.passes.length + 1, trigger: this.pendingTrigger, samples },
    ];
    this.pendingTrigger = null;
    this.version++;
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach((l) => l());
  }
}

/** Un objet « react-like » porte les hooks (React, ReactScope…). */
function isReactLike(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).useState === "function"
  );
}

/** Enrobe un déclencheur de re-rendu (setState, dispatch…) : la passe de
 *  rendu qui suit repart des index 0 et retient QUI l'a déclenchée. */
function tracedSetter(
  tracker: Tracker,
  setter: Function,
  kind: string,
  index: number,
): Function {
  return (...args: unknown[]) => {
    tracker.beginRender(tracker.setterName(kind, index) ?? `${kind}[${index}]`);
    return setter(...args);
  };
}

/**
 * Instrumente un objet react-like : chaque hook use*** appelé par le code
 * du banc échantillonne sa valeur dans le tracker — le reste (lazy,
 * Suspense…) est copié tel quel.
 */
function instrumentedReact(
  react: Record<string, unknown>,
  tracker: Tracker,
): Record<string, unknown> {
  const hooks: Record<string, unknown> = { ...react };

  hooks.useState = (initial: unknown) => {
    const pair = (react.useState as (i: unknown) => [unknown, (v: unknown) => void])(initial);
    const i = tracker.push("useState", pair[0]);
    return [pair[0], tracedSetter(tracker, pair[1], "useState", i)];
  };

  hooks.useReducer = (reducer: unknown, init: unknown) => {
    const triple = (react.useReducer as (r: unknown, i: unknown) => [unknown, unknown])(reducer, init);
    const i = tracker.push("useReducer", triple[0]);
    return [triple[0], tracedSetter(tracker, triple[1] as Function, "useReducer", i)];
  };

  hooks.useMemo = (factory: unknown, deps: unknown) => {
    const value = (react.useMemo as (f: unknown, d: unknown) => unknown)(factory, deps);
    tracker.push("useMemo", value);
    return value;
  };

  hooks.useCallback = (fn: unknown, deps: unknown) => {
    const value = (react.useCallback as (f: unknown, d: unknown) => unknown)(fn, deps);
    tracker.push("useCallback", "[fn]");
    return value;
  };

  hooks.useRef = (initial: unknown) => {
    const ref = (react.useRef as (i: unknown) => { current: unknown })(initial);
    tracker.push("useRef", ref.current);
    return ref;
  };

  hooks.useEffect = (fn: unknown, deps: unknown) => {
    const result = (react.useEffect as (f: unknown, d: unknown) => void)(fn, deps);
    tracker.push("useEffect", deps ?? "[aucune dép]");
    return result;
  };

  hooks.useContext = (ctx: unknown) => {
    const value = (react.useContext as (c: unknown) => unknown)(ctx);
    tracker.push("useContext", value);
    return value;
  };

  hooks.useDeferredValue = (value: unknown) => {
    const deferred = (react.useDeferredValue as (v: unknown) => unknown)(value);
    tracker.push("useDeferredValue", deferred);
    return deferred;
  };

  hooks.useTransition = () => {
    const pair = (react.useTransition as () => [boolean, (fn: () => void) => void])();
    const i = tracker.push("useTransition", `isPending:${String(pair[0])}`);
    return [pair[0], tracedSetter(tracker, pair[1], "useTransition", i)];
  };

  hooks.useOptimistic = (value: unknown) => {
    const pair = (react.useOptimistic as (v: unknown) => [unknown, unknown])(value);
    const i = tracker.push("useOptimistic", pair[0]);
    return [pair[0], tracedSetter(tracker, pair[1] as Function, "useOptimistic", i)];
  };

  hooks.useActionState = (action: unknown, initial: unknown) => {
    const triple = (react.useActionState as (a: unknown, i: unknown) => [unknown, unknown, boolean])(action, initial);
    const i = tracker.push("useActionState", triple[0]);
    return [triple[0], tracedSetter(tracker, triple[1] as Function, "useActionState", i), triple[2]];
  };

  hooks.use = (input: unknown) => {
    const value = (react.use as (i: unknown) => unknown)(input);
    tracker.push("use", value);
    return value;
  };

  return hooks;
}

/** Remplace, dans un scope de banc, chaque objet react-like (React,
 *  ReactScope…) par sa version instrumentée. Les composants (Button…) et
 *  les utilitaires (cn…) passent tels quels. */
export function instrumentScope(
  scope: Record<string, unknown>,
  tracker: Tracker,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(scope)) {
    out[key] = isReactLike(value) ? instrumentedReact(value, tracker) : value;
  }
  return out;
}

// ——— Affichage du tracé ———

/** Badge de comptage des hooks de la dernière passe. */
function HookCount({ tracker }: { tracker: Tracker }) {
  useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, () => -1);
  const passes = tracker.snapshot();
  const count = passes[passes.length - 1]?.samples.length ?? 0;
  if (count === 0) return null;
  return <span className="ml-1 opacity-70">{count}</span>;
}

/**
 * Panneau « État des hooks » : la chronologie des passes de rendu. Chaque
 * colonne est un rendu, avec son déclencheur et la valeur de chaque hook.
 * Re-rend via useSyncExternalStore à chaque commit du Tracker.
 * Exposé pour les tests.
 */
export function HookMonitor({ tracker }: { tracker: Tracker }) {
  useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, () => -1);
  const passes = tracker.snapshot();

  if (passes.length === 0) {
    return (
      <div className="px-3 py-3 text-xs text-muted-foreground">
        État des hooks <span aria-hidden="true">·</span> aucun hook use*** exécuté
      </div>
    );
  }

  return (
    <div className="code-scroll overflow-x-auto px-3 py-3">
      <ol className="flex min-w-fit gap-4">
        {passes.map((pass) => (
          <li
            key={pass.index}
            className={cn(
              "min-w-[10rem] border-l-2 pl-3",
              pass.trigger ? "border-primary/60" : "border-border",
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Rendu #{pass.index}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground/80">
              {pass.trigger ? `← ${pass.trigger}` : "montage"}
            </p>
            <ul className="mt-1.5 flex flex-col gap-0.5">
              {pass.samples.map((s, i) => (
                <li key={`${s.name}-${i}`} className="font-mono text-xs leading-snug">
                  <span className="text-emerald-600 dark:text-emerald-400">{s.name}</span>{" "}
                  <span className="text-[10px] text-muted-foreground">{s.kind}</span>{" "}
                  <span className="text-foreground">{s.value}</span>
                  {pass.index > 1 &&
                    (s.changed ? (
                      <span className="text-amber-500"> ⚡</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60">
                        {" "}
                        {s.kind === "useMemo" || s.kind === "useCallback"
                          ? "cache réutilisé"
                          : "inchangé"}
                      </span>
                    ))}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}

// ——— Exécution du code utilisateur ———

class BenchErrorBoundary extends Component<
  { children: ReactNode; onError: (message: string) => void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error instanceof Error ? error.message : String(error));
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          L'exécution a échoué — corrigez le code puis ré-exécutez.
        </div>
      );
    }
    return this.props.children;
  }
}

function RenderedView({
  code,
  data,
  scope,
  tracker,
  onLog,
  onError,
}: {
  code: string;
  data: string;
  scope: Record<string, unknown>;
  tracker: Tracker;
  onLog: (type: "log" | "warn" | "error", args: unknown[]) => void;
  onError: (message: string) => void;
}) {
  const [result, setResult] = useState<ReactNode>(null);

  useEffect(() => {
    try {
      const parsedData = data.trim() === "" ? {} : JSON.parse(data);
      const rendered = evaluate(code, scope, parsedData, tracker, onLog);
      setResult(rendered);
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, data]);

  // Les exemples « système » (toast, field) appellent useToast() : leur
  // rendu doit vivre sous un ToastProvider. S'il est dans le scope de la
  // fiche, on enrobe automatiquement (sinon rendu nu).
  const ToastWrapper = (scope.ToastProvider as ComponentType | undefined) ?? Fragment;

  return (
    <BenchErrorBoundary onError={onError}>
      <ToastWrapper>{result}</ToastWrapper>
    </BenchErrorBoundary>
  );
}

/** Le code du banc est-il un programme avec un `return` de premier
 *  niveau (colonne 0) ? Exposé pour les tests — la règle de wrapper
 *  en dépend intégralement (spec §7). */
export function hasTopLevelReturnIn(code: string): boolean {
  return /^return\b/m.test(code.trimStart());
}

// Transpile + exécute le JSX utilisateur avec un scope explicite.
// Le code est une expression de rendu : on injecte les variables via l'argument.
function evaluate(
  code: string,
  scope: Record<string, unknown>,
  data: unknown,
  tracker: Tracker,
  onLog: (type: "log" | "warn" | "error", args: unknown[]) => void,
): ReactNode {
  // Sucrase : JSX → React.createElement, TS transpilé
  const compiled = transform(code, {
    transforms: ["typescript", "jsx"],
    jsxRuntime: "classic",
    production: true,
  }).code;

  // Deux formes de code acceptées :
  // 1. une EXPRESSION de rendu seule (`<X/>`) → `return (<expr>)` ;
  // 2. un PROGRAMME avec `return` de premier niveau
  //    (`function Demo(){…}\nreturn <Demo/>`) → exécuté tel quel.
  // Wrapper avec un return sur une expression qui en contient déjà un
  // lève « Unexpected token 'return' » (le bug que le test verrouille).
  const hasTopLevelReturn = hasTopLevelReturnIn(code);
  const body = hasTopLevelReturn ? compiled : `return (${compiled});`;

  const keys = Object.keys(scope).filter((k) => k !== "React");

  // React (et tout objet react-like du scope) est remplacé par la version
  // instrumentée : chaque hook use*** appelé par le code échantillonne sa
  // valeur dans le tracker — « l'état des données à chaque moment ».
  const tracedScope = instrumentScope(scope, tracker);

  // La zone « Données (JSON) » du panneau alimente un paramètre `data`.
  // Conflit : les exemples qui déclarent leur PROPRE variable
  // (`const data = […]`) redeclarent le paramètre → SyntaxError.
  // On n'injecte alors pas `data` — l'exemple vit avec sa déclaration.
  const declaresOwnData = /\b(?:const|let|var|function|class)\s+data\b/.test(code);
  const dataParams = declaresOwnData ? [] : (["data"] as const);

  const params = ["React", ...dataParams, "console", ...keys];
  const args: unknown[] = [
    tracedScope.React,
    ...(declaresOwnData ? [] : [data]),
    {
      log: (...a: unknown[]) => onLog("log", a),
      warn: (...a: unknown[]) => onLog("warn", a),
      error: (...a: unknown[]) => onLog("error", a),
    },
    ...keys.map((k) => tracedScope[k]),
  ];

  // eslint-disable-next-line no-new-func
  const evaluator = new Function(...params, body);
  return evaluator(...args);
}
