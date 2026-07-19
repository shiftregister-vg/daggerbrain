import type { PrimaryWeapon } from '@domain/schemas/compendium';

// todo: verify all below

export const TIER_1_PRIMARY_WEAPONS = {
} as const satisfies Record<string, PrimaryWeapon>;
