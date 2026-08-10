// Pourquoi : adaptateur mock — le catalogue et l'app tournent sans backend.
// Latence simulée, erreurs déclenchables à la demande (pour les fiches API/état).
// C'est la SEULE pièce branchée sur le « stockage » ; un swap vers le vrai
// client HTTP se fait ici ou en réexportant depuis client.ts.

import type { ApiClient } from "./client";
import { apiError } from "./client";
import type { Task, TaskFilters, TaskInput } from "./types";

// Latence simulée (±100 ms) pour voir les états de chargement
const latence = () => new Promise((r) => setTimeout(r, 120 + Math.random() * 180));

// Pour déclencher des erreurs manuellement (fiches « erreur serveur »)
export const mockBehavior = {
  failNextList: false,
  /** true → createTask rejette avec fieldErrors (validation serveur) */
  failNextCreate: false,
};

const now = () => new Date().toISOString();

const seed: Task[] = [
  { id: "t1", title: "Déployer le catalogue", description: "Les phases 1-3 en prod", status: "in_progress", priority: "high", owner: "Simbié", createdAt: "2026-08-01T09:00:00Z" },
  { id: "t2", title: "Écrire la fiche useEffect", description: "Ses quatre non-usages", status: "todo", priority: "medium", owner: "Ana", createdAt: "2026-08-02T14:30:00Z" },
  { id: "t3", title: "Vérifier la copiabilité", description: "Test de fumée sur chaque composant", status: "done", priority: "high", owner: "Simbié", createdAt: "2026-08-03T08:15:00Z" },
  { id: "t4", title: "Choisir la palette", description: "Tokens Tailwind 4", status: "done", priority: "low", owner: "Ana", createdAt: "2026-08-04T11:00:00Z" },
];

let store: Task[] = [...seed];

function matchesFilters(task: Task, f?: TaskFilters): boolean {
  if (!f) return true;
  if (f.status && task.status !== f.status) return false;
  if (f.priority && task.priority !== f.priority) return false;
  if (f.owner && task.owner !== f.owner) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    if (!(task.title.toLowerCase().includes(q) || task.description.toLowerCase().includes(q))) return false;
  }
  return true;
}

export const mockClient: ApiClient = {
  async listTasks(filters) {
    await latence();
    if (mockBehavior.failNextList) {
      mockBehavior.failNextList = false;
      throw apiError("Le serveur de démo a planté (erreur déclenchée).", undefined, 500);
    }
    return store.filter((t) => matchesFilters(t, filters)).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async getTask(id) {
    await latence();
    const task = store.find((t) => t.id === id);
    if (!task) throw apiError("Tâche introuvable.", undefined, 404);
    return task;
  },

  async createTask(input) {
    await latence();
    if (mockBehavior.failNextCreate) {
      mockBehavior.failNextCreate = false;
      throw apiError("La validation serveur a échoué.", {
        title: "Un titre identique existe déjà côté serveur.",
      });
    }
    const task: Task = {
      id: `t${Date.now()}`,
      title: input.title,
      description: input.description ?? "",
      status: input.status ?? "todo",
      priority: input.priority ?? "medium",
      owner: input.owner ?? "Vous",
      createdAt: now(),
    };
    store = [task, ...store];
    return task;
  },

  async updateTask(id, input) {
    await latence();
    const found = store.find((t) => t.id === id);
    if (!found) throw apiError("Tâche introuvable.", undefined, 404);
    const updated = { ...found, ...input };
    store = store.map((t) => (t.id === id ? updated : t));
    return updated;
  },

  async deleteTask(id) {
    await latence();
    store = store.filter((t) => t.id !== id);
  },
};