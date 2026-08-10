// Pourquoi : Checkbox MUI — la version Material de la case à cocher.
// Même contrat : checked, defaultChecked, onChange, indeterminate, disabled, ref.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import MuiCheckbox from "@mui/material/Checkbox";

export interface CheckboxProps extends ComponentPropsWithoutRef<"input"> {
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ className, ref, ...rest }: CheckboxProps) {
  return (
    <MuiCheckbox
      slotProps={{ input: { ref } }}
      className={className}
      {...(rest as object)}
    />
  );
}