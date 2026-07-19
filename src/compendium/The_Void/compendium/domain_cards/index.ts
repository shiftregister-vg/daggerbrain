import type { DomainCard } from '@domain/schemas/compendium';
import { BLOOD_DOMAIN_CARDS } from './blood-cards';

export const DOMAIN_CARDS = {
	...BLOOD_DOMAIN_CARDS
} as const satisfies Record<string, DomainCard>;
