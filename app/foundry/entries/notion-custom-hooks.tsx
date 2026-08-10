// Pourquoi : fiche notion — hooks custom : la méthode d'extraction (spec §9.4).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Un hook custom = une fonction qui utilise des hooks.
// La règle : nom en use… et TOUTES les règles des hooks s'appliquent.

function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);           // cleanup : annule l'ancien timer
  }, [value, delay]);
  return debounced;
}

// Usage : le formulaire reste simple, le debounce est encapsulé.
function SearchBox() {
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 300);   // prêt à chercher
  return <Input value={query} onChange={(e) => setQuery(e.target.value)} />;
}

// Extrayez quand : 3+ composants partagent le même comportement,
// OU le composant devient illisible. Pas avant.`;

export const CustomHooksNotion: Entry = {
  slug: "notion-custom-hooks",
  title: "Hooks custom",
  family: "notions",
  level: "intermediaire",
  summary: "La méthode d'extraction : useDebounce, useDisclosure, useLocalStorage, useMediaQuery.",
  intents: [
    "réutiliser une logique d'état entre composants",
    "encapsuler un comportement (debounce, ouverture, media query)",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-effects", "notion-state"],
  props: ["useDebounced", "useDisclosure", "useLocalStorage", "useMediaQuery"],
  Doc: CustomHooksDoc,
};

function CustomHooksDoc() {
  return (
    <>
      <Concept>
        <p>
          Un hook custom n'est qu'une fonction qui appelle des hooks — il bénéficie
          donc automatiquement de tout l'état local et des effets, sans déclaration
          spéciale. L'extraction suit la même logique que les composants : après la
          troisième duplicata, ou quand le composant devient illisible.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — hooks-custom" />

      <WhenToUse
        yes={
          <>
            <li>3+ occurrences du même comportement : debounce, persistence, ouverture de dialog</li>
            <li>Encapsuler un cycle : useDisclosure (open/openChange), useLocalStorage (lecture+écriture)</li>
          </>
        }
        no={
          <>
            <li>Un seul usage : une fonction locale suffit — l'extraction prématurée noie le code</li>
            <li>Des hooks appelés conditionnellement : interdit, quelle que soit la jolie logique</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Le hook custom perd son état entre les rendus", cause: "Composant démonté puis remonté : l'état local repart de zéro — remontez-le si la persistance est requise." },
          { symptom: "« Rendered more hooks than during the previous render »", cause: "Un hook dans une branche conditionnelle — remontez-le au-dessus du if." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Intermédiaire" },
          { label: "À retenir", value: "use… + hooks dedans + cleanup dans l'effet — et on n'extrait pas avant le 3e duplicata" },
        ]}
      />
    </>
  );
}