import { env } from '$env/dynamic/private';
import Database from 'better-sqlite3';
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3';
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as pgSchema from './schema';
import * as sqliteSchema from './schema.sqlite';

const globalForDb = globalThis as typeof globalThis & {
	daggerbrainPool?: Pool;
	daggerbrainSqlite?: Database.Database;
};

const connectionString = env.DATABASE_URL;

if (!connectionString) {
	console.warn('DATABASE_URL is not configured. Use postgres://... or file:./data/local.db.');
}

export const databaseDialect = connectionString?.startsWith('file:') ? 'sqlite' : 'postgres';

function createPostgresPool() {
	return new Pool({ connectionString });
}

function createSqliteDatabase() {
	const path = connectionString?.replace(/^file:/, '') ?? './data/local.db';
	const database = new Database(path);
	database.pragma('foreign_keys = ON');
	return database;
}

export const pool =
	databaseDialect === 'postgres'
		? (globalForDb.daggerbrainPool ?? createPostgresPool())
		: undefined;

export const sqlite =
	databaseDialect === 'sqlite'
		? (globalForDb.daggerbrainSqlite ?? createSqliteDatabase())
		: undefined;

if (env.NODE_ENV !== 'production') {
	if (pool) globalForDb.daggerbrainPool = pool;
	if (sqlite) globalForDb.daggerbrainSqlite = sqlite;
}

export const db =
	databaseDialect === 'sqlite'
		? drizzleSqlite(sqlite!, { schema: sqliteSchema })
		: drizzlePostgres({ client: pool!, schema: pgSchema });

export type Db = typeof db;

function postgresSql(query: string) {
	let index = 0;
	return query.replace(/\?/g, () => `$${++index}`);
}

function sqliteParam(value: unknown) {
	if (typeof value === 'boolean') return value ? 1 : 0;
	return value;
}

export async function queryRows<T>(query: string, params: unknown[] = []): Promise<T[]> {
	if (databaseDialect === 'sqlite') {
		return sqlite!.prepare(query).all(...params.map(sqliteParam)) as T[];
	}

	const result = await pool!.query(postgresSql(query), params);
	return result.rows as T[];
}

export async function queryOne<T>(query: string, params: unknown[] = []): Promise<T | null> {
	const rows = await queryRows<T>(query, params);
	return rows[0] ?? null;
}

export async function execute(query: string, params: unknown[] = []) {
	if (databaseDialect === 'sqlite') {
		sqlite!.prepare(query).run(...params.map(sqliteParam));
		return;
	}

	await pool!.query(postgresSql(query), params);
}

export function jsonParam(value: unknown) {
	return JSON.stringify(value);
}

export function parseJson<T>(value: unknown): T {
	if (typeof value === 'string') return JSON.parse(value) as T;
	return value as T;
}
