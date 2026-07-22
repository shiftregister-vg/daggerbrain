import { CHARACTER_DEFAULTS } from '@domain/constants/constants';
import type { Campaign, CampaignCharacter, CampaignMember } from '@domain/schemas/campaigns';
import type {
	Character,
	CharacterCompendiumScope,
	OfficialSourceVersions
} from '@domain/schemas/characters';
import type { CompendiumContent, CompendiumContentIds } from '@domain/schemas/compendium';
import type { DiceHistory } from '@domain/schemas/dice';
import type { Encounter } from '@domain/schemas/encounters';
import type { SourceKey } from '@domain/schemas/rules';
import type { SourceMetadata } from '@domain/schemas/sources';
import type { HomebrewAccess, HomebrewItem, HomebrewTable } from '@domain/permissions';
import type { Id } from '@domain/ids';
import { publish } from './events';
import { execute, jsonParam, parseJson, queryOne, queryRows } from '$lib/server/db/client';
import {
	createEmptyCompendiumContentIds,
	normalizeCompendiumContentIds
} from '@domain/character-compendium';
import {
	OFFICIAL_COMPENDIUM_TABLES,
	ensureOfficialCompendiumSeeded,
	validateOfficialCompendiumItem
} from '$lib/server/compendium/official-seed';

const VAULT_KEYS = [
	'primary_weapons',
	'secondary_weapons',
	'armor',
	'loot',
	'consumables',
	'beastforms',
	'classes',
	'subclasses',
	'domains',
	'domain_cards',
	'ancestry_cards',
	'community_cards',
	'transformations',
	'adversaries',
	'environments'
] as const satisfies (keyof CompendiumContentIds)[];

type UserRow = {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
	is_admin: boolean | number;
	homebrew_vault: unknown;
};

type CharacterRow = {
	id: string;
	owner_user_id: string;
	campaign_id: string | null;
	character: unknown;
};

type CampaignRow = {
	id: string;
	invite_code: string;
	campaign: unknown;
	members: unknown;
	characters: unknown;
};

type EncounterRow = {
	id: string;
	owner_user_id: string;
	encounter: unknown;
};

type HomebrewRow = {
	id: string;
	owner_user_id: string;
	type: HomebrewTable;
	item: unknown;
};

type OfficialSourceRow = {
	source_key: SourceKey;
	metadata: unknown;
	enabled: boolean | number;
	deleted_at?: string | number | null;
};

type OfficialCompendiumItemRow = {
	item_type: HomebrewTable;
	item_id: string;
	source_key: SourceKey;
	current_version: string | number;
	created_at?: string | number;
	updated_at: string | number;
	deleted_at?: string | number | null;
};

type OfficialCompendiumItemVersionRow = {
	item_type: HomebrewTable;
	item_id: string;
	source_key: SourceKey;
	item_version: string | number;
	label: string;
	changelog: string;
	item: unknown;
	created_at: string | number;
	published_at: string | number;
	deleted_at?: string | number | null;
};

type CompendiumTransferSource = SourceMetadata & {
	enabled: boolean;
	created_at?: string | number;
	updated_at?: string | number;
	deleted_at?: string | number | null;
};

type CompendiumTransferItem = {
	item_type: HomebrewTable;
	item_id: string;
	source_key: SourceKey;
	current_version: number;
	created_at?: string | number;
	updated_at?: string | number;
	deleted_at?: string | number | null;
};

type CompendiumTransferVersion = {
	item_type: HomebrewTable;
	item_id: string;
	source_key: SourceKey;
	item_version: number;
	label: string;
	changelog: string;
	item: unknown;
	created_at?: string | number;
	published_at?: string | number;
	deleted_at?: string | number | null;
};

type CompendiumTransfer = {
	format: 'daggerlore-compendium-transfer';
	format_version: 1;
	exported_at: string;
	sources: CompendiumTransferSource[];
	items: CompendiumTransferItem[];
	versions: CompendiumTransferVersion[];
};

type CompendiumImportAction =
	| 'create'
	| 'update'
	| 'restore'
	| 'delete'
	| 'import'
	| 'advance'
	| 'skip'
	| 'conflict'
	| 'unchanged';

type CompendiumImportResolution =
	| 'skip'
	| 'replace'
	| 'next_version'
	| { action: 'skip' | 'replace' | 'next_version' | 'custom_version'; version?: number };

type CompendiumImportRequest = {
	transfer: CompendiumTransfer;
	resolutions: {
		version_conflicts: Record<string, CompendiumImportResolution>;
	};
};

type StreamOverlayRow = {
	id: string;
	campaign_id: string;
	token: string;
	enabled: boolean | number;
	modules: unknown;
	settings: unknown;
	layout: unknown;
};

function newId() {
	return crypto.randomUUID();
}

function nowIso() {
	return new Date().toISOString();
}

function requireUserId(userId: string | undefined) {
	if (!userId) throw new Error('Unauthenticated');
	return userId;
}

function parseVault(value: unknown): CompendiumContentIds {
	return normalizeCompendiumContentIds(value ? parseJson<Partial<CompendiumContentIds>>(value) : null);
}

function countHomebrewVault(vault: CompendiumContentIds): number {
	return Object.values(vault).reduce((total, ids) => total + ids.length, 0);
}

function emptyCompendium(): CompendiumContent {
	return {
		primary_weapons: {},
		secondary_weapons: {},
		armor: {},
		loot: {},
		consumables: {},
		beastforms: {},
		classes: {},
		subclasses: {},
		domains: {},
		domain_cards: {},
		ancestry_cards: {},
		community_cards: {},
		transformations: {},
		character_sheet_addons: {},
		adversaries: {},
		environments: {}
	};
}

async function getUserRow(userId: string): Promise<UserRow> {
	const row = await queryOne<UserRow>(
		'select id, name, email, image, is_admin, homebrew_vault from users where id = ?',
		[userId]
	);
	if (!row) throw new Error('User not found');
	return row;
}

function isAdminValue(value: boolean | number) {
	return value === true || value === 1;
}

function isEnabledValue(value: boolean | number) {
	return value === true || value === 1;
}

function placeholders(values: unknown[]) {
	return values.map(() => '?').join(', ');
}

async function getUnlockedSourceKeys(userId: string): Promise<SourceKey[]> {
	await ensureOfficialCompendiumSeeded();
	const row = await queryOne<{ unlocked_source_keys: unknown }>(
		'select unlocked_source_keys from user_unlocked_sources where user_id = ?',
		[userId]
	);
	const unlockedSourceKeys = row ? parseJson<SourceKey[]>(row.unlocked_source_keys) : [];
	const enabledSources = await queryRows<{ source_key: SourceKey }>(
		'select source_key from official_sources where enabled = true and deleted_at is null order by source_key'
	);
	return [...new Set([...enabledSources.map((source) => source.source_key), ...unlockedSourceKeys])];
}

export async function getCurrentUser(userId: string | undefined) {
	const id = requireUserId(userId);
	const [user, characterCount, homebrewCount, campaigns] = await Promise.all([
		getUserRow(id),
		queryOne<{ count: string | number }>('select count(*) as count from characters where owner_user_id = ?', [
			id
		]),
		queryOne<{ count: string | number }>(
			'select count(*) as count from homebrew_items where owner_user_id = ?',
			[id]
		),
		queryRows<{ id: string }>('select id from campaigns')
	]);

	const campaignIds: string[] = [];
	for (const campaign of campaigns) {
		const access = await getCampaignAccess(id, campaign.id);
		if (access) campaignIds.push(campaign.id);
	}

	return {
		_id: user.id,
		clerk_id: user.id,
		campaign_ids: campaignIds,
		character_count: Number(characterCount?.count ?? 0),
		homebrew_count: Number(homebrewCount?.count ?? 0),
		homebrew_vault: parseVault(user.homebrew_vault),
		is_admin: isAdminValue(user.is_admin),
		name: user.name,
		email: user.email,
		image: user.image
	};
}

export async function getAdminAccess(userId: string | undefined) {
	const id = requireUserId(userId);
	const user = await getUserRow(id);
	if (!isAdminValue(user.is_admin)) throw new Error('Not authorized');

	return {
		is_admin: true,
		user: {
			_id: user.id,
			name: user.name,
			email: user.email,
			image: user.image
		}
	};
}

export async function listSources(userId: string | undefined) {
	const id = requireUserId(userId);
	return getUnlockedSourceKeys(id);
}

function parseOfficialSourceRow(row: OfficialSourceRow): SourceMetadata {
	const metadata = parseJson<SourceMetadata>(row.metadata);
	return { ...metadata, source_key: row.source_key };
}

function addOfficialItemToCompendium(
	compendium: CompendiumContent,
	row: OfficialCompendiumItemVersionRow
) {
	const item = {
		...parseJson<HomebrewItem<HomebrewTable>>(row.item),
		source_key: row.source_key
	};
	(compendium[row.item_type] as Record<string, HomebrewItem<HomebrewTable>>)[row.item_id] = item;
}

async function getLatestOfficialSourceVersions(sourceKeys: SourceKey[]): Promise<OfficialSourceVersions> {
	return Object.fromEntries(sourceKeys.map((sourceKey) => [sourceKey, 1])) as OfficialSourceVersions;
}

export async function listOfficialSources(
	userId: string | undefined,
	sourceKeys?: SourceKey[]
): Promise<SourceMetadata[]> {
	const id = requireUserId(userId);
	const unlockedSourceKeys = await getUnlockedSourceKeys(id);
	const allowedSourceKeys = sourceKeys?.length
		? sourceKeys.filter((sourceKey) => unlockedSourceKeys.includes(sourceKey))
		: unlockedSourceKeys;
	if (!allowedSourceKeys.length) return [];

	await ensureOfficialCompendiumSeeded();

	const rows = await queryRows<OfficialSourceRow>(
		`select source_key, metadata, enabled, deleted_at from official_sources where enabled = true and deleted_at is null and source_key in (${placeholders(
			allowedSourceKeys
		)}) order by source_key`,
		allowedSourceKeys
	);
	return rows.filter((row) => isEnabledValue(row.enabled)).map(parseOfficialSourceRow);
}

export async function getOfficialCompendiumFromSourceKeys(
	userId: string | undefined,
	sourceKeys?: SourceKey[],
	sourceVersions?: OfficialSourceVersions
): Promise<CompendiumContent> {
	const id = requireUserId(userId);
	const unlockedSourceKeys = await getUnlockedSourceKeys(id);
	const allowedSourceKeys = sourceKeys?.length
		? sourceKeys.filter((sourceKey) => unlockedSourceKeys.includes(sourceKey))
		: unlockedSourceKeys;
	const compendium = emptyCompendium();
	if (!allowedSourceKeys.length) return compendium;

	await ensureOfficialCompendiumSeeded();
	const rows = await queryRows<OfficialCompendiumItemVersionRow>(
		[
			[
				'select official_compendium_items.item_type, official_compendium_items.item_id, official_compendium_items.source_key,',
				'official_compendium_item_versions.item_version, official_compendium_item_versions.label,',
				'official_compendium_item_versions.changelog, official_compendium_item_versions.item,',
				'official_compendium_item_versions.created_at, official_compendium_item_versions.published_at,',
				'official_compendium_item_versions.deleted_at'
			].join(' '),
			'from official_compendium_items',
			'inner join official_sources on official_sources.source_key = official_compendium_items.source_key',
			[
				'inner join official_compendium_item_versions on',
				'official_compendium_item_versions.source_key = official_compendium_items.source_key and',
				'official_compendium_item_versions.item_type = official_compendium_items.item_type and',
				'official_compendium_item_versions.item_id = official_compendium_items.item_id and',
				'official_compendium_item_versions.item_version = official_compendium_items.current_version'
			].join(' '),
			`where official_sources.enabled = true and official_sources.deleted_at is null and official_compendium_items.deleted_at is null and official_compendium_item_versions.deleted_at is null and official_compendium_items.source_key in (${placeholders(
				allowedSourceKeys
			)})`,
			'order by official_compendium_items.item_type, official_compendium_items.item_id'
		].join(' '),
		allowedSourceKeys
	);
	for (const row of rows) {
		addOfficialItemToCompendium(compendium, row);
	}
	return compendium;
}

export async function getAdminCompendiumDashboard(userId: string | undefined) {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	const sources = await queryRows<OfficialSourceRow>(
		'select source_key, metadata, enabled, deleted_at from official_sources where deleted_at is null order by source_key'
	);
	const counts = await queryRows<{
		source_key: SourceKey;
		item_type: HomebrewTable;
		count: string | number;
	}>(
		[
			'select official_compendium_items.source_key, official_compendium_items.item_type, count(*) as count',
			'from official_compendium_items',
			'inner join official_sources on official_sources.source_key = official_compendium_items.source_key',
			'where official_compendium_items.deleted_at is null and official_sources.deleted_at is null',
			'group by official_compendium_items.source_key, official_compendium_items.item_type',
			'order by official_compendium_items.source_key, official_compendium_items.item_type'
		].join(' ')
	);

	return {
		sources: sources.map((source) => ({
			...parseOfficialSourceRow(source),
			enabled: isEnabledValue(source.enabled)
		})),
		versions: [],
		item_types: OFFICIAL_COMPENDIUM_TABLES,
		counts: counts.map((count) => ({
			source_key: count.source_key,
			item_type: count.item_type,
			count: Number(count.count)
		}))
	};
}

export async function updateAdminOfficialSource(
	userId: string | undefined,
	data: {
		source_key: SourceKey;
		name?: string;
		short_title?: string;
		enabled?: boolean;
	}
) {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	const existing = await queryOne<OfficialSourceRow>(
		'select source_key, metadata, enabled from official_sources where source_key = ?',
		[data.source_key]
	);
	if (!existing) throw new Error('Source not found');

	const metadata = parseOfficialSourceRow(existing);
	const nextMetadata: SourceMetadata = {
		source_key: data.source_key,
		name: data.name?.trim() || metadata.name,
		short_title: data.short_title?.trim() || metadata.short_title
	};
	await execute('update official_sources set metadata = ?, enabled = ?, updated_at = ? where source_key = ?', [
		jsonParam(nextMetadata),
		data.enabled === false ? false : true,
		nowIso(),
		data.source_key
	]);
}

export async function createAdminOfficialSource(
	userId: string | undefined,
	data: {
		source_key: SourceKey;
		name: string;
		short_title: string;
		enabled?: boolean;
	}
) {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	const sourceKey = data.source_key.trim();
	const name = data.name.trim();
	const shortTitle = data.short_title.trim();
	if (!sourceKey) throw new Error('Source key is required');
	if (!name) throw new Error('Source name is required');
	if (!shortTitle) throw new Error('Source short title is required');

	const existing = await queryOne<OfficialSourceRow>(
		'select source_key, metadata, enabled from official_sources where source_key = ?',
		[sourceKey]
	);
	if (existing) throw new Error('Source already exists');

	const metadata: SourceMetadata = {
		source_key: sourceKey,
		name,
		short_title: shortTitle
	};
	const timestamp = nowIso();
	await execute(
		'insert into official_sources (source_key, metadata, enabled, created_at, updated_at) values (?, ?, ?, ?, ?)',
		[sourceKey, jsonParam(metadata), data.enabled === false ? false : true, timestamp, timestamp]
	);
}

function parseTransfer(data: unknown): CompendiumTransfer {
	if (!data || typeof data !== 'object') throw new Error('Invalid compendium import file');
	const transfer = data as Partial<CompendiumTransfer>;
	if (transfer.format !== 'daggerlore-compendium-transfer' || transfer.format_version !== 1) {
		throw new Error('Unsupported compendium import format');
	}
	if (!Array.isArray(transfer.sources) || !Array.isArray(transfer.items) || !Array.isArray(transfer.versions)) {
		throw new Error('Invalid compendium import file');
	}
	return transfer as CompendiumTransfer;
}

function parseImportRequest(data: unknown): CompendiumImportRequest {
	if (
		data &&
		typeof data === 'object' &&
		'transfer' in data &&
		(data as { transfer?: unknown }).transfer
	) {
		const resolutions = (data as { resolutions?: unknown }).resolutions;
		const versionConflicts =
			resolutions && typeof resolutions === 'object' && 'version_conflicts' in resolutions
				? (resolutions as { version_conflicts?: unknown }).version_conflicts
				: {};
		return {
			transfer: parseTransfer((data as { transfer: unknown }).transfer),
			resolutions: {
				version_conflicts:
					versionConflicts && typeof versionConflicts === 'object'
						? Object.fromEntries(
								Object.entries(versionConflicts as Record<string, unknown>)
									.map(([key, value]) => [key, normalizeImportResolution(value)] as const)
									.filter((entry): entry is [string, CompendiumImportResolution] => Boolean(entry[1]))
							)
						: {}
			}
		};
	}
	return { transfer: parseTransfer(data), resolutions: { version_conflicts: {} } };
}

function normalizeImportResolution(value: unknown): CompendiumImportResolution | null {
	if (value === 'skip' || value === 'replace' || value === 'next_version') return value;
	if (!value || typeof value !== 'object') return null;
	const action = (value as { action?: unknown }).action;
	if (action === 'skip' || action === 'replace' || action === 'next_version') return { action };
	if (action === 'custom_version') {
		const version = Number((value as { version?: unknown }).version);
		return Number.isInteger(version) && version > 0 ? { action, version } : null;
	}
	return null;
}

function importResolutionAction(resolution: CompendiumImportResolution | undefined) {
	return typeof resolution === 'string' ? resolution : resolution?.action;
}

function importResolutionVersion(resolution: CompendiumImportResolution | undefined) {
	if (resolution && typeof resolution === 'object' && resolution.action === 'custom_version') {
		return resolution.version;
	}
	return undefined;
}

function versionConflictKey(version: Pick<CompendiumTransferVersion, 'source_key' | 'item_type' | 'item_id' | 'item_version'>) {
	return `${version.source_key}:${version.item_type}:${version.item_id}:${version.item_version}`;
}

function normalizeTransferSource(source: CompendiumTransferSource) {
	const sourceKey = source.source_key.trim();
	const name = source.name.trim();
	const shortTitle = source.short_title.trim();
	if (!sourceKey) throw new Error('Source key is required');
	if (!name) throw new Error(`Source ${sourceKey} is missing a name`);
	if (!shortTitle) throw new Error(`Source ${sourceKey} is missing a short title`);
	return {
		source_key: sourceKey as SourceKey,
		name,
		short_title: shortTitle,
		enabled: source.enabled !== false
	};
}

function normalizeTransferItem(item: CompendiumTransferItem) {
	if (!OFFICIAL_COMPENDIUM_TABLES.includes(item.item_type)) throw new Error('Invalid item type');
	const itemId = item.item_id.trim();
	if (!itemId) throw new Error('Item ID is required');
	const currentVersion = Number(item.current_version);
	if (!Number.isInteger(currentVersion) || currentVersion < 1) {
		throw new Error(`Invalid current version for ${item.source_key}/${item.item_type}/${item.item_id}`);
	}
	return {
		item_type: item.item_type,
		item_id: itemId,
		source_key: item.source_key,
		current_version: currentVersion
	};
}

function normalizeTransferVersion(version: CompendiumTransferVersion) {
	if (!OFFICIAL_COMPENDIUM_TABLES.includes(version.item_type)) throw new Error('Invalid item type');
	const itemId = version.item_id.trim();
	if (!itemId) throw new Error('Item ID is required');
	const itemVersion = Number(version.item_version);
	if (!Number.isInteger(itemVersion) || itemVersion < 1) {
		throw new Error(`Invalid version for ${version.source_key}/${version.item_type}/${version.item_id}`);
	}
	const parsedItem = validateOfficialCompendiumItem(version.item_type, {
		...(version.item && typeof version.item === 'object' ? version.item : {}),
		source_key: version.source_key
	});
	return {
		item_type: version.item_type,
		item_id: itemId,
		source_key: version.source_key,
		item_version: itemVersion,
		label: version.label?.trim() || `Version ${itemVersion}`,
		changelog: version.changelog?.trim() || '',
		item: parsedItem
	};
}

export async function exportAdminCompendium(userId: string | undefined): Promise<CompendiumTransfer> {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	const sourceRows = await queryRows<OfficialSourceRow & { created_at?: string | number; updated_at?: string | number }>(
		'select source_key, metadata, enabled, created_at, updated_at, deleted_at from official_sources order by source_key'
	);
	const itemRows = await queryRows<OfficialCompendiumItemRow>(
		'select item_type, item_id, source_key, current_version, created_at, updated_at, deleted_at from official_compendium_items order by source_key, item_type, item_id'
	);
	const versionRows = await queryRows<OfficialCompendiumItemVersionRow>(
		'select item_type, item_id, source_key, item_version, label, changelog, item, created_at, published_at, deleted_at from official_compendium_item_versions order by source_key, item_type, item_id, item_version'
	);

	return {
		format: 'daggerlore-compendium-transfer',
		format_version: 1,
		exported_at: nowIso(),
		sources: sourceRows.map((row) => ({
			...parseOfficialSourceRow(row),
			enabled: isEnabledValue(row.enabled),
			created_at: row.created_at,
			updated_at: row.updated_at,
			deleted_at: row.deleted_at ?? null
		})),
		items: itemRows.map((row) => ({
			item_type: row.item_type,
			item_id: row.item_id,
			source_key: row.source_key,
			current_version: Number(row.current_version),
			created_at: row.created_at,
			updated_at: row.updated_at,
			deleted_at: row.deleted_at ?? null
		})),
		versions: versionRows.map((row) => ({
			item_type: row.item_type,
			item_id: row.item_id,
			source_key: row.source_key,
			item_version: Number(row.item_version),
			label: row.label,
			changelog: row.changelog,
			item: parseJson(row.item),
			created_at: row.created_at,
			published_at: row.published_at,
			deleted_at: row.deleted_at ?? null
		}))
	};
}

export async function previewAdminCompendiumImport(userId: string | undefined, data: unknown) {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	const transfer = parseTransfer(data);
	const result = {
		sources: [] as Array<{
			source_key: SourceKey;
			name: string;
			short_title: string;
			action: CompendiumImportAction;
			enabled: boolean;
			deleted_at: string | number | null;
		}>,
		versions: [] as Array<{
			key: string;
			source_key: SourceKey;
			item_type: HomebrewTable;
			item_id: string;
			item_version: number;
			title: string;
			label: string;
			action: CompendiumImportAction;
			deleted_at: string | number | null;
		}>,
		items: [] as Array<{
			key: string;
			source_key: SourceKey;
			item_type: HomebrewTable;
			item_id: string;
			current_version: number;
			action: CompendiumImportAction;
			deleted_at: string | number | null;
		}>,
		summary: {
			sources_created: 0,
			sources_updated: 0,
			sources_unchanged: 0,
			items_created: 0,
			items_advanced: 0,
			items_unchanged: 0,
			versions_imported: 0,
			versions_skipped: 0,
			version_conflicts: 0,
			current_version_conflicts: 0
		}
	};
	const conflictingVersionKeys = new Set<string>();

	for (const rawSource of transfer.sources) {
		const source = normalizeTransferSource(rawSource);
		const existing = await queryOne<OfficialSourceRow>(
			'select source_key, metadata, enabled, deleted_at from official_sources where source_key = ?',
			[source.source_key]
		);
		const metadata = existing ? parseOfficialSourceRow(existing) : null;
		const deletedAt = rawSource.deleted_at ?? null;
		let action: CompendiumImportAction = 'create';
		if (existing) {
			const changed =
				metadata?.name !== source.name ||
				metadata?.short_title !== source.short_title ||
				isEnabledValue(existing.enabled) !== source.enabled ||
				(existing.deleted_at ?? null) !== deletedAt;
			action = changed ? (existing.deleted_at && !deletedAt ? 'restore' : 'update') : 'unchanged';
		}
		if (action === 'create') result.summary.sources_created += 1;
		else if (action === 'unchanged') result.summary.sources_unchanged += 1;
		else result.summary.sources_updated += 1;
		result.sources.push({
			source_key: source.source_key,
			name: source.name,
			short_title: source.short_title,
			action,
			enabled: source.enabled,
			deleted_at: deletedAt
		});
	}

	for (const rawVersion of transfer.versions) {
		const version = normalizeTransferVersion(rawVersion);
		const key = versionConflictKey(version);
		const existing = await queryOne<OfficialCompendiumItemVersionRow>(
			'select item_type, item_id, source_key, item_version, label, changelog, item, created_at, published_at, deleted_at from official_compendium_item_versions where source_key = ? and item_type = ? and item_id = ? and item_version = ?',
			[version.source_key, version.item_type, version.item_id, version.item_version]
		);
		const deletedAt = rawVersion.deleted_at ?? null;
		let action: CompendiumImportAction = 'import';
		if (existing) {
			const existingItem = JSON.stringify(parseJson(existing.item));
			const importedItem = JSON.stringify(version.item);
			if (
				existingItem !== importedItem ||
				existing.label !== version.label ||
				existing.changelog !== version.changelog
			) {
				action = 'conflict';
				result.summary.version_conflicts += 1;
				conflictingVersionKeys.add(key);
			} else {
				action = (existing.deleted_at ?? null) !== deletedAt ? 'update' : 'skip';
				result.summary.versions_skipped += 1;
			}
		} else {
			result.summary.versions_imported += 1;
		}
		result.versions.push({
			key,
			source_key: version.source_key,
			item_type: version.item_type,
			item_id: version.item_id,
			item_version: version.item_version,
			title: itemTitle(version.item),
			label: version.label,
			action,
			deleted_at: deletedAt
		});
	}

	for (const rawItem of transfer.items) {
		const item = normalizeTransferItem(rawItem);
		const key = `${item.source_key}:${item.item_type}:${item.item_id}`;
		const existing = await queryOne<OfficialCompendiumItemRow>(
			'select item_type, item_id, source_key, current_version, updated_at, deleted_at from official_compendium_items where source_key = ? and item_type = ? and item_id = ?',
			[item.source_key, item.item_type, item.item_id]
		);
		const deletedAt = rawItem.deleted_at ?? null;
		let action: CompendiumImportAction = 'create';
		if (!existing) {
			result.summary.items_created += 1;
		} else if (
			Number(existing.current_version) < item.current_version &&
			conflictingVersionKeys.has(`${item.source_key}:${item.item_type}:${item.item_id}:${item.current_version}`)
		) {
			action = 'conflict';
			result.summary.current_version_conflicts += 1;
		} else if (Number(existing.current_version) < item.current_version) {
			action = 'advance';
			result.summary.items_advanced += 1;
		} else if ((existing.deleted_at ?? null) !== deletedAt) {
			action = deletedAt ? 'delete' : 'restore';
			result.summary.items_advanced += 1;
		} else {
			action = 'unchanged';
			result.summary.items_unchanged += 1;
		}
		result.items.push({
			key,
			source_key: item.source_key,
			item_type: item.item_type,
			item_id: item.item_id,
			current_version: item.current_version,
			action,
			deleted_at: deletedAt
		});
	}

	return result;
}

export async function importAdminCompendium(userId: string | undefined, data: unknown) {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	const { transfer, resolutions } = parseImportRequest(data);
	const timestamp = nowIso();
	const result = {
		sources_upserted: 0,
		items_created: 0,
		items_updated: 0,
		versions_imported: 0,
		versions_replaced: 0,
		versions_skipped: 0,
		version_conflicts: 0,
		current_version_conflicts: 0
	};
	const conflictingVersionKeys = new Set<string>();
	const remappedVersionKeys = new Map<string, number>();

	for (const rawSource of transfer.sources) {
		const source = normalizeTransferSource(rawSource);
		await execute(
			[
				'insert into official_sources (source_key, metadata, enabled, created_at, updated_at, deleted_at)',
				'values (?, ?, ?, ?, ?, ?)',
				'on conflict (source_key) do update set',
				'metadata = excluded.metadata,',
				'enabled = excluded.enabled,',
				'updated_at = excluded.updated_at,',
				'deleted_at = excluded.deleted_at'
			].join(' '),
			[
				source.source_key,
				jsonParam({
					source_key: source.source_key,
					name: source.name,
					short_title: source.short_title
				} satisfies SourceMetadata),
				source.enabled,
				timestamp,
				timestamp,
				rawSource.deleted_at ?? null
			]
		);
		result.sources_upserted += 1;
	}

	for (const rawVersion of transfer.versions) {
		const version = normalizeTransferVersion(rawVersion);
		const key = versionConflictKey(version);
		const existing = await queryOne<OfficialCompendiumItemVersionRow>(
			'select item_type, item_id, source_key, item_version, label, changelog, item, created_at, published_at, deleted_at from official_compendium_item_versions where source_key = ? and item_type = ? and item_id = ? and item_version = ?',
			[version.source_key, version.item_type, version.item_id, version.item_version]
		);
		if (existing) {
			const existingItem = JSON.stringify(parseJson(existing.item));
			const importedItem = JSON.stringify(version.item);
			if (existingItem !== importedItem || existing.label !== version.label || existing.changelog !== version.changelog) {
				const resolution = resolutions.version_conflicts[key];
				const resolutionAction = importResolutionAction(resolution);
				if (resolutionAction === 'replace') {
					await execute(
						[
							'update official_compendium_item_versions set',
							'label = ?, changelog = ?, item = ?, published_at = ?, deleted_at = ?',
							'where source_key = ? and item_type = ? and item_id = ? and item_version = ?'
						].join(' '),
						[
							version.label,
							version.changelog,
							jsonParam(version.item),
							timestamp,
							rawVersion.deleted_at ?? null,
							version.source_key,
							version.item_type,
							version.item_id,
							version.item_version
						]
					);
					result.versions_replaced += 1;
					continue;
				}
				if (resolutionAction === 'next_version' || resolutionAction === 'custom_version') {
					const maxVersion = await queryOne<{ max_version: number | null }>(
						'select max(item_version) as max_version from official_compendium_item_versions where source_key = ? and item_type = ? and item_id = ?',
						[version.source_key, version.item_type, version.item_id]
					);
					const targetVersion =
						resolutionAction === 'custom_version'
							? importResolutionVersion(resolution)
							: Number(maxVersion?.max_version ?? 0) + 1;
					if (!targetVersion || !Number.isInteger(targetVersion) || targetVersion < 1) {
						throw new Error(`Invalid import version for ${version.source_key}/${version.item_type}/${version.item_id}`);
					}
					const targetExisting = await queryOne<OfficialCompendiumItemVersionRow>(
						'select item_type, item_id, source_key, item_version, label, changelog, item, created_at, published_at, deleted_at from official_compendium_item_versions where source_key = ? and item_type = ? and item_id = ? and item_version = ?',
						[version.source_key, version.item_type, version.item_id, targetVersion]
					);
					if (targetExisting) {
						throw new Error(
							`Version v${targetVersion} already exists for ${version.source_key}/${version.item_type}/${version.item_id}`
						);
					}
					await execute(
						[
							'insert into official_compendium_item_versions',
							'(item_type, item_id, source_key, item_version, label, changelog, item, created_at, published_at, deleted_at)',
							'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
						].join(' '),
						[
							version.item_type,
							version.item_id,
							version.source_key,
							targetVersion,
							version.label,
							version.changelog,
							jsonParam(version.item),
							timestamp,
							timestamp,
							rawVersion.deleted_at ?? null
						]
					);
					remappedVersionKeys.set(key, targetVersion);
					result.versions_imported += 1;
					continue;
				}
				result.version_conflicts += 1;
				conflictingVersionKeys.add(key);
			}
			await execute(
				'update official_compendium_item_versions set deleted_at = ? where source_key = ? and item_type = ? and item_id = ? and item_version = ?',
				[
					rawVersion.deleted_at ?? null,
					version.source_key,
					version.item_type,
					version.item_id,
					version.item_version
				]
			);
			result.versions_skipped += 1;
			continue;
		}
		await execute(
			[
				'insert into official_compendium_item_versions',
				'(item_type, item_id, source_key, item_version, label, changelog, item, created_at, published_at, deleted_at)',
				'values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
			].join(' '),
			[
				version.item_type,
				version.item_id,
				version.source_key,
				version.item_version,
				version.label,
				version.changelog,
				jsonParam(version.item),
				timestamp,
				timestamp,
				rawVersion.deleted_at ?? null
			]
		);
		result.versions_imported += 1;
	}

	for (const rawItem of transfer.items) {
		const item = normalizeTransferItem(rawItem);
		const currentVersionKey = `${item.source_key}:${item.item_type}:${item.item_id}:${item.current_version}`;
		const remappedCurrentVersion = remappedVersionKeys.get(currentVersionKey);
		const currentVersion = remappedCurrentVersion ?? item.current_version;
		const existing = await queryOne<OfficialCompendiumItemRow>(
			'select item_type, item_id, source_key, current_version, updated_at, deleted_at from official_compendium_items where source_key = ? and item_type = ? and item_id = ?',
			[item.source_key, item.item_type, item.item_id]
		);
		if (!existing) {
			await execute(
				[
					'insert into official_compendium_items',
					'(item_type, item_id, source_key, current_version, created_at, updated_at, deleted_at)',
					'values (?, ?, ?, ?, ?, ?, ?)'
				].join(' '),
				[
					item.item_type,
					item.item_id,
					item.source_key,
					currentVersion,
					timestamp,
					timestamp,
					rawItem.deleted_at ?? null
				]
			);
			result.items_created += 1;
			continue;
		}
		await execute(
			'update official_compendium_items set deleted_at = ?, updated_at = ? where source_key = ? and item_type = ? and item_id = ?',
			[rawItem.deleted_at ?? null, timestamp, item.source_key, item.item_type, item.item_id]
		);
		if (
			Number(existing.current_version) < currentVersion &&
			conflictingVersionKeys.has(currentVersionKey)
		) {
			result.current_version_conflicts += 1;
			continue;
		}
		if (Number(existing.current_version) < currentVersion) {
			await execute(
				'update official_compendium_items set current_version = ?, updated_at = ? where source_key = ? and item_type = ? and item_id = ?',
				[currentVersion, timestamp, item.source_key, item.item_type, item.item_id]
			);
			result.items_updated += 1;
		}
	}

	return result;
}

function itemTitle(item: unknown) {
	if (item && typeof item === 'object' && 'title' in item && typeof item.title === 'string') {
		return item.title;
	}
	return 'Untitled';
}

export async function listAdminCompendiumItems(
	userId: string | undefined,
	options: { sourceKey?: SourceKey; itemType?: HomebrewTable } = {}
) {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	const clauses: string[] = [];
	const params: unknown[] = [];
	if (options.sourceKey) {
		clauses.push('official_compendium_items.source_key = ?');
		params.push(options.sourceKey);
	}
	if (options.itemType) {
		clauses.push('official_compendium_items.item_type = ?');
		params.push(options.itemType);
	}
	clauses.push('official_compendium_items.deleted_at is null');
	clauses.push('official_sources.deleted_at is null');
	clauses.push('official_compendium_item_versions.deleted_at is null');

	const whereClause = clauses.length ? `where ${clauses.join(' and ')}` : '';
	const rows = await queryRows<OfficialCompendiumItemVersionRow & { updated_at: string | number }>(
		[
			[
				'select official_compendium_items.item_type, official_compendium_items.item_id, official_compendium_items.source_key,',
				'official_compendium_items.current_version as item_version, official_compendium_items.updated_at,',
				'official_compendium_item_versions.label, official_compendium_item_versions.changelog,',
				'official_compendium_item_versions.item, official_compendium_item_versions.created_at,',
				'official_compendium_item_versions.published_at, official_compendium_item_versions.deleted_at'
			].join(' '),
			'from official_compendium_items',
			'inner join official_sources on official_sources.source_key = official_compendium_items.source_key',
			[
				'inner join official_compendium_item_versions on',
				'official_compendium_item_versions.source_key = official_compendium_items.source_key and',
				'official_compendium_item_versions.item_type = official_compendium_items.item_type and',
				'official_compendium_item_versions.item_id = official_compendium_items.item_id and',
				'official_compendium_item_versions.item_version = official_compendium_items.current_version'
			].join(' '),
			whereClause,
			'order by official_compendium_items.item_type, official_compendium_items.item_id'
		].join(' '),
		params
	);

	return rows.map((row) => {
		const item = parseJson<HomebrewItem<HomebrewTable>>(row.item);
		return {
			item_type: row.item_type,
			item_id: row.item_id,
			source_key: row.source_key,
			version: Number(row.item_version),
			current_version: Number(row.item_version),
			label: row.label,
			changelog: row.changelog,
			title: itemTitle(item),
			item,
			updated_at: row.updated_at
		};
	});
}

export async function updateAdminCompendiumItem(
	userId: string | undefined,
	data: {
		source_key: SourceKey;
		original_source_key?: SourceKey;
		item_type: HomebrewTable;
		item_id: string;
		item: unknown;
		label?: string;
		changelog?: string;
	}
) {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	const lookupSourceKey = data.original_source_key ?? data.source_key;
	const existing = await queryOne<OfficialCompendiumItemRow>(
		'select item_type, item_id, source_key, current_version, updated_at, deleted_at from official_compendium_items where source_key = ? and item_type = ? and item_id = ? and deleted_at is null',
		[lookupSourceKey, data.item_type, data.item_id]
	);
	if (!existing) throw new Error('Compendium item not found');
	if (data.source_key !== existing.source_key) {
		const conflict = await queryOne<OfficialCompendiumItemRow>(
			'select item_type, item_id, source_key, current_version, updated_at, deleted_at from official_compendium_items where source_key = ? and item_type = ? and item_id = ? and deleted_at is null',
			[data.source_key, data.item_type, data.item_id]
		);
		if (conflict) throw new Error('Another item already uses this source and item ID');
		await execute(
			'update official_compendium_items set source_key = ?, updated_at = ? where source_key = ? and item_type = ? and item_id = ?',
			[data.source_key, nowIso(), existing.source_key, data.item_type, data.item_id]
		);
		await execute(
			'update official_compendium_item_versions set source_key = ? where source_key = ? and item_type = ? and item_id = ?',
			[data.source_key, existing.source_key, data.item_type, data.item_id]
		);
	}

	const parsedItem = validateOfficialCompendiumItem(data.item_type, {
		...(data.item && typeof data.item === 'object' ? data.item : {}),
		source_key: data.source_key
	});
	const nextVersion = Number(existing.current_version) + 1;
	const timestamp = nowIso();
	await execute(
		[
			'insert into official_compendium_item_versions',
			'(item_type, item_id, source_key, item_version, label, changelog, item, created_at, published_at)',
			'values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
		].join(' '),
		[
			data.item_type,
			data.item_id,
			data.source_key,
			nextVersion,
			data.label?.trim() || `Version ${nextVersion}`,
			data.changelog?.trim() || '',
			jsonParam(parsedItem),
			timestamp,
			timestamp
		]
	);
	await execute(
		'update official_compendium_items set current_version = ?, updated_at = ? where source_key = ? and item_type = ? and item_id = ?',
		[nextVersion, timestamp, data.source_key, data.item_type, data.item_id]
	);
}

export async function createAdminCompendiumItem(
	userId: string | undefined,
	data: {
		source_key: SourceKey;
		item_type: HomebrewTable;
		item_id: string;
		item: unknown;
	}
) {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	if (!OFFICIAL_COMPENDIUM_TABLES.includes(data.item_type)) throw new Error('Invalid item type');
	const itemId = data.item_id.trim();
	if (!itemId) throw new Error('Item ID is required');

	const existing = await queryOne<OfficialCompendiumItemRow>(
		'select item_type, item_id, source_key, current_version, updated_at, deleted_at from official_compendium_items where source_key = ? and item_type = ? and item_id = ?',
		[data.source_key, data.item_type, itemId]
	);
	if (existing) throw new Error('Compendium item already exists');

	const parsedItem = validateOfficialCompendiumItem(data.item_type, {
		...(data.item && typeof data.item === 'object' ? data.item : {}),
		source_key: data.source_key
	});
	const timestamp = nowIso();
	await execute(
		[
			'insert into official_compendium_items',
			'(item_type, item_id, source_key, current_version, created_at, updated_at)',
			'values (?, ?, ?, ?, ?, ?)'
		].join(' '),
		[data.item_type, itemId, data.source_key, 1, timestamp, timestamp]
	);
	await execute(
		[
			'insert into official_compendium_item_versions',
			'(item_type, item_id, source_key, item_version, label, changelog, item, created_at, published_at)',
			'values (?, ?, ?, ?, ?, ?, ?, ?, ?)'
		].join(' '),
		[
			data.item_type,
			itemId,
			data.source_key,
			1,
			'Initial Version',
			'Created in admin.',
			jsonParam(parsedItem),
			timestamp,
			timestamp
		]
	);
}

export async function deleteAdminCompendiumItem(
	userId: string | undefined,
	data: {
		source_key: SourceKey;
		item_type: HomebrewTable;
		item_id: string;
	}
) {
	await getAdminAccess(userId);
	await ensureOfficialCompendiumSeeded();

	const existing = await queryOne<OfficialCompendiumItemRow>(
		'select item_type, item_id, source_key, current_version, updated_at, deleted_at from official_compendium_items where source_key = ? and item_type = ? and item_id = ? and deleted_at is null',
		[data.source_key, data.item_type, data.item_id]
	);
	if (!existing) throw new Error('Compendium item not found');

	const timestamp = nowIso();
	await execute(
		'update official_compendium_item_versions set deleted_at = ? where source_key = ? and item_type = ? and item_id = ? and deleted_at is null',
		[timestamp, data.source_key, data.item_type, data.item_id]
	);
	await execute(
		'update official_compendium_items set deleted_at = ?, updated_at = ? where source_key = ? and item_type = ? and item_id = ? and deleted_at is null',
		[timestamp, timestamp, data.source_key, data.item_type, data.item_id]
	);
}

export async function createAdminCompendiumVersion(
	userId: string | undefined,
	data: { source_key: SourceKey; label?: string; changelog?: string }
) {
	await getAdminAccess(userId);
	throw new Error('Source-level compendium versions are no longer supported');
}

export async function listCharacters(userId: string | undefined) {
	const id = requireUserId(userId);
	const rows = await queryRows<CharacterRow>(
		'select id, owner_user_id, campaign_id, character from characters where owner_user_id = ? order by updated_at desc',
		[id]
	);

	return Promise.all(
		rows.map(async (row) => {
			const character = parseJson<Character>(row.character);
			const campaignId = row.campaign_id ?? character.campaign_id;
			const campaignAccess = campaignId ? await getCampaignAccess(id, campaignId) : null;
			return {
				id: row.id,
				character: { ...character, campaign_id: campaignId ?? undefined },
				campaign_name: campaignAccess?.campaign.name
			};
		})
	);
}

export async function createCharacter(userId: string | undefined, character = CHARACTER_DEFAULTS) {
	const id = requireUserId(userId);
	const characterId = newId();
	const sourceKeys = await getUnlockedSourceKeys(id);
	const latestSourceVersions = await getLatestOfficialSourceVersions(sourceKeys);
	await execute(
		'insert into characters (id, owner_user_id, campaign_id, character, created_at, updated_at) values (?, ?, ?, ?, ?, ?)',
		[
			characterId,
			id,
			null,
			jsonParam({
				...character,
				campaign_id: undefined,
				official_source_versions: {
					...latestSourceVersions,
					...(character.official_source_versions ?? {})
				}
			}),
			nowIso(),
			nowIso()
		]
	);
	return characterId;
}

export async function getCharacterAccess(userId: string | undefined, characterId: string) {
	const id = requireUserId(userId);
	const row = await queryOne<CharacterRow>(
		'select id, owner_user_id, campaign_id, character from characters where id = ?',
		[characterId]
	);
	if (!row) return null;

	const character = parseJson<Character>(row.character);
	const campaignId = row.campaign_id ?? character.campaign_id ?? null;
	if (row.owner_user_id === id) {
		return {
			character: { ...character, campaign_id: campaignId ?? undefined },
			canEdit: true,
			isOwner: true,
			ownerUserId: row.owner_user_id
		};
	}

	if (!campaignId) return null;
	const campaign = await getCampaignRow(campaignId);
	if (!campaign) return null;
	const members = parseJson<CampaignMember[]>(campaign.members);
	const member = members.find((campaignMember) => campaignMember.clerk_id === id);
	if (!member) return null;

	return {
		character: { ...character, campaign_id: campaignId },
		canEdit: member.role === 'GM',
		isOwner: false,
		ownerUserId: row.owner_user_id
	};
}

export async function updateCharacter(
	userId: string | undefined,
	characterId: string,
	character: Character
) {
	const access = await getCharacterAccess(userId, characterId);
	if (!access?.canEdit) throw new Error('Not authorized');
	await execute('update characters set character = ?, updated_at = ? where id = ?', [
		jsonParam({ ...character, campaign_id: access.character.campaign_id }),
		nowIso(),
		characterId
	]);
}

export async function deleteCharacter(userId: string | undefined, characterId: string) {
	const access = await getCharacterAccess(userId, characterId);
	if (!access?.isOwner) throw new Error('Not authorized');

	if (access.character.campaign_id) {
		const campaign = await getCampaignRow(access.character.campaign_id);
		if (campaign) {
			const characters = parseJson<CampaignCharacter[]>(campaign.characters).filter(
				(character) => character.character_id !== characterId
			);
			await execute('update campaigns set characters = ?, updated_at = ? where id = ?', [
				jsonParam(characters),
				nowIso(),
				access.character.campaign_id
			]);
		}
	}

	await execute('delete from characters where id = ?', [characterId]);
}

async function getCampaignRow(campaignId: string) {
	return queryOne<CampaignRow>(
		'select id, invite_code, campaign, members, characters from campaigns where id = ?',
		[campaignId]
	);
}

async function publishStreamUpdatesForCampaign(campaignId: string) {
	const rows = await queryRows<{ token: string }>(
		'select token from stream_overlays where campaign_id = ?',
		[campaignId]
	);
	for (const row of rows) {
		publish(`stream:${row.token}`, { campaignId });
	}
}

export async function getCampaignAccess(userId: string | undefined, campaignId: string) {
	const id = requireUserId(userId);
	const row = await getCampaignRow(campaignId);
	if (!row) return null;
	const campaign = parseJson<Campaign>(row.campaign);
	const members = parseJson<CampaignMember[]>(row.members);
	const characters = parseJson<CampaignCharacter[]>(row.characters);
	const member = members.find((campaignMember) => campaignMember.clerk_id === id);
	if (!member) return null;
	return {
		campaign_id: row.id,
		invite_code: row.invite_code,
		campaign,
		members,
		characters,
		isOwner: member.role === 'GM'
	};
}

export async function listCampaigns(userId: string | undefined) {
	const id = requireUserId(userId);
	const rows = await queryRows<CampaignRow & { created_at: string | number }>(
		'select id, invite_code, campaign, members, characters, created_at from campaigns order by updated_at desc'
	);
	const campaigns: Record<string, unknown> = {};
	for (const row of rows) {
		const access = await getCampaignAccess(id, row.id);
		if (!access) continue;
		const activeCharacterImageUrls = [];
		for (const campaignCharacter of access.characters.filter((entry) => entry.status === 'active')) {
			const character = await getCharacterAccess(id, campaignCharacter.character_id as string);
			if (character?.character.image_url) activeCharacterImageUrls.push(character.character.image_url);
		}
		const member = access.members.find((member) => member.clerk_id === id);
		campaigns[row.id] = {
			role: member?.role ?? 'Player',
			name: access.campaign.name,
			player_count: access.members.filter((member) => member.role === 'Player').length,
			active_character_image_urls: activeCharacterImageUrls,
			creation_time: row.created_at
		};
	}
	return campaigns;
}

function inviteCode() {
	return crypto.randomUUID().replace(/-/g, '').slice(0, 10);
}

export async function createCampaign(
	userId: string | undefined,
	data: { name: string; display_name?: string }
) {
	const id = requireUserId(userId);
	const name = data.name.trim();
	if (!name) throw new Error('Campaign name is required');
	const campaignId = newId();
	const code = inviteCode();
	const campaign: Campaign = {
		name,
		fear_track: 0,
		countdowns: [],
		homebrew_vault: createEmptyCompendiumContentIds()
	};
	const members: CampaignMember[] = [
		{
			clerk_id: id,
			display_name: data.display_name ?? '',
			role: 'GM'
		}
	];
	await execute(
		'insert into campaigns (id, invite_code, campaign, members, characters, created_at, updated_at) values (?, ?, ?, ?, ?, ?, ?)',
		[`${campaignId}`, code, jsonParam(campaign), jsonParam(members), jsonParam([]), nowIso(), nowIso()]
	);
	return campaignId;
}

export async function deleteCampaign(userId: string | undefined, campaignId: string) {
	const access = await getCampaignAccess(userId, campaignId);
	if (!access?.isOwner) throw new Error('Not authorized');
	for (const campaignCharacter of access.characters) {
		const characterAccess = await getCharacterAccess(userId, campaignCharacter.character_id as string);
		if (characterAccess?.isOwner) {
			await execute('update characters set campaign_id = ?, updated_at = ? where id = ?', [
				null,
				nowIso(),
				campaignCharacter.character_id
			]);
		}
	}
	await execute('delete from campaigns where id = ?', [campaignId]);
}

export async function changeCampaignDisplayName(
	userId: string | undefined,
	campaignId: string,
	displayName: string
) {
	const id = requireUserId(userId);
	const access = await getCampaignAccess(id, campaignId);
	if (!access) throw new Error('Not authorized');
	const members = access.members.map((member) =>
		member.clerk_id === id ? { ...member, display_name: displayName } : member
	);
	await execute('update campaigns set members = ?, updated_at = ? where id = ?', [
		jsonParam(members),
		nowIso(),
		campaignId
	]);
}

export async function addCharacterToCampaign(
	userId: string | undefined,
	campaignId: string,
	characterId: string
) {
	const id = requireUserId(userId);
	const access = await getCampaignAccess(id, campaignId);
	if (!access) throw new Error('Not authorized');
	const characterAccess = await getCharacterAccess(id, characterId);
	if (!characterAccess?.isOwner) throw new Error('Not authorized');
	if (characterAccess.character.campaign_id) throw new Error('Character already belongs to a campaign');

	const status: CampaignCharacter['status'] = access.isOwner ? 'unclaimed' : 'active';
	const nextCharacters: CampaignCharacter[] = access.characters.some(
		(character) => character.character_id === characterId
	)
		? access.characters
		: [
				...access.characters,
				{
					character_id: characterId as Id<'characters'>,
					status,
					claimed_by_clerk_id: access.isOwner ? undefined : id
				}
			];

	await execute('update campaigns set characters = ?, updated_at = ? where id = ?', [
		jsonParam(nextCharacters),
		nowIso(),
		campaignId
	]);
	await execute('update characters set campaign_id = ?, updated_at = ? where id = ?', [
		campaignId,
		nowIso(),
		characterId
	]);
}

export async function removeCharacterFromCampaign(
	userId: string | undefined,
	campaignId: string,
	characterId: string
) {
	const access = await getCampaignAccess(userId, campaignId);
	if (!access?.isOwner) throw new Error('Not authorized');
	const nextCharacters = access.characters.filter(
		(character) => character.character_id !== characterId
	);
	await execute('update campaigns set characters = ?, updated_at = ? where id = ?', [
		jsonParam(nextCharacters),
		nowIso(),
		campaignId
	]);
	await execute('update characters set campaign_id = ?, updated_at = ? where id = ?', [
		null,
		nowIso(),
		characterId
	]);
}

export async function claimCampaignCharacter(
	userId: string | undefined,
	campaignId: string,
	characterId: string
) {
	const id = requireUserId(userId);
	const access = await getCampaignAccess(id, campaignId);
	if (!access) throw new Error('Not authorized');
	const hasActiveCharacter = access.characters.some(
		(character) => character.status === 'active' && character.claimed_by_clerk_id === id
	);
	if (hasActiveCharacter) throw new Error('You already have a character in this campaign');
	const nextCharacters = access.characters.map((character) =>
		character.character_id === characterId
			? { ...character, status: 'active' as const, claimed_by_clerk_id: id }
			: character
	);
	await execute('update campaigns set characters = ?, updated_at = ? where id = ?', [
		jsonParam(nextCharacters),
		nowIso(),
		campaignId
	]);
}

export async function unassignCampaignCharacter(
	userId: string | undefined,
	campaignId: string,
	characterId: string
) {
	const access = await getCampaignAccess(userId, campaignId);
	if (!access?.isOwner) throw new Error('Not authorized');
	const nextCharacters = access.characters.map((character) =>
		character.character_id === characterId
			? { ...character, status: 'unclaimed' as const, claimed_by_clerk_id: undefined }
			: character
	);
	await execute('update campaigns set characters = ?, updated_at = ? where id = ?', [
		jsonParam(nextCharacters),
		nowIso(),
		campaignId
	]);
}

export async function leaveCampaign(userId: string | undefined, campaignId: string) {
	const id = requireUserId(userId);
	const access = await getCampaignAccess(id, campaignId);
	if (!access) throw new Error('Not authorized');
	if (access.isOwner) throw new Error('GM cannot leave campaign');
	const members = access.members.filter((member) => member.clerk_id !== id);
	const characters = access.characters.map((character) =>
		character.claimed_by_clerk_id === id
			? { ...character, status: 'unclaimed' as const, claimed_by_clerk_id: undefined }
			: character
	);
	await execute('update campaigns set members = ?, characters = ?, updated_at = ? where id = ?', [
		jsonParam(members),
		jsonParam(characters),
		nowIso(),
		campaignId
	]);
}

export async function updateCampaign(userId: string | undefined, campaignId: string, campaign: Campaign) {
	const access = await getCampaignAccess(userId, campaignId);
	if (!access?.isOwner) throw new Error('Not authorized');
	await execute('update campaigns set campaign = ?, updated_at = ? where id = ?', [
		jsonParam(campaign),
		nowIso(),
		campaignId
	]);
	await publishStreamUpdatesForCampaign(campaignId);
}

export async function updateDiceHistory(
	userId: string | undefined,
	campaignId: string,
	history: DiceHistory
) {
	const access = await getCampaignAccess(userId, campaignId);
	if (!access) throw new Error('Not authorized');
	const existing = await queryOne<{ id: string }>('select id from dice_history where campaign_id = ?', [
		campaignId
	]);
	if (existing) {
		await execute('update dice_history set history = ? where campaign_id = ?', [
			jsonParam(history),
			campaignId
		]);
		return;
	}
	await execute('insert into dice_history (id, campaign_id, history) values (?, ?, ?)', [
		newId(),
		campaignId,
		jsonParam(history)
	]);
}

export async function getDiceHistory(userId: string | undefined, campaignId: string) {
	const access = await getCampaignAccess(userId, campaignId);
	if (!access) throw new Error('Not authorized');
	const row = await queryOne<{ history: unknown }>(
		'select history from dice_history where campaign_id = ?',
		[campaignId]
	);
	return row ? parseJson<DiceHistory>(row.history) : { rolls: [] };
}

export async function resolveInvite(userId: string | undefined, code: string) {
	requireUserId(userId);
	const row = await queryOne<CampaignRow>(
		'select id, invite_code, campaign, members, characters from campaigns where invite_code = ?',
		[code]
	);
	if (!row) return null;
	const members = parseJson<CampaignMember[]>(row.members);
	return {
		campaign_id: row.id,
		campaign_name: parseJson<Campaign>(row.campaign).name,
		is_member: members.some((member) => member.clerk_id === userId)
	};
}

export async function joinCampaign(userId: string | undefined, code: string, displayName: string) {
	const id = requireUserId(userId);
	const row = await queryOne<CampaignRow>(
		'select id, invite_code, campaign, members, characters from campaigns where invite_code = ?',
		[code]
	);
	if (!row) throw new Error('Invite not found');
	const members = parseJson<CampaignMember[]>(row.members);
	if (!members.some((member) => member.clerk_id === id)) {
		members.push({ clerk_id: id, display_name: displayName, role: 'Player' });
		await execute('update campaigns set members = ?, updated_at = ? where id = ?', [
			jsonParam(members),
			nowIso(),
			row.id
		]);
	}
	return row.id;
}

export async function rotateInviteCode(userId: string | undefined, campaignId: string) {
	const access = await getCampaignAccess(userId, campaignId);
	if (!access?.isOwner) throw new Error('Not authorized');
	const code = inviteCode();
	await execute('update campaigns set invite_code = ?, updated_at = ? where id = ?', [
		code,
		nowIso(),
		campaignId
	]);
	return code;
}

export async function listHomebrew(userId: string | undefined): Promise<CompendiumContent> {
	const id = requireUserId(userId);
	const rows = await queryRows<HomebrewRow>(
		'select id, owner_user_id, type, item from homebrew_items where owner_user_id = ? order by updated_at desc',
		[id]
	);
	const compendium = emptyCompendium();
	for (const row of rows) {
		const item = parseJson<HomebrewItem<HomebrewTable>>(row.item);
		(compendium[row.type] as Record<string, HomebrewItem<HomebrewTable>>)[row.id] = item;
	}
	return compendium;
}

export async function getHomebrewAccess<T extends HomebrewTable>(
	userId: string | undefined,
	itemId: string
): Promise<HomebrewAccess<T> | null> {
	const id = requireUserId(userId);
	const row = await queryOne<HomebrewRow>(
		'select id, owner_user_id, type, item from homebrew_items where id = ?',
		[itemId]
	);
	if (!row) return null;
	if (row.owner_user_id !== id) return null;
	return {
		item: parseJson<HomebrewItem<T>>(row.item),
		canEdit: true,
		isOwner: true
	};
}

export async function createHomebrew(
	userId: string | undefined,
	data: { type: HomebrewTable; item: HomebrewItem<HomebrewTable> }
) {
	const id = requireUserId(userId);
	const itemId = newId();
	const item = { ...data.item, source_key: 'Homebrew' };
	await execute(
		'insert into homebrew_items (id, owner_user_id, type, item, created_at, updated_at) values (?, ?, ?, ?, ?, ?)',
		[itemId, id, data.type, jsonParam(item), nowIso(), nowIso()]
	);
	const user = await getUserRow(id);
	const vault = parseVault(user.homebrew_vault);
	vault[data.type] = [...vault[data.type], itemId] as never;
	await execute('update users set homebrew_vault = ?, updated_at = ? where id = ?', [
		jsonParam(vault),
		nowIso(),
		id
	]);
	return itemId;
}

export async function updateHomebrew(
	userId: string | undefined,
	data: { type: HomebrewTable; id: string; item: HomebrewItem<HomebrewTable> }
) {
	const access = await getHomebrewAccess(userId, data.id);
	if (!access?.canEdit) throw new Error('Not authorized');
	await execute('update homebrew_items set item = ?, updated_at = ? where id = ?', [
		jsonParam({ ...data.item, source_key: 'Homebrew' }),
		nowIso(),
		data.id
	]);
}

export async function deleteHomebrew(userId: string | undefined, itemId: string) {
	const id = requireUserId(userId);
	const access = await getHomebrewAccess(id, itemId);
	if (!access?.isOwner) throw new Error('Not authorized');
	await execute('delete from homebrew_items where id = ?', [itemId]);
	const user = await getUserRow(id);
	const vault = parseVault(user.homebrew_vault);
	for (const key of VAULT_KEYS) {
		vault[key] = vault[key].filter((id) => id !== itemId) as never;
	}
	await execute('update users set homebrew_vault = ?, updated_at = ? where id = ?', [
		jsonParam(vault),
		nowIso(),
		id
	]);
}

export async function listEncounters(userId: string | undefined) {
	const id = requireUserId(userId);
	const rows = await queryRows<EncounterRow>(
		'select id, owner_user_id, encounter from encounters where owner_user_id = ? order by updated_at desc',
		[id]
	);
	return rows.map((row) => ({ id: row.id, encounter: parseJson<Encounter>(row.encounter) }));
}

export async function getEncounterAccess(userId: string | undefined, encounterId: string) {
	const id = requireUserId(userId);
	const row = await queryOne<EncounterRow>(
		'select id, owner_user_id, encounter from encounters where id = ?',
		[encounterId]
	);
	if (!row || row.owner_user_id !== id) return null;
	return { encounter: parseJson<Encounter>(row.encounter), isOwner: true };
}

export async function createEncounter(userId: string | undefined, encounter: Encounter) {
	const id = requireUserId(userId);
	const encounterId = newId();
	await execute(
		'insert into encounters (id, owner_user_id, encounter, created_at, updated_at) values (?, ?, ?, ?, ?)',
		[encounterId, id, jsonParam(encounter), nowIso(), nowIso()]
	);
	return encounterId;
}

export async function updateEncounter(
	userId: string | undefined,
	encounterId: string,
	encounter: Encounter
) {
	const access = await getEncounterAccess(userId, encounterId);
	if (!access?.isOwner) throw new Error('Not authorized');
	await execute('update encounters set encounter = ?, updated_at = ? where id = ?', [
		jsonParam(encounter),
		nowIso(),
		encounterId
	]);
}

export async function deleteEncounter(userId: string | undefined, encounterId: string) {
	const access = await getEncounterAccess(userId, encounterId);
	if (!access?.isOwner) throw new Error('Not authorized');
	await execute('delete from encounters where id = ?', [encounterId]);
}

export async function getCharacterCompendiumScope(
	userId: string | undefined,
	characterId: string
): Promise<CharacterCompendiumScope | null> {
	const access = await getCharacterAccess(userId, characterId);
	if (!access) return null;
	const sourceKeys = await getUnlockedSourceKeys(access.ownerUserId);
	const latestSourceVersions = await getLatestOfficialSourceVersions(sourceKeys);
	const sourceVersions = {
		...latestSourceVersions,
		...(access.character.official_source_versions ?? {})
	};
	const owner = await getUserRow(access.ownerUserId);
	const campaignId = access.character.campaign_id ?? null;
	const campaign = campaignId ? await getCampaignRow(campaignId) : null;
	const campaignData = campaign ? parseJson<Campaign>(campaign.campaign) : null;
	return {
		source_keys: sourceKeys,
		source_versions: sourceVersions,
		latest_source_versions: latestSourceVersions,
		campaign_source_keys: campaignData?.enabled_source_keys,
		homebrew_vault: parseVault(owner.homebrew_vault),
		campaign_id: campaignId as CharacterCompendiumScope['campaign_id'],
		campaign_vault: campaignData
			? normalizeCompendiumContentIds(campaignData.homebrew_vault)
			: createEmptyCompendiumContentIds()
	};
}

export async function getHomebrewItemsByVault(
	vault: CompendiumContentIds,
	sourceKey: SourceKey = 'Homebrew'
) {
	const compendium = emptyCompendium();
	for (const key of VAULT_KEYS) {
		for (const id of vault[key]) {
			const row = await queryOne<HomebrewRow>(
				'select id, owner_user_id, type, item from homebrew_items where id = ?',
				[id]
			);
			if (!row) continue;
			(compendium[key] as Record<string, HomebrewItem<HomebrewTable>>)[id] = {
				...parseJson<HomebrewItem<HomebrewTable>>(row.item),
				source_key: sourceKey
			};
		}
	}
	return compendium;
}

export async function getStreamOverlayForCampaign(userId: string | undefined, campaignId: string) {
	const access = await getCampaignAccess(userId, campaignId);
	if (!access?.isOwner) throw new Error('Not authorized');
	const row = await queryOne<StreamOverlayRow>(
		'select id, campaign_id, token, enabled, modules, settings, layout from stream_overlays where campaign_id = ?',
		[campaignId]
	);
	return row ? serializeStreamOverlay(row) : null;
}

export async function getStreamOverlayState(token: string) {
	const row = await queryOne<StreamOverlayRow>(
		'select id, campaign_id, token, enabled, modules, settings, layout from stream_overlays where token = ?',
		[token]
	);
	if (!row || !row.enabled) return null;
	const campaign = await getCampaignRow(row.campaign_id);
	if (!campaign) return null;
	const campaignPayload = parseJson<Campaign>(campaign.campaign);
	return {
		...serializeStreamOverlay(row),
		campaign: campaignPayload,
		countdowns: campaignPayload.countdowns ?? []
	};
}

export async function upsertStreamOverlay(
	userId: string | undefined,
	campaignId: string,
	data: Omit<ReturnType<typeof serializeStreamOverlay>, 'id' | 'campaign_id' | 'token'> & {
		token?: string;
	}
) {
	const access = await getCampaignAccess(userId, campaignId);
	if (!access?.isOwner) throw new Error('Not authorized');
	const existing = await queryOne<StreamOverlayRow>(
		'select id, campaign_id, token, enabled, modules, settings, layout from stream_overlays where campaign_id = ?',
		[campaignId]
	);
	const token = data.token ?? existing?.token ?? crypto.randomUUID().replace(/-/g, '');
	if (existing) {
		await execute(
			'update stream_overlays set token = ?, enabled = ?, modules = ?, settings = ?, layout = ? where campaign_id = ?',
			[
				token,
				data.enabled ? 1 : 0,
				jsonParam(data.modules),
				jsonParam(data.settings),
				jsonParam(data.layout),
				campaignId
			]
		);
		const overlay = await getStreamOverlayForCampaign(userId, campaignId);
		publish(`stream:${token}`, { campaignId });
		return overlay;
	}
	await execute(
		'insert into stream_overlays (id, campaign_id, token, enabled, modules, settings, layout) values (?, ?, ?, ?, ?, ?, ?)',
		[
			newId(),
			campaignId,
			token,
			data.enabled ? 1 : 0,
			jsonParam(data.modules),
			jsonParam(data.settings),
			jsonParam(data.layout)
		]
	);
	const overlay = await getStreamOverlayForCampaign(userId, campaignId);
	publish(`stream:${token}`, { campaignId });
	return overlay;
}

function serializeStreamOverlay(row: StreamOverlayRow) {
	return {
		id: row.id,
		campaign_id: row.campaign_id,
		token: row.token,
		enabled: !!row.enabled,
		modules: parseJson<{ fear: boolean; countdowns: boolean }>(row.modules),
		settings: parseJson<Record<string, unknown>>(row.settings),
		layout: parseJson<Record<string, unknown>>(row.layout)
	};
}
