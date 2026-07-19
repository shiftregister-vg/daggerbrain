import type { CompendiumContent } from '@domain/schemas/compendium';
import { CLASSES } from './classes';
import { DOMAIN_CARDS } from './domain_cards';
import { DOMAINS } from './domains';
import { SUBCLASSES } from './subclasses';

export const COMPENDIUM: CompendiumContent = {
	primary_weapons: {},
	secondary_weapons: {},
	armor: {},
	loot: {},
	consumables: {},
	beastforms: {},
	classes: CLASSES,
	subclasses: SUBCLASSES,
	domains: DOMAINS,
	domain_cards: DOMAIN_CARDS,
	ancestry_cards: {},
	community_cards: {},
	transformation_cards: {},
	adversaries: {},
	environments: {}
};
