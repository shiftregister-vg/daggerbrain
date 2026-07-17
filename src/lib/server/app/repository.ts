import { CHARACTER_DEFAULTS } from '@convex/constants/constants';
import { DEFAULT_UNLOCKED_SOURCES } from '@convex/constants/entitlements';
import type { Campaign, CampaignCharacter, CampaignMember } from '@convex/schemas/campaigns';
import type { Character, CharacterCompendiumScope } from '@convex/schemas/characters';
import type { CompendiumContent, CompendiumContentIds } from '@convex/schemas/compendium';
import type { DiceHistory } from '@convex/schemas/dice';
import type { Encounter } from '@convex/schemas/encounters';
import type { SourceKey } from '@convex/schemas/rules';
import type { HomebrewAccess, HomebrewItem, HomebrewTable } from '@convex/permissions';
import type { Id } from '@convex/_generated/dataModel';
import { publish } from './events';
import { execute, jsonParam, parseJson, queryOne, queryRows } from '$lib/server/db/client';
import { createEmptyCompendiumContentIds } from '@convex/lib/characterCompendium';

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
	'transformation_cards',
	'adversaries',
	'environments'
] as const satisfies (keyof CompendiumContentIds)[];

type UserRow = {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
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
	return value ? parseJson<CompendiumContentIds>(value) : createEmptyCompendiumContentIds();
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
		transformation_cards: {},
		adversaries: {},
		environments: {}
	};
}

async function getUserRow(userId: string): Promise<UserRow> {
	const row = await queryOne<UserRow>(
		'select id, name, email, image, homebrew_vault from users where id = ?',
		[userId]
	);
	if (!row) throw new Error('User not found');
	return row;
}

async function getUnlockedSourceKeys(userId: string): Promise<SourceKey[]> {
	const row = await queryOne<{ unlocked_source_keys: unknown }>(
		'select unlocked_source_keys from user_unlocked_sources where user_id = ?',
		[userId]
	);
	const unlockedSourceKeys = row ? parseJson<SourceKey[]>(row.unlocked_source_keys) : [];
	return [...new Set([...DEFAULT_UNLOCKED_SOURCES, ...unlockedSourceKeys])];
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
		name: user.name,
		email: user.email,
		image: user.image
	};
}

export async function listSources(userId: string | undefined) {
	const id = requireUserId(userId);
	return getUnlockedSourceKeys(id);
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
	await execute(
		'insert into characters (id, owner_user_id, campaign_id, character, created_at, updated_at) values (?, ?, ?, ?, ?, ?)',
		[characterId, id, null, jsonParam({ ...character, campaign_id: undefined }), nowIso(), nowIso()]
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
	const owner = await getUserRow(access.ownerUserId);
	const campaignId = access.character.campaign_id ?? null;
	const campaign = campaignId ? await getCampaignRow(campaignId) : null;
	return {
		source_keys: sourceKeys,
		homebrew_vault: parseVault(owner.homebrew_vault),
		campaign_id: campaignId as CharacterCompendiumScope['campaign_id'],
		campaign_vault: campaign ? parseJson<Campaign>(campaign.campaign).homebrew_vault : createEmptyCompendiumContentIds()
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
