// Pourquoi : fiche notion — useReducer : un état à transitions explicites, ou jamais (spec §9.5).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// useReducer est utile quand l'état a des TRANSITIONS nommées —
// pas pour remplacer trois useState "par élégance".

type State = {
  items: Task[];
  status: "idle" | "loading" | "error";
  error: string | null;
};

type Action =
  | { type: "load/start" }
  | { type: "load/success"; items: Task[] }
  | { type: "load/failure"; error: string }
  | { type: "item/toggle"; id: number };

// Le reducer est PURE : même état + même action → même résultat.
// Il décrit les transitions, il n'appelle ni fetch ni setState.
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "load/start":
      return { ...state, status: "loading", error: null };
    case "load/success":
      return { ...state, status: "idle", items: action.items };
    case "load/failure":
      return { ...state, status: "error", error: action.error };
    case "item/toggle":
      return {
        ...state,
        items: state.items.map((t) =>
          t.id === action.id ? { ...t, done: !t.done } : t,
        ),
      };
  }
}

// Légende : "load/start" — domaine/verbe, un seul fichier d'actions.
// Combined with Context (notion-reducer + Context), l'état voyage
// sans prop-drilling : voir la fiche notion-reducer.

function TaskBoard() {
  const [state, dispatch] = useReducer(reducer, initialState);
  // every setState devient dispatch({ type: "…" }) — traçable, testable.
  return <TaskList tasks={state.items} onToggle={(id) => dispatch({ type: "item/toggle", id })} />;
}`;

export const ReducerNotion: Entry = {
  slug: "notion-reducer",
  title: "useReducer + Context",
  family: "notions",
  level: "avance",
  summary: "Des transitions nommées et pures pour un état complexe ; Context pour le distribuer sans prop-drilling. Jamais pour remplacer trois useState.",
  intents: [
    "structurer un état à plusieurs transitions",
    "éviter le prop-drilling d'un état partagé",
    "savoir quand garder useState",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-state", "notion-context"],
  props: ["useReducer", "dispatch", "Context", "reducer", "initialState"],
  Doc: ReducerDoc,
};

function ReducerDoc() {
  return (
    <>
      <Concept>
        <p>
          <code className="font-mono text-[13px]">useReducer</code> change le vocabulaire :
          on ne <em>set</em> plus une valeur, on <em>dispatch</em> une intention
          (« load/success », « item/toggle »). Chaque transition est une case d'un{" "}
          <strong>reducer pur</strong> — donc testable sans DOM et traçable. On l'utilise
          quand l'état a des transitions nommées et souvent exclusives (statuts, listes
          riches), et on le couple à un <strong>Context</strong> quand la valeur et le{" "}
          <code className="font-mono text-[13px]">dispatch</code> doivent voyager loin sans
          traverser dix props.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — reducer" />

      <WhenToUse
        yes={
          <>
            <li>Un état machine : statuts exclusifs (idle/loading/error), invariants</li>
            <li>Des actions nommées partagées par plusieurs composants (undo, réinitialisation)</li>
            <li>La même transition dans N endroits : le reducer la centralise à un seul endroit</li>
            <li>Couplé à Context quand l'état doit voyager sans prop-drilling</li>
          </>
        }
        no={
          <>
            <li>Deux ou trois useState indépendants : le reducer ajoute du cérémonial sans gain</li>
            <li>Un reducer qui fait des effets de bord (fetch, log) : il doit rester pur</li>
            <li>Un état local à un composant : useState, point final</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Deux actions qui mutent le même état sans coordination", cause: "Le reducer est le bon endroit pour centraliser — sinon le dédoublement est inévitable." },
          { symptom: "Le reducer re-fetch à chaque dispatch", cause: "Les effets de bord n'ont pas leur place dans un reducer : déclenchez-les dans les handlers ou un effect, puis dispatch le résultat." },
          { symptom: "dispatch dans le corps du rendu", cause: "Comme setState : jamais pendant le rendu — « Too many re-renders ». Déclenchez dans les événements." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé" },
          { label: "À retenir", value: "Transitions nommées + reducer pur ; Context pour la distribution ; jamais par habitude" },
        ]}
      />
    </>
  );
}