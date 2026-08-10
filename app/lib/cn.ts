// Pourquoi : fusionner des classes Tailwind conditionnellement, sans dépendance.
// Accepte : "px-2", ["px-2", cond && "py-1"], { "px-2": cond }, null, undefined.

export type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

function flatten(value: ClassValue, out: string[]): void {
  if (!value) return;
  if (Array.isArray(value)) {
    for (const item of value) flatten(item, out);
  } else if (typeof value === "object") {
    for (const [key, on] of Object.entries(value)) {
      if (on) out.push(key);
    }
  } else {
    out.push(String(value));
  }
}

/**
 * Merge de classes conditionnelles, style clsx.
 * Utilisé partout dans la banque pour respecter le contrat de props `className`.
 */
export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) flatten(input, out);
  return out.join(" ");
}