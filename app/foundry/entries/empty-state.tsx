// Pourquoi : fiche EmptyState — l'état vide comme état d'interface, pas comme absence.

import type { Entry } from "../registry";
import {
  AdaptationAxes,
  BenchSection,
  Code,
  Concept,
  Facts,
  Pitfalls,
  Preview,
  PropsTable,
  WhenToUse,
} from "../sheet";
import emptyStateSource from "~/components/patterns/empty-state.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { EmptyState } from "~/components/patterns/empty-state";
import { Button } from "~/components/ui/button";
import * as ReactScope from "react";

export const EmptyStateEntry: Entry = {
  slug: "empty-state",
  title: "EmptyState",
  family: "donnees",
  level: "base",
  summary: "Message central quand une liste est vide — avec ou sans action.",
  intents: [
    "afficher un message quand il n'y a rien",
    "inviter à créer la première donnée",
  ],
  source: emptyStateSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-props"],
  props: ["title", "description", "action", "className"],
  Doc: EmptyStateDoc,
};

function EmptyStateDoc() {
  return (
    <>
      <Concept>
        <p>
          L'état vide est un état à part entière : il explique, rassure et propose
          une action. Un vide muet fait croire à un bug ; un « Rien ici »
          bien écrit fait continuer.
        </p>
      </Concept>

      <Preview>
        <EmptyState
          title="Aucune tâche en cours"
          description="Créez la première pour démarrer."
          action={<Button size="sm">Nouvelle tâche</Button>}
        />
      </Preview>

      <Code source={emptyStateSource} filename="components/patterns/empty-state.tsx" depsCode={[cnSource]} depsNames={["lib/cn.ts"]} />

      <PropsTable rows={[
        { name: "title", type: "string", default: "—", description: "La phrase d'accroche, sans « erreur »" },
        { name: "description", type: "string", default: "—", description: "Le contexte : quoi faire ?" },
        { name: "action", type: "ReactNode", default: "—", description: "Le bouton d'action (optionnel)" },
        { name: "className", type: "string", default: "—", description: "Largeur/padding supplémentaires" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Après un filtre qui ne matche rien</li>
            <li>Au premier chargement d'un espace vide (onboarding)</li>
          </>
        }
        no={
          <>
            <li>Pendant le chargement : un squelette, pas un message</li>
            <li>En cas d'erreur : un message d'erreur (voir recette-api-error), pas un vide</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Icône", description: "Ajoutez un SVG décoratif au-dessus du titre — gardez-le en aria-hidden." },
          { title: "Action", description: "Le bouton vient en prop : il navigue ou soumet selon VOTRE contexte." },
          { title: "Style", description: "border-dashed et fond muted par défaut — changez les classes du cn()." },
        ]}
      />

      <BenchSection
        code={`return (
  <EmptyState
    title="Aucun résultat pour « ${"{}"}${"{}"} »".replace("${"{}"}${"{}"}", data.query ?? "rien")
    description="Essayez un autre terme ou réinitialisez les filtres."
    action={<Button size="sm" variant="outline">Réinitialiser</Button>}
  />
);`}
        data={`{"query": "bug"}`}
        scope={{ EmptyState, Button, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Le vide apparaît pendant le chargement", cause: "Vous rendez l'empty même quand items est null — le DataList ne le fait pas, faites pareil." },
          { symptom: "« Aucune tâche » sans action", cause: "Un état vide sans action est un cul-de-sac : ajoutez au moins un lien." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "Texte réel, pas d'icône seule. L'action est un vrai bouton." },
          { label: "Poids", value: "~30 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}