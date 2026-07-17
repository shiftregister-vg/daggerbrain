import type { CompendiumContent } from '@convex/schemas/compendium';
import { getContext, setContext } from 'svelte';
import { getUserContext } from './user.svelte';
import type { SourceKey } from '@convex/schemas/rules';
import {
	getOfficialCompendiumFromSourceKeys,
	getOfficialSourcesFromKeys
} from '$lib/compendium/official-sources';
import { createApiResource } from './api-resource.svelte';
import { getApi } from '$lib/api/client';

function createSources() {
	const userContext = getUserContext();

	const sourceResource = createApiResource<SourceKey[]>(async () => {
		if (!userContext.user) return [];
		return await getApi<SourceKey[]>('/sources');
	});
	const sourceKeys: SourceKey[] = $derived(sourceResource.data ?? []);
	const sources = $derived(getOfficialSourcesFromKeys(sourceKeys));
	const isLoading = $derived(userContext.isLoading || sourceResource.isLoading);
	const error = $derived(sourceResource.error);

	const compendium: CompendiumContent = $derived(getCompendiumFromSourceKeys(...sourceKeys));

	function getCompendiumFromSourceKeys(...source_keys: SourceKey[]): CompendiumContent {
		return getOfficialCompendiumFromSourceKeys(source_keys);
	}

	return {
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},
		get compendium() {
			return compendium;
		},
		get sources() {
			return sources;
		},

		getCompendiumFromSourceKeys
	};
}

const SOURCES_KEY = Symbol('Sources');

export const setSourcesContext = () => {
	const newSources = createSources();
	return setContext(SOURCES_KEY, newSources);
};

export const getSourcesContext = (): ReturnType<typeof setSourcesContext> => {
	return getContext(SOURCES_KEY);
};
