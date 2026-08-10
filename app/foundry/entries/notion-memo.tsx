// Pourquoi : fiche notion — useMemo/useCallback : mesurer avant de mémoriser (spec §9.4).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Mesurer AVANT de mémoriser. useMemo/useCallback coûtent de la comparaison
// à chaque rendu : ils ne paient que si le calcul est coûteux OU si l'identité
// doit être stable (deps d'un useEffect, React.memo).

// ✅ mémoriser un calcul coûteux réellement (liste de 10k items, tri, filtre)
const visible = useMemo(
  () => expensiveFilter(items, query),
  [items, query],
);

// ⚠️ une addition ou un slice ? Inutile, le rendu est déjà rapide.
// const twice = useMemo(() => n * 2, [n]); // ❌ sur-engineering

// ✅ stabiliser un callback passé en prop à un enfant mémorisé
const handleSelect = useCallback((id) => onSelect(id), [onSelect]);

// ❌ ne jamais wrap un <div> entier dans useMemo "au cas où"
// ❌ ne jamais mettre useMemo AUTOUR d'un JSX pour éviter un rendu`;

export const MemoNotion: Entry = {
  slug: "notion-memo",
  title: "useMemo et useCallback",
  family: "notions",
  level: "intermediaire",
  summary: "Mémoriser coûte de la comparaison : calculez d'abord, mémorisez seulement ce qui est mesurablement lent ou doit être stable.",
  intents: [
    "optimiser un rendu lent",
    "savoir quand useCallback est nécessaire",
    "éviter la mémorisation systématique",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-effects", "notion-state"],
  props: ["useMemo", "useCallback", "deps", "React.memo"],
  Doc: MemoDoc,
};

function MemoDoc() {
  return (
    <>
      <Concept>
        <p>
          La mémorisation n'est pas une garantie de performance — c'est un arbitrage :
          elle compare les dépendances à chaque rendu pour éviter de refaire un calcul.
          Elle paie quand le calcul est mesurablement coûteux, ou quand l'identité
          d'une fonction doit être stable (deps d'effets, enfants <code>memo</code>).
          Dans le doute, <strong>mesurez, puis mémorisez</strong>.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — memo-use-callback" />

      <WhenToUse
        yes={
          <>
            <li>Un calcul lisiblement coûteux (filtre/tri sur des milliers d'items), rejoué trop souvent</li>
            <li>Un callback passé à un enfant enveloppé dans <code>React.memo</code> — sinon identité instable = re-rendu</li>
            <li>Une fonction dans les deps d'un useEffect qui ne doit pas re-déclencher l'effet</li>
          </>
        }
        no={
          <>
            <li>Systématiquement, « pour être sûr » : la comparaison coûte plus que le calcul trivial</li>
            <li>Autour d'un JSX : la mémorisation ne court-circuite pas le rendu des enfants</li>
            <li>Remplacer une dérivation simple par de la mémorisation (voir notion-state, état dérivé)</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "L'optimisation ne change rien au profiler", cause: "Le calcul était déjà rapide : la mémorisation ajoute la comparaison, pas de gain. Retirez-la." },
          { symptom: "useCallback avec des deps vides « pour stabiliser »", cause: "La fonction capture des valeurs périmées — la stabilité sans fraîcheur crée des bugs sournois." },
          { symptom: "Un enfant memo qui re-rend quand même", cause: "Une prop objet reconstruite à chaque rendu : mémorisez l'objet, pas seulement le callback." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Intermédiaire" },
          { label: "À retenir", value: "Mesurer avant ; mémoriser les calculs coûteux et les identités nécessaires" },
        ]}
      />
    </>
  );
}