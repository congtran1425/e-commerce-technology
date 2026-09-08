import type { RecipeDetail, RecipeSummary } from './types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

type ApiResponse<T> = { data: T };

export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function get<T>(path: string, signal?: AbortSignal) {
  const response = await fetch(`${apiBaseUrl}${path}`, { signal, credentials: 'include' });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: { message?: string } }
      | null;
    throw new ApiError(response.status, body?.error?.message ?? 'Không tải được dữ liệu.');
  }

  return (await response.json() as ApiResponse<T>).data;
}

export function fetchRecipes(signal?: AbortSignal) {
  return get<RecipeSummary[]>('/recipes', signal);
}

export function fetchRecipe(slug: string, servings?: number, signal?: AbortSignal) {
  const query = servings ? `?servings=${servings}` : '';
  return get<RecipeDetail>(`/recipes/${encodeURIComponent(slug)}${query}`, signal);
}
