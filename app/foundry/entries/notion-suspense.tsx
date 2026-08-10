// Pourquoi : fiche notion — Suspense et streaming : laisser React attendre, rendre ce qui est prêt (spec §9.5).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Suspense : un composant peut dire "pas encore prêt" au lieu de crasher.
// Le boundary affiche le fallback le temps que le contenu arrive.

import { Suspense, lazy } from "react";

// lazy : le code du composant n'arrive qu'à l'usage (split du bundle).
const HeavyChart = lazy(() => import("./HeavyChart"));

function Dashboard() {
  return (
    <>
      <h1>Tableau de bord</h1>
      <Suspense fallback={<SkeletonChart />}>
        <HeavyChart data={revenue} />
      </Suspense>
    </>
  );
}

// Server-side (SSR streaming) : la page part au client avec sa coquille,
// les sections en Suspense se remplissent quand leurs données arrivent.
// Suspense < Suspense : chaque zone garde son propre fallback et sa
// propre vitesse — une section lente n'attend pas les autres.

// ❌ Suspense n'est pas un loader "au cas où" : pas de fallback sans
// mécanisme d'attente (lazy, data fetching, streaming).`;

export const SuspenseNotion: Entry = {
  slug: "notion-suspense",
  title: "Suspense et streaming",
  family: "notions",
  level: "avance",
  summary: "Le rendu attend sans crasher : fallback par zone, lazy pour le code, streaming SSR pour les données. Jamais de fallback sans mécanisme d'attente.",
  intents: [
    "découper le bundle avec lazy",
    "servir une page SSR progressive",
    "donner à chaque zone son propre état d'attente",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-conditional"],
  props: ["Suspense", "lazy", "fallback", "streaming", "boundary"],
  Doc: SuspenseDoc,
};

function SuspenseDoc() {
  return (
    <>
      <Concept>
        <p>
          Sans Suspense, un composant qui n'a pas ses données n'a que deux
          options : crasher ou gérer son loader à la main. Avec Suspense, il
          « suspend » — React affiche le fallback le plus proche et reprend le
          rendu quand c'est prêt. Deux usages concrets : <code>lazy</code> pour
          le découpage du code, et le <strong>streaming SSR</strong> où la coquille
          de la page part immédiatement pendant que chaque zone en Suspense se
          remplit à son rythme.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — suspense" />

      <WhenToUse
        yes={
          <>
            <li>Un gros composant rarement ouvert : <code>lazy</code> + Suspense</li>
            <li>SSR : des zones indépendantes qui peuvent arriver progressivement</li>
            <li>Des skeletons par zone plutôt qu'un loader global : chaque section vit sa vie</li>
          </>
        }
        no={
          <>
            <li>Un fallback sans rien qui suspend : Suspense ne fait rien tout seul</li>
            <li>Une seule boundary autour de toute la page : un écran skeleton global, pas une progression</li>
            <li>Envelopper du code synchrone « au cas où » — aucun gain, juste une couche</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Le fallback ne s'affiche jamais", cause: "Aucun composant sous la boundary ne suspend (pas de lazy, pas de source de données suspensible) : la boundary est inerte." },
          { symptom: "La page entière attend la section la plus lente", cause: "Une seule boundary englobante : imbriquez des boundaries par zone pour une progression indépendante." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé" },
          { label: "À retenir", value: "Fallback par zone ; lazy pour le code ; chaque section à son rythme" },
        ]}
      />
    </>
  );
}