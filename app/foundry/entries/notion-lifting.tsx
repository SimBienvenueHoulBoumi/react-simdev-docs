// Pourquoi : fiche notion — remonter l'état (spec §9.3), avec un exemple concret.

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Problème : deux composants ont besoin de la même valeur.
// → la valeur monte chez leur ancêtre commun, qui la redistribue.

function TodoApp() {
  const [status, setStatus] = useState("all");   // ← la valeur vit ICI
  return (
    <>
      {/* Fils n°1 : il affiche, on lui passe juste la valeur */}
      <FilterBar status={status} onChange={setStatus} />
      {/* Fils n°2 : il filtre, il reçoit aussi la valeur */}
      <TodoList status={status} />
    </>
  );
}

// Les deux fils ne se parlent JAMAIS : ils parlent au parent.
// C'est tout. Pas de context, pas de store.`;

export const LiftingNotion: Entry = {
  slug: "notion-lifting",
  title: "Remonter l'état",
  family: "notions",
  level: "base",
  summary: "Deux composants partagent une valeur ? Elle monte chez l'ancêtre commun.",
  intents: [
    "partager un état entre composants sans store",
    "structurer les props parent→enfant",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-state"],
  props: ["children", "onChange", "pas de context"],
  Doc: LiftingDoc,
};

function LiftingDoc() {
  return (
    <>
      <Concept>
        <p>
          L'état partagé n'a pas besoin de magie : il remonte chez l'ancêtre
          commun, qui le transmet par les props. Le parent possède, les enfants
          consomment — et un enfant ne modifie JAMAIS la valeur d'un autre
          directement : il appelle le setter reçu.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — remonter-etat" />

      <WhenToUse
        yes={
          <>
            <li>2-3 niveaux de profondeur : des props, c'est plus simple à lire</li>
            <li>Quand le flux est « monte-voit-redescend » classique</li>
          </>
        }
        no={
          <>
            <li>Profondeur de plus de 3 niveaux ou douzaines de props à faire transiter : passez à Context (fiche notion-context, hors v1)</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Un enfant modifie la valeur d'un autre sans que le parent le sache", cause: "L'enfant détient un setState local au lieu de celui du parent — remontez-le." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Bases" },
          { label: "À retenir", value: "Le parent possède, les enfants reçoivent, personne ne se parle directement" },
        ]}
      />
    </>
  );
}