// Pourquoi : test de fumée de la banque (spec §12, critère d'acceptation 1).
// Chaque composant de components/ compile isolément : on importe chaque
// fichier tel quel — si une dépendance manquait ou un import cassait, le
// module échouerait au chargement. On vérifie de plus que le fichier
// exporte bien le composant attendu (même nom que le fichier).

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = [
  { dir: "app/components/ui/tw", label: "tw" },
  { dir: "app/components/ui/mui", label: "mui" },
];

interface ModuleShape {
  [name: string]: unknown;
}

function componentFiles(dir: string): string[] {
  const abs = join(process.cwd(), dir);
  try {
    return readdirSync(abs)
      .filter((f) => f.endsWith(".tsx"))
      .sort();
  } catch {
    return [];
  }
}

describe("test de fumée — chaque composant compile isolément", () => {
  const cases: { file: string; label: string }[] = [];
  for (const root of ROOTS) {
    for (const file of componentFiles(root.dir)) {
      cases.push({ file: join(root.dir, file), label: `${root.label}/${file}` });
    }
  }

  it.each(cases)("importe et exporte $label", async ({ file }) => {
    // Import dynamique : toute erreur de compilation/dépendance casse ici.
    const mod = (await import(`../${file}`)) as ModuleShape;
    const expected = file.split("/").pop()!.replace(/\.tsx$/, "");
    // Le nom du composant suit le nom du fichier en PascalCase
    // (Button → button.tsx). Exceptions : les systèmes de composants
    // (ToastProvider dans toast.tsx) — préfixe suffit.
    const cap = expected.charAt(0).toUpperCase() + expected.slice(1);
    const exportNames = Object.keys(mod).filter(
      (k) => k !== "default" && typeof mod[k] === "function",
    );
    expect(exportNames.length, `${file} doit exporter au moins un composant`).toBeGreaterThan(0);
    expect(
      exportNames.some((n) => n === cap || n.startsWith(cap)),
      `${file} doit exporter un composant nommé d'après le fichier (${cap})`,
    ).toBe(true);
  });
});