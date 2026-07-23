import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { databaseDialect, execute, queryOne } from '$lib/server/db/client';

type InviteAccessUserRow = {
	id: string;
	email: string | null;
	disabled_at: string | number | null;
	banned_at: string | number | null;
	invite_accepted_at: string | number | null;
};

function nowIso() {
	return new Date().toISOString();
}

function nowDbTimestamp() {
	return databaseDialect === 'sqlite' ? Date.now() : nowIso();
}

function normalizedEmail(email: string | null | undefined) {
	return email?.trim().toLowerCase() ?? '';
}

function bootstrapAdminEmails() {
	return new Set(
		(env.ADMIN_EMAIL ?? '')
			.split(',')
			.map((email) => normalizedEmail(email))
			.filter(Boolean)
	);
}

function isBootstrapAdminEmail(email: string | null | undefined) {
	const normalized = normalizedEmail(email);
	return Boolean(normalized && bootstrapAdminEmails().has(normalized));
}

async function ensureBootstrapAdminAccess(user: InviteAccessUserRow) {
	if (!isBootstrapAdminEmail(user.email)) return false;

	const acceptedAt = nowDbTimestamp();
	await execute('update users set is_admin = ?, invite_accepted_at = coalesce(invite_accepted_at, ?), updated_at = ? where id = ?', [
		true,
		acceptedAt,
		acceptedAt,
		user.id
	]);
	return true;
}

function isProvisionalAllowedPath(pathname: string) {
	return (
		pathname === '/invite-required' ||
		pathname === '/' ||
		pathname === '/favicon.svg' ||
		pathname === '/manifest.json' ||
		pathname === '/robots.txt' ||
		pathname === '/sitemap.xml' ||
		pathname === '/llms.txt' ||
		pathname.startsWith('/auth/') ||
		pathname.startsWith('/_app/') ||
		pathname.startsWith('/fonts/') ||
		pathname.startsWith('/images/') ||
		pathname.startsWith('/invites/') ||
		pathname.startsWith('/campaigns/join/') ||
		pathname === '/api/app/me' ||
		pathname.startsWith('/api/app/invites/') ||
		pathname.startsWith('/api/app/access-invites/')
	);
}

export async function acceptCampaignInviteForUser(
	userId: string,
	email: string | null | undefined,
	campaignId: string,
	inviteCode: string
) {
	const acceptedAt = nowDbTimestamp();
	await execute('update users set invite_accepted_at = ?, updated_at = ? where id = ?', [
		acceptedAt,
		acceptedAt,
		userId
	]);
	await execute(
		`insert into invitations (
			id,
			invite_type,
			email,
			invite_code,
			campaign_id,
			accepted_by_user_id,
			accepted_at,
			created_at,
			updated_at
		) values (?, ?, ?, ?, ?, ?, ?, ?, ?)
		on conflict(invite_code) do update set
			email = excluded.email,
			campaign_id = excluded.campaign_id,
			accepted_by_user_id = excluded.accepted_by_user_id,
			accepted_at = excluded.accepted_at,
			updated_at = excluded.updated_at`,
		[
			crypto.randomUUID(),
			'campaign',
			normalizedEmail(email) || null,
			`${inviteCode}:${userId}`,
			campaignId,
			userId,
			acceptedAt,
			acceptedAt,
			acceptedAt
		]
	);
}

export async function ensureInviteAccessForRequest(userId: string | undefined, pathname: string) {
	if (!userId) return;

	const user = await queryOne<InviteAccessUserRow>(
		'select id, email, disabled_at, banned_at, invite_accepted_at from users where id = ?',
		[userId]
	);
	if (!user) return;
	if (user.banned_at || user.disabled_at) return;
	if (user.invite_accepted_at) return;
	if (await ensureBootstrapAdminAccess(user)) return;
	if (isProvisionalAllowedPath(pathname)) return;

	throw redirect(302, '/invite-required');
}
