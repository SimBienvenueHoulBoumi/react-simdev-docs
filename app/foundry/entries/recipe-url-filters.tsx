// Pourquoi : recette — liste + filtres URL + création + suppression avec confirmation.
// Un écran complet, copiable : le fichier de route entier, loader, action,
// et un commentaire par bloc expliquant POURQUOI il est là (spec §9.6).

import type { Entry } from "../registry";
import { Code, Concept, Facts, Pitfalls, WhenToUse } from "../sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";

const RECIPE = `// Fichier : app/routes/tasks.tsx — l'écran complet.
// Pourquoi : on copie l'écran entier, on remplace le domaine, ça marche le jour 1.

import { Form, useLoaderData, useNavigation, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { api, type TaskFilters } from "~/lib/api/tasks";   // VOTRE couche transport

// ——— Loader ———
// Pourquoi : les filtres VIVENT dans l'URL (bookmarkables, partageables,
// retour navigateur gratuit). Le loader lit l'URL, appelle l'API, renvoie.
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const filters: TaskFilters = {
    status: (url.searchParams.get("status") as Task["status"]) || undefined,
    search: url.searchParams.get("q") || undefined,
  };
  return { tasks: await api.listTasks(filters), filters };
}

// ——— Action ———
// Pourquoi : le formulaire poste vers la même route ; l'action valide,
// appelle l'API, puis React Router revalide le loader (liste à jour).
export async function action({ request }: ActionFunctionArgs) {
  const fd = await request.formData();
  const title = String(fd.get("title") ?? "").trim();
  if (!title) return { error: "Le titre est requis." };
  await api.createTask({ title });          // ← remplacez par votre CRUD
  return { ok: true };
}

export default function Screen() {
  const { tasks, filters } = useLoaderData<typeof loader>();
  const nav = useNavigation();
  return (
    <div className="mx-auto max-w-2xl p-6">
      {/* GET : les filtres naviguent, pas de mutation */}
      <Form method="get" className="flex gap-2">
        <Input name="q" defaultValue={filters.search} placeholder="Chercher…" />
        <Button type="submit">Filtrer</Button>
      </Form>
      {/* POST : la mutation — pending = bouton en charge */}
      <Form method="post" className="mt-4 flex gap-2">
        <Input name="title" required placeholder="Nouvelle tâche…" />
        <Button type="submit" isLoading={nav.state === "submitting"}>Créer</Button>
      </Form>
      <ul className="mt-6 flex flex-col gap-2">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between rounded-lg border p-3">
            {t.title}
            {/* DELETE via double-rendu : méthode POST + intent — pas de fetch */}
            <Form method="post">
              <input type="hidden" name="intent" value="delete" />
              <input type="hidden" name="id" value={t.id} />
              <Button type="submit" variant="destructive" size="sm">Supprimer</Button>
            </Form>
          </li>
        ))}
      </ul>
    </div>
  );
}
// Pour en faire une confirmation : ajoutez un Dialog (fiche dialog) autour du
// formulaire delete — open contrôlé, onClose → enfin la mutation.`;

export const UrlFiltersRecipe: Entry = {
  slug: "recipe-url-filters",
  title: "Recette : liste + filtres URL + CRUD",
  family: "recettes",
  level: "intermediaire",
  summary: "L'écran complet : loader, action, filtres dans l'URL, création et suppression — à copier tel quel.",
  intents: [
    "un écran liste filtrable et éditable, du premier coup",
    "voir comment loader et action s'articulent",
    "filtrer sans perdre l'URL",
  ],
  source: RECIPE,
  deps: ["components/ui/button.tsx", "components/ui/input.tsx", "lib/api/tasks.ts", "lib/cn.ts"],
  uses: ["notion-forms", "notion-keys", "data-list", "notion-effects"],
  props: [],
  errors: [],
  Doc: UrlFiltersDoc,
};

function UrlFiltersDoc() {
  return (
    <>
      <Concept>
        <p>
          La recette n°1 : un écran de liste complet — filtres dans l'URL,
          création, suppression — avec pourquoi chaque bloc existe. Copiez le
          fichier, remplacez le domaine ({<span>tasks</span>} → vos entités),
          ça marche le jour 1. Les composants de la banque sont interchangeables
          ici : c'est la RECETTE qui assemble.
        </p>
      </Concept>

      <Code source={RECIPE} filename="routes/tasks.tsx — l'écran complet" />

      <WhenToUse
        yes={
          <>
            <li>Un écran CRUD standard : liste + filtre + création + suppression</li>
            <li>Commencer un nouvel écran : copiez, remplacez le domaine, itérez</li>
          </>
        }
        no={
          <>
            <li>Un écran en lecture seule : le loader suffit, pas d'action</li>
            <li>Des mutations hors formulaire (drag & drop) : useFetcher (fiche dédiée, hors v1)</li>
          </>
        }
      />

      <Pitfalls
        items={[
          { symptom: "La liste ne se rafraîchit pas après création", cause: "L'action a réussi mais le loader ne revalide pas — normalement automatique ; vérifiez qu'aucun redirect() n'est sauté." },
          { symptom: "Le bouton « Créer » reste actif pendant l'envoi", cause: "isLoading lié à navigation.state === \"submitting\" — la recette le montre, ne l'oubliez pas." },
        ]}
      />

      <Facts
        facts={[
          { label: "Niveau", value: "Recette (niveau intermédiare)" },
          { label: "Dépendances", value: "React Router v8 · composants de la banque · une couche api" },
          { label: "À retenir", value: "GET = navigation · POST = mutation · l'URL porte les filtres · l'action revalide le loader" },
        ]}
      />
    </>
  );
}