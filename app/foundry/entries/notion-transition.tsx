// Pourquoi : fiche notion — useTransition/useDeferredValue/useOptimistic : garder l'UI réactive (spec §9.5).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Trois hooks pour un même objectif : l'UI ne bloque pas.

// 1. useTransition : marquer une mise à jour comme "non urgente".
// React préserve la réactivité du reste (frappe, clics) et bascule
// isPending pendant le traitement.
function SearchPage() {
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    setQuery(e.target.value); // urgente : le champ répond
    startTransition(() => {
      setResults(expensiveSearch(query)); // non urgente : l'UI respire
    });
  };

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results data={results} />
    </>
  );
}

// 2. useDeferredValue : garder l'ancienne valeur pendant que la nouvelle
// se calcule — idéal pour filtrer une liste déjà chargée.
const deferred = useDeferredValue(query);
const visible = useMemo(() => filter(list, deferred), [list, deferred]);

// 3. useOptimistic : afficher le résultat avant la confirmation serveur,
// rollback automatique en cas d'échec.
const [optimisticTodos, addTodo] = useOptimistic(todos, (state, todo) => [...state, todo]);`;

export const TransitionNotion: Entry = {
  slug: "notion-transition",
  title: "useTransition, useDeferredValue, useOptimistic",
  family: "notions",
  level: "avance",
  summary: "Trois réponses à l'UI qui bloque : marquer un calcul comme non urgent, garder l'ancienne valeur, afficher l'optimiste avant le serveur.",
  intents: [
    "garder la frappe fluide pendant un gros calcul",
    "afficher le résultat avant la confirmation serveur",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-memo", "notion-state", "notion-effects"],
  props: ["useTransition", "isPending", "startTransition", "useDeferredValue", "useOptimistic"],
  Doc: TransitionDoc,
};

function TransitionDoc() {
  return (
    <>
      <Concept>
        <p>
          Quand une mise à jour coûteuse (filtre d'une grande liste, rendu lourd)
          s'exécute en même temps qu'une frappe, tout se fige. Les trois hooks
          répondent à trois versions du même problème :{" "}
          <code className="font-mono text-[13px]">useTransition</code> déclare une mise à
          jour non urgente — React la traite en tâche de fond et fournit{" "}
          <code className="font-mono text-[13px]">isPending</code> ;{" "}
          <code className="font-mono text-[13px]">useDeferredValue</code> garde l'ancienne
          valeur affichée pendant que la nouvelle se calcule ;{" "}
          <code className="font-mono text-[13px]">useOptimistic</code> affiche le résultat
          immédiat et revient en arrière si le serveur refuse.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — transitions" />

      <WhenToUse
        yes={
          <>
            <li>Un calcul lourd derrière chaque frappe : transition ou deferred, jamais les deux sur la même valeur</li>
            <li>Une action réseau avec confirmation : optimistic pour la sensation, rollback propre en cas d'erreur</li>
            <li><code>isPending</code> pour un indicateur de traitement non bloquant</li>
          </>
        }
        no={
          <>
            <li>Une mise à jour synchrone rapide : la transition ajoute un décalage inutile</li>
            <li>useOptimistic sans gestion d'erreur : le rollback doit exister, sinon l'UI ment</li>
            <li>Réutiliser le même état calqué : chaque hook pour son cas, pas un cocktail</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "La frappe reste saccadée malgré startTransition", cause: "Le calcul urgent s'exécute quand même dans le même rendu : vérifiez que la partie coûteuse est bien DANS la transition." },
          { symptom: "L'optimistic affiche puis « saute » au retour serveur", cause: "La source de vérité doit être réconciliée : comparez les identifiants pour éviter le clignotement." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé" },
          { label: "À retenir", value: "Urgent vs différé vs optimiste : chaque blocage a son hook" },
        ]}
      />
    </>
  );
}