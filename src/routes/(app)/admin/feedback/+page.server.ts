import { getAdminAccess } from '$lib/server/app/repository';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	try {
		const session = await locals.auth();
		return await getAdminAccess(session?.user?.id);
	} catch {
		throw redirect(302, '/');
	}
}
