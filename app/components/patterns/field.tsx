// Pourquoi : label + champ + message d'erreur, assemblage cohérent.
// Le « htmlFor » relie automatiquement au champ via le children (cloneElement),
// donc pas besoin de prop id côté appelant si un seul champ est passé.

import { cloneElement, isValidElement, type ReactNode } from "react";

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Le champ enfant (Input, Select…) — reçoit automatiquement id et erreur pas à pas */
  children: ReactNode;
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  const id = useFieldId(label);

  const child = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ id?: string; error?: boolean; "aria-describedby"?: string }>, {
        id,
        error: error ? true : undefined,
        "aria-describedby": error ? `${id}-error` : hint ? `${id}-hint` : undefined,
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive" aria-hidden="true">*</span>}
      </label>
      {child}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

// Pourquoi : id stable par label (sluggé), sans dépendre d'un compteur global.
function useFieldId(label: string): string {
  const slug = label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `field-${slug}`;
}