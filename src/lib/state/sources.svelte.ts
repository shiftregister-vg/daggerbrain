import type { CompendiumContent } from '@domain/schemas/compendium';
import { getContext, setContext, untrack } from 'svelte';
import { getUserContext } from './user.svelte';
import type { SourceKey } from '@domain/schemas/rules';
import type { SourceMetadata } from '@domain/schemas/sources';
import { createApiResource } from './api-resource.svelte';
import { getApi } from '$lib/api/client';
import { merge_compendium_content } from '$lib/utils';

function sourceQuery(sourceKeys: SourceKey[]) {
	const params = new URLSearchParams();
	for (const sourceKey of sourceKeys) params.append('source_key', sourceKey);
	const query = params.toString();
	return query ? `?${query}` : '';
}

function sameSourceKeys(left: SourceKey[], right: SourceKey[]) {
	return left.length === right.length && left.every((sourceKey, index) => sourceKey === right[index]);
}

function createSources() {
	const userContext = getUserContext();

	const sourceResource = createApiResource<SourceKey[]>(async () => {
		if (!userContext.user) return [];
		return await getApi<SourceKey[]>('/sources');
	});
	const sourceKeys: SourceKey[] = $derived(sourceResource.data ?? []);
	const sourceKeySignature = $derived(sourceKeys.join('|'));
	const sourceMetadataResource = createApiResource<SourceMetadata[]>(async () => {
		if (!userContext.user || sourceKeys.length === 0) return [];
		return await getApi<SourceMetadata[]>(`/official-sources${sourceQuery(sourceKeys)}`);
	});
	const compendiumResource = createApiResource<CompendiumContent>(async () => {
		if (!userContext.user || sourceKeys.length === 0) return merge_compendium_content();
		return await getApi<CompendiumContent>(`/official-compendium${sourceQuery(sourceKeys)}`);
	}, { immediate: false });
	const sources = $derived(sourceMetadataResource.data ?? []);
	const isLoading = $derived(
		userContext.isLoading ||
			sourceResource.isLoading ||
			sourceMetadataResource.isLoading ||
			compendiumResource.isLoading
	);
	const error = $derived(
		sourceResource.error ?? sourceMetadataResource.error ?? compendiumResource.error
	);

	const compendium: CompendiumContent = $derived(
		compendiumResource.data ?? merge_compendium_content()
	);

	function getCompendiumFromSourceKeys(...source_keys: SourceKey[]): CompendiumContent {
		if (sameSourceKeys(source_keys, sourceKeys)) return compendium;
		return merge_compendium_content();
	}

	function loadCompendium() {
		return compendiumResource.refresh();
	}

	$effect(() => {
		sourceKeySignature;
		untrack(() => void sourceMetadataResource.refresh());
	});

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

		getCompendiumFromSourceKeys,
		loadCompendium
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
