// Pourquoi : textarea multiligne, même contrat que Input.
// `invalid` porte le visuel, <Field> porte le message (cf. tw/input.tsx).
// `className` s'applique à la racine — ici le textarea lui-même.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  /** Passe le bord en destructif et pose aria-invalid. Le message vient de <Field>. */
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, invalid, ref, ...rest }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        "flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors",
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
