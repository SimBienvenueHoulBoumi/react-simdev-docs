// Pourquoi : case à cocher native stylée.
// Le label doit être fourni par l'appelant (accessibilité) — cf. fiche.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface CheckboxProps extends ComponentPropsWithoutRef<"input"> {
  ref?: Ref<HTMLInputElement>;
}

export function Checkbox({ className, ref, ...rest }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      ref={ref}
      className={cn(
        "size-4 shrink-0 appearance-none rounded border border-input bg-background shadow-sm",
        "checked:bg-primary checked:border-primary",
        "checked:bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M4%208.5l2.5%202.5L12%206%22%20fill=%22none%22%20stroke=%22white%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22/%3E%3C/svg%3E')] checked:bg-center checked:bg-no-repeat",
        "indeterminate:bg-primary indeterminate:border-primary",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...rest}
    />
  );
}