// Pourquoi : interfaces du domaine — la seule source de vérité des formes de données.
// Les composants ne les importent jamais (contrat §5.1) ; les routes et features si.

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  owner: string;
  createdAt: string;
}

export type TaskStatus = Task["status"];
export type TaskPriority = Task["priority"];

export interface TaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  owner?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  owner?: string;
  search?: string;
}

export interface ApiError {
  /** Message stable, affichable (mock ou vrai backend) */
  message: string;
  /** Erreurs champ par champ, pour les formulaires (§11) */
  fieldErrors?: Record<string, string>;
  status?: number;
}