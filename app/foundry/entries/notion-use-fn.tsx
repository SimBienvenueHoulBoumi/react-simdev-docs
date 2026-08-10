// Pourquoi : fiche notion — use() : lire une promesse ou un contexte sans hook (spec §9.5).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// use() (React 19) lit une promesse OU un contexte — sans être un hook :
// il s'appelle dans des branches, des boucles, des conditions (un hook non).

import { use } from "react";

// 1. use(promise) : la promesse "suspend", le composant attend (voir notion-suspense).
function Profile({ userPromise }: { userPromise: Promise<User> }) {
  const user = use(userPromise);         // pas de useEffect, pas d'état de chargement
  return <h2>{user.name}</h2>;
}

// L'appelant reste dans la maîtrise :
// <Suspense fallback={<ProfileSkeleton />}>
//   <Profile userPromise={fetchUser(id)} />
// </Suspense>

// 2. use(context) : la version conditionnelle de useContext.
function Field({ name }) {
  const form = name === "legacy" ? null : use(FormContext);
  // condition ? OK avec use, interdit avec useContext.
  if (!form) return <input name={name} />;
  return <input name={name} value={form.values[name]} onChange={form.update} />;
}

// ⚠️ pas de boucle infinie : une promesse passée à use() ne se relance
// pas toute seule — reconstruisez la promesse chez l'appelant si besoin.`;

export const UseFnNotion: Entry = {
  slug: "notion-use-fn",
  title: "use() — promesses et context",
  family: "notions",
  level: "avance",
  summary: "Lire une promesse (avec Suspense) ou un contexte, même dans des conditions — là où un hook est interdit.",
  intents: [
    "consommer une promesse sans état de chargement manuel",
    "lire un contexte conditionnellement",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-suspense", "notion-context"],
  props: ["use", "promise", "context"],
  Doc: UseFnDoc,
};

function UseFnDoc() {
  return (
    <>
      <Concept>
        <p>
          <code className="font-mono text-[13px]">use()</code> est le couteau suisse du
          React 19 : il lit une <strong>promesse</strong> (le composant suspend, un
          boundary Suspense s'en charge) ou un <strong>contexte</strong> — et, contrairement
          aux hooks, il supporte les branches et les boucles. C'est la sortie élégante
          des cas tordu s du « rendu qui dépend d'une donnée asynchrone » : pas
          d'useEffect, pas de état de chargement manuel, juste l'attente déclarée.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — use-fn" />

      <WhenToUse
        yes={
          <>
            <li>Une donnée arrivant via une promesse, avec un Suspense qui la couvre</li>
            <li>Lire un contexte dans une condition — interdit avec useContext, permis avec use</li>
            <li>Un composant qui mixe plusieurs promesses concurrentes simplement</li>
          </>
        }
        no={
          <>
            <li>Sans Suspense autour : la suspension doit avoir un fallback quelque part</li>
            <li>En remplacement systématique de useContext : use ne change rien au câblage</li>
            <li>Recréer la promesse à chaque rendu « pour rafraîchir » : resuspend sans fin — faites-le à l'appelant</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "L'écran reste sur le fallback pour toujours", cause: "La promesse rejetée ou jamais résolue : attachez-lui un .catch / un état de rejet, et couvrez le rejet par une Error Boundary (notion-error-boundary)." },
          { symptom: "Nouvelle promesse à chaque rendu → re-suspension perpétuelle", cause: "L'appelant doit stabiliser la promesse (mémo, loader) : ne la construisez pas dans le corps du composant qui use()." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé" },
          { label: "À retenir", value: "Promesse ou contexte, partout où un hook est interdit — avec Suspense au-dessus" },
        ]}
      />
    </>
  );
}