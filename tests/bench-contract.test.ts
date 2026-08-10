// Pourquoi : verrouille le contrat d'exécution du banc d'essai (spec §7).
// Deux formes de code sont acceptées par evaluate() :
// 1. une EXPRESSION de rendu seule (`<X/>`) → wrappée dans `return (...)` ;
// 2. un PROGRAMME avec `return` de premier niveau (`function Demo(){…}\n
//    return <Demo/>`) → exécuté tel quel.
// Oublier cette distinction a produit « Unexpected token 'return' » sur
// 15 fiches sur 16. Le test importe la règle RÉELLE (bench-panel) — pas
// une copie.

import { describe, expect, it } from "vitest";
import { hasTopLevelReturnIn } from "~/components/layout/bench-panel";

function wrapDecided(code: string): string {
  return hasTopLevelReturnIn(code) ? "<tel quel>" : "return (<wrapper>);";
}

describe("banc d'essai — contrat d'exécution", () => {
  it("programme `function Demo(){…}\\nreturn <Demo/>` : non wrappé", () => {
    const code = `function Demo() {\n  const [n] = React.useState(0);\n  return <p>{n}</p>;\n}\nreturn <Demo />;`;
    expect(hasTopLevelReturnIn(code)).toBe(true);
    expect(wrapDecided(code)).toBe("<tel quel>");
  });

  it("forme `return (` (empty-state, skeleton) : non wrappée", () => {
    const code = `return (\n  <EmptyState\n    title={"Aucun résultat".replace("{}", data.query ?? "rien")}\n  />\n);`;
    expect(hasTopLevelReturnIn(code)).toBe(true);
  });

  it("expression seule (button) : wrappée dans un return", () => {
    const code = `<div className="flex gap-2"><Button variant="outline">Annuler</Button></div>`;
    expect(hasTopLevelReturnIn(code)).toBe(false);
    expect(wrapDecided(code)).toBe("return (<wrapper>);");
  });

  it("const data = […] + return : programme, non wrappé (avatar, card)", () => {
    const code = `const data = [\n  { name: "a" },\n];\nreturn (\n  <ul>{data.map((d) => <li key={d.name}>{d.name}</li>)}</ul>\n);`;
    expect(hasTopLevelReturnIn(code)).toBe(true);
  });

  it("un return indenté dans une fonction ne compte pas (arrow seule)", () => {
    const code = `const x = () => {\n  return 1;\n};`;
    expect(hasTopLevelReturnIn(code)).toBe(false);
  });
});