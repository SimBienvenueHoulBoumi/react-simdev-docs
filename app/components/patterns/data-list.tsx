// Pourquoi : liste générique avec les quatre états (chargement / vide / erreur / succès).
// Ne connaît JAMAIS la forme des données : accesseurs + render props (spec §5.1).
// Branchez n'importe quoi : tasks, users, git commits… tant que getKey/renderItem suivent.

import { type ReactNode, type Ref } from "react";
import { cn } from "~/lib/cn";
import { Skeleton } from "~/components/ui/skeleton";

export interface DataListProps<T> {
  items: T[] | null | undefined;
  getKey: (item: T, index: number) => string | number;
  renderItem: (item: T, index: number) => ReactNode;
  empty: ReactNode;
  /** État : null = chargement, Error = erreur, sinon succès */
  error?: Error | null;
  isLoading?: boolean;
  className?: string;
  ref?: Ref<HTMLUListElement>;
}

export function DataList<T>({
  items,
  getKey,
  renderItem,
  empty,
  error,
  isLoading,
  className,
  ref,
}: DataListProps<T>) {
  if (error) {
    return (
      <div role="alert" className="flex flex-col items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Impossible de charger les données</p>
        <p className="text-xs text-muted-foreground">{error.message}</p>
      </div>
    );
  }

  if (isLoading || items === null || items === undefined) {
    return <SkeletonRows count={3} className={className} />;
  }

  if (items.length === 0) return <>{empty}</>;

  return (
    <ul ref={ref} className={cn("flex flex-col gap-2", className)}>
      {items.map((item, i) => (
        <li key={getKey(item, i)}>{renderItem(item, i)}</li>
      ))}
    </ul>
  );
}

export function SkeletonRows({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2", className)} aria-busy="true" aria-label="Chargement">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}