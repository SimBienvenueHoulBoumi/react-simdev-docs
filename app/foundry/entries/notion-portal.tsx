// Pourquoi : fiche notion — Portals : rendre ailleurs dans le DOM, réagir ici (spec §9.4).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// createPortal : le JSX appartient au composant (état, events, context),
// mais le rendu atterrit ailleurs — en général à la fin de <body>.

import { createPortal } from "react-dom";

function Toast({ message }: { message: string }) {
  return createPortal(
    <div role="status" className="fixed bottom-4 right-4 rounded-md bg-foreground px-4 py-2 text-sm text-background shadow-lg">
      {message}
    </div>,
    document.body,
  );
}

// Pourquoi : un positionnement fixe doit échapper aux ancêtres
// transformés (transform: translate crée un nouveau contexte de
// positionnement) et ne pas être découpé par un overflow: hidden.
// Le portal sort le nœud de cette hiérarchie : le fixed redevient
// relatif à la fenêtre.`;

// Les toasts surlignent le point : affichés en plein flow, un ancêtre
// overflow les découpe ; portés sous body, ils flottent au-dessus.

export const PortalNotion: Entry = {
  slug: "notion-portal",
  title: "Portals",
  family: "notions",
  level: "intermediaire",
  summary: "Rendre un nœud ailleurs dans le DOM (typiquement body) : toasts, modales, tooltips libérés des contraintes CSS des ancêtres.",
  intents: [
    "sortir un élément d'un ancêtre overflow/transform",
    "monter un toast ou un menu hors de la hiérarchie visuelle",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-children"],
  props: ["createPortal", "container", "document.body"],
  Doc: PortalDoc,
};

function PortalDoc() {
  return (
    <>
      <Concept>
        <p>
          Un portal découple deux choses : <em>où le composant vit</em> (état, events,
          contexte — inchangés) et <em>où il se rend</em> (souvent à la fin de{" "}
          <code className="font-mono text-[13px]">body</code>). C'est la réponse aux
          overlays coincés : un <code>overflow: hidden</code> ou un{" "}
          <code>transform</code> sur un ancêtre découpe le fixed ou crée un contexte
          de positionnement — le portal échappe à tout ça. Le composant reste
          déclaratif et piloté par l'état, le DOM suit.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — portals" />

      <WhenToUse
        yes={
          <>
            <li>Toast, modal, tooltip, menu : tout overlay qui doit passer au-dessus de l'UI</li>
            <li>Un fixed qui refuse de se positionner par rapport à la fenêtre (ancêtre transform)</li>
            <li>Un rendu dans une zone précise du DOM (head, side panel d'une extension)</li>
          </>
        }
        no={
          <>
            <li>Un simple élément flow positionné dans la page : le portal ajoute de la complexité sans gain</li>
            <li>Remplacer la composition children : le portal complète, il ne remplace pas</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Le overlay est découpé ou mal positionné dans un ancêtre overflow/transform", cause: "Le style fixed est relatif à l'ancêtre transformé : passez par createPortal vers document.body." },
          { symptom: "Le tooltip disparaît au survol du contenu", cause: "Sans portal, le contenu hors du parent casse la logique hover/mouseenter : la sortie vers body résout aussi ce cas." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Intermédiaire" },
          { label: "À retenir", value: "Le composant vit ici, le nœud se rend ailleurs — pour libérer les overlays" },
        ]}
      />
    </>
  );
}