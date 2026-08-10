// Pourquoi : bouton polyvalent, pur, copiable tel quel.
// Contrat de props transversal : variant, size, isLoading, className, as.
// React 19 : ref passée en prop normale, pas de forwardRef.

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";
import { cn } from "~/lib/cn";

export interface ButtonProps<T extends ElementType = "button"> {
  /** Élément rendu : "button" (défaut), "a", ou tout composant acceptant className+ref */
  as?: T;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  /** Affiche un spinner et désactive le bouton (anti double-clic) */
  isLoading?: boolean;
  /** Libellé pendant le chargement (« Enregistrement… »). À défaut, le libellé
   *  normal reste affiché — le spinner seul dit alors ce qui se passe. */
  loadingLabel?: ReactNode;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  ref?: Ref<HTMLElement>;
}

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm rounded-md",
  md: "h-9 px-4 text-sm rounded-md",
  lg: "h-11 px-6 text-base rounded-lg",
  icon: "h-9 w-9 rounded-md",
} as const;

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
  const Comp: ElementType = as ?? "button";
  return (
    <Comp
      ref={ref}
      disabled={disabled ?? isLoading}
      aria-disabled={isLoading || undefined}
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 font-medium transition-colors",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {isLoading && loadingLabel ? loadingLabel : children}
    </Comp>
  );
}