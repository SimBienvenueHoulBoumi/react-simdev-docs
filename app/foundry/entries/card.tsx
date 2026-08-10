// Pourquoi : fiche Card — surface de contenu composable.

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
import cardTwSource from "~/components/ui/tw/card.tsx?raw";
import cardMuiSource from "~/components/ui/mui/card.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Avatar } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import * as ReactScope from "react";

export const CardEntry: Entry = {
  slug: "card",
  title: "Card",
  family: "primitives",
  level: "base",
  summary: "Surface de contenu : header, titre, description, contenu, footer — composable.",
  intents: [
    "regrouper des informations liées",
    "mettre en valeur une entité (tâche, profil…)",
  ],
  sourceTw: cardTwSource,
  sourceMui: cardMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-props", "notion-polymorphism"],
  props: ["className", "children", "ref"],
  Doc: CardDoc,
};

export function CardDoc() {
  return (
    <>
      <Concept>
        <p>
          La carte est une <em>surface</em>, pas un composant magicien : cinq blocs
          composables (Card, CardHeader, CardTitle, CardDescription, CardContent,
          CardFooter) qu'on assemble selon le besoin. Aucune logique — elle isole
          visuellement un groupe d'informations liées.
        </p>
      </Concept>

      <Preview>
        <Card className="w-full max-w-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Avatar name="Simbié" size="sm" />
              <CardTitle>Déployer le catalogue</CardTitle>
              <Badge variant="success" className="ml-auto">En cours</Badge>
            </div>
            <CardDescription>Créée le 01/08 · priorité haute</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Les phases 1-3 en production : tokens, moteur de catalogue, primitives.
            </p>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button size="sm" variant="outline">Détails</Button>
            <Button size="sm">Terminer</Button>
          </CardFooter>
        </Card>
      </Preview>

      <Code
    tw={{ source: cardTwSource, filename: "components/ui/tw/card.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: cardMuiSource, filename: "components/ui/mui/card.tsx" }}
  />

      <PropsTable rows={[
        { name: "Card", type: "div", default: "—", description: "La surface : bord, fond, ombre, rayon" },
        { name: "CardHeader", type: "div", default: "—", description: "En-tête : padding haut, sans fond particulier" },
        { name: "CardTitle", type: "h3", default: "—", description: "Le titre — sémantique h3 automatique" },
        { name: "CardDescription", type: "p", default: "—", description: "Sous-titre grisé" },
        { name: "CardContent", type: "div", default: "—", description: "Le corps" },
        { name: "CardFooter", type: "div", default: "—", description: "Zone d'actions, alignez à droite si besoin" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Détail d'une entité : tâche, profil, résultat</li>
            <li>Une action secondaire groupée avec ses informations</li>
          </>
        }
        no={
          <>
            <li>Un simple paragraphe de texte — une div suffit</li>
            <li>Des cartes cliquables qui naviguent : préférez une liste de liens (voir recette liste)</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Carte cliquable", description: "Enveloppez l'ensemble dans un `<a>` — la sémantique vient de l'extérieur, la carte reste pure." },
          { title: "Grille de cartes", description: "Assemblez avec `grid sm:grid-cols-2` dans votre page, pas dans le composant." },
          { title: "Un seul bloc", description: "Card + CardContent suffisent pour une surface sans titre." },
        ]}
      />

      <BenchSection
        code={`const data = {
  title: "Écrire la fiche useEffect",
  status: "todo",
  owner: "Ana",
  description: "Ses quatre non-usages.",
};

return (
  <Card className="w-full max-w-sm">
    <CardHeader>
      <div className="flex items-center gap-2">
        <Avatar name={data.owner} size="sm" />
        <CardTitle>{data.title}</CardTitle>
      </div>
      <CardDescription>Priorité moyenne</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">{data.description}</p>
    </CardContent>
    <CardFooter className="justify-end">
      <Button size="sm" variant="outline">
        Voir
      </Button>
    </CardFooter>
  </Card>
);`}
        data={""}
        scope={{ Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Avatar, Button, Badge, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Le contenu touche les bords", cause: "CardContent porte `p-6 pt-4` : si vous assemblez sans lui, ajoutez le padding vous-même." },
          { symptom: "Le titre déborde", cause: "Les textes longs : ajoutez `truncate` ou `line-clamp-1` sur le CardTitle." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "Hiérarchie h3 pour CardTitle — respectez l'ordre des titres de votre page." },
          { label: "Poids", value: "~80 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}
