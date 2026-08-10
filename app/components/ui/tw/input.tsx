// Pourquoi : champ de saisie simple. La logique de formulaire vit dehors
// (Form + action côté route), le composant ne connaît que props/état local.
//
// Contrat d'erreur : ce composant ne porte QUE l'état visuel (`invalid`).
// Le message, son id et le câblage aria-describedby appartiennent à <Field> —
// un seul propriétaire, donc jamais deux messages pour une même erreur.
//
// `className` s'applique à l'élément racine, qui est ici l'input lui-même :
// pas de wrapper, donc pas de désynchronisation entre la boîte et le champ.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
  /** Passe le bord en destructif et pose aria-invalid. Le message vient de <Field>. */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, invalid, ref, ...rest }: InputProps) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      {...rest}
    />
  );
}
