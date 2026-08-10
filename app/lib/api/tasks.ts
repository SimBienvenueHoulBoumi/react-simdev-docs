// Pourquoi : le point d'entrée du domaine pour les routes.
// Les routes n'importent QUE ce fichier — pas le mock, pas le client HTTP.
// Pour passer au vrai backend : changez l'import ci-dessous, rien d'autre.

import { mockClient, mockBehavior } from "./mock";
import type { ApiClient } from "./client";

export type { Task, TaskFilters, TaskInput, ApiError } from "./types";
export { isApiError } from "./client";

// Seul endroit qui décide qui sert les données
export const api: ApiClient = mockClient;

export { mockBehavior };