// Pourquoi : Select MUI — la version Material du select.
// Même contrat que tw/select.tsx : error, placeholder, children (<option>), ref.
// Le `native` de MUI garde des <option> en children : aucune conversion.

import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";
import MuiSelect from "@mui/material/Select";
import FormHelperText from "@mui/material/FormHelperText";
import { cn } from "~/lib/cn";

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
    <div className="flex w-full flex-col gap-1">
      <MuiSelect
        native
        inputRef={ref}
        size="small"
        error={Boolean(error)}
        className={cn("MuiInputBase-root", className)}
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
    </div>
  );
}