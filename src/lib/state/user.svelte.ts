import type { Id } from '@convex/_generated/dataModel';
import { CHARACTER_DEFAULTS } from '@convex/constants/constants';
import { getContext, setContext } from 'svelte';
import { upload_user_image } from '$lib/remote/images.remote';
import { page } from '$app/state';
import { createEmptyCompendiumContentIds } from '@convex/lib/characterCompendium';
import { createApiResource } from './api-resource.svelte';
import { deleteApi, getApi, postApi } from '$lib/api/client';

type AppUser = {
	_id: Id<'users'>;
	clerk_id: string;
	campaign_ids: Id<'campaigns'>[];
	character_count: number;
	homebrew_count: number;
	homebrew_vault: ReturnType<typeof createEmptyCompendiumContentIds>;
	name?: string | null;
	email?: string | null;
	image?: string | null;
};

function userContext() {
	const sessionUser = $derived(page.data.session?.user);
	const userResource = createApiResource<AppUser | null>(async () => {
		if (!sessionUser?.id) return null;
		return await getApi<AppUser>('/me');
	});
	const fallbackUser: AppUser | null = $derived.by(() =>
		sessionUser?.id
			? {
					_id: sessionUser.id as Id<'users'>,
					clerk_id: sessionUser.id,
					campaign_ids: [],
					character_count: 0,
					homebrew_count: 0,
					homebrew_vault: createEmptyCompendiumContentIds(),
					name: sessionUser.name,
					email: sessionUser.email,
					image: sessionUser.image
				}
			: null
	);
	const user: AppUser | null = $derived(userResource.data ?? fallbackUser);

	const character_limits = $derived.by(() => {
		return { has_unlimited: true, can_create_character: !!user };
	});

	const homebrew_limits = $derived.by(() => {
		return { has_unlimited: true, can_create_homebrew: !!user };
	});
	const isLoading = $derived(userResource.isLoading);
	const error = $derived(userResource.error);

	async function createCharacter(): Promise<Id<'characters'>> {
		if (!user) {
			throw new Error('User not found');
		}

		const result = await postApi<{ id: Id<'characters'> }>('/characters', CHARACTER_DEFAULTS);
		await userResource.refresh();
		return result.id;
	}

	async function deleteCharacter(id: Id<'characters'>): Promise<void> {
		await deleteApi<void>(`/characters/${id}`);
		await userResource.refresh();
	}

	const uploadImage = async (params: { data: string; name: string; type: string }) => {
		const result = await upload_user_image(params);
		if (!result.ok) {
			throw new Error(result.message);
		}

		return result.data;
	};

	return {
		get user() {
			return user;
		},
		get features() {
			return [];
		},
		get character_limits() {
			return character_limits;
		},
		get homebrew_limits() {
			return homebrew_limits;
		},
		get isLoading() {
			return isLoading;
		},
		get error() {
			return error;
		},

		createCharacter,
		deleteCharacter,
		uploadImage
	};
}

const USER_CONTEXT_KEY = Symbol('UserContext');

export const setUserContext = () => {
	const newUserContext = userContext();
	return setContext(USER_CONTEXT_KEY, newUserContext);
};

export const getUserContext = (): ReturnType<typeof setUserContext> => {
	return getContext(USER_CONTEXT_KEY) as ReturnType<typeof setUserContext>;
};
