// Pourquoi : petit libellé d'état ou de catégorie.
// Pur, un seul fichier, dépend de cn uniquement.

import { type ComponentPropsWithoutRef, type Ref } from "react";
import { cn } from "~/lib/cn";

export interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  variant?: "default" | "secondary" | "outline" | "destructive" | "success";
  ref?: Ref<HTMLSpanElement>;
}

const variants = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  outline: "border-input text-foreground",
  destructive: "border-transparent bg-destructive/15 text-destructive",
  success: "border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
} as const;

export function Badge({ variant = "default", className, ref, ...rest }: BadgeProps) {
  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...rest}
    />
  );
}