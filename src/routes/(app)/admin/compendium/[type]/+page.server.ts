import { error } from '@sveltejs/kit';
import { getAdminAccess } from '$lib/server/app/repository';
import { OFFICIAL_COMPENDIUM_TABLES } from '$lib/server/compendium/official-seed';
import type { HomebrewTable } from '@domain/permissions';

export const load = async (event) => {
	const session = await event.locals.auth();
	const type = event.params.type as HomebrewTable;

	if (!OFFICIAL_COMPENDIUM_TABLES.includes(type)) {
		throw error(404, 'Compendium entity type not found');
	}

	try {
		return {
			...(await getAdminAccess(session?.user?.id)),
			type
		};
	} catch (accessError) {
		const message = accessError instanceof Error ? accessError.message : 'Not authorized';
		if (message === 'Unauthenticated') throw error(401, message);
		throw error(403, 'Not authorized');
	}
};
