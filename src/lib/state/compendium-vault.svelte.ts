import type { Id } from '@convex/_generated/dataModel';
import type { CompendiumContent, CompendiumContentIds } from '@convex/schemas/compendium';
import type { HomebrewAccess, HomebrewItem, HomebrewTable } from '@convex/permissions';
import { onDestroy } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { merge_compendium_content } from '$lib/utils';
import { getApi } from '$lib/api/client';

const VAULT_KEYS = [
	'primary_weapons',
	'secondary_weapons',
	'armor',
	'loot',
	'consumables',
	'beastforms',
	'classes',
	'subclasses',
	'domains',
	'domain_cards',
	'ancestry_cards',
	'community_cards',
	'transformation_cards',
	'adversaries',
	'environments'
] as const satisfies (keyof CompendiumContentIds)[];

type VaultSourceOverride = HomebrewItem<HomebrewTable>['source_key'];

function itemsFor<T extends HomebrewTable>(
	ids: Id<T>[],
	results: SvelteMap<string, HomebrewAccess<HomebrewTable> | null>,
	sourceKeyOverride?: VaultSourceOverride
): Record<string, HomebrewItem<T>> {
	const entries: [string, HomebrewItem<T>][] = [];
	for (const id of ids) {
		const data = results.get(id);
		if (data?.item != null) {
			const item = data.item as HomebrewItem<T>;
			entries.push([
				id,
				sourceKeyOverride ? ({ ...item, source_key: sourceKeyOverride } as HomebrewItem<T>) : item
			]);
		}
	}

	return Object.fromEntries(entries) as Record<string, HomebrewItem<T>>;
}

function firstErrorFromMap(errors: SvelteMap<string, Error>): Error | null {
	for (const value of errors.values()) {
		return value;
	}

	return null;
}

function getAllVaultIds(vault: CompendiumContentIds): string[] {
	const ids: string[] = [];
	for (const key of VAULT_KEYS) {
		ids.push(...vault[key]);
	}

	return ids;
}

export function hasAnyVaultItems(vault: CompendiumContentIds | null | undefined): boolean {
	if (!vault) return false;

	return VAULT_KEYS.some((key) => vault[key].length > 0);
}

export function createVaultCompendiumSubscription(options: {
	getVault: () => CompendiumContentIds | null;
	getPrereqLoading?: () => boolean;
	sourceKeyOverride?: VaultSourceOverride;
}) {
	const results = new SvelteMap<string, HomebrewAccess<HomebrewTable> | null>();
	const subscriptionErrors = new SvelteMap<string, Error>();
	let generation = 0;

	onDestroy(() => {
		results.clear();
		subscriptionErrors.clear();
	});

	async function refresh() {
		const vault = options.getVault();
		if (!vault) {
			results.clear();
			subscriptionErrors.clear();
			return;
		}

		const currentGeneration = ++generation;
		const ids = getAllVaultIds(vault);
		for (const id of ids) {
			try {
				const data = await getApi<HomebrewAccess<HomebrewTable> | null>(`/homebrew/${id}`);
				if (currentGeneration === generation) {
					subscriptionErrors.delete(id);
					results.set(id, data);
				}
			} catch (error) {
				if (currentGeneration === generation) {
					subscriptionErrors.set(
						id,
						error instanceof Error ? error : new Error('Failed to load homebrew item')
					);
				}
			}
		}

		for (const id of [...results.keys()]) {
			if (!ids.includes(id)) results.delete(id);
		}
	}

	$effect(() => {
		void refresh();
	});

	const isReady = $derived.by(() => {
		if (options.getPrereqLoading?.()) return false;

		const vault = options.getVault();
		if (!vault) return true;

		return getAllVaultIds(vault).every((id) => results.has(id));
	});

	const error = $derived.by(() => firstErrorFromMap(subscriptionErrors));
	const isLoading = $derived.by(() => !!options.getPrereqLoading?.() || (!isReady && !error));

	const compendium: CompendiumContent | null = $derived.by(() => {
		const vault = options.getVault();
		if (!vault) return null;

		return {
			primary_weapons: itemsFor(vault.primary_weapons, results, options.sourceKeyOverride),
			secondary_weapons: itemsFor(vault.secondary_weapons, results, options.sourceKeyOverride),
			armor: itemsFor(vault.armor, results, options.sourceKeyOverride),
			loot: itemsFor(vault.loot, results, options.sourceKeyOverride),
			consumables: itemsFor(vault.consumables, results, options.sourceKeyOverride),
			beastforms: itemsFor(vault.beastforms, results, options.sourceKeyOverride),
			classes: itemsFor(vault.classes, results, options.sourceKeyOverride),
			subclasses: itemsFor(vault.subclasses, results, options.sourceKeyOverride),
			domains: itemsFor(vault.domains, results, options.sourceKeyOverride),
			domain_cards: itemsFor(vault.domain_cards, results, options.sourceKeyOverride),
			ancestry_cards: itemsFor(vault.ancestry_cards, results, options.sourceKeyOverride),
			community_cards: itemsFor(vault.community_cards, results, options.sourceKeyOverride),
			transformation_cards: itemsFor(
				vault.transformation_cards,
				results,
				options.sourceKeyOverride
			),
			adversaries: itemsFor(vault.adversaries, results, options.sourceKeyOverride),
			environments: itemsFor(vault.environments, results, options.sourceKeyOverride)
		};
	});

	return {
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get compendium() {
			return compendium ?? merge_compendium_content();
		}
	};
}
