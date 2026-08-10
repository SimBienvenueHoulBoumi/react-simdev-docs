// Pourquoi : fiche notion — Error Boundaries : la seule vraie protection contre le crash (spec §9.4).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Une Error Boundary est un composant de CLASSE qui rattrape les erreurs
// de rendu de ses enfants. Le hook useErrorBoundary (React 19) situe
// l'erreur dans le même arbre — sans classe.

import { useErrorBoundary } from "react";

function Feature({ id }: { id: string }) {
  const { showBoundary, resetBoundary } = useErrorBoundary();

  if (id === "boom") {
    showBoundary(new Error("Échec du chargement de la section"));
  }

  return <SectionContent id={id} />;
}

// Côté parent, une boundary par zone fragile — pas une seule pour tout l'app :
function Page() {
  return (
    <>
      <Header />
      <ErrorBoundary key={routeKey} fallback={<SectionFallback onRetry={reset} />}>
        <Feature id={current} />
      </ErrorBoundary>
      <Footer />
    </>
  );
}

// ❌ les boundaries n'attrapent PAS : les erreurs d'événements (handlers),
// les promesses rejetées, l'async hors rendu — gérées par ailleurs.`;

export const ErrorBoundaryNotion: Entry = {
  slug: "notion-error-boundary",
  title: "Error Boundaries",
  family: "notions",
  level: "intermediaire",
  summary: "Isoler les zones fragiles : le crash d'une section n'emporte pas la page. React 19 : useErrorBoundary + remount par key.",
  intents: [
    "empêcher un crash de zone de tuer toute la page",
    "remettre à zéro la boundary après un échec",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-conditional"],
  props: ["fallback", "key", "showBoundary", "resetBoundary"],
  Doc: ErrorBoundaryDoc,
};

function ErrorBoundaryDoc() {
  return (
    <>
      <Concept>
        <p>
          Sans boundary, la moindre erreur de rendu démonte l'arbre entier — écran
          blanc. La boundary délimite une zone : l'erreur s'y arrête, le reste de la
          page continue de vivre. On en place <strong>une par zone fragile</strong>{" "}
          (liste distante, widget d'édition), chacune avec son fallback et son retry.
          En React 19, <code>useErrorBoundary</code> rapproche l'erreur du composant
          fautif, et changer la <code>key</code> remonte une boundary proprement.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — error-boundary" />

      <WhenToUse
        yes={
          <>
            <li>Autour de chaque zone qui peut crasher (données malformées, lib instable)</li>
            <li>Un fallback utile : message + bouton « Réessayer », pas un écran vide</li>
            <li>Relancer via <code>key</code> : remonter la boundary efface l'état fautif</li>
          </>
        }
        no={
          <>
            <li>Une seule boundary enveloppant toute l'application « au cas où » — elle cache tout</li>
            <li>Attendre d'une boundary qu'elle rattrape un handler de clic ou une promesse : elle ne le peut pas</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "L'erreur d'un clic fait toujours tomber l'app", cause: "Les boundaries n'interceptent pas les erreurs d'événements : gérez la promesse (try/catch, .catch) et affichez l'état d'erreur." },
          { symptom: "« Réessayer » ne change rien", cause: "La boundary garde l'état fautif : changez la key pour forcer le remontage." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Intermédiaire" },
          { label: "À retenir", value: "Une boundary par zone fragile ; key pour réessayer ; jamais une seule pour tout" },
        ]}
      />
    </>
  );
}