// Pourquoi : panneau interne du banc d'essai (chargé à la demande, client-only).
// — Code (JSX) éditable dans un textarea monospace (pas de coloration, hors v1)
// — Données (JSON) éditable
// — Rendu live à l'exécution (⌘↵ / bouton)
// — Console : console.log capturés + erreurs de compile/run avec message exact
// — État des hooks : chaque hook use*** du code échantillonne ses valeurs
//   successives (useState, useReducer, useMemo…) — voir Tracker
// — Error boundary réinitialisée à chaque exécution (spec §7)

"use client";

import {
  Component,
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from "react";
import { transform } from "sucrase";

export interface BenchPanelProps {
  code: string;
  data: string;
  scope: Record<string, unknown>;
}

interface LogEntry {
  type: "log" | "warn" | "error";
  args: unknown[];
}

export default function BenchPanel({ code, data, scope }: BenchPanelProps) {
  const [codeValue, setCodeValue] = useState(code);
  const [dataValue, setDataValue] = useState(data);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [execution, setExecution] = useState<{ key: number; error?: string } | null>(null);
  const codeRef = useRef<HTMLTextAreaElement>(null);
  const dataRef = useRef<HTMLTextAreaElement>(null);
  // Traqueur des hooks use*** — vit pendant toute la session du banc et
  // se vide à chaque exécution (comme la console et la boundary).
  const trackerRef = useRef<Tracker | null>(null);
  if (!trackerRef.current) trackerRef.current = new Tracker();
  const tracker = trackerRef.current;

  const run = useCallback(() => {
    setLogs([]);
    tracker.reset();
    // Nouvelle clé → le RenderedView est remonté → erreurs de la run précédente purgées
    setExecution({ key: Date.now() });
  }, [tracker]);

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
    setExecution(null);
  };

  return (
    <div className="grid gap-0 border-t border-border lg:grid-cols-2">
      {/* Colonne gauche : code + données */}
      <div className="flex flex-col border-b border-border lg:border-b-0 lg:border-r">
        <div className="border-b border-border">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">Code (JSX)</span>
            <span className="text-[10px] text-muted-foreground">JSX + TS supporté</span>
          </div>
          <textarea
            ref={codeRef}
            value={codeValue}
            onChange={(e) => setCodeValue(e.target.value)}
            spellCheck={false}
            aria-label="Code JSX du banc d'essai"
            className="code-scroll h-44 w-full resize-y bg-background p-3 font-mono text-[13px] leading-relaxed outline-none"
          />
        </div>
        <div>
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Données (JSON) — remplacez par VOS données
            </span>
          </div>
          <textarea
            ref={dataRef}
            value={dataValue}
            onChange={(e) => setDataValue(e.target.value)}
            spellCheck={false}
            aria-label="Données JSON du banc d'essai"
            className="code-scroll h-36 w-full resize-y bg-background p-3 font-mono text-[13px] leading-relaxed outline-none"
          />
        </div>
      </div>

      {/* Colonne droite : rendu + console */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
          <span className="text-xs font-medium text-muted-foreground">Rendu</span>
          <div className="flex gap-1.5">
            <button
              onClick={run}
              className="rounded border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-accent"
            >
              Exécuter <kbd className="ml-1 text-[10px] text-muted-foreground">⌘↵</kbd>
            </button>
            <button
              onClick={reset}
              className="rounded border border-border bg-background px-2 py-1 text-xs font-medium hover:bg-accent"
            >
              Réinit.
            </button>
          </div>
        </div>
        <div className="flex min-h-40 flex-1 flex-col gap-2 p-3">
          {execution && (
            <RenderedView
              key={execution.key}
              code={codeValue}
              data={dataValue}
              scope={scope}
              tracker={tracker}
              onLog={(type, args) => setLogs((prev) => [...prev, { type, args }])}
              onError={(message) =>
                setLogs((prev) => [...prev, { type: "error", args: [message] }])
              }
            />
          )}
        </div>
        <HookMonitor tracker={tracker} />
        <div className="border-t border-border">
          <div className="flex items-center justify-between px-3 py-1.5">
            <span className="text-xs font-medium text-muted-foreground">
              Console {logs.length > 0 && <span className="ml-1 text-[10px]">({logs.length})</span>}
            </span>
            {logs.length > 0 && (
              <button
                onClick={() => setLogs([])}
                className="text-[10px] text-muted-foreground underline hover:text-foreground"
              >
                effacer
              </button>
            )}
          </div>
          <div className="code-scroll h-24 overflow-y-auto bg-background px-3 py-2 font-mono text-xs">
            {logs.length === 0 && (
              <p className="text-muted-foreground/60">console.log capturé ici…</p>
            )}
            {logs.map((l, i) => (
              <p key={i} className={`py-0.5 ${l.type === "error" ? "text-destructive" : l.type === "warn" ? "text-amber-500" : ""}`}>
                {l.type === "error" ? "✗ " : l.type === "warn" ? "⚠ " : "› "}
                {formatArgs(l.args)}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
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

/** État observé d'un hook : le nom (ex. "useState[1]") et la série des
 *  valeurs successives — une entrée par rendu où la valeur change.
 *  « L'état des données à chaque moment » (exigence du banc d'essai). */
export interface HookTrace {
  name: string;
  values: string[];
}

/**
 * Tracker : enregistre chaque appel de hook du code du banc, ordonné par
 * (kind + index d'appel dans la passe). Notifie les abonnés après chaque
 * échantillon — le panneau « État des hooks » re-rend via useSyncExternalStore.
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
  private hooks = new Map<string, string[]>();
  private buffer: { kind: string; value: unknown }[] = [];
  private listeners = new Set<() => void>();
  private version = 0;
  private scheduled = false;

  /** Appelé PENDANT le rendu du composant sandbox (effet de bord bénin :
   *  ni setState React, ni DOM — juste un échantillon + notification). */
  push(kind: string, value: unknown): void {
    this.buffer.push({ kind, value });
    this.scheduleCommit();
  }

  /** Nouvelle passe de rendu (setter appelé, ré-exécution) : la passe en
   *  cours est commitée immédiatement, la suivante repart des index 0. */
  beginRender(): void {
    this.commitNow();
  }

  reset(): void {
    this.hooks.clear();
    this.buffer = [];
    this.version++;
    this.emit();
  }

  /** Commit synchrone — exposé pour les tests (déterministe, sans timer). */
  flush(): void {
    this.commitNow();
  }

  snapshot(): HookTrace[] {
    return [...this.hooks.entries()].map(([name, values]) => ({ name, values }));
  }

  get isEmpty(): boolean {
    return this.hooks.size === 0;
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

    // Re-passe identique (StrictMode) : la séquence d'une passe de rendu
    // suit exactement celle de la précédente → enregistrer une seule fois.
    const half = seq.length / 2;
    const isRedite =
      Number.isInteger(half) &&
      seq.slice(0, half).every((s, i) => s.kind === seq[half + i].kind && s.value === seq[half + i].value);
    const finalSeq = isRedite ? seq.slice(0, half) : seq;

    const counters = new Map<string, number>();
    let changed = false;
    for (const { kind, value } of finalSeq) {
      const index = counters.get(kind) ?? 0;
      counters.set(kind, index + 1);
      const name = `${kind}[${index}]`;
      const rendered = formatValue(value);
      const list = this.hooks.get(name);
      if (!list) {
        this.hooks.set(name, [rendered]);
        changed = true;
      } else if (list[list.length - 1] !== rendered) {
        list.push(rendered);
        changed = true;
      }
    }
    if (changed) {
      this.version++;
      this.emit();
    }
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
 *  rendu qui suit repart des index 0 — les hooks re-rendus prolongent leur
 *  historique au lieu d'être confondus avec de nouveaux hooks. */
function tracedSetter(tracker: Tracker, setter: Function): Function {
  return (...args: unknown[]) => {
    tracker.beginRender();
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
    tracker.push("useState", pair[0]);
    return [pair[0], tracedSetter(tracker, pair[1])];
  };

  hooks.useReducer = (reducer: unknown, init: unknown) => {
    const triple = (react.useReducer as (r: unknown, i: unknown) => [unknown, unknown])(reducer, init);
    tracker.push("useReducer", triple[0]);
    return [triple[0], tracedSetter(tracker, triple[1] as Function)];
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
    tracker.push("useTransition", `isPending:${String(pair[0])}`);
    return [pair[0], tracedSetter(tracker, pair[1])];
  };

  hooks.useOptimistic = (value: unknown) => {
    const pair = (react.useOptimistic as (v: unknown) => [unknown, unknown])(value);
    tracker.push("useOptimistic", pair[0]);
    return [pair[0], tracedSetter(tracker, pair[1] as Function)];
  };

  hooks.useActionState = (action: unknown, initial: unknown) => {
    const triple = (react.useActionState as (a: unknown, i: unknown) => [unknown, unknown, boolean])(action, initial);
    tracker.push("useActionState", triple[0]);
    return [triple[0], tracedSetter(tracker, triple[1] as Function), triple[2]];
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

// ——— Exécution du code utilisateur ———

/** Panneau « État des hooks » : la valeur de chaque hook use*** à chaque
 *  rendu, et son historique (les valeurs successives, dédupliquées).
 *  Re-rend via useSyncExternalStore à chaque échantillon du Tracker.
 *  Exposé pour les tests. */
export function HookMonitor({ tracker }: { tracker: Tracker }) {
  const traces = useSyncExternalStore(tracker.subscribe, tracker.getSnapshot, () => -1);
  void traces; // le numéro de version ne sert qu'à déclencher le re-rendu
  const hooks = tracker.snapshot();

  if (hooks.length === 0) {
    return (
      <div className="border-t border-border px-3 py-2 text-xs text-muted-foreground">
        État des hooks{" "}
        <span aria-hidden>·</span> aucun hook use*** exécuté
      </div>
    );
  }

  return (
    <div className="border-t border-border px-3 py-2">
      <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        État des hooks — la valeur à chaque rendu
      </div>
      <ul className="mt-1.5 space-y-1.5">
        {hooks.map((hook) => {
          const current = hook.values[hook.values.length - 1];
          const history = hook.values.slice(0, -1);
          return (
            <li key={hook.name} className="text-xs leading-snug">
              <span className="font-mono text-muted-foreground">{hook.name}</span>{" "}
              <span className="font-medium">{current}</span>
              {history.length > 0 && (
                <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground/70">
                  {history.join(" → ")} →
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

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
  // Conflit : les exemples qui déclarent leur PROPRRE variable
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