// Pourquoi : fiche Select — sélection native stylée, options en children.

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
import selectTwSource from "~/components/ui/tw/select.tsx?raw";
import selectMuiSource from "~/components/ui/mui/select.tsx?raw";
import cnSource from "~/lib/cn.ts?raw";
import { Select } from "~/components/ui/select";
import * as ReactScope from "react";

export const SelectEntry: Entry = {
  slug: "select",
  title: "Select",
  family: "primitives",
  level: "base",
  summary: "Sélection native stylée. Options en children : le composant ne connaît pas vos données.",
  intents: [
    "choisir parmi une liste d'options",
    "filtrer une liste par statut",
  ],
  sourceTw: selectTwSource,
  sourceMui: selectMuiSource,
  deps: ["lib/cn.ts"],
  uses: ["notion-forms", "notion-state", "notion-props"],
  props: ["error", "placeholder", "value", "onValueChange", "children", "ref"],
  Doc: SelectDoc,
};

export function SelectDoc() {
  return (
    <>
      <Concept>
        <p>
          Le <code className="font-mono text-[13px]">select</code> natif, stylé. Il reçoit les
          <code className="font-mono text-[13px]">option</code> en children — donc vos données
          prennent la forme que vous voulez, la conversion est votre affaire.
          Nativement accessible : clavier, lecteur d'écran, mobile.
        </p>
      </Concept>

      <Preview>
        <Select defaultValue="medium" className="max-w-56" aria-label="Priorité">
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
        </Select>
        <Select placeholder="Choisir un statut" className="max-w-56" aria-label="Statut">
          <option value="todo">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminé</option>
        </Select>
        <Select error="Choisissez une priorité" className="max-w-56" aria-label="Priorité">
          <option value="">—</option>
          <option value="low">Basse</option>
          <option value="high">Haute</option>
        </Select>
      </Preview>

      <Code
    tw={{ source: selectTwSource, filename: "components/ui/tw/select.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
    mui={{ source: selectMuiSource, filename: "components/ui/mui/select.tsx", depsCode: [cnSource], depsNames: ["lib/cn.ts"] }}
  />

      <PropsTable rows={[
        { name: "error", type: "string", default: "—", description: "Message d'erreur sous le champ" },
        { name: "placeholder", type: "string", default: "—", description: "Option grisée en tête, non sélectionnable" },
        { name: "value / onChange", type: "string / fn", default: "—", description: "Mode contrôlé" },
        { name: "children", type: "<option>…", default: "—", description: "Les options — c'est VOUS qui les construisez depuis vos données" },
        { name: "ref", type: "Ref<HTMLSelectElement>", default: "—", description: "React 19 : ref en prop directe" },
      ]} />

      <WhenToUse
        yes={
          <>
            <li>2 à ~15 options, l'utilisateur sait ce qu'il cherche</li>
            <li>Filtres : statut, priorité, tri — la valeur se colle dans l'URL</li>
            <li>Le clavier et le mobile doivent marcher sans JavaScript supplémentaire</li>
          </>
        }
        no={
          <>
            <li>Options nombreuses avec recherche : un composant combobox avec filtre (hors v1)</li>
            <li>Choix multi : des Checkbox ou un multi-select (hors v1)</li>
          </>
        }
      />

      <AdaptationAxes
        axes={[
          { title: "Conversion des données", description: "`data.map(o => <option key={o.id} value={o.value}>{o.label}</option>)` — la seule adaptation à faire." },
          { title: "Largeur", description: "Le wrapper est `w-full` : bornez-le avec `className` (max-w-56 par ex.)." },
          { title: "Icône", description: "Le chevron est un SVG inline en absolu — changez-le sans toucher au DOM." },
        ]}
      />

      <BenchSection
        code={`const data = [
  { id: 1, value: "todo", label: "À faire" },
  { id: 2, value: "in_progress", label: "En cours" },
  { id: 3, value: "done", label: "Terminé" },
];

function Demo() {
  const [status, setStatus] = ReactScope.useState("todo");
  return (
    <div className="flex w-72 flex-col gap-2">
      <Select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        aria-label="Statut"
      >
        {data.map((o) => (
          <option key={o.id} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
      <p className="text-xs text-muted-foreground">
        Statut : {status}
      </p>
    </div>
  );
}
return <Demo />;`}
        data={""}
        scope={{ Select, ReactScope }}
      />

      <Pitfalls
        items={[
          { symptom: "La première option s'affiche toujours", cause: "Sans `placeholder`, le select montre la première option — ajoutez une option vide ou un placeholder." },
          { symptom: "Le style du select natif du navigateur persiste", cause: "`appearance-none` est dans le cn() — si vous le retirez, l'icône double." },
        ]}
      />

      <Facts
        facts={[
          { label: "Prérequis", value: "React 19 · Tailwind 4 · lib/cn.ts" },
          { label: "Accessibilité", value: "Clavier natif (flèches, Échap), lecteur d'écran : rien à ajouter." },
          { label: "Poids", value: "~50 lignes, zéro dépendance" },
        ]}
      />
    </>
  );
}
