import { SvelteKitAuth } from '@auth/sveltekit';
import type { SvelteKitAuthConfig } from '@auth/sveltekit';
import Google from '@auth/sveltekit/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { env } from '$env/dynamic/private';
import { databaseDialect, db } from '$lib/server/db/client';
import * as pgSchema from '$lib/server/db/schema';
import * as sqliteSchema from '$lib/server/db/schema.sqlite';

const schema = databaseDialect === 'sqlite' ? sqliteSchema : pgSchema;

const authTables = {
	usersTable: schema.users,
	accountsTable: schema.accounts,
	sessionsTable: schema.sessions,
	verificationTokensTable: schema.verificationTokens,
	authenticatorsTable: schema.authenticators
};

const authConfig = {
	adapter: DrizzleAdapter(db as never, authTables as never),
	providers: [
		Google({
			clientId: env.GOOGLE_CLIENT_ID ?? '',
			clientSecret: env.GOOGLE_CLIENT_SECRET ?? ''
		})
	],
	secret: env.AUTH_SECRET ?? '',
	trustHost: true,
	callbacks: {
		session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
			}
			return session;
		}
	}
} satisfies SvelteKitAuthConfig;

export const { handle, signIn, signOut } = SvelteKitAuth(authConfig);
