// Pourquoi : fiche notion — composition par children : le conteneur ne connaît pas son contenu (spec §9.4).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// children : le conteneur rend ce qu'on lui donne, sans le connaître.
// Le Dialog sait cadrer, fermer, animer — il ignore le formulaire qu'il reçoit.

function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div role="dialog" aria-modal aria-label={title} className="w-96 rounded-lg bg-background p-4 shadow-xl">
        <header className="mb-2 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>✕</Button>
        </header>
        {children}
      </div>
    </div>
  );
}

// Usage : le formulaire reste chez l'appelant, Dialog reste générique.
<Dialog open={open} onClose={close} title="Nouveau projet">
  <ProjectForm onSaved={close} />
</Dialog>`;

export const ChildrenNotion: Entry = {
  slug: "notion-children",
  title: "Composition par children",
  family: "notions",
  level: "intermediaire",
  summary: "Le conteneur rend children sans le connaître : Dialog, Card, Layout deviennent réutilisables tels quels.",
  intents: [
    "construire des conteneurs réutilisables",
    "savoir quand children remplace une prop de configuration",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-props", "notion-conditional"],
  props: ["children", "ReactNode", "slot"],
  Doc: ChildrenDoc,
};

function ChildrenDoc() {
  return (
    <>
      <Concept>
        <p>
          Un composant qui accepte <code className="font-mono text-[13px]">children</code>
          devient un conteneur : il gère la structure, le style, l'accessibilité —
          mais pas le contenu. C'est l'inverse d'une prop de configuration qui
          accumulerait des options : <em>composer</em> plutôt que <em>configurer</em>.
          Le Dialog de la banque fonctionne ainsi, et c'est pour ça qu'il sert
          partout sans changer.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — composition-children" />

      <WhenToUse
        yes={
          <>
            <li>Tout composant « cadre » : Dialog, Card, Badge, Layout, Tooltip</li>
            <li>Quand les variantes d'usage sont infinies (formulaires, contenus libres)</li>
            <li>Plusieurs zones : children + props slots (header, footer, actions)</li>
          </>
        }
        no={
          <>
            <li>Une seule utilisation prévue : une prop <code>label</code> suffit</li>
            <li>Forcer le parent à recomposer le même contenu à chaque usage — créez une façade (voir data-list)</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Le conteneur veut récupérer des données du contenu", cause: "children est opaque : passez les données par props, ou élevez l'état (notion-state)." },
          { symptom: "Des wrappers <div> superposés inutilement", cause: "children n'oblige pas à un niveau de DOM : rendez le fragment directement." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Intermédiaire" },
          { label: "À retenir", value: "Le conteneur structure, children remplit — composer plutôt que configurer" },
        ]}
      />
    </>
  );
}