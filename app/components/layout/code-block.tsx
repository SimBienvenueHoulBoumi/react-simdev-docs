// Pourquoi : bloc de code avec coloration et deux boutons de copie (spec §6.7).
// Le code vient TOUJOURS de `?raw` — jamais d'une chaîne dupliquée (critère 4).

import { useCallback, useRef, useState, type Ref } from "react";
import { highlightToHtml } from "~/lib/highlight";

export interface CodeBlockProps {
  /** Le code brut (importé via ?raw) */
  code: string;
  /** Nom du fichier affiché en tête */
  filename: string;
  /** Dépendances à copier en plus (concaténées, ordre compilable) */
  depsCode?: string[];
  /** Fichiers de deps associés (affichage) */
  depsNames?: string[];
  ref?: Ref<HTMLDivElement>;
}

export function CodeBlock({ code, filename, depsCode = [], depsNames = [], ref }: CodeBlockProps) {
  const [copied, setCopied] = useState<"main" | "deps" | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(null);

  const copy = useCallback(async (what: "main" | "deps") => {
    const text =
      what === "main" ? code : [code, "", "/* ——— dépendances ——— */", "", ...depsCode].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }, [code, depsCode]);

  const buttons: { key: "main" | "deps"; label: string; visible: boolean }[] = [
    { key: "main", label: "Copier le composant", visible: true },
    { key: "deps", label: "Copier avec les dépendances", visible: depsCode.length > 0 },
  ];

  return (
    <div ref={ref} className="overflow-hidden rounded-lg border border-border bg-muted/40">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-background px-3 py-1.5">
        <code className="font-mono text-xs text-muted-foreground">{filename}</code>
        <div className="flex gap-1.5">
          {buttons.filter((b) => b.visible).map((b) => (
            <button
              key={b.key}
              onClick={() => copy(b.key)}
              className="rounded border border-border bg-background px-2 py-1 text-xs font-medium transition-colors hover:bg-accent"
            >
              {copied === b.key ? "Copié ✓" : b.label}
            </button>
          ))}
        </div>
      </div>
      <pre className="code-scroll overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: highlightToHtml(code) }} />
      </pre>
      {depsCode.length > 0 && (
        <div className="border-t border-border px-4 py-2">
          <p className="text-xs text-muted-foreground">
            Dépendances incluses :{" "}
            <code className="font-mono text-[11px]">{depsNames.join(" · ")}</code>
          </p>
        </div>
      )}
    </div>
  );
}