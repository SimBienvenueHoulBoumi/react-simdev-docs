// Pourquoi : Textarea MUI — la version Material de la zone multiligne.
// Même contrat : error, rows, defaultValue, className, ref.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import MuiTextField from "@mui/material/TextField";

export interface TextareaProps extends ComponentPropsWithoutRef<"textarea"> {
  error?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({ className, error, ref, rows = 3, ...rest }: TextareaProps) {
  const { children, ...inputRest } = rest;
  return (
    <MuiTextField
      inputRef={ref}
      error={Boolean(error)}
      helperText={error}
      className={className}
      size="small"
      variant="outlined"
      multiline
      minRows={rows}
      slotProps={{
        input: { ...(inputRest as object) },
        htmlInput: { "aria-invalid": error ? true : undefined },
      }}
    />
  );
}