import {
	pgTable,
	text as pgText,
	timestamp as pgTimestamp,
	uuid as pgUuid
} from 'drizzle-orm/pg-core';
import {
	integer as sqliteInteger,
	sqliteTable,
	text as sqliteText
} from 'drizzle-orm/sqlite-core';

export const pgAuthUsers = pgTable('users', {
	id: pgUuid('id').defaultRandom().primaryKey(),
	name: pgText('name'),
	email: pgText('email').notNull().unique(),
	emailVerified: pgTimestamp('email_verified', { mode: 'date' }),
	image: pgText('image')
});

export const sqliteAuthUsers = sqliteTable('users', {
	id: sqliteText('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: sqliteText('name'),
	email: sqliteText('email').notNull().unique(),
	emailVerified: sqliteInteger('email_verified', { mode: 'timestamp_ms' }),
	image: sqliteText('image')
});
