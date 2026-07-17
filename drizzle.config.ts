import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL ?? '';
const isSqlite = databaseUrl.startsWith('file:');

export default defineConfig({
	schema: isSqlite ? './src/lib/server/db/schema.sqlite.ts' : './src/lib/server/db/schema.ts',
	out: isSqlite ? './drizzle/sqlite' : './drizzle',
	dialect: isSqlite ? 'sqlite' : 'postgresql',
	dbCredentials: isSqlite
		? { url: databaseUrl.replace(/^file:/, '') || './data/local.db' }
		: { url: databaseUrl }
});
