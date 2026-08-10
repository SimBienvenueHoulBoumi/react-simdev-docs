// Pourquoi : Badge MUI — la version Material du libellé d'état.
// Même contrat : variant, className, children. Chip porte ces couleurs.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import MuiChip from "@mui/material/Chip";

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success";
  ref?: Ref<HTMLDivElement>;
}

const chipProps = {
  default: { color: "primary" as const, variant: "filled" as const },
  secondary: { color: "default" as const, variant: "filled" as const },
  outline: { color: "default" as const, variant: "outlined" as const },
  destructive: { color: "error" as const, variant: "filled" as const },
  success: { color: "success" as const, variant: "filled" as const },
} as const;

export function Badge({ variant = "default", className, ref, ...rest }: BadgeProps) {
  const mapped = chipProps[variant];
  return (
    <MuiChip
      ref={ref}
      color={mapped.color}
      variant={mapped.variant}
      label={rest.children}
      size="small"
      className={className}
      {...({ ...rest, children: undefined } as object)}
    />
  );
}