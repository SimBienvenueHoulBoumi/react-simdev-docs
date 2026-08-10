// Pourquoi : fiche Dialog — dialogue accessible avec piège de focus.

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
import dialogTwSource from "~/components/ui/tw/dialog.tsx?raw";
import dialogMuiSource from "~/components/ui/mui/dialog.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Dialog } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import * as ReactScope from "react";

export const DialogEntry: Entry = {
  slug: "dialog",
  title: "Dialog",
  family: "primitives",
  level: "intermediaire",
  summary: "Boîte de dialogue modale : piège de focus, Échap, aria-modal — prête à copier.",
  intents: [
    "demander confirmation avant de supprimer",
    "ouvrir un formulaire rapide par-dessus la page",
  ],
  sourceTw: dialogTwSource,
  sourceMui: dialogMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-state", "notion-portals"],
  props: ["open", "onClose", "title", "children", "className", "ref"],
  errors: ["Cannot update a component while rendering a different component"],
  Doc: DialogDoc,
};

export function DialogDoc() {
  return (
    <>
      <Concept>
        <p>
          La modale accessible : focus piégé dans le panneau, Échap pour fermer,
          fond cliquable, aria-modal. C'est un composant <em>contrôlé</em> —
          <code className="font-mono text-[13px]">open</code> et{" "}
          <code className="font-mono text-[13px]">onClose</code> viennent de vous.
          Le contenu (formulaire, confirmation) reste votre affaire.
        </p>
      </Concept>

      <Preview>
        <DialogDemo />
      </Preview>

      <Code
    tw={{ source: dialogTwSource, filename: "components/ui/tw/dialog.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: dialogMuiSource, filename: "components/ui/mui/dialog.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
  />

      <PropsTable rows={[
        { name: "open", type: "boolean", default: "false", description: "Le dialogue est-il visible ? (contrôlé)" },
        { name: "onClose", type: "() => void", default: "—", description: "Appelé à la fermeture : Échap, fond, bouton — à vous de re-setté open à false" },
        { name: "title", type: "string", default: "—", description: "Titre : sert de aria-label ET d'en-tête" },
        { name: "children", type: "ReactNode", default: "—", description: "Le contenu : formulaire, texte de confirmation…" },
        { name: "className", type: "string", default: "—", description: "Taille/position du panneau (max-w-md par défaut)" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Confirmation destructive — le cas le plus utile</li>
            <li>Un formulaire court qui ne mérite pas sa page</li>
            <li>Toute interruption qui exige l'attention</li>
          </>
        }
        no={
          <>
            <li>Simple info : un toast suffit</li>
            <li>Navigation entre vues : une vraie route</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Largeur", description: "className=\"max-w-lg\" sur le panneau — la structure est en max-w-md par défaut." },
          { title: "Titre", description: "Le panneau porte aria-label={title} : ne le videz jamais." },
          { title: "Fermeture", description: "Gérez onClose côté appelant : « Annuler », « Confirmer » et Échap doivent TOUS finir par onClose()." },
        ]}
      />

      <BenchSection
        code={`function Demo() {
  const [open, setOpen] = ReactScope.useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} variant="destructive">
        Supprimer la tâche
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Confirmer la suppression"
      >
        <p className="text-sm text-muted-foreground">
          Cette action est irréversible.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setOpen(false);
            }}
          >
            Supprimer
          </Button>
        </div>
      </Dialog>
    </>
  );
}
return <Demo />;`}
        data={""}
        scope={{ Dialog, Button, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Le focus sort du dialogue au Tab", cause: "Le trap ne gère que focusin : si un élément est monté après l'ouverture, il faut re-scan — la version actuelle scanne à l'ouverture." },
          { symptom: "Le dialogue reste ouvert au retour navigateur", cause: "L'état open est local : synchronisez-le avec l'URL (voir recette confirmation)." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "Clavier : Tab piégé, Échap ferme. aria-modal=\"true\". Fond en aria-hidden par le voile." },
          { label: "Poids", value: "~110 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}


function DialogDemo() {
  const [open, setOpen] = ReactScope.useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Supprimer la tâche
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Confirmer la suppression">
        <p className="text-sm text-muted-foreground">
          Cette action est irréversible. La tâche disparaîtra de la liste.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              setOpen(false);
            }}
          >
            Supprimer
          </Button>
        </div>
      </Dialog>
    </>
  );
}