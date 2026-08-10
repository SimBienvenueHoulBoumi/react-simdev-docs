// Pourquoi : Select MUI — la version Material du select.
// Même contrat que tw/select.tsx : error, placeholder, children (<option>), ref.
// Le `native` de MUI garde des <option> en children : aucune conversion.

import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";
import MuiSelect from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import Stack from "@mui/material/Stack";

export interface SelectProps extends ComponentPropsWithoutRef<"select"> {
  error?: string;
  placeholder?: string;
  ref?: Ref<HTMLSelectElement>;
  children?: ReactNode;
}

export function Select({
  className,
  error,
  placeholder,
  children,
  ref,
  ...rest
}: SelectProps) {
  return (
    <Stack spacing={0.5} sx={{ width: "100%" }}>
      <MuiSelect
        native
        inputRef={ref}
        size="small"
        error={Boolean(error)}
        className={className}
        {...(rest as object)}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </MuiSelect>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Stack>
  );
}