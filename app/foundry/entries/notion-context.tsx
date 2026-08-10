// Pourquoi : fiche notion — Context et son seuil concret (spec §9.4).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Le seuil concret de Context : quand le tunnel de props devient
// illisible (>3 niveaux, douzaines de props) OU quand un état global
// est légitime (thème, session, toasts).

const ThemeContext = createContext("light");

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Consommation : un hook dédié, pas le contexte brut.
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme hors ThemeProvider");
  return ctx;
}

// Ce que Context ne remplace PAS : les données serveur (loader),
// la remontée d'état locale (props), les formulaires (Form+action).`;

export const ContextNotion: Entry = {
  slug: "notion-context",
  title: "Context",
  family: "notions",
  level: "intermediaire",
  summary: "Le seuil concret : plus de 3 niveaux de tunnel de props, ou un état global légitime (thème, toasts).",
  intents: [
    "éviter le tunnel de props",
    "partager un état applicatif sans store",
  ],
  source: EXAMPLE,
  deps: [],
  uses: ["notion-state", "notion-custom-hooks"],
  props: ["createContext", "Provider", "useContext"],
  Doc: ContextDoc,
};

function ContextDoc() {
  return (
    <>
      <Concept>
        <p>
          Context livre une valeur à tout le sous-arbre sans la faire transiter par
          les props. Sa vraie valeur : rendre <em>explicite</em> un état légitimement
          global (thème, session, toasts) — et son vrai coût : un re-rendu de toute
          la zone consommatrice à chaque changement.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — context" />

      <WhenToUse
        yes={
          <>
            <li>Thème, langue, session, toasts : une valeur globale au sens propre</li>
            <li>Le tunnel de props de plus de 3 niveaux, avec volume de props important</li>
          </>
        }
        no={
          <>
            <li>Un état partagé par 2 composants voisins : remontez-le par props (fiche lifting)</li>
            <li>Des données serveur : le loader les fournit, Context ne les remplace pas</li>
            <li>Éviter un re-render : Context re-rend tout le consommateur — useMemo les valeurs</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Tout re-rend quand la valeur change", cause: "Valeur non mémoïsée (objet recréé) — useMemo la valeur, ou découpez en deux contextes." },
          { symptom: "useContext(undefined) silencieux", cause: "Provider absent : un hook dédié qui throw est plus parlant qu'un undefined perdu." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Intermédiaire" },
          { label: "À retenir", value: "Seuil concret avant Context ; useMemo la valeur ; hook dédié qui throw hors provider" },
        ]}
      />
    </>
  );
}