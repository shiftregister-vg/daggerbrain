import type { SecondaryWeapon } from '@domain/schemas/compendium';

// todo: verify all below

export const TIER_1_SECONDARY_WEAPONS = {
} as const satisfies Record<string, SecondaryWeapon>;
