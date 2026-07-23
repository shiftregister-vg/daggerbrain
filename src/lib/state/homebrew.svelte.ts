import type { Id } from '@domain/ids';
import type { CompendiumContent } from '@domain/schemas/compendium';
import type { HomebrewItem, HomebrewTable } from '@domain/permissions';
import { getContext, setContext, untrack } from 'svelte';
import { createApiResource } from './api-resource.svelte';
import { deleteApi, getApi, patchApi, postApi } from '$lib/api/client';
import { getUserContext } from './user.svelte';

type AddHomebrewData = {
	type: HomebrewTable;
	item: HomebrewItem<HomebrewTable>;
};

type UpdateHomebrewData = AddHomebrewData & {
	id: string;
};

function createHomebrew() {
	const userContext = getUserContext();
	const userInviteAccepted = $derived(userContext.user?.invite_accepted === true);
	const resource = createApiResource<CompendiumContent | null>(
		async () => {
			if (!userContext.user?.invite_accepted) return null;
			return await getApi<CompendiumContent>('/homebrew');
		}
	);

	$effect(() => {
		userInviteAccepted;
		untrack(() => void resource.refresh());
	});

	async function addItem(data: AddHomebrewData) {
		const result = await postApi<{ id: Id<HomebrewTable> }>('/homebrew', data);
		await Promise.all([resource.refresh()]);
		return result.id;
	}

	async function removeItem(id: Id<HomebrewTable>) {
		await deleteApi<void>(`/homebrew/${id}`);
		await resource.refresh();
	}

	async function updateItem(data: UpdateHomebrewData) {
		await patchApi<void>('/homebrew', data);
		await resource.refresh();
	}

	return {
		get isLoading() {
			return resource.isLoading;
		},
		get error() {
			return resource.error;
		},
		get compendium() {
			return resource.data;
		},
		addItem,
		removeItem,
		updateItem
	};
}

const HOMEBREW_KEY = Symbol('Homebrew');

export const setHomebrewContext = () => {
	const newHomebrew = createHomebrew();
	return setContext(HOMEBREW_KEY, newHomebrew);
};

export const getHomebrewContext = (): ReturnType<typeof setHomebrewContext> => {
	return getContext(HOMEBREW_KEY);
};
