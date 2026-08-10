// Pourquoi : panneau interne du banc d'essai (chargé à la demande, client-only).
// — Code (JSX) éditable dans un textarea monospace (pas de coloration, hors v1)
// — Données (JSON) éditable
// — Rendu live à l'exécution (⌘↵ / bouton)
// — Console : console.log capturés + erreurs de compile/run avec message exact
// — Error boundary réinitialisée à chaque exécution (spec §7)

"use client";

import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
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

  const run = useCallback(() => {
    setLogs([]);
    // Nouvelle clé → le RenderedView est remonté → erreurs de la run précédente purgées
    setExecution({ key: Date.now() });
  }, []);

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
              onLog={(type, args) => setLogs((prev) => [...prev, { type, args }])}
              onError={(message) =>
                setLogs((prev) => [...prev, { type: "error", args: [message] }])
              }
            />
          )}
        </div>
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
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      try {
        return JSON.stringify(a, null, 0);
      } catch {
        return String(a);
      }
    })
    .join(" ");
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
  onLog,
  onError,
}: {
  code: string;
  data: string;
  scope: Record<string, unknown>;
  onLog: (type: "log" | "warn" | "error", args: unknown[]) => void;
  onError: (message: string) => void;
}) {
  const [result, setResult] = useState<ReactNode>(null);

  useEffect(() => {
    try {
      const parsedData = data.trim() === "" ? {} : JSON.parse(data);
      const rendered = evaluate(code, scope, parsedData, onLog);
      setResult(rendered);
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, data]);

  return <BenchErrorBoundary onError={onError}>{result}</BenchErrorBoundary>;
}

// Transpile + exécute le JSX utilisateur avec un scope explicite.
// Le code est une expression de rendu : on injecte les variables via l'argument.
function evaluate(
  code: string,
  scope: Record<string, unknown>,
  data: unknown,
  onLog: (type: "log" | "warn" | "error", args: unknown[]) => void,
): ReactNode {
  // Sucrase : JSX → React.createElement, TS transpilé
  const compiled = transform(code, {
    transforms: ["typescript", "jsx"],
    jsxRuntime: "classic",
    production: true,
  }).code;

  const keys = Object.keys(scope).filter((k) => k !== "React");

  const params = ["React", "data", "console", ...keys];
  const args = [
    scope.React,
    data,
    {
      log: (...a: unknown[]) => onLog("log", a),
      warn: (...a: unknown[]) => onLog("warn", a),
      error: (...a: unknown[]) => onLog("error", a),
    },
    ...keys.map((k) => scope[k]),
  ];

  // eslint-disable-next-line no-new-func
  const evaluator = new Function(...params, `return (${compiled});`);
  return evaluator(...args);
}