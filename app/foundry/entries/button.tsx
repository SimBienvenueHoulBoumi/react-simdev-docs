// Pourquoi : fiche Button — le modèle de toute fiche du catalogue.
// Ordre des blocs (spec §6.6) : concept, aperçu, code, contrat, quand, axes, banc, pièges, faits.

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
import buttonTwSource from "~/components/ui/tw/button.tsx?raw";
import buttonMuiSource from "~/components/ui/mui/button.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Button } from "~/components/ui/button";
import * as ReactScope from "react";
import { Badge } from "~/components/ui/badge";
import { useState } from "react";

export const ButtonEntry: Entry = {
  slug: "button",
  title: "Button",
  family: "primitives",
  level: "base",
  summary: "Bouton polyvalent : variantes, tailles, état de chargement, polymorphisme as.",
  intents: [
    "un bouton avec des variantes et des tailles",
    "empêcher un double-clic (état de chargement)",
    "un bouton qui affiche un spinner pendant l'envoi",
    "un lien stylé comme un bouton",
  ],
  sourceTw: buttonTwSource,
  sourceMui: buttonMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-polymorphism", "notion-props"],
  props: ["variant", "size", "isLoading", "className", "as", "ref", "disabled"],
  Doc: ButtonDoc,
};

export function ButtonDoc() {
  return (
    <>
      <Concept>
        <p>
          Le bouton de la banque. Variantes, tailles, état de chargement intégré
          (anti double-clic) et polymorphisme <code className="font-mono text-[13px]">as</code>.
          Il ne fait rien d'autre : pas de navigation, pas d'appel réseau — il annonce
          une intention et déclenche un <em>onClick</em>.
        </p>
      </Concept>

      <Preview>
        <Button>Primaire</Button>
        <Button variant="secondary">Secondaire</Button>
        <Button variant="outline">Contour</Button>
        <Button variant="ghost">Fantôme</Button>
        <Button variant="destructive">Danger</Button>
        <Button size="sm">Petit</Button>
        <Button size="lg">Grand</Button>
        <Button isLoading>Envoi…</Button>
        <Button disabled>Désactivé</Button>
        <Button as="a" href="#code">Lien stylé</Button>
      </Preview>

      <Code
    tw={{ source: buttonTwSource, filename: "components/ui/tw/button.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: buttonMuiSource, filename: "components/ui/mui/button.tsx" }}
  />

      <SheetPropsTable />

      <WhenToUse
        yes={
          <>
            <li>Déclencher une action explicite (soumettre, supprimer, ouvrir…)</li>
            <li>Afficher un état de chargement pendant une mutation — le <code>isLoading</code> désactive le bouton : anti double-clic gratuit</li>
            <li>Transformer un lien en bouton via <code>as="a"</code> — garde la sémantique du lien</li>
          </>
        }
        no={
          <>
            <li>Pour naviguer en interne : préférez un composant lien du routeur avec <code>as</code> (voir fiche polymorphisme)</li>
            <li>Pour un clic purement décoratif / toggle d'état : un <code>&lt;button&gt;</code> seul suffit</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Variantes", description: "Ajoutez des entrées dans `variants` — chaque entrée est un groupe de classes Tailwind." },
          { title: "Tailles", description: "Faites de même dans `sizes` ; le contrat `size` reste le même pour tous les composants." },
          { title: "Comportement", description: "Le bouton ne connaît pas votre logique : branchez votre `onClick` et vos routes depuis l'extérieur." },
        ]}
      />

      <BenchSection
        code={`<div className="flex flex-wrap items-center gap-2">
  <Button variant="primary" size="md">Enregistrer</Button>
  <Button variant="outline" isLoading>
    Vérification…
  </Button>
  <Button variant="destructive" size="sm">
    Supprimer
  </Button>
</div>`}
        data={""}
        scope={{ Button, useState: ReactScope.useState, Badge }}
      />

      <Pitfalls
        items={[
          { symptom: "Double-clic envoie deux requêtes", cause: "Bouton sans `isLoading` pendant la mutation — passez `isLoading` dès l'envoi." },
          { symptom: "Le `disabled` ne bloque pas le clic sur un lien `as=\"a\"`", cause: "Les liens n'ont pas d'attribut disabled natif : vérifiez `aria-disabled` et bloquez dans le handler." },
          { symptom: "Le bouton perd sa hauteur quand on met une icône", cause: "Les tailles fixent `h-9` etc. : l'icône doit être en `size-4`, pas plus grande." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts — rien d'autre" },
          { label: "Accessibilité", value: "Focus visible natif (ring). `disabled` bloque le focus. Spinner en `aria-hidden`." },
          { label: "Poids", value: "~50 lignes, zéro dépendance" },
          { label: "Copie", value: "Collez `button.tsx` + `lib/cn.ts`, ça compile" },
        ]}
      />
    </>
  );
}

// Le composant Doc est référencé séparément pour être stable dans le registry

function SheetPropsTable() {
  return (
    <PropsTable rows={[
      { name: "variant", type: "\"primary\" | \"secondary\" | \"outline\" | \"ghost\" | \"destructive\"", default: "\"primary\"", description: "Le rendu visuel du bouton" },
      { name: "size", type: "\"sm\" | \"md\" | \"lg\" | \"icon\"", default: "\"md\"", description: "La taille : hauteur + espacement" },
      { name: "isLoading", type: "boolean", default: "false", description: "Affiche un spinner et désactive — anti double-clic" },
      { name: "as", type: "ElementType", default: "\"button\"", description: "Élément rendu : a, button, ou composant" },
      { name: "className", type: "string", default: "—", description: "Classes supplémentaires, fusionnées après les variantes" },
      { name: "ref", type: "Ref", default: "—", description: "Ref passée en prop (React 19, plus de forwardRef)" },
    ]} />
  );
}