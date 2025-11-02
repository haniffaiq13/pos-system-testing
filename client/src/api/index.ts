// API client - switches between mock and real adapter based on environment

import { mockAdapter } from "./mockAdapter";
import { realAdapter } from "./realAdapter";
import type { ApiAdapter } from "./types";

// Switch based on VITE_USE_MOCKS environment variable
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS !== 'false';

export const api: ApiAdapter = USE_MOCKS ? mockAdapter : realAdapter;

// Re-export types
export type * from "./types";
