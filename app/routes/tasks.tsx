// Pourquoi : l'app réelle — taskmanager branché sur l'API mock (phase 8 de la spec).
// Les composants importés ici sont des FAÇADES : ils se rendent en Tailwind OU
// MUI selon le moteur sélectionné dans le catalogue. Zéro changement de code ici
// quand on bascule : c'est la démonstration du mécanisme.

import {
  data,
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "react-router";
import { useState } from "react";
import { api, isApiError, type Task, type TaskFilters } from "~/lib/api/tasks";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Select } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar } from "~/components/ui/avatar";
import { Dialog } from "~/components/ui/dialog";
import { ToastProvider, useToast } from "~/components/ui/toast";
import { DataList } from "~/components/patterns/data-list";
import { EmptyState } from "~/components/patterns/empty-state";
import { Field } from "~/components/patterns/field";
import type { Route } from "./+types/tasks";

const STATUS_LABEL: Record<Task["status"], string> = {
  todo: "À faire",
  in_progress: "En cours",
  done: "Terminé",
};

// ——— Loader : les filtres VIVENT dans l'URL, pas dans l'état local (§9.6) ———
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const filters: TaskFilters = {
    status: (url.searchParams.get("status") as Task["status"]) || undefined,
    priority: (url.searchParams.get("priority") as Task["priority"]) || undefined,
    search: url.searchParams.get("q") || undefined,
  };
  const tasks = await api.listTasks(filters);
  return { tasks, filters };
}

// ——— Action : création + toggle done + suppression ———
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "create") {
    const title = String(formData.get("title") ?? "").trim();
    const priority = (formData.get("priority") as Task["priority"]) || "medium";
    try {
      const task = await api.createTask({ title, priority });
      return { ok: true, created: task, fieldErrors: undefined };
    } catch (err) {
      if (isApiError(err)) {
        return { ok: false, fieldErrors: err.fieldErrors, error: err.message };
      }
      return { ok: false, fieldErrors: { title: "Erreur inattendue." } };
    }
  }

  const id = String(formData.get("id") ?? "");

  if (intent === "toggle-done") {
    const task = await api.getTask(id);
    await api.updateTask(id, { status: task.status === "done" ? "todo" : "done" });
    return { ok: true };
  }

  if (intent === "delete") {
    await api.deleteTask(id);
    return { ok: true, deleted: id };
  }

  return { ok: false, error: "Requête inconnue." };
}

export function meta() {
  return [{ title: "Tâches — react-foundry" }];
}

export default function Tasks() {
  const { tasks, filters } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <ToastProvider>
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-6 p-6">
        <Header />
        <FiltersBar filters={filters} />
        <CreateForm isSubmitting={isSubmitting} fieldErrors={actionData?.ok === false ? actionData.fieldErrors : undefined} />
        <TaskList tasks={tasks} />
      </div>
    </ToastProvider>
  );
}

function Header() {
  return (
    <header className="flex items-end justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tâches</h1>
        <p className="text-sm text-muted-foreground">
          App réelle sur API mock — basculez Tailwind/MUI dans le catalogue.
        </p>
      </div>
      <a href="/foundry" className="text-sm text-primary underline underline-offset-2 hover:no-underline">
        ← catalogue
      </a>
    </header>
  );
}

// Les filtres se collent dans l'URL : un <Form method="get"> suffit (§8)
function FiltersBar({ filters }: { filters: TaskFilters }) {
  return (
    <Form method="get" className="flex flex-wrap items-end gap-2">
      <Field label="Recherche">
        <Input name="q" defaultValue={filters.search} placeholder="Filtrer par texte…" className="max-w-48" />
      </Field>
      <Field label="Statut">
        <Select name="status" defaultValue={filters.status} className="max-w-40">
          <option value="">Tous</option>
          <option value="todo">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Terminé</option>
        </Select>
      </Field>
      <Field label="Priorité">
        <Select name="priority" defaultValue={filters.priority} className="max-w-40">
          <option value="">Toutes</option>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
        </Select>
      </Field>
      <div className="flex gap-2">
        <Button type="submit">Filtrer</Button>
        <Button type="submit" variant="ghost" name="reset" value="1">Réinitialiser</Button>
      </div>
    </Form>
  );
}

function CreateForm({
  isSubmitting,
  fieldErrors,
}: {
  isSubmitting: boolean;
  fieldErrors?: Record<string, string>;
}) {
  const { toast } = useToast();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle tâche</CardTitle>
      </CardHeader>
      <CardContent>
        <Form method="post" className="flex flex-wrap items-start gap-2">
          <input type="hidden" name="intent" value="create" />
          <Field label="Titre" required error={fieldErrors?.title}>
            <Input name="title" placeholder="Ex. : écrire la fiche useEffect" className="max-w-72" />
          </Field>
          <Field label="Priorité">
            <Select name="priority" defaultValue="medium" className="w-36">
              <option value="low">Basse</option>
              <option value="medium">Moyenne</option>
              <option value="high">Haute</option>
            </Select>
          </Field>
          <Button
            type="submit"
            isLoading={isSubmitting}
            loadingLabel="Création…"
            onClick={() => {
              // l'action réussie déclenche le toast côté client (voir plus bas)
            }}
          >
            Créer
          </Button>
        </Form>
        {fieldErrors?.title && (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
        )}
      </CardContent>
    </Card>
  );
}

function TaskList({ tasks }: { tasks: Task[] }) {
  const { toast } = useToast();
  return (
    <DataList
      items={tasks}
      getKey={(t) => t.id}
      renderItem={(task) => (
        <Card>
          <CardContent className="flex items-center gap-3">
            <Form method="post">
              <input type="hidden" name="intent" value="toggle-done" />
              <input type="hidden" name="id" value={task.id} />
              <Checkbox
                name="done"
                checked={task.status === "done"}
                onChange={(e) => {
                  if (e.target.checked) toast(`« ${task.title} » terminé`, { variant: "success" });
                }}
              />
            </Form>
            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${task.status === "done" ? "text-muted-foreground line-through" : ""}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="truncate text-xs text-muted-foreground">{task.description}</p>
              )}
            </div>
            <Badge
              variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
            >
              {task.priority}
            </Badge>
            <Avatar name={task.owner} size="sm" />
            <DeleteButton task={task} />
          </CardContent>
        </Card>
      )}
      empty={
        <EmptyState
          title="Aucune tâche ne correspond"
          description="Modifiez les filtres ou créez une tâche."
        />
      }
    />
  );
}

function DeleteButton({ task }: { task: Task }) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const navigation = useNavigation();
  const deleting = navigation.state === "submitting";

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        aria-label={`Supprimer ${task.title}`}
        className="text-muted-foreground hover:text-destructive"
      >
        <svg aria-hidden="true" className="size-4" viewBox="0 0 16 16" fill="none">
          <path
            d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.5 7v4M9.5 7v4"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Button>
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Supprimer cette tâche ?"
      >
        <p className="text-sm text-muted-foreground">
          « {task.title} » sera supprimée définitivement. Cette action est irréversible.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Annuler
          </Button>
          <Form method="post" onSubmit={() => toast("Tâche supprimée", { variant: "success" })}>
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={task.id} />
            <Button
              type="submit"
              variant="destructive"
              isLoading={deleting}
              loadingLabel="Suppression…"
            >
              Supprimer
            </Button>
          </Form>
        </div>
      </Dialog>
    </>
  );
}