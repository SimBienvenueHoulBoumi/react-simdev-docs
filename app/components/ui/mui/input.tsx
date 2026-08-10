// Pourquoi : Input MUI — la version Material du champ de saisie.
// Même contrat que tw/input.tsx : error (string|undefined), className, ref.
// TextField porte helperText + error ; on n'expose pas la logique, juste le rendu.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import MuiTextField from "@mui/material/TextField";
import { cn } from "~/lib/cn";

export interface InputProps extends ComponentPropsWithoutRef<"input"> {
  error?: string;
  ref?: Ref<HTMLInputElement>;
}

export function Input({ className, error, ref, ...rest }: InputProps) {
  const { children, ...inputRest } = rest;
  return (
    <MuiTextField
      inputRef={ref}
      error={Boolean(error)}
      helperText={error}
      className={cn("MuiFormControl-root", className)}
      size="small"
      variant="outlined"
      slotProps={{
        input: { ...(inputRest as object) },
        htmlInput: { "aria-invalid": error ? true : undefined },
      }}
    />
  );
}