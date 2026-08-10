// Pourquoi : fiche Badge — petit libellé d'état.

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
import badgeTwSource from "~/components/ui/tw/badge.tsx?raw";
import badgeMuiSource from "~/components/ui/mui/badge.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Badge } from "~/components/ui/badge";
import * as ReactScope from "react";

export const BadgeEntry: Entry = {
  slug: "badge",
  title: "Badge",
  family: "primitives",
  level: "base",
  summary: "Petit libellé de statut — 5 variantes de couleur, rien d'autre.",
  intents: [
    "afficher un statut (Terminé, En échec…)",
    "étiqueter une carte avec une catégorie",
  ],
  sourceTw: badgeTwSource,
  sourceMui: badgeMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-props"],
  props: ["variant", "className", "children"],
  Doc: BadgeDoc,
};

export function BadgeDoc() {
  return (
    <>
      <Concept>
        <p>
          Un libellé compact pour marquer un état. Ne clique pas, ne navigue pas :
          il <em>annonce</em>. Les variantes sont des couples de couleurs prêts à l'emploi.
        </p>
      </Concept>

      <Preview>
        <Badge>Défaut</Badge>
        <Badge variant="secondary">Secondaire</Badge>
        <Badge variant="outline">Contour</Badge>
        <Badge variant="destructive">Échec</Badge>
        <Badge variant="success">Terminé</Badge>
      </Preview>

      <Code
    tw={{ source: badgeTwSource, filename: "components/ui/tw/badge.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: badgeMuiSource, filename: "components/ui/mui/badge.tsx" }}
  />

      <PropsTable rows={[
        { name: "variant", type: "\"default\" | \"secondary\" | \"outline\" | \"destructive\" | \"success\"", default: "\"default\"", description: "Le couple de couleurs du badge" },
        { name: "className", type: "string", default: "—", description: "Fusionné après les styles de base" },
        { name: "children", type: "ReactNode", default: "—", description: "Le texte du badge (ou toute autre chose)" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Statut d'une entité : Terminé, À faire, En échec, Bêta…</li>
            <li>Méta-donnée discrète dans une Card ou une liste</li>
          </>
        }
        no={
          <>
            <li>Destructif ou cliquable : un <a href="/foundry/button" className="text-primary underline underline-offset-2">Button</a> (même petit)</li>
            <li>Plus d'un mot long : un vrai paragraphe</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Nouvelles variantes", description: "Ajoutez des entrées dans `variants` — chaque entrée est un couple fond/texte." },
          { title: "Accessibilité de couleur", description: "Ne vous fiez pas qu'à la couleur : accompagnez d'un point ou d'un texte pour les daltoniens." },
        ]}
      />

      <BenchSection
        code={`const data = [
  { id: 1, label: "Terminé", v: "success" },
  { id: 2, label: "En échec", v: "destructive" },
  { id: 3, label: "Brouillon", v: "secondary" },
];

return (
  <div className="flex flex-wrap gap-2">
    {data.map((d) => (
      <Badge key={d.id} variant={d.v}>
        {d.label}
      </Badge>
    ))}
  </div>
);`}
        data={""}
        scope={{ Badge, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Le badge est un bloc, pas en ligne", cause: "`inline-flex` est dans la base : si vous l'avez retiré, remettez-le." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "Texte réel (pas d'icône seule) : lu tel quel." },
          { label: "Poids", value: "~30 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}
