// Pourquoi : indicateur de chargement standard — couronne animée qui tourne.
// Accessibilité : le rôle status porte le message annoncé aux lecteurs
// d'écran, l'anneau décoratif est masqué (aria-hidden).

import { cn } from "~/lib/cn";

export interface SpinnerProps {
  /** Taille du carré englobant, en pixels (défaut 20) */
  size?: number;
  /** Message annoncé par le rôle status (défaut « Chargement… ») */
  label?: string;
  className?: string;
}

export function Spinner({ size = 20, label = "Chargement…", className }: SpinnerProps) {
  return (
    <span role="status" aria-label={label} className={cn("inline-flex", className)}>
      <span
        aria-hidden="true"
        className="animate-spin rounded-full border-2 border-current border-t-transparent"
        style={{ width: size, height: size }}
      />
    </span>
  );
}