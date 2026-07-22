import type { CompendiumContentIds } from './schemas/compendium';

export function createEmptyCompendiumContentIds(): CompendiumContentIds {
	return {
		primary_weapons: [],
		secondary_weapons: [],
		armor: [],
		loot: [],
		consumables: [],
		beastforms: [],
		classes: [],
		subclasses: [],
		domains: [],
		domain_cards: [],
		ancestry_cards: [],
		community_cards: [],
		transformations: [],
		character_sheet_addons: [],
		adversaries: [],
		environments: []
	};
}

export function normalizeCompendiumContentIds(value: Partial<CompendiumContentIds> | null | undefined): CompendiumContentIds {
	return {
		...createEmptyCompendiumContentIds(),
		...(value ?? {})
	};
}
