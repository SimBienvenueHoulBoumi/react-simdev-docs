// Pourquoi : Skeleton MUI — la version Material du placeholder de chargement.
// Même contrat : className (donne la FORME), ref. MUI Skeleton porte width/height.

import { type Ref } from "react";
import MuiSkeleton from "@mui/material/Skeleton";

export interface SkeletonProps {
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

export function Skeleton({ className, ref }: SkeletonProps) {
  return (
    <MuiSkeleton
      ref={ref}
      variant="rounded"
      animation="pulse"
      aria-hidden="true"
      className={className}
    />
  );
}