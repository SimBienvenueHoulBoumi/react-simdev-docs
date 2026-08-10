// Pourquoi : select natif stylé. Nativement accessible (clavier, lecteur d'écran).
// Options passées en children — le composant ne connaît pas la forme des données.
//
// `className` s'applique à la RACINE, pas au <select>. C'est elle qui définit la
// largeur, donc le chevron — positionné en absolu par rapport à elle — reste collé
// au champ quelle que soit sa taille. L'appliquer au <select> décrochait le chevron.
//
// `invalid` porte le visuel, <Field> porte le message (cf. tw/input.tsx).

import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  /** Passe le bord en destructif et pose aria-invalid. Le message vient de <Field>. */
  invalid?: boolean;
  /** Option grisée en tête, affichée tant qu'aucune valeur n'est choisie (value=""). */
  placeholder?: string;
  ref?: Ref<HTMLSelectElement>;
  children?: ReactNode;
}

export function Select({
  className,
  invalid,
  placeholder,
  children,
  ref,
  ...rest
}: SelectProps) {
  return (
    <div className={cn("relative w-full", className)}>
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm shadow-sm transition-colors",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          invalid && "border-destructive focus-visible:ring-destructive",
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
  );
}
