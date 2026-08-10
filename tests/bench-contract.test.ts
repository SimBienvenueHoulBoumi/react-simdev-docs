// Pourquoi : verrouille le contrat d'exécution du banc d'essai (spec §7) —
// les deux formes de code acceptées ne doivent plus jamais régresser :
// 1. expression de rendu seule (`<X/>`) → wrappée dans un return ;
// 2. programme avec `return` de premier niveau (`function Demo(){…}\n
//    return <Demo/>`) → exécuté tel quel (le wrapper cassait ça :
//    « Unexpected token 'return' »).
// Le contrat vaut pour `evaluate` : on réplique sa logique ici, sans DOM.

import { describe, expect, it } from "vitest";

/** Copie de la règle de bench-panel : détecte la forme de code. */
function hasTopLevelReturn(code: string): boolean {
  return /^return\b/m.test(code.trimStart());
}

function wrapIfNeeded(code: string): string {
  const compiled = `return JSX(${JSON.stringify(code)})`;
  return hasTopLevelReturn(code) ? compiled : `return (${compiled});`;
}

describe("banc d'essai — contrat d'exécution", () => {
  it("n'enveloppe pas un programme qui a déjà un return de premier niveau", () => {
    const code = `function Demo() {\n  const [n] = React.useState(0);\n  return <p>{n}</p>;\n}\nreturn <Demo />;`;
    expect(hasTopLevelReturn(code)).toBe(true);
    expect(wrapIfNeeded(code).startsWith("return (return")).toBe(false);
    const compiled = wrapIfNeeded(code);
    expect(compiled).toContain("render(<Demo />)");
  });

  it("n'enveloppe pas `return (<X/>)` (forme empty-state)", () => {
    const code = `return (\n  <EmptyState\n    title={"Aucun résultat".replace("{}", data.query ?? "rien")}\n  />\n);`;
    expect(hasTopLevelReturn(code)).toBe(true);
    expect(wrapIfNeeded(code).startsWith("return (return")).toBe(false);
  });

  it("enveloppe une expression de rendu seule (forme button)", () => {
    const code = `<div className="flex gap-2"><Button variant="outline">Annuler</Button></div>`;
    expect(hasTopLevelReturn(code)).toBe(false);
    expect(wrapIfNeeded(code)).toBe(`return (return JSX(${JSON.stringify(code)}));`);
  });

  it("un return indenté (dans une fonction) n'est pas un return de premier niveau", () => {
    const code = `function Demo() {\n  return <p>bonjour</p>;\n}\nreturn <Demo />;`;
    // Le return en colonne 0 existe bien — l'indenté seul ne suffirait pas.
    expect(hasTopLevelReturn("const x = () => {\n  return 1;\n};")).toBe(false);
    expect(hasTopLevelReturn(code)).toBe(true);
  });
});