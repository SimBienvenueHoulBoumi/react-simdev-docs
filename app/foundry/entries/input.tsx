// Pourquoi : fiche Input — champ de saisie avec message d'erreur intégré.

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
import inputTwSource from "~/components/ui/tw/input.tsx?raw";
import inputMuiSource from "~/components/ui/mui/input.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import * as ReactScope from "react";

export const InputEntry: Entry = {
  slug: "input",
  title: "Input",
  family: "primitives",
  level: "base",
  summary: "Champ de saisie simple, avec message d'erreur intégré. Logique contrôlée par vous.",
  intents: [
    "saisir du texte dans un formulaire",
    "montrer une erreur sous un champ",
    "un champ de recherche",
  ],
  sourceTw: inputTwSource,
  sourceMui: inputMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-forms", "notion-state"],
  props: ["error", "type", "placeholder", "value", "onChange", "disabled", "ref"],
  Doc: InputDoc,
};

export function InputDoc() {
  return (
    <>
      <Concept>
        <p>
          Le champ de texte standard. Il ne fait que de l'affichage : la valeur et
          le <em>onChange</em> viennent de vous (contrôlé) — ou alors il est non
          contrôlé avec <code className="font-mono text-[13px]">defaultValue</code> et lu
          à la soumission. L'erreur arrive en prop : le composant ne connaît pas votre validation.
        </p>
      </Concept>

      <Preview>
        <Input placeholder="Nom de la tâche" className="max-w-56" />
        <Input defaultValue="Valeur contrôlée" className="max-w-56" />
        <Input placeholder="Avec erreur" error="Ce champ est requis" className="max-w-56" />
        <Input placeholder="Désactivé" disabled className="max-w-56" />
        <Input type="search" placeholder="Recherche…" className="max-w-56" />
      </Preview>

      <Code
    tw={{ source: inputTwSource, filename: "components/ui/tw/input.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: inputMuiSource, filename: "components/ui/mui/input.tsx" }}
  />

      <PropsTable rows={[
        { name: "error", type: "string", default: "—", description: "Message affiché sous le champ ; passe le bord en rouge" },
        { name: "type", type: "string", default: "\"text\"", description: "Tout type natif : text, search, email, password…" },
        { name: "value / onChange", type: "string / fn", default: "—", description: "Mode contrôlé — la valeur vit dans votre état" },
        { name: "defaultValue", type: "string", default: "—", description: "Mode non contrôlé — valeur initiale seule" },
        { name: "className", type: "string", default: "—", description: "Fusionné après les styles de base" },
        { name: "ref", type: "Ref<HTMLInputElement>", default: "—", description: "React 19 : ref en prop directe" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Saisie libre courte : nom, email, recherche, filtre</li>
            <li>Formulaire simple où la validation s'affiche champ par champ</li>
          </>
        }
        no={
          <>
            <li>Texte long : utilisez <a href="/foundry/textarea" className="text-primary underline underline-offset-2">Textarea</a></li>
            <li>Choix parmi une liste : <a href="/foundry/select" className="text-primary underline underline-offset-2">Select</a></li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Style", description: "Modifiez les classes de base du `cn(...)` : hauteur, rayon, épaisseur de bord." },
          { title: "Erreur", description: "Le pattern `error ? … : …` du bord est copiable tel quel pour d'autres champs." },
          { title: "Icône", description: "Enveloppez le composant dans un conteneur relatif et ajoutez l'icône en absolu." },
        ]}
      />

      <BenchSection
        code={`function Demo() {
  const [value, setValue] = ReactScope.useState("");
  return (
    <div className="flex w-72 flex-col gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Votre nom"
      />
      <Input
        placeholder="Saisie non contrôlée"
        error={value.length === 0 ? "" : undefined}
      />
      <p className="text-xs text-muted-foreground">
        Contrôlé : {value || "…"}
      </p>
    </div>
  );
}
return <Demo />;`}
        data={""}
        scope={{ Input, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Le champ ne réagit pas à la frappe", cause: "`value` sans `onChange` : le champ est contrôlé mais l'état ne bouge jamais." },
          { symptom: "Erreur qui ne disparaît pas", cause: "Erreur passée depuis le serveur : effacez-la dès que l'utilisateur tape (onChange)." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "TW : React 19 · Tailwind 4 · lib/cn.ts — MUI : React 19 · @mui/material" },
          { label: "Accessibilité", value: "aria-invalid sur erreur, focus visible. Le label reste à votre charge (voir Field)." },
          { label: "Poids", value: "~35 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}
