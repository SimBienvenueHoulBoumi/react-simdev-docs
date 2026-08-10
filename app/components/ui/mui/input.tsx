// Pourquoi : Input MUI — la version Material du champ de saisie.
// Même contrat que tw/input.tsx : invalid, className, ref.
//
// Deux pièges MUI corrigés ici :
//   1. les attributs HTML natifs (maxLength, pattern, autoComplete, aria-*)
//      vont dans le slot `htmlInput` — le slot `input` désigne le composant
//      OutlinedInput, pas l'élément du DOM, et tout attribut inconnu y finit
//      sur une <div> (attribut perdu + avertissement React) ;
//   2. `fullWidth` est nécessaire pour égaler le `w-full` de la version
//      Tailwind — sans lui, la même prop donne deux largeurs selon le moteur.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import MuiTextField from "@mui/material/TextField";

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
  /** Passe le champ en erreur. Le message vient de <Field>. */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  className,
  invalid,
  disabled,
  required,
  ref,
  children: _children,
  ...rest
}: InputProps) {
  return (
    <MuiTextField
      inputRef={ref}
      error={Boolean(invalid)}
      className={className}
      fullWidth
      size="small"
      variant="outlined"
      disabled={disabled}
      required={required}
      slotProps={{
        htmlInput: { ...rest, "aria-invalid": invalid || undefined },
      }}
    />
  );
}
