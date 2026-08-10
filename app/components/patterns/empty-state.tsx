// Pourquoi : message central quand une liste est vide — l'état vide est aussi
// un état de l'interface, pas une absence. Laissez agir l'utilisateur.

import { type ReactNode } from "react";
import { cn } from "~/lib/cn";

export interface EmptyStateProps {
  title: string;
  description?: string;
  /** Action principale (ex. bouton « Nouvelle tâche ») */
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border bg-muted/30 px-6 py-12 text-center",
        className,
      )}
    >
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}