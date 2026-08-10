// Pourquoi : fiche notion — formulaires contrôlés vs non contrôlés (spec §9.3).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const EXAMPLE = `// Non contrôlé : le DOM garde la valeur, React la lit à la soumission.
function Uncontrolled() {
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      console.log(fd.get("title"));    // lu au moment de soumettre
    }}>
      <input name="title" defaultValue="Valeur initiale" />
      <button>Soumettre</button>
    </form>
  );
}

// Contrôlé : React possède la valeur à chaque frappe.
function Controlled() {
  const [title, setTitle] = useState("");
  return (
    <input
      value={title}
      onChange={(e) => setTitle(e.target.value)}  // mis à jour à la frappe
    />
  );
}

// En pratique avec React Router : <Form method="post"> + action
// = non contrôlé par le navigateur, géré par le routeur (fiche formulaire).`;

export const FormsNotion: Entry = {
  slug: "notion-forms",
  title: "Formulaires contrôlés et non contrôlés",
  family: "notions",
  level: "base",
  summary: "Quand le DOM garde la valeur, quand React la garde — et pourquoi le Form de React Router tranche.",
  intents: [
    "choisir entre contrôlé et non contrôlé",
    "bâtir un formulaire avec validation",
  ],
  source: EXAMPLE,
  deps: [],
  uses: [],
  props: ["value", "defaultValue", "onChange", "name"],
  Doc: FormsDoc,
};

function FormsDoc() {
  return (
    <>
      <Concept>
        <p>
          Deux philosophies : le <strong>non contrôlé</strong> laisse le DOM garder
          les valeurs et React les lit à la soumission (léger, rapide) ; le{" "}
          <strong>contrôlé</strong> fait transiter chaque frappe par un état React
          (nécessaire pour valider en direct, désactiver le bouton, compter les caractères).
          La banque tranche : <em>non contrôlé par défaut, contrôlé quand on a besoin de voir la valeur</em>.
        </p>
      </Concept>

      <Code source={EXAMPLE} filename="notion — formulaires" />

      <WhenToUse
        yes={
          <>
            <li>Non contrôlé : la plupart des champs d'un Form method="post" — le serveur valide</li>
            <li>Contrôlé : validation en direct, aperçu live, dépendances entre champs</li>
          </>
        }
        no={
          <>
            <li>Un store de formulaire (Formik, react-hook-form) avant d'avoir besoin de sa complexité</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "Le champ ne se met pas à jour à la frappe", cause: "Contrôlé (value) sans onChange — ajoutez l'handler d'état." },
          { symptom: "Champ « non contrôlé » avec une value prop → warning React en console", cause: "Melange de defaultValue et value : choisissez un seul mode par champ." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Bases" },
          { label: "À retenir", value: "Contrôlé = value + onChange ; non contrôlé = defaultValue ; un seul mode par champ" },
        ]}
      />
    </>
  );
}