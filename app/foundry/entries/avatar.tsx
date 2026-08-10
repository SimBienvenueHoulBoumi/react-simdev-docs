// Pourquoi : fiche Avatar — image de profil avec repli sur initiales.

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
import avatarTwSource from "~/components/ui/tw/avatar.tsx?raw";
import avatarMuiSource from "~/components/ui/mui/avatar.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Avatar } from "~/components/ui/avatar";
import * as ReactScope from "react";

export const AvatarEntry: Entry = {
  slug: "avatar",
  title: "Avatar",
  family: "primitives",
  level: "base",
  summary: "Image de profil ; sans image, il affiche les initiales du nom.",
  intents: [
    "afficher l'avatar d'un utilisateur avec un repli",
    "des initiales quand il n'y a pas de photo",
  ],
  sourceTw: avatarTwSource,
  sourceMui: avatarMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-props"],
  props: ["imgSrc", "name", "size", "className", "ref"],
  Doc: AvatarDoc,
};

export function AvatarDoc() {
  return (
    <>
      <Concept>
        <p>
          Un cercle qui affiche la photo — et si la photo manque ou casse, les
          initiales du nom. Un seul composant, deux états. Il ne charge rien lui-même :
          l'URL arrive en prop.
        </p>
      </Concept>

      <Preview>
        <Avatar name="Simbié Kouassi" size="sm" />
        <Avatar name="Ana Durand" />
        <Avatar name="Léo Martin" size="lg" />
        <Avatar
          name="Utilisateur réel"
          imgSrc="https://i.pravatar.cc/96?img=12"
        />
      </Preview>

      <Code
    tw={{ source: avatarTwSource, filename: "components/ui/tw/avatar.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: avatarMuiSource, filename: "components/ui/mui/avatar.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
  />

      <PropsTable rows={[
        { name: "name", type: "string", default: "—", description: "Nom complet : sert aux initiales ET au aria-label" },
        { name: "imgSrc", type: "string", default: "—", description: "URL de la photo ; si elle échoue, repli sur initiales" },
        { name: "size", type: "\"sm\" | \"md\" | \"lg\"", default: "\"md\"", description: "Diamètre + taille de police" },
        { name: "className", type: "string", default: "—", description: "Fusionné après les styles de base" },
        { name: "ref", type: "Ref<HTMLSpanElement>", default: "—", description: "React 19 : ref en prop" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Afficher une personne avec un repli gracieux : liste, header, commentaire</li>
            <li>Groupe d'avatars superposés — les initiales restent lisibles</li>
          </>
        }
        no={
          <>
            <li>Une image quelconque non circulaire : un élément <code className="font-mono text-[13px]">img</code> avec classes</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Initiales", description: "La règle « 1-2 premiers mots, majuscules » est dans le composant — adaptez-la (initiales inversées ?)." },
          { title: "Groupes", description: "Enveloppez dans un flex avec `-space-x-2` et un ring couleur fond." },
        ]}
      />

      <BenchSection
        code={`const data = [
  { name: "Simbié K.", src: null },
  { name: "Ana D.", src: "https://i.pravatar.cc/96?img=47" },
  { name: "Léo M.", src: "https://i.pravatar.cc/96?img=11" },
];

return (
  <div className="flex items-center -space-x-2">
    {data.map((d) => (
      <Avatar
        key={d.name}
        name={d.name}
        imgSrc={d.src}
        className="ring-2 ring-background"
      />
    ))}
  </div>
);`}
        data={""}
        scope={{ Avatar, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Image cassée affichée à la place des initiales", cause: "Le repli se fait à l'événement onError : vérifiez que `imgSrc` est bien facultatif." },
          { symptom: "Initiales vides", cause: "`name` vide → relevez-le à l'appel, le composant ne devine pas." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "role=\"img\" + aria-label = le nom complet." },
          { label: "Poids", value: "~45 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}
