// Pourquoi : fiche Field — label + champ + message d'erreur, assemblage cohérent.

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
import fieldSource from "~/components/patterns/field.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Field } from "~/components/patterns/field";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Button } from "~/components/ui/button";
import { ToastProvider, useToast } from "~/components/ui/toast";
import * as ReactScope from "react";

export const FieldEntry: Entry = {
  slug: "field",
  title: "Field",
  family: "formulaires",
  level: "base",
  summary: "Label + champ + erreur assemblés : le même bloc partout dans vos formulaires.",
  intents: [
    "afficher un label, un champ et une erreur ensemble",
    "homogénéiser les formulaires",
  ],
  source: fieldSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-forms"],
  props: ["label", "hint", "error", "required", "children"],
  Doc: FieldDoc,
};

function FieldDoc() {
  return (
    <>
      <Concept>
        <p>
          Le trio <em>label + champ + message</em> qui va TOUJOURS ensemble.
          Il crée l'id, relie le label au champ, affiche l'aide et l'erreur au bon
          endroit. Le champ enfant reçoit automatiquement <code className="font-mono text-[13px]">id</code> et{" "}
          <code className="font-mono text-[13px]">aria-describedby</code>.
        </p>
      </Concept>

      <Preview>
        <div className="flex w-full max-w-sm flex-col gap-4">
          <Field label="Titre de la tâche" hint="Soyez précis, une seule action.">
            <Input placeholder="Ex. : déployer le catalogue" />
          </Field>
          <Field label="Priorité" required error="Choisissez une priorité.">
            <Select placeholder="Choisir…">
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </Select>
          </Field>
        </div>
      </Preview>

      <Code source={fieldSource} filename="components/patterns/field.tsx" depsCode={[cnSource]} depsNames={["lib/cn.ts"]} />

      <PropsTable rows={[
        { name: "label", type: "string", default: "—", description: "Le texte du label — sert aussi à générer l'id" },
        { name: "hint", type: "string", default: "—", description: "Aide affichée quand pas d'erreur" },
        { name: "error", type: "string", default: "—", description: "Message d'erreur — remplace l'aide" },
        { name: "required", type: "boolean", default: "false", description: "Affiche l'astérisque" },
        { name: "children", type: "ReactElement", default: "—", description: "LE champ (Input, Select…) — clone avec id/error" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>Chaque champ de formulaire — la cohérence visuelle et a11y vient toute seule</li>
            <li>Les champs dont l'erreur vient du serveur (fieldErrors de l'action)</li>
          </>
        }
        no={
          <>
            <li>Un champ seul sans label (icône de recherche décorative) : Input brut suffit</li>
            <li>Des champs empilés sans logique de formulaire : Field est un bloc, pas un moteur</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Génération de l'id", description: "Sluggé depuis le label — deux fields au même label = deux ids identiques, évitez les libellés dupliqués." },
          { title: "Contenu du message", description: "L'erreur passe en prop depuis VOTRE validation ou le fieldErrors serveur." },
          { title: "defaultValue", description: "Passez defaultValue directement au champ enfant — Field ne le pirate pas." },
        ]}
      />

      <BenchSection
        code={`function Demo() {
  const { toast } = useToast();
  const [title, setTitle] = ReactScope.useState("");
  const error = title.trim() === "" ? "Le titre est requis." : undefined;
  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Field label="Titre" hint="Minimum 1 caractère" error={error}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ma tâche…"
        />
      </Field>
      <div>
        <Button
          size="sm"
          onClick={() => toast("Formulaire cohérent ✓", { variant: "success" })}
        >
          Valider
        </Button>
      </div>
    </div>
  );
}
return <Demo />;`}
        data={""}
        scope={{ Field, Input, Select, Button, ToastProvider, useToast, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "Le clic sur le label ne focus pas le champ", cause: "Le champ enfant a déjà un id : Field clone avec son id — vérifiez qu'aucun id dupliqué n'existe." },
          { symptom: "L'erreur du serveur ne disparaît pas quand on corrige", cause: "Effacez fieldErrors dans l'action dès qu'un champ change, ou passez undefined en onChange." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "label htmlFor auto, aria-describedby vers hint/erreur, role=alert sur l'erreur." },
          { label: "Poids", value: "~55 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}