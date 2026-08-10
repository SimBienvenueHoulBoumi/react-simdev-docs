// Pourquoi : fiche notion — polymorphisme `as` (spec §9.5), ce que Button fait.

import type { Entry } from "../registry";
import { BenchSection, Code, Concept, Facts, Pitfalls, Preview, WhenToUse } from "../sheet";
import { Button } from "~/components/ui/button";
import * as ReactScope from "react";

const EXAMPLE = `// Polymorphisme as : le MÊME composant rend un bouton, un lien, ou autre.
// La prop \`as\` change l'élément racine — le contrat de props reste identique.

<Button as="button" onClick={save}>Sauvegarder</Button>
<Button as="a" href="/foundry/button">Lien vers la fiche</Button>

// Pourquoi pas un composant <Link> dédié :
// - la sémantique du DOM reste correcte (a vs button)
// - le style, les états (hover/focus/disabled) restent centralisés
// - le composant reste PUR : il ne connaît pas votre routeur`;

export const PolymorphismNotion: Entry = {
  slug: "notion-polymorphism",
  title: "Polymorphisme `as`",
  family: "notions",
  level: "avance",
  summary: "Un composant, plusieurs éléments racine : la prop as garde le style, la sémantique, et la pureté.",
  intents: [
    "faire qu'un bouton devienne un lien sans perdre le style",
    "garder les composants purs face aux routeurs",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-props", "notion-context"],
  props: ["as"],
  Doc: PolyDoc,
};

function PolyDoc() {
  return (
    <>
      <Concept>
        <p>
          <code className="font-mono text-[13px]">as</code> dit « rends cet élément,
          pas le défaut ». Le composant garde son style, ses variantes, ses états —
          mais la sémantique du DOM suit l'usage : lien pour naviguer, bouton pour
          agir. C'est aussi ce qui garde la banque pure : vos composants n'affichent
          pas de routeur, c'est VOUS qui décidez, au moment d'utiliser.
        </p>
      </Concept>

      <Preview>
        <div className="flex flex-wrap items-center gap-2">
          <Button as="button" onClick={() => {}}>Agir</Button>
          <Button as="a" href="#code">Lien interne</Button>
          <Button as="a" href="https://react.dev" target="_blank" rel="noreferrer">
            Lien externe
          </Button>
        </div>
      </Preview>

      <Code source={EXAMPLE} filename="notion — polymorphisme-as" />

      <WhenToUse
        yes={
          <>
            <li>Même apparence, sémantique différente : bouton vs lien</li>
            <li>Quand le rendu exact dépend du contexte (composant routeur, etc.)</li>
          </>
        }
        no={
          <>
            <li>Deux composants vraiment différents : ne forcez pas le même bouton</li>
            <li>Faire transiter des props spécifiques (to=) : le typage générique devient vite douloureux</li>
          </>
        }
      />

      <BenchSection
        code={`return (
  <div className="flex flex-wrap items-center gap-2">
    <Button as="button" onClick={() => console.log("action")}>
      Bouton
    </Button>
    <Button as="a" href="https://react.dev" target="_blank" rel="noreferrer">
      Lien externe
    </Button>
  </div>
);`}
        data={""}
        scope={{ Button, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Le polymorphisme ne type pas href sur as=\"a\"", cause: "typage générique incomplet de votre composant — la banque couple T extends ElementType et Omit<ComponentPropsWithoutRef<T>>." },
          { symptom: "L'attribut s'applique au mauvais élément", cause: "as change la racine : vérifiez que la prop (ex. href) appartient bien à l'élément rendu." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé, mais Button s'en sert dès le niveau base" },
          { label: "À retenir", value: "1 composant, Le style centralisé, la sémantique à l'usage — et zéro import de routeur" },
        ]}
      />
    </>
  );
}