// Pourquoi : Button MUI — la version Material du bouton de la banque.
// Même contrat de props que tw/button.tsx : variant, size, isLoading, as, ref.
// Traduction : primary→contained/primary · outline→outlined · ghost→text · destructive→error.

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import MuiButton from "@mui/material/Button";

export interface ButtonProps<T extends ElementType = "button"> {
  as?: T;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  /** Libellé pendant le chargement (« Enregistrement… ») */
  loadingLabel?: ReactNode;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}

const variantMap = {
  primary: { color: "primary" as const, variant: "contained" as const },
  secondary: { color: "secondary" as const, variant: "contained" as const },
  outline: { color: "primary" as const, variant: "outlined" as const },
  ghost: { color: "primary" as const, variant: "text" as const },
  destructive: { color: "error" as const, variant: "contained" as const },
};

const sizeMap = {
  sm: "small" as const,
  md: "medium" as const,
  lg: "large" as const,
  icon: "small" as const,
};

export function Button<T extends ElementType = "button">({
  as,
  variant = "primary",
  size = "md",
  isLoading = false,
  loadingLabel,
  className,
  children,
  disabled,
  ref,
  ...rest
}: ButtonProps<T> & Omit<ComponentPropsWithoutRef<T>, keyof ButtonProps<T> | "disabled">) {
  const mapped = variantMap[variant];
  // Caster en ElementType lève les surcharges MUI (composant polymorphique)
  const Comp = MuiButton as ElementType;
  return (
    <Comp
      ref={ref}
      component={as}
      color={mapped.color}
      variant={mapped.variant}
      size={sizeMap[size]}
      loading={isLoading}
      disabled={disabled ?? isLoading}
      className={className}
      sx={
        size === "icon"
          ? { minWidth: 36, minHeight: 36, width: 36, height: 36, padding: 0 }
          : undefined
      }
      {...(rest as object)}
    >
      {isLoading && loadingLabel ? loadingLabel : children}
    </Comp>
  );
}