// Pourquoi : label + champ + message d'erreur, assemblage cohérent.
//
// Field est le SEUL propriétaire du message d'erreur. Les champs n'exposent que
// `invalid` (l'état visuel) : un message, un id, un câblage aria — donc jamais
// deux messages concurrents pour une même erreur.
//
// L'id vient de useId() et non du label : deux <Field label="Priorité"> sur une
// même page produisaient deux id identiques, et le <label htmlFor> désignait
// alors le mauvais champ.
//
// Le clone complète l'enfant, il ne l'écrase pas : un id ou un aria-describedby
// posé par l'appelant survit.

import { cloneElement, isValidElement, useId, type ReactNode } from "react";

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Le champ enfant (Input, Select…) — reçoit id, invalid et le câblage aria */
  children: ReactNode;
}

/** Les props que Field sait poser sur son champ enfant. */
interface FieldChildProps {
  id?: string;
  invalid?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}

export function Field({ label, hint, error, required, children }: FieldProps) {
  const uid = useId();
  const fieldId = `${uid}-field`;
  const errorId = `${uid}-error`;
  const hintId = `${uid}-hint`;

  // Un seul message à la fois : l'aide s'efface dès qu'une erreur est présente.
  const describedBy = error ? errorId : hint ? hintId : undefined;

  const isElement = isValidElement<FieldChildProps>(children);
  // Si l'appelant a posé son propre id, le label doit pointer dessus.
  const labelFor = isElement ? (children.props.id ?? fieldId) : fieldId;

  const child = isElement
    ? cloneElement(children, {
        id: children.props.id ?? fieldId,
        invalid: error ? true : children.props.invalid,
        "aria-describedby":
          [children.props["aria-describedby"], describedBy].filter(Boolean).join(" ") ||
          undefined,
        // L'astérisque est aria-hidden : sans ceci, l'obligation ne serait
        // annoncée nulle part par un lecteur d'écran.
        "aria-required": required || children.props["aria-required"],
      })
    : children;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={labelFor} className="text-sm font-medium">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {child}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
