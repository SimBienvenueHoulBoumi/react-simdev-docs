// Pourquoi : fiche notion — useEffect et ses quatre non-usages (spec §9.4).
// La fiche la plus importante de la banque : la plupart des bugs React
// viennent d'un useEffect qui n'aurait pas dû exister.

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";
import { Badge } from "~/components/ui/badge";

const EXAMPLE = `// Les quatre non-usages de useEffect (spec §9.4) :
// 1. Données serveur → loader, PAS useEffect
// 2. Valeur dérivable → calcul direct, PAS useEffect
// 3. Événement → handler, PAS useEffect
// 4. Synchronisation d'état → état dérivé, PAS useEffect

// 🔴 1. Mauvaise idée : fetch dans l'effet
useEffect(() => { fetchTasks().then(setTasks) }, []);

// ✅ Correct : le loader (React Router) fait ce travail
export async function loader() {
  return { tasks: await api.listTasks() };
}

// 🔴 2. Mauvaise idée : dériver dans l'effet
const [done, setDone] = useState(false);
useEffect(() => { setDone(items.every((i) => i.done)) }, [items]);

// ✅ Correct : calcul au render
const done = items.every((i) => i.done);

// 🔴 3. Mauvaise idée : action utilisateur dans l'effet
useEffect(() => { if (open) fetchDetail() }, [open]);

// ✅ Correct : un handler
<button onClick={() => fetchDetail()}>Voir le détail</button>`;

export const EffectsNotion: Entry = {
  slug: "notion-effects",
  title: "useEffect",
  family: "notions",
  level: "intermediaire",
  summary: "Le bon usage : synchroniser avec l'extérieur. Les quatre non-usages qui créent les bugs.",
  intents: [
    "savoir quand utiliser useEffect (et quand surtout pas)",
    "éviter les boucles infinies et les fetch dans les effets",
  ],
  source: EXAMPLE,
  deps: [],
  uses: [],
  props: ["useEffect"],
  errors: ["Too many re-renders", "Cannot update a component while rendering a different component"],
  Doc: EffectsDoc,
};

function EffectsDoc() {
  return (
    <>
      <Concept>
        <p>
          useEffect synchronise votre composant avec le monde extérieur : timers,
          abonnements, mesures DOM, API natives. C'est TOUT. Quatre usages sont
          des anti-patterns qui produisent les bugs les plus classiques de React —
          la règle : si vous pouvez le calculer ou le déclencher ailleurs, faites-le ailleurs.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — useeffect" />

      <WhenToUse
        yes={
          <>
            <li>S'abonner (setInterval, écouteurs DOM/WS) — et se désabonner dans le cleanup</li>
            <li>Mesurer le DOM (largeur, position) après le rendu</li>
            <li>Synchroniser AVEC un système externe : API navigateur, lib, serveur (rare)</li>
          </>
        }
        no={
          <>
            <li><Badge variant="destructive" className="mr-1">Non 1</Badge> Données serveur : le loader / la requête fait le travail</li>
            <li><Badge variant="destructive" className="mr-1">Non 2</Badge> Dérivation : calculez au render (useMemo seulement si coûteux)</li>
            <li><Badge variant="destructive" className="mr-1">Non 3</Badge> Événement : un handler onClick, pas un effet qui surveille</li>
            <li><Badge variant="destructive" className="mr-1">Non 4</Badge> Synchronisation d'états entre eux : un seul état source + dérivation</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "« Too many re-renders »", cause: "setState appelé depuis un effet sans dépendance contrôlée — le non-usage n°4." },
          { symptom: "Fetch en double : une fois par montage, une fois au strict mode", cause: "Effet de fetch sans cleanup ni gestion — utilisez le loader ou un client dédié." },
          { symptom: "L'effet ne tourne « qu'une fois » mais court après des données périmées", cause: "Dépendances incomplètes — le lint exhaustive-deps est votre ami, pas votre ennemi." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Intermédiaire — la fiche la plus lue de la banque" },
          { label: "À retenir", value: "Calculez au render · déclenchez dans un handler · synchronisez avec l'extérieur dans l'effet" },
        ]}
      />
    </>
  );
}