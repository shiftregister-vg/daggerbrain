import { error } from '@sveltejs/kit';
import { getAdminAccess } from '$lib/server/app/repository';

export const load = async (event) => {
	const session = await event.locals.auth();

	try {
		return {
			...(await getAdminAccess(session?.user?.id)),
			userId: event.params.user_id
		};
	} catch (accessError) {
		const message = accessError instanceof Error ? accessError.message : 'Not authorized';
		if (message === 'Unauthenticated') throw error(401, message);
		throw error(403, 'Not authorized');
	}
};
