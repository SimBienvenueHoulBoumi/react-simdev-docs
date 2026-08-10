// Pourquoi : fiche notion — l'inventaire des hooks use*** de React et ce que
// chacun renvoie. Le banc d'essai trace chaque hook : le panneau « État des
// hooks » montre sa valeur à chaque rendu et son historique (spec §9.4).

import type { Entry } from "../registry";
import * as ReactScope from "react";
import { BenchSection, Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const PATTERNS = `// Le répertoire des hooks use*** — ce que chacun REND :

// État et rendu :
const [value, setValue] = useState(initial);        // [valeur, setter]
const [state, dispatch] = useReducer(reduce, init); // [état, dispatch]
const ctx = useContext(Ctx);                        // la valeur du Context
const ref = useRef(initial);                        // { current } — stable, sans rendu

// Mémoïsation :
const v = useMemo(() => compute(a), [a]);           // valeur calculée
const fn = useCallback(cb, [a]);                    // fonction stable

// Cycle de vie — effets de bord :
useEffect(fn, deps);        // après le rendu (le plus courant)
useLayoutEffect(fn, deps);  // avant le paint (mesures DOM)

// Identité et concurrence :
const id = useId();                                 // identifiant stable
const [pending, start] = useTransition();           // [en attente, démarreur]
const deferred = useDeferredValue(value);           // valeur reportée
useSyncExternalStore(sub, snap);                    // store externe re-rendu

// Actions et formulaires :
const [state, action, pending] = useActionState(action, init);
const [optimistic, setOptimistic] = useOptimistic(value, merge);
const resource = use(promiseOrContext);             // promesse / Context`;

export const HooksNotion: Entry = {
  slug: "notion-hooks",
  title: "Les hooks use***",
  family: "notions",
  level: "avance",
  summary: "L'inventaire des hooks — chacun rend une valeur précise ; le banc affiche leur état et leur historique à chaque rendu.",
  intents: [
    "retrouver le hook dont on a besoin",
    "voir ce que chaque hook renvoie",
  ],
  source: PATTERNS,
  deps: [],
  uses: ["notion-state", "notion-effects", "notion-reducer", "notion-ref"],
  props: ["useState", "useReducer", "useMemo", "useCallback", "useTransition", "useActionState"],
  Doc: HooksDoc,
};

const DEMO = `function Controls() {
  const [label, setLabel] = ReactScope.useState("compteur");
  const [state, dispatch] = ReactScope.useReducer(
    (s, a) => (a === "+" ? s + 1 : s - 1),
    0,
  );
  const square = ReactScope.useMemo(() => state * state, [state]);

  return (
    <div className="flex items-center gap-3">
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="libellé…"
        className="rounded border border-input bg-background px-2 py-1 text-sm"
      />
      <button
        onClick={() => dispatch("−")}
        className="rounded border border-border bg-background px-2 py-0.5 text-sm"
      >
        −
      </button>
      <span>
        {label} : {state} (carré {square})
      </span>
      <button
        onClick={() => dispatch("+")}
        className="rounded border border-border bg-background px-2 py-0.5 text-sm"
      >
        +
      </button>
    </div>
  );
}

return <Controls />;`;

function HooksDoc() {
  return (
    <>
      <Concept>
        <p>
          Chaque hook <code className="font-mono text-[13px]">use***</code> a un contrat
          de retour précis : <code className="font-mono text-[13px]">[valeur, setter]</code> pour{" "}
          <code className="font-mono text-[13px]">useState</code>,{" "}
          une valeur calculée pour <code className="font-mono text-[13px]">useMemo</code>,{" "}
          un objet <code className="font-mono text-[13px]">{"{ current }"}</code> pour{" "}
          <code className="font-mono text-[13px]">useRef</code>. Le panneau{" "}
          <strong>« État des hooks »</strong> sous le rendu du banc trace chaque appel :
          sa valeur courante et la suite des valeurs successives — l'état des données
          à chaque moment.
        </p>
      </Concept>

      <Code source={PATTERNS} filename="notion — inventaire-des-hooks" />

      <BenchSection
        code={DEMO}
        data={""}
        scope={{ ReactScope }}
      />

      <WhenToUse
        yes={
          <>
            <li>Le hook par défaut : <code>useState</code> — une valeur + son setter</li>
            <li><code>useReducer</code> : des transitions nommées sur un état complexe</li>
            <li><code>useMemo</code> / <code>useCallback</code> : calcul coûteux ou stabilité de référence</li>
            <li><code>useRef</code> : une valeur stable sans re-rendu (DOM, compteurs)</li>
          </>
        }
        no={
          <>
            <li>Lancer <code>useMemo</code> pour du calcul trivial : le cache coûte plus que le calcul</li>
            <li>Remplacer trois <code>useState</code> par un <code>useReducer</code> « par élégance »</li>
            <li>Muté <code>ref.current</code> pour afficher quelque chose : c'est l'affaire de <code>useState</code></li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Un hook apparaît sous un autre nom à l'écran du panneau", cause: "Les hooks sont numérotés par ordre d'appel dans le rendu (useState[0], useState[1]…) ; deux rendus successifs prolongent l'historique du même hook." },
          { symptom: "L'historique du panneau semble repartir de zéro", cause: "Le bouton Réinit. vide le tracé — et chaque exécution (⌘↵) repart d'un tracé vierge." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé" },
          { label: "Hooks tracés", value: "tous les use*** du code du banc, valeur + historique" },
          { label: "À retenir", value: "Un hook = une valeur de retour précise ; le banc la montre à chaque rendu" },
        ]}
      />
    </>
  );
}