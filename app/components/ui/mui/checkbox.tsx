// Pourquoi : Checkbox MUI — la version Material de la case à cocher.
// Même contrat : invalid, checked, defaultChecked, onChange, indeterminate,
// disabled, ref. Ici `slotProps.input` désigne bien l'élément <input> du DOM
// (SwitchBase), contrairement au TextField où c'est `htmlInput`.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import MuiCheckbox from "@mui/material/Checkbox";

export interface CheckboxProps extends ComponentPropsWithoutRef<"input"> {
  /** Passe la case en erreur. Le message vient de <Field>. */
  invalid?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ className, invalid, ref, ...rest }: CheckboxProps) {
  return (
    <MuiCheckbox
      slotProps={{ input: { ref, "aria-invalid": invalid || undefined } }}
      color={invalid ? "error" : "primary"}
      className={className}
      {...(rest as object)}
    />
  );
}
