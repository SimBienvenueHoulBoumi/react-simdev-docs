// Pourquoi : fiche notion — virtualisation : ne pas rendre ce qui n'est pas visible (spec §9.5).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// 10 000 lignes rendues = 10 000 nœuds DOM = page morte.
// La virtualisation ne rend QUE la fenêtre visible (+ une marge),
// et remplace les lignes sorties par de l'espace : le scroll existe,
// le prix du rendu disparaît.

// Principe (implémentation simplifiée, à remplacer par une lib :
// @tanstack/react-virtual, react-window — la banque recommande
// @tanstack/react-virtual, headless et testée).
function VirtualList({ items, rowHeight = 40 }: { items: Row[]; rowHeight?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const viewport = ref.current?.clientHeight ?? 400;

  const start = Math.floor(scrollTop / rowHeight);
  const count = Math.ceil(viewport / rowHeight) + 4; // + marge de overscan
  const visible = items.slice(start, start + count);

  return (
    <div
      ref={ref}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      className="h-[400px] overflow-auto border rounded-md"
    >
      <div style={{ height: items.length * rowHeight, position: "relative" }}>
        {visible.map((row, i) => (
          <div key={row.id} style={{ position: "absolute", top: (start + i) * rowHeight, height: rowHeight }}>
            {row.label}
          </div>
        ))}
      </div>
    </div>
  );
}`;

export const VirtualizationNotion: Entry = {
  slug: "notion-virtualization",
  title: "Virtualisation de longues listes",
  family: "notions",
  level: "avance",
  summary: "Rendre seulement la fenêtre visible (+ marge) : 10 000 lignes restent fluides. Seuil : dès que le rendu complet ralentit le scroll ou l'interaction.",
  intents: [
    "garder une longue liste fluide",
    "choisir le bon moment pour virtualiser",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-ref", "notion-state", "notion-keys"],
  props: ["overscan", "rowHeight", "scroll", "items"],
  Doc: VirtualizationDoc,
};

function VirtualizationDoc() {
  return (
    <>
      <Concept>
        <p>
          Un millier de lignes rendues, c'est déjà lourd ; dix mille, c'est une page
          qui ne répond plus. La virtualisation inverse la logique : le DOM ne
          contient que les lignes <strong>visibles</strong> (plus une marge d'overscan
          pour le scroll anticipé), le reste n'existe que comme hauteur virtuelle.
          Les clés, la hauteur de ligne fixe et l'immutabilité des données sont les
          conditions de fonctionnement — et la bibliothèque headless (
          <code className="font-mono text-[13px]">@tanstack/react-virtual</code>)
          évite de réinventer un moteur de scroll.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — virtualisation" />

      <WhenToUse
        yes={
          <>
            <li>Des centaines à des milliers de lignes — mesuré lent au profiler ou au ressenti</li>
            <li>Des lignes de hauteur homogène (tableaux, journaux, feeds)</li>
            <li>Un scroll qui rame : la virtualisation rend la interaction à nouveau fluide</li>
          </>
        }
        no={
          <>
            <li>Une liste de 50 lignes : la complexité ne paie pas</li>
            <li>Des lignes de hauteur variable sans mesure : les hauteurs estimées créent des sauts</li>
            <li>Un contenu qui change à chaque rendu (pas de clés stables) : le moteur ne peut pas suivre</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Des sauts de scroll ou des lignes blanches", cause: "Hauteur de ligne estimée fausse : il faut une hauteur fixe, ou une mesure réelle (ResizeObserver, virtualizer mesure)." },
          { symptom: "Le composant virtualisé perd le focus au scroll", cause: "Les lignes sorties sont démontées : gardez le focus dans un état elevé ou désactivez la virtualisation sur les petits jeux de données." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Avancé" },
          { label: "À retenir", value: "Seulement le visible + overscan ; hauteur fixe ; clés stables ; lib headless" },
        ]}
      />
    </>
  );
}