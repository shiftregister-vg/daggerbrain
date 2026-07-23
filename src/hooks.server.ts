import * as Sentry from '@sentry/sveltekit';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { handle as authHandle } from './auth';
import { ensureInviteAccessForRequest } from '$lib/server/app/invite-access';

const maintenanceModeHandle: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event);
	}

	if (env.MAINTENANCE_MODE === 'true' && !event.url.pathname.startsWith('/maintenance')) {
		const session = await event.locals.auth();
		const userId = session?.user?.id;

		const adminIds = env.ADMIN_USER_ID?.split(',') ?? [];

		if (!userId || !adminIds.includes(userId)) {
			throw redirect(302, '/maintenance');
		}
	}
	return resolve(event);
};

const inviteOnlyHandle: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event);
	}

	const session = await event.locals.auth();
	await ensureInviteAccessForRequest(session?.user?.id, event.url.pathname);
	return resolve(event);
};

const sentryCloudflareHandle = Sentry.initCloudflareSentryHandle({
	dsn: '',
	tracesSampleRate: 1.0,
	enableLogs: true,
	environment: dev ? 'development' : 'production'
});

export const handle = sequence(
	sentryCloudflareHandle,
	Sentry.sentryHandle(),
	authHandle,
	maintenanceModeHandle,
	inviteOnlyHandle
);
export const handleError = Sentry.handleErrorWithSentry();
