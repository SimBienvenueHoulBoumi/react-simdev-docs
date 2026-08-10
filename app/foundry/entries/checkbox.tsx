// Pourquoi : fiche Checkbox — case à cocher native stylée.

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
import checkboxTwSource from "~/components/ui/tw/checkbox.tsx?raw";
import checkboxMuiSource from "~/components/ui/mui/checkbox.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Checkbox } from "~/components/ui/checkbox";
import * as ReactScope from "react";

export const CheckboxEntry: Entry = {
  slug: "checkbox",
  title: "Checkbox",
  family: "primitives",
  level: "base",
  summary: "Case à cocher native stylée — état contrôlé par vous, accessible par nature.",
  intents: [
    "cocher/décocher une option",
    "marquer une tâche comme terminée",
  ],
  sourceTw: checkboxTwSource,
  sourceMui: checkboxMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-state"],
  props: ["checked", "defaultChecked", "onChange", "indeterminate", "disabled", "ref"],
  Doc: CheckboxDoc,
};

export function CheckboxDoc() {
  return (
    <>
      <Concept>
        <p>
          La checkbox native, stylée par-dessus. Aucun state interne obligatoire :
          contrôlez-la (checked/onChange) ou laissez-la se débrouiller (defaultChecked).
          Le style « coché » est un SVG data-URI, donc aucun asset externe.
        </p>
      </Concept>

      <Preview>
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox defaultChecked /> C'est fait (non contrôlé)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox /> À faire (non contrôlé)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked onChange={() => {}} /> Contrôlée par vous
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox disabled /> Désactivée
          </label>
        </div>
      </Preview>

      <Code
    tw={{ source: checkboxTwSource, filename: "components/ui/tw/checkbox.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: checkboxMuiSource, filename: "components/ui/mui/checkbox.tsx" }}
  />

      <PropsTable rows={[
        { name: "checked", type: "boolean", default: "—", description: "Mode contrôlé : l'état vient de vous" },
        { name: "defaultChecked", type: "boolean", default: "—", description: "Mode non contrôlé : valeur initiale" },
        { name: "onChange", type: "(e) => void", default: "—", description: "Le changement — pensez à `e.target.checked`" },
        { name: "indeterminate", type: "boolean", default: "false", description: "État « partiel » (sélection de groupe)" },
        { name: "ref", type: "Ref<HTMLInputElement>", default: "—", description: "React 19 : ref en prop" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Choix binaire indépendant : oui/non, terminé/pas terminé</li>
            <li>Sélection multiple d'éléments d'une liste</li>
          </>
        }
        no={
          <>
            <li>Deux options exclusives : deux radios ou un Select</li>
            <li>Plus de 5 options : un groupe de checkbox avec titres</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Le SVG de coche", description: "Le data-URI est une URL encodée — remplacez-le par une icône externe si vous préférez." },
          { title: "Taille", description: "size-4 par défaut ; agrandissez avec className (size-5)." },
          { title: "Label", description: "Le label est TOUJOURS un `<label>` autour du composant : clic = toggle, gratuit." },
        ]}
      />

      <BenchSection
        code={`function Demo() {
  const [done, setDone] = ReactScope.useState(false);
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-sm">
        <Checkbox
          checked={done}
          onChange={(e) => setDone(e.target.checked)}
        />
        J'ai compris le contrat de données
      </label>
      <p className="text-xs text-muted-foreground">
        État contrôlé : {done ? "coché ✓" : "décoché"}
      </p>
    </div>
  );
}
return <Demo />;`}
        data={""}
        scope={{ Checkbox, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Le clic sur le label ne coche pas", cause: "Pas de `<label htmlFor>` ou le label n'enveloppe pas la case." },
          { symptom: "La checkbox redevient toujours décochée", cause: "`checked` sans `onChange` : l'état est figé, le rendu revient en arrière." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "Native : Espace pour toggler, focus visible, lecteur d'écran." },
          { label: "Poids", value: "~25 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}
