// Pourquoi : verrouille la dérivation du sommaire côté serveur (design §6).
// Le risque est le décalage silencieux : si un bloc de sheet.tsx change d'ancre
// ou de titre sans que BLOCS suive, le sommaire SSR renverrait vers des ancres
// qui n'existent pas — des liens morts que rien ne signalerait.

import { describe, expect, it } from "vitest";
import { sectionsFromDoc } from "~/foundry/toc-sections";
import {
  BenchSection,
  Code,
  Concept,
  Facts,
  Pitfalls,
  SheetSection,
  SheetSubSection,
  WhenToUse,
} from "~/foundry/sheet";
import { entries, entryBySlug } from "~/foundry/registry";

describe("sectionsFromDoc — lecture de l'arbre sans rendu", () => {
  it("relève les blocs du gabarit avec leur ancre fixe", () => {
    const Doc = () => (
      <>
        <Concept>
          <p>texte</p>
        </Concept>
        <Code source="x" filename="y" />
        <Pitfalls items={[]} />
      </>
    );
    expect(sectionsFromDoc(Doc)).toEqual([
      { id: "concept", label: "Le concept en trois lignes", level: 2 },
      { id: "code", label: "Code", level: 2 },
      { id: "pieges", label: "Pièges", level: 2 },
    ]);
  });

  it("relève les sections libres avec leur id et leur titre", () => {
    const Doc = () => (
      <>
        <SheetSection id="par-ou-commencer" title="Par où commencer">
          <p>parcours</p>
        </SheetSection>
        <SheetSubSection id="detail" title="Un détail">
          <p>sous-section</p>
        </SheetSubSection>
      </>
    );
    expect(sectionsFromDoc(Doc)).toEqual([
      { id: "par-ou-commencer", label: "Par où commencer", level: 2 },
      { id: "detail", label: "Un détail", level: 3 },
    ]);
  });

  it("ne descend pas dans le contenu d'un bloc", () => {
    // Un <p id="..."> dans un Concept n'est pas une section du sommaire.
    const Doc = () => (
      <Concept>
        <p id="piege">ce paragraphe ne doit pas apparaître</p>
      </Concept>
    );
    expect(sectionsFromDoc(Doc)).toEqual([
      { id: "concept", label: "Le concept en trois lignes", level: 2 },
    ]);
  });

  it("renvoie une liste vide plutôt que de lever si le Doc n'est pas lisible", () => {
    const Doc = () => {
      throw new Error("Doc qui appelle un hook hors rendu");
    };
    expect(sectionsFromDoc(Doc)).toEqual([]);
  });

  it("garde l'ordre de déclaration", () => {
    const Doc = () => (
      <>
        <Concept>
          <p>a</p>
        </Concept>
        <BenchSection code="" data="" scope={{}} />
        <WhenToUse yes={<li>o</li>} no={<li>n</li>} />
        <Facts facts={[]} />
      </>
    );
    expect(sectionsFromDoc(Doc).map((s) => s.id)).toEqual([
      "concept",
      "banc-essai",
      "quand-utiliser",
      "prerequis",
    ]);
  });
});

describe("sectionsFromDoc — sur le catalogue réel", () => {
  it("produit un sommaire non vide pour chaque fiche", () => {
    const vides = entries
      .filter((e) => sectionsFromDoc(e.Doc).length === 0)
      .map((e) => e.slug);
    expect(vides).toEqual([]);
  });

  it("commence toujours par le concept (ordre du gabarit §6.6)", () => {
    for (const entry of entries) {
      expect(sectionsFromDoc(entry.Doc)[0]?.id).toBe("concept");
    }
  });

  it("place « Par où commencer » juste après le concept sur la fiche hooks", () => {
    const hooks = entryBySlug.get("notion-hooks")!;
    expect(sectionsFromDoc(hooks.Doc).slice(0, 2).map((s) => s.id)).toEqual([
      "concept",
      "par-ou-commencer",
    ]);
  });
});
