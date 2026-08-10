// Pourquoi : fiche notion — événements : la logique vit dans les handlers (spec §9.3).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";
import { Button } from "~/components/ui/button";
import * as ReactScope from "react";

const EXAMPLE = `// Un événement se branche dans un handler — jamais dans le corps du composant.
function Counter() {
  const [count, setCount] = ReactScope.useState(0);

  // ✅ handler : le clic déclenche, l'état change là, pas ailleurs
  const handleClick = () => setCount((c) => c + 1);

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleClick}>+1</Button>
      <span className="font-mono text-sm">{count}</span>
    </div>
  );
}

// ❌ jamais : setState pendant le rendu
// const [n, setN] = useState(0);
// setN(n + 1);  // → "Too many re-renders", boucle infinie`;

export const EventsNotion: Entry = {
  slug: "notion-events",
  title: "Événements",
  family: "notions",
  level: "base",
  summary: "onClick, onSubmit, onChange : la logique se branche dans des handlers, jamais dans le corps du rendu.",
  intents: [
    "brancher un clic ou une soumission",
    "comprendre pourquoi un setState pendant le rendu boucle à l'infini",
    "savoir lire les handlers de la banque",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-state", "notion-props"],
  props: ["onClick", "onChange", "onSubmit", "event", "preventDefault"],
  Doc: EventsDoc,
};

function EventsDoc() {
  return (
    <>
      <Concept>
        <p>
          React ne réagit pas au temps — il réagit aux événements. Clic, frappe,
          soumission, focus : la logique se branche dans des handlers{" "}
          <code className="font-mono text-[13px]">onClick</code>,{" "}
          <code className="font-mono text-[13px]">onSubmit</code>… L'état ne change{" "}
          <em>jamais</em> dans le corps du composant : un setState appelé pendant
          le rendu redéclenche le rendu, qui rappelle setState — boucle infinie.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — evenements" />

      <WhenToUse
        yes={
          <>
            <li>Les handlers comme seuls endroits qui modifient l'état</li>
            <li>Un formulaire : <code>onSubmit</code> + <code>preventDefault()</code>, jamais un onClick sur le bouton</li>
          </>
        }
        no={
          <>
            <li>Appeler setState dans le corps du composant ou dans un <code>useEffect</code> sans raison (voir notion useEffect)</li>
            <li>Attacher un listener global par événement — préférez les props <code>on*</code></li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "« Too many re-renders »", cause: "Un setState appelé pendant le rendu (corps du composant ou équivalent). Déplacez-le dans un handler." },
          { symptom: "Le clic ne fait rien sur un <button> dans un <form>", cause: "Le type par défaut est submit : ajoutez type=\"button\" sauf si vous soumettez réellement." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Bases" },
          { label: "À retenir", value: "La logique vit dans les handlers ; setState jamais dans le rendu" },
        ]}
      />
    </>
  );
}