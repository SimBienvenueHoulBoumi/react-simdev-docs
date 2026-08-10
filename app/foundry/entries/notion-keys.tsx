// Pourquoi : fiche notion — les clés : pourquoi c'est LE piège (spec §9.3).

import type { Entry } from "../registry";
import {
  BenchSection,
  Code,
  Concept,
  Facts,
  Pitfalls,
  Preview,
  WhenToUse,
} from "../sheet";

const EXAMPLE = `// Le piège des clés : la CLÉ est une identité, pas un index.
function TodoList({ todos }: { todos: Todo[] }) {
  return (
    <ul>
      {todos.map((todo) => (
        // ✅ Identité stable de l'élément
        <li key={todo.id}>{todo.title}</li>
      ))}
    </ul>
  );
}

// 🔴 Faux : l'index change quand la liste bouge → mauvais état focalisé,
// mauvais re-rendu, checkbox qui « saute ».
{todos.map((todo, i) => (
  <li key={i}>{todo.title}</li>
))}`;

export const KeysNotion: Entry = {
  slug: "notion-keys",
  title: "Listes et clés",
  family: "notions",
  level: "base",
  summary: "Pourquoi key={index} casse silencieusement votre UI — et quoi mettre à la place.",
  intents: [
    "comprendre le vrai piège des clés de liste",
    "corriger « unique key prop »",
  ],
  source: EXAMPLE,
  deps: [],
  uses: [],
  props: ["key"],
  errors: ["Each child in a list should have a unique \"key\" prop"],
  Doc: KeysDoc,
};

function KeysDoc() {
  return (
    <>
      <Concept>
        <p>
          Quand vous rendez une liste, React a besoin d'une <em>identité stable</em>{" "}
          par élément pour savoir qui a changé. L'index ne bouge pas quand la liste
          est statique — mais dès qu'on insère, supprime ou réordonne, il ment :
          les états locaux (focus, checkbox, input) se retrouvent sur la mauvaise ligne.
        </p>
      </Concept>

      <Preview>
        <div className="w-full">
          {[
            { id: "a", label: "Clé = id stable ✓" },
            { id: "b", label: "Ordonnancement conservé" },
            { id: "c", label: "Aucun glitch de focus" },
          ].map((item) => (
            <div key={item.id} className="border-b border-border py-1 text-sm">
              {item.label}
            </div>
          ))}
        </div>
      </Preview>

      <Code source={EXAMPLE} filename="notion — listes-et-cles" />

      <WhenToUse
        yes={
          <>
            <li>Toujours : une valeur unique, stable, issue des données (id, slug, clé composée)</li>
            <li>Une clé composée quand aucune id : {`\`\${a.id}-\${b.id}\``} (concaténation de deux identifiants)</li>
          </>
        }
        no={
          <>
            <li>L'index — sauf liste figée, jamais triée, jamais filtrée, jamais éditée</li>
            <li>Une valeur qui change à chaque render (Math.random()) — re-crée tout à chaque fois</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "« Each child in a list should have a unique key prop » en console", cause: "Clé absente ou dupliquée — assurez une identité unique par ligne." },
          { symptom: "Ultra subtil : l'input d'une ligne garde la valeur d'une autre quand on réordonne", cause: "key={index} : React réutilise le composant au mauvais endroit. La clé id règle tout." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Bases — mais le bug se cache au niveau avancé" },
          { label: "À retenir", value: "key = identité des données, pas position dans le DOM" },
        ]}
      />
    </>
  );
}