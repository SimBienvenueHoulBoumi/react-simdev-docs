// Pourquoi : squelette de chargement — placeholder gris qui pulse.
// Rendu avec aria-busy pour l'accessibilité.

import { type Ref } from "react";
import { cn } from "~/lib/cn";

export interface SkeletonProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function Skeleton({ className, ref }: SkeletonProps) {
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
    />
  );
}