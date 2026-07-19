import type { Environment } from '@domain/schemas/compendium';

export const ENVIRONMENTS = {
} as const satisfies Record<string, Environment>;
