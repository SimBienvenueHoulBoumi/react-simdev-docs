// Pourquoi : fiche notion — état local et remontée d'état (spec §9.3).

import type { Entry } from "../registry";
import { BenchSection, Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";
import { Button } from "~/components/ui/button";
import * as ReactScope from "react";

const EXAMPLE = `// L'état vit DANS le composant qui l'affiche,
// ou remonte chez l'ancêtre qui en a besoin.
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount((c) => c + 1)}>{count}</button>;
}

// Remonter l'état : le parent possède la valeur.
function TodoApp() {
  const [todos, setTodos] = useState([]);
  // setTodos passe vers le bas → le formulaire ajoute sans savoir le reste
  return <TodoForm onAdd={(t) => setTodos((prev) => [...prev, t])} />;
}`;

export const StateNotion: Entry = {
  slug: "notion-state",
  title: "État local",
  family: "notions",
  level: "base",
  summary: "useState au plus près de l'affichage ; remonter quand deux composants partagent la valeur.",
  intents: [
    "comprendre où mettre l'état",
    "remonter l'état entre composants",
  ],
  source: EXAMPLE,
  deps: [],
  uses: [],
  props: ["useState", "defaultValue", "onChange"],
  Doc: StateDoc,
};

function StateDoc() {
  return (
    <>
      <Concept>
        <p>
          Une règle en deux temps : l'état commence <em>au plus près</em> de ce qui
          l'affiche — et monte d'un cran dès que deux composants ont besoin de la
          même valeur. Rien de plus, rien de moins. Pas de store global par défaut.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — etat-local" />

      <WhenToUse
        yes={
          <>
            <li>Un état qui n'intéresse qu'un composant : il VIT dans ce composant</li>
            <li>Deux composants partagent une valeur : elle monte chez leur ancêtre commun</li>
          </>
        }
        no={
          <>
            <li>Des données serveur : elles arrivent par le loader, pas par useState (voir notion useEffect)</li>
            <li>Une valeur dérivable d'autres états : calculez-la, ne stockez pas (état dérivé)</li>
          </>
        }
      />

      <BenchSection
        code={`function Demo() {
  const [name, setName] = ReactScope.useState("");
  return (
    <div className="flex flex-col gap-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Votre nom…"
        className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
      />
      <p className="text-sm text-muted-foreground">
        Bonjour {name.trim() || "…"} — l'état vit ici, contrôlé
      </p>
    </div>
  );
}
return <Demo />;`}
        data={""}
        scope={{ Button, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Deux composants désynchronisés sur la même valeur", cause: "Chacun a son useState — remontez la valeur chez l'ancêtre commun." },
          { symptom: "setState dans render → « Too many re-renders »", cause: "Mutable ou appelé pendant le rendu : déclenchez les changements dans les handlers, jamais dans le corps." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Bases" },
          { label: "À retenir", value: "Au plus près d'abord ; remonter quand nécessaire ; jamais de setState dans le render" },
        ]}
      />
    </>
  );
}