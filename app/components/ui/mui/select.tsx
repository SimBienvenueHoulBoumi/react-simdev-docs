// Pourquoi : Select MUI — la version Material du select.
// Même contrat que tw/select.tsx : invalid, placeholder, children (<option>), ref.
// Le `native` de MUI garde des <option> en children : aucune conversion.
//
// `className` va sur la racine et `fullWidth` égale le `w-full` de la version
// Tailwind : la même prop doit produire la même largeur dans les deux moteurs.
// Les attributs natifs du <select> passent par `inputProps`, seul canal qui
// atteint l'élément du DOM.

import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";
import MuiSelect from "@mui/material/Select";
import type { InputBaseComponentProps } from "@mui/material/InputBase";

export interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  /** Passe le champ en erreur. Le message vient de <Field>. */
  invalid?: boolean;
  placeholder?: string;
  ref?: Ref<HTMLSelectElement>;
  children?: ReactNode;
}

export function Select({
  className,
  invalid,
  placeholder,
  children,
  disabled,
  value,
  defaultValue,
  onChange,
  ref,
  ...rest
}: SelectProps) {
  return (
    <MuiSelect
      native
      fullWidth
      size="small"
      error={Boolean(invalid)}
      className={className}
      inputRef={ref}
      disabled={disabled}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange as never}
      // MUI type `inputProps` pour <input>/<textarea> ; avec `native` l'élément
      // rendu est un <select>. Le cast couvre cet écart de typage côté MUI.
      inputProps={
        { ...rest, "aria-invalid": invalid || undefined } as InputBaseComponentProps
      }
    >
      {placeholder !== undefined && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </MuiSelect>
  );
}
