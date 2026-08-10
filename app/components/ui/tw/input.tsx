// Pourquoi : champ de saisie simple. La logique de formulaire vit dehors
// (Form + action côté route), le composant ne connaît que props/état local.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
  /** Affiche un message d'erreur sous le champ et passe le bord en destructif */
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, error, ref, ...rest }: InputProps) {
  return (
    <div className="w-full">
      <input
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? undefined : undefined}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
          "placeholder:text-muted-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className,
        )}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}