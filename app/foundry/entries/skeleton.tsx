// Pourquoi : fiche Skeleton — placeholder de chargement.

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
import skeletonTwSource from "~/components/ui/tw/skeleton.tsx?raw";
import skeletonMuiSource from "~/components/ui/mui/skeleton.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Skeleton } from "~/components/ui/skeleton";
import * as ReactScope from "react";

export const SkeletonEntry: Entry = {
  slug: "skeleton",
  title: "Skeleton",
  family: "primitives",
  level: "base",
  summary: "Placeholder gris qui pulse pendant le chargement — l'état « chargement » rendu.",
  intents: [
    "afficher un squelette pendant un chargement",
    "éviter le saut de mise en page au chargement",
  ],
  sourceTw: skeletonTwSource,
  sourceMui: skeletonMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-state", "notion-effects"],
  props: ["className", "ref"],
  Doc: SkeletonDoc,
};

export function SkeletonDoc() {
  return (
    <>
      <Concept>
        <p>
          Un rectangle gris animé qui marque une zone en train de charger.
          L'idée : reproduire la FORM E de vos données (ligne, avatar, carte)
          pour que la mise en page ne saute pas quand le vrai contenu arrive.
          Rendu : aria-hidden, il ne gêne pas les lecteurs d'écran.
        </p>
      </Concept>

      <Preview>
        <div className="flex w-full max-w-72 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex flex-1 flex-col gap-1">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-2 w-1/3" />
            </div>
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </Preview>

      <Code
    tw={{ source: skeletonTwSource, filename: "components/ui/tw/skeleton.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: skeletonMuiSource, filename: "components/ui/mui/skeleton.tsx" }}
  />

      <PropsTable rows={[
        { name: "className", type: "string", default: "—", description: "La FORME du squelette : h-*, w-*, rounded-*" },
        { name: "ref", type: "Ref<HTMLDivElement>", default: "—", description: "React 19 : ref en prop" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Chargement initial d'une liste ou d'un détail</li>
            <li>Chaque zone qui change de taille au chargement (évite le CLS)</li>
          </>
        }
        no={
          <>
            <li>Chargement sous 300 ms : un contenu instantané ou rien, le flash de squelette gêne</li>
            <li>Le chargement d'un bouton : <a href="/foundry/button" className="text-primary underline underline-offset-2">isLoading</a> fait mieux</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Forme", description: "Tout est dans className : cercle (rounded-full), ligne (h-3), carte (h-24 rounded-lg)." },
          { title: "Rythme", description: "animate-pulse par défaut ; remplacez par animate-ping pour des « blobs »." },
          { title: "Composition", description: "Assemblez des squelettes pour imiter VOTRE layout — voir l'aperçu." },
        ]}
      />

      <BenchSection
        code={`return (
  <div className="flex w-full max-w-72 flex-col gap-2">
    <div className="flex items-center gap-2">
      <Skeleton className="size-8 rounded-full" />
      <div className="flex flex-1 flex-col gap-1">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-2 w-1/3" />
      </div>
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <Skeleton className="h-9 w-24 rounded-md" />
  </div>
);`}
        data={""}
        scope={{ Skeleton, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "La page saute quand les données arrivent", cause: "Le squelette n'imite pas le layout final : mêmes tailles, mêmes marges." },
          { symptom: "Skeleton sous 200 ms = flash gênant", cause: "Le loader est trop rapide : gardez l'état précédent, ne montrez le squelette qu'après une latence." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "aria-hidden + la zone portée se balise elle-même (aria-busy ideallement)." },
          { label: "Poids", value: "~20 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}
