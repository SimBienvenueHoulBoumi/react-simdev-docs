// Pourquoi : bascule Tailwind ⇄ MUI — le sélecteur du moteur de style.
// L'aperçu, les fiches et l'app entière réagissent instantanément.

"use client";

import { useStyleEngine, type StyleEngine } from "~/lib/style-engine";
import { cn } from "~/lib/cn";

export interface EngineToggleProps {
  className?: string;
}

const OPTIONS: { value: StyleEngine; label: string }[] = [
  { value: "tailwind", label: "Tailwind" },
  { value: "mui", label: "MUI" },
];

export function EngineToggle({ className }: EngineToggleProps) {
  const { engine, setEngine } = useStyleEngine();

  return (
    <div
      role="group"
      aria-label="Moteur de style"
      className={cn(
        "flex items-center rounded-md border border-border bg-background p-0.5 text-xs",
        className,
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setEngine(opt.value)}
          aria-pressed={engine === opt.value}
          className={cn(
            "rounded px-2 py-1 font-medium transition-colors",
            engine === opt.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}