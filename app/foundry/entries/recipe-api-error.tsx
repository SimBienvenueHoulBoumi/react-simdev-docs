// Pourquoi : recette — gérer une erreur serveur sans casser la page (spec §11).
// Quatre étages : loader qui throw → ErrorBoundary de route → message actionnable.

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";

const RECIPE = `// 1. Le loader peut throw : React Router attrape, l'ErrorBoundary affiche.
export async function loader() {
  const tasks = await api.listTasks();   // le client normalize l'erreur
  return { tasks };                       // throw → ErrorBoundary du bas
}

// 2. L'ErrorBoundary de route — même fichier, export dédié.
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const message = isRouteErrorResponse(error)
    ? error.data?.message ?? \`Erreur \${error.status}\`
    : error instanceof Error ? error.message : "Erreur inattendue";
  return (
    <main className="p-6" role="alert">
      <h1 className="text-xl font-semibold">Impossible de charger les tâches</h1>
      <p className="text-muted-foreground">{message}</p>
      {/* Le bouton Réessayer revalide la route : React Router refait le loader */}
      <Form method="get" className="mt-3">
        <Button type="submit">Réessayer</Button>
      </Form>
    </main>
  );
}

// 3. Pour les mutations : erreurs champ par champ dans l'action.
export async function action({ request }: ActionFunctionArgs) {
  try {
    await api.createTask(...);
  } catch (err) {
    if (isApiError(err)) return { fieldErrors: err.fieldErrors };  // → <Field error={...}>
    throw err;  // erreurs inattendues → ErrorBoundary, jamais un écran blanc
  }
  return { ok: true };
}`;

export const ApiErrorRecipe: Entry = {
  slug: "recipe-api-error",
  title: "Recette : gérer une erreur serveur",
  family: "recettes",
  level: "intermediaire",
  summary: "Loader qui throw, ErrorBoundary de route, erreurs champ par champ — la page ne casse jamais.",
  intents: [
    "gérer une erreur serveur proprement",
    "un message actionnable avec bouton Réessayer",
    "remonter les erreurs de formulaire champ par champ",
  ],
  source: RECIPE,
  deps: ["components/ui/button.tsx", "components/patterns/field.tsx", "lib/cn.ts"],
  uses: ["notion-forms", "field", "toast"],
  props: [],
  errors: ["Hydration failed", "Objects are not valid as a React child"],
  Doc: ApiErrorDoc,
};

function ApiErrorDoc() {
  return (
    <>
      <Concept>
        <p>
          Quatre étages, une règle : <em>jamais d'écran blanc</em>. Le loader
          throw → l'ErrorBoundary de route affiche un message actionnable ;
          la mutation échoue → les erreurs remontent champ par champ dans le
          formulaire. Les erreurs inattendues finissent TOUJOURS dans la
          boundary, jamais swallow.
        </p>
      </Concept>

      <Code source={RECIPE} filename="recette — erreur-serveur" />

      <WhenToUse
        yes={
          <>
            <li>Chaque route qui charge des données : une ErrorBoundary nommée</li>
            <li>Chaque action : catch des erreurs API connues, throw pour le reste</li>
          </>
        }
        no={
          <>
            <li>catch + console.log : l'utilisateur ne voit rien et vous non plus</li>
            <li>Le message d'erreur brut du serveur tel quel : normalisez (message actionnable)</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "« Hydration failed » en console", cause: "Le rendu client diffère du serveur (random, date) — voir la fiche erreurs courantes." },
          { symptom: "Écran blanc au lieu de l'erreur", cause: "Une exception dans render hors boundary : remontez ErrorBoundary au niveau route/root." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Recette" },
          { label: "À retenir", value: "Loader throw → Boundary affiche · action catch → champs · jamais d'écran blanc" },
        ]}
      />
    </>
  );
}