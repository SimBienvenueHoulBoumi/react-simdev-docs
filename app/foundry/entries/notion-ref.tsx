// Pourquoi : fiche notion — useRef : valeurs stables hors rendu, accès aux nœuds DOM (spec §9.4).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// useRef : deux usages, une même idée — une valeur qui ne déclenche PAS le rendu.

// 1. Accéder à un nœud DOM (focus, mesure, scroll) — React 19 : ref en prop.
function SearchBox() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusIt = () => inputRef.current?.focus();

  return (
    <>
      <input ref={inputRef} placeholder="Recherche…" />
      <Button onClick={focusIt}>Focus</Button>
    </>
  );
}

// 2. Compter sans re-rendre (penser "instance", pas "état affiché").
function RenderCount() {
  const renders = useRef(0);
  renders.current += 1; // muter une ref pendant le rendu : OK pour un compteur
  return <span>{renders.current} rendus</span>;
}

// ❌ ne jamais utiliser une ref pour provoquer un rendu :
// muter ref.current n'affiche rien — c'est le rôle de useState.`;

export const RefNotion: Entry = {
  slug: "notion-ref",
  title: "useRef et accès au DOM",
  family: "notions",
  level: "intermediaire",
  summary: "Une valeur stable qui ne déclenche pas le rendu : nœuds DOM en React 19 (ref en prop), compteurs, poignées d'instance.",
  intents: [
    "mettre le focus ou mesurer un nœud",
    "stocker une valeur sans re-rendre",
    "savoir quand une ref N'est pas la bonne réponse",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-state", "notion-events"],
  props: ["useRef", "ref", "current", "forwardRef"],
  Doc: RefDoc,
};

function RefDoc() {
  return (
    <>
      <Concept>
        <p>
          Une ref, c'est une boîte stable : elle survit aux rendus et sa mutation{" "}
          <em>ne déclenche pas</em> de rendu. Deux usages canoniques : toucher un nœud
          DOM (focus, mesure, scroll — en React 19 la <code>ref</code> se passe comme
          une prop normale, plus besoin de <code>forwardRef</code>) et conserver une
          valeur « d'instance » qui n'a pas vocation à s'afficher. Si vous devez
          faire réafficher quelque chose — c'est <code>useState</code>.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — use-ref" />

      <WhenToUse
        yes={
          <>
            <li>Focus, sélection, mesure de position ou scroll sur un élément</li>
            <li>Un compteur de rendus, un id stable, une valeur technique en interne</li>
            <li>Interopérabilité : une lib imperative (editeur, carrousel) qui expose une API</li>
          </>
        }
        no={
          <>
            <li>Faire réafficher l'UI : c'est le travail de useState, pas d'une mutation de ref</li>
            <li>Partager une valeur entre plusieurs components « pour éviter les props » — remonter l'état (notion-state)</li>
            <li>Lire <code>ref.current</code> pendant le rendu pour afficher une valeur — résultat imprévisible</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "L'UI ne bouge pas après avoir muté ref.current", cause: "Normal : une ref ne déclenche aucun rendu. Si ça doit s'afficher, c'est un useState." },
          { symptom: "ref.current est null au premier rendu", cause: "Le nœud n'existe pas encore à ce moment-là : lisez la ref dans un handler ou un effect." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Intermédiaire" },
          { label: "À retenir", value: "Stable, sans rendu, pour le DOM et l'instance — jamais pour afficher" },
        ]}
      />
    </>
  );
}