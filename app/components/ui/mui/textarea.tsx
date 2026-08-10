// Pourquoi : Textarea MUI — la version Material de la zone multiligne.
// Même contrat que tw/textarea.tsx : invalid, rows, className, ref.
// Mêmes corrections que mui/input.tsx : attributs natifs dans `htmlInput`,
// `fullWidth` pour égaler le `w-full` de la version Tailwind.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import MuiTextField from "@mui/material/TextField";

export interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  /** Passe le champ en erreur. Le message vient de <Field>. */
  invalid?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  invalid,
  disabled,
  required,
  rows = 3,
  ref,
  children: _children,
  ...rest
}: TextareaProps) {
  return (
    <MuiTextField
      inputRef={ref}
      error={Boolean(invalid)}
      className={className}
      fullWidth
      size="small"
      variant="outlined"
      multiline
      minRows={rows}
      disabled={disabled}
      required={required}
      slotProps={{
        // Le slot est typé pour <input> alors que `multiline` rend un <textarea> :
        // le cast couvre cet écart de typage côté MUI, pas un écart de contrat.
        htmlInput: { ...rest, "aria-invalid": invalid || undefined } as object,
      }}
    />
  );
}
