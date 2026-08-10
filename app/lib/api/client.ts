// Pourquoi : interface du transport — tout le reste du code ne connaît que ça.
// Le mock (§mock.ts) et le vrai backend partagent ce contrat.
// Passer au réel : remplacez fetchTasks ci-dessous, rien d'autre ne bouge.

import type { ApiError, Task, TaskFilters, TaskInput } from "./types";

export interface ApiClient {
  listTasks(filters?: TaskFilters): Promise<Task[]>;
  getTask(id: string): Promise<Task>;
  createTask(input: TaskInput): Promise<Task>;
  updateTask(id: string, input: Partial<TaskInput>): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}

export function apiError(message: string, fieldErrors?: Record<string, string>, status?: number): ApiError {
  return { message, fieldErrors, status };
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as ApiError).message === "string"
  );
}