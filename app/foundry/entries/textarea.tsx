// Pourquoi : fiche Textarea — zone de texte multiligne, même contrat que Input.

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
import textareaTwSource from "~/components/ui/tw/textarea.tsx?raw";
import textareaMuiSource from "~/components/ui/mui/textarea.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Textarea } from "~/components/ui/textarea";
import * as ReactScope from "react";

export const TextareaEntry: Entry = {
  slug: "textarea",
  title: "Textarea",
  family: "primitives",
  level: "base",
  summary: "Zone de texte multiligne — même contrat que Input, même ton.",
  intents: [
    "saisir un texte long (description, commentaire)",
    "un champ avec plusieurs lignes",
  ],
  sourceTw: textareaTwSource,
  sourceMui: textareaMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-forms", "notion-state"],
  props: ["error", "rows", "value", "defaultValue", "ref"],
  Doc: TextareaDoc,
};

export function TextareaDoc() {
  return (
    <>
      <Concept>
        <p>
          Le même composant qu'Input, en multiligne. Pas de logique propre : la
          valeur, l'erreur et la validation restent vos affaires. Les lignes
          s'agrandissent avec <code className="font-mono text-[13px]">min-h-20</code> par défaut.
        </p>
      </Concept>

      <Preview>
        <Textarea placeholder="Décrivez la tâche…" className="max-w-72" rows={3} />
        <Textarea
          defaultValue="avec erreur"
          error="La description ne doit pas contenir le mot « error »"
          className="max-w-72"
        />
      </Preview>

      <Code
    tw={{ source: textareaTwSource, filename: "components/ui/tw/textarea.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: textareaMuiSource, filename: "components/ui/mui/textarea.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
  />

      <PropsTable rows={[
        { name: "error", type: "string", default: "—", description: "Message affiché sous la zone ; passe le bord en rouge" },
        { name: "rows", type: "number", default: "—", description: "Hauteur initiale en lignes" },
        { name: "value / onChange", type: "string / fn", default: "—", description: "Mode contrôlé" },
        { name: "defaultValue", type: "string", default: "—", description: "Mode non contrôlé" },
        { name: "ref", type: "Ref<HTMLTextAreaElement>", default: "—", description: "React 19 : ref en prop directe" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Description, commentaire, message : tout texte long (plus d'une ligne)</li>
            <li>Champ où l'utilisateur doit « écrire », pas « choisir »</li>
          </>
        }
        no={
          <>
            <li>Un mot ou deux : Input</li>
            <li>Markdown riche : ajoutez un aperçu à côté, pas ici</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Hauteur", description: "Jouez sur `min-h-*` dans le cn() : 20 est confortable pour 3 lignes." },
          { title: "Redimensionnement", description: "`resize-y` par défaut ; retirez-le si votre layout ne le supporte pas." },
          { title: "Compteur de caractères", description: "Affiché en dessous, calculé depuis `value.length` par l'appelant." },
        ]}
      />

      <BenchSection
        code={`function Demo() {
  const [value, setValue] = ReactScope.useState("");
  return (
    <div className="flex w-80 flex-col gap-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Votre message…"
        rows={3}
      />
      <p className="text-xs text-muted-foreground">
            {value.length} caractères
      </p>
    </div>
  );
}
return <Demo />;`}
        data={""}
        scope={{ Textarea, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Le texte déborde de la zone", cause: "`rows` fixe une hauteur mais le contenu s'étend : utilisez `resize-y` ou limitez avec une autre classe." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "aria-invalid sur erreur, label à votre charge." },
          { label: "Poids", value: "~35 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}
