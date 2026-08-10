// Pourquoi : fiche Toast — notifications éphémères via contexte.

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
import toastTwSource from "~/components/ui/tw/toast.tsx?raw";
import toastMuiSource from "~/components/ui/mui/toast.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { ToastProvider, useToast, type ToastOptions } from "~/components/ui/toast";
import { Button } from "~/components/ui/button";
import * as ReactScope from "react";

export const ToastEntry: Entry = {
  slug: "toast",
  title: "Toast",
  family: "primitives",
  level: "intermediaire",
  summary: "Notification éphémère : useToast() + provider, aria-live inclus, disparition auto.",
  intents: [
    "prévenir que ça a marché (enregistré ✓)",
    "annoncer une erreur sans détourner l'attention",
    "confirmer une action sans page de remerciement",
  ],
  sourceTw: toastTwSource,
  sourceMui: toastMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-context", "notion-custom-hooks"],
  props: ["toast(title, options)", "ToastProvider", "duration", "variant"],
  Doc: ToastDoc,
};

export function ToastDoc() {
  return (
    <>
      <Concept>
        <p>
          Le toast est un système : un <code className="font-mono text-[13px]">ToastProvider</code>{" "}
          à la racine, un hook <code className="font-mono text-[13px]">useToast()</code> n'importe où
          en dessous, et les notifications disparaissent automatiquement.
          C'est le SEUL composant de la banque avec un état global — assumé :
          c'est son rôle. Les toasts sont aria-live, donc lus par les lecteurs d'écran.
        </p>
      </Concept>

      <Preview>
        <ToastProvider>
          <ToastDemo />
        </ToastProvider>
      </Preview>

      <Code
        tw={{ source: toastTwSource, filename: "components/ui/tw/toast.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
        mui={{ source: toastMuiSource, filename: "components/ui/mui/toast.tsx" }}
      />

      <PropsTable rows={[
        { name: "ToastProvider", type: "composant", default: "—", description: "À monter une fois, haut dans l'arbre (root). Rendra la pile en overlay." },
        { name: "useToast()", type: "hook", default: "—", description: "Renvoie { toast } — lève une erreur hors provider" },
        { name: "toast(title, opts)", type: "(string, ToastOptions) => void", default: "—", description: "Affiche une notification" },
        { name: "description", type: "string", default: "—", description: "Ligne secondaire grisée" },
        { name: "variant", type: "\"default\" | \"success\" | \"destructive\"", default: "\"default\"", description: "La couleur de bord" },
        { name: "duration", type: "number (ms)", default: "4000", description: "Temps d'affichage avant disparition" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Confirmer une mutation : « Tâche créée » — après l'action, pas avant</li>
            <li>Erreur non bloquante (la page reste utilisable)</li>
            <li>Un retours éphémère que l'utilisateur n'a pas à re-trouver plus tard</li>
          </>
        }
        no={
          <>
            <li>Une erreur qui bloque : un message dans la page, pas un toast</li>
            <li>Une info à conserver : une alerte persistance, pas un toast</li>
            <li>Plusieurs toasts pour une même action : un seul, bien écrit</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Position", description: "bottom-right par défaut : changez la classe de l'overlay." },
          { title: "Contenu riche", description: "Le p.title/p.description suffisent en v1 ; pour plus, étendez ToastData." },
          { title: "Actions", description: "« Annuler » dans un toast : ajoutez un bouton et appelez onDismiss." },
        ]}
      />

      <BenchSection
        code={`function Demo() {
  const { toast } = useToast();
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => toast("Tâche enregistrée", { variant: "success" })}
      >
        Enregistrer
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast("Échec de l'envoi", {
            description: "Réessayez dans un instant.",
            variant: "destructive",
          })
        }
      >
        Provoquer une erreur
      </Button>
    </div>
  );
}
return <Demo />;`}
        data={""}
        scope={{ useToast, ToastProvider, Button, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "useToast() renvoie une erreur", cause: "Pas de ToastProvider au-dessus : vérifiez qu'il est bien à la racine." },
          { symptom: "Le toast s'affiche pendant une bataille de re-renders", cause: "Appelez toast() dans un handler (après l'action), jamais pendant le rendu." },
          { symptom: "Plusieurs toasts pour une erreur retentée", cause: "Dedupez dans le handler : un toast par action, pas par essai." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "aria-live=\"polite\", role=\"status\" — lu sans interrompre." },
          { label: "Poids", value: "~120 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}


function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast("Tâche enregistrée", { variant: "success" })}>
        Enregistrer
      </Button>
      <Button variant="outline" onClick={() => toast("Modifications non sauvegardées")}>
        Discret
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast("Échec de l'envoi", {
            description: "Réessayez dans un instant.",
            variant: "destructive",
          })
        }
      >
        Erreur
      </Button>
    </div>
  );
}