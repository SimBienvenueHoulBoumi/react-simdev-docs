// Pourquoi : select natif stylé. Nativement accessible (clavier, lecteur d'écran).
// Options passées en children — le composant ne connaît pas la forme des données.

import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  error?: string;
  /** Placeholder affiché quand aucune valeur (option vide, value="") */
  placeholder?: string;
  ref?: Ref<HTMLSelectElement>;
  children?: ReactNode;
}

export function Select({
  className,
  error,
  placeholder,
  children,
  ref,
  ...rest
}: SelectProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={error ? true : undefined}
          className={cn(
            "flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm shadow-sm transition-colors",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className,
          )}
          {...rest}
        >
          {placeholder !== undefined && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        {/* Chevron dessiné, pas d'icône externe */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}