// Pourquoi : fiche notion — compound components : plusieurs composants, un seul contrat (spec §9.5).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Compound : un parent qui POSSÈDE l'état, des enfants qui s'y connectent
// par Context. L'usage final ressemble à du HTML — flexible, sans props en cascade.

import { createContext, useContext, useState, type ReactNode } from "react";

const TabsCtx = createContext<{ active: string; setActive: (v: string) => void } | null>(null);

function Tabs({ defaultValue, children }: { defaultValue: string; children: ReactNode }) {
  const [active, setActive] = useState(defaultValue);
  return <TabsCtx.Provider value={{ active, setActive }}>{children}</TabsCtx.Provider>;
}

function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist" className="flex gap-1 rounded-md bg-muted p-1">{children}</div>;
}

function Tab({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsCtx)!;
  const selected = ctx.active === value;
  return (
    <button
      role="tab"
      aria-selected={selected}
      onClick={() => ctx.setActive(value)}
      className={selected ? "rounded bg-background px-3 py-1 text-sm shadow-sm" : "px-3 py-1 text-sm text-muted-foreground"}
    >
      {children}
    </button>
  );
}

function Panel({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsCtx)!;
  if (ctx.active !== value) return null;
  return <div role="tabpanel" className="mt-3">{children}</div>;
}

// Usage : le parent orchestre, les enfants s'arrangent entre eux.
<Tabs defaultValue="a">
  <TabList>
    <Tab value="a">Général</Tab>
    <Tab value="b">Avancé</Tab>
  </TabList>
  <Panel value="a">Réglages généraux…</Panel>
  <Panel value="b">Options fines…</Panel>
</Tabs>`;

export const CompoundNotion: Entry = {
  slug: "notion-compound",
  title: "Compound components",
  family: "notions",
  level: "avance",
  summary: "Tabs, Select, Menu : l'état vit dans le parent, chaque enfant s'y connecte par Context — l'usage final reste du JSX simple.",
  intents: [
    "concevoir un composant à plusieurs pièces coordonnées",
    "offrir la flexibilité du composé sans props en cascade",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-context", "notion-state", "notion-children"],
  props: ["defaultValue", "value", "children", "Provider", "Context"],
  Doc: CompoundDoc,
};

function CompoundDoc() {
  return (
    <>
      <Concept>
        <p>
          Le pattern compound répond à un besoin précis : un composant multi-pièces
          (onglets, menus, select riche) dont l'état est partagé entre les pièces sans
          que l'utilisateur ait à le porter. Le <strong>parent possède l'état</strong>,
          les <strong>enfants consomment</strong> par Context, et l'API finale ressemble
          à de l'HTML sémantique. Le prix : un fichier par pièce et un contrat Context
          explicite — à ne payer que quand le composant est réellement composé.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — compound" />

      <WhenToUse
        yes={
          <>
            <li>Des pièces qui partagent un état et s'imbriquent (tabs, accordéons, selects)</li>
            <li>Une API qui doit rester lisible même avec des variantes d'agencement</li>
            <li>Quand les props traverseraient trois niveaux de profondeur</li>
          </>
        }
        no={
          <>
            <li>Un composant monolithique sans pièces : le Context est du poids mort</li>
            <li>Un seul usage prévu : un composant classique avec props suffit</li>
            <li>Sans besoin de flexibilité d'agencement : privilégiez une façade simple</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Un enfant rendu hors du parent n'a rien", cause: "useContext hors Provider : le contrat doit rendre une erreur claire (« <Tab> doit vivre dans <Tabs> ») pour débusquer ça." },
          { symptom: "Deux instances de Tabs sur la même page partagent l'état", cause: "Le Context est partagé : chaque instance monte son propre Provider, vérifiez le montage." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé" },
          { label: "À retenir", value: "L'état dans le parent, le Context comme câblage, l'usage comme du HTML" },
        ]}
      />
    </>
  );
}