// Pourquoi : fiche DataList — liste générique à quatre états, sans connaissance des données.

import type { Entry } from "../registry";
import {
  AdaptationAxes,
  BenchSection,
  Code,
  Concept,
  DataContract,
  Facts,
  Pitfalls,
  Preview,
  PropsTable,
  WhenToUse,
} from "../sheet";
import dataListSource from "~/components/patterns/data-list.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { DataList } from "~/components/patterns/data-list";
import { EmptyState } from "~/components/patterns/empty-state";
import { Badge } from "~/components/ui/badge";
import { Avatar } from "~/components/ui/avatar";
import { Card, CardContent } from "~/components/ui/card";
import * as ReactScope from "react";

const rowTw = "flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2";

export const DataListEntry: Entry = {
  slug: "data-list",
  title: "DataList",
  family: "donnees",
  level: "intermediaire",
  summary: "Liste générique : chargement, vide, erreur, succès — avec accesseurs et render props.",
  intents: [
    "afficher une liste qui peut être vide",
    "afficher un chargement, une erreur ou une liste vide proprement",
    "réutiliser le même rendu de liste avec des données différentes",
  ],
  source: dataListSource,
  deps: ["components/ui/skeleton.tsx", "lib/cn.ts"],
  uses: ["notion-keys", "notion-props"],
  props: ["items", "getKey", "renderItem", "empty", "error", "isLoading", "className"],
  Doc: DataListDoc,
};

function DataListDoc() {
  return (
    <>
      <Concept>
        <p>
          La liste qui gère les quatre états — chargement, vide, erreur, succès —
          en un seul composant. Elle ne connaît PAS vos données :{" "}
          <code className="font-mono text-[13px]">getKey</code> et{" "}
          <code className="font-mono text-[13px]">renderItem</code> font le pont.
          Le même DataList affiche des tâches, des commits ou des utilisateurs.
        </p>
      </Concept>

      <Preview>
        <div className="flex w-full flex-col gap-3">
          <DataList
            items={[
              { id: "1", title: "Déployer le catalogue", status: "done", owner: "Simbié" },
              { id: "2", title: "Écrire la fiche useEffect", status: "todo", owner: "Ana" },
              { id: "3", title: "Choisir la palette", status: "in_progress", owner: "Léo" },
            ]}
            getKey={(t) => t.id}
            renderItem={(t) => (
              <div className={rowTw}>
                <span className="text-sm font-medium">{t.title}</span>
                <span className="flex items-center gap-2">
                  <Badge variant={t.status === "done" ? "success" : "secondary"}>{t.status}</Badge>
                  <Avatar name={t.owner} size="sm" />
                </span>
              </div>
            )}
            empty={<EmptyState title="Aucune tâche" />}
          />
          <DataList items={[]} getKey={(x: { id: string }) => x.id} renderItem={() => null}
            empty={<EmptyState title="Rien ici" description="Modifiez vos filtres." />} />
        </div>
      </Preview>

      <Code source={dataListSource} filename="components/patterns/data-list.tsx" depsCode={[cnSource]} depsNames={["components/ui/skeleton.tsx", "lib/cn.ts"]} />

      <PropsTable rows={[
        { name: "items", type: "T[] | null | undefined", default: "—", description: "null/undefined = chargement" },
        { name: "getKey", type: "(item, i) => Key", default: "—", description: "La clé de chaque ligne (le vrai piège des clés)" },
        { name: "renderItem", type: "(item, i) => ReactNode", default: "—", description: "Le rendu d'une ligne — VOTRE JSX" },
        { name: "empty", type: "ReactNode", default: "—", description: "Rendu quand items est []" },
        { name: "error", type: "Error | null", default: "—", description: "Affiche l'erreur et masque la liste" },
        { name: "isLoading", type: "boolean", default: "false", description: "Force l'état chargement (squelettes)" },
      ]} />

      <DataContract
        first={{
          name: "Des tâches",
          shape: `{ id: string; title: string; status: string; owner: string }`,
          usage: "getKey prend id, renderItem lit title/status/owner",
        }}
        second={{
          name: "Des commits git",
          shape: `{ sha: string; message: string; author: { name: string } }`,
          usage: "getKey prend sha, renderItem lit message/author.name — zéro changement de composant",
        }}
      />

      <WhenToUse
        yes={
          <>
            <li>Une liste branchée sur un loader, un mock ou une API — le branchement est ailleurs</li>
            <li>Quatre états à gérer sans écrire quatre conditions</li>
          </>
        }
        no={
          <>
            <li>Une liste figée en dur dans le JSX — inutile de passer par un composant</li>
            <li>Des lignes avec sélection complexe : composez au-dessus, pas dedans</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Vos données", description: "Remplacez getKey/renderItem — c'est LE seul endroit qui touche à votre domaine." },
          { title: "État vide", description: "Passez un EmptyState (ou n'importe quel ReactNode) — l'apparence est libre." },
          { title: "Chargement", description: "Le squelette imite vos lignes : passez className pour la forme." },
        ]}
      />

      <BenchSection
        code={`const tasks = [
  { id: "t1", title: "Déployer", status: "done", owner: "Simbié" },
  { id: "t2", title: "Écrire le banc d'essai", status: "todo", owner: "Ana" },
];

return (
  <div className="w-full">
    <DataList
      items={data.tasks ?? tasks}
      getKey={(t) => t.id}
      renderItem={(t) => (
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
          <span className="text-sm font-medium">{t.title}</span>
          <Badge variant={t.status === "done" ? "success" : "secondary"}>
            {t.status}
          </Badge>
        </div>
      )}
      empty={<EmptyState title="Aucune tâche" description="Changez les données JSON à gauche." />}
    />
  </div>
);`}
        data={`{"tasks": []}`}
        scope={{ DataList, EmptyState, Badge, Avatar, Card, CardContent }}
      />

      <Pitfalls
        items={[
          { symptom: "« Each child in a list should have a unique key »", cause: "getKey renvoie des doublons — index ou id non unique. Lisez la fiche notion-keys." },
          { symptom: "La liste affiche des squelettes pour toujours", cause: "items reste null/undefined : le loader ne retourne pas la liste." },
          { symptom: "L'erreur n'apparaît jamais", cause: "error arrive du catch du loader : propagez-la en prop, ne la logguez pas." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · skeleton.tsx + cn.ts · rien d'autre" },
          { label: "Accessibilité", value: "aria-busy sur les squelettes, role=alert sur l'erreur, la liste reste un <ul>." },
          { label: "Poids", value: "~70 lignes (+ skeleton), zéro dépendance" },
        ]}
      />
    </>
  );
}