<script lang="ts">
	import Database from '@lucide/svelte/icons/database';
	import Plus from '@lucide/svelte/icons/plus';
	import Save from '@lucide/svelte/icons/save';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import { goto } from '$app/navigation';
	import { onMount, untrack } from 'svelte';
	import { deleteApi, getApi, patchApi, postApi } from '$lib/api/client';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import DomainCardEditor from './domain-card-editor.svelte';
	import type { HomebrewTable } from '@domain/permissions';
	import type { SourceKey } from '@domain/schemas/rules';
	import type { SourceMetadata } from '@domain/schemas/sources';

	type Dashboard = {
		sources: (SourceMetadata & { enabled: boolean })[];
		versions: [];
		item_types: HomebrewTable[];
		counts: { source_key: SourceKey; item_type: HomebrewTable; count: number }[];
	};

	type AdminCompendiumItem = {
		item_type: HomebrewTable;
		item_id: string;
		source_key: SourceKey;
		version: number;
		current_version: number;
		label: string;
		changelog: string;
		title: string;
		item: Record<string, unknown>;
		updated_at: string | number;
	};

	type MutableItem = Record<string, any>;
	type FilterKey = 'sources' | 'domains' | 'classes' | 'categories' | 'tiers' | 'types' | 'levels';
	type FilterDefinition = {
		key: FilterKey;
		label: string;
		fields: string[];
		prefix?: string;
	};

	let { data } = $props();

	const TRAITS = ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'];
	const RANGES = ['Melee', 'Very Close', 'Close', 'Far', 'Very Far'];
	const DAMAGE_TYPES = ['phy', 'mag'];
	const WEAPON_TYPES = ['Physical', 'Magical'];
	const ADVERSARY_TYPES = [
		'Bruiser',
		'Horde',
		'Leader',
		'Minion',
		'Ranged',
		'Skulk',
		'Social',
		'Solo',
		'Standard',
		'Support'
	];
	const ENVIRONMENT_TYPES = ['Exploration', 'Social', 'Traversal', 'Event'];
	const FILTER_DEFINITIONS: FilterDefinition[] = [
		{ key: 'sources', label: 'Source', fields: ['source_key'] },
		{ key: 'domains', label: 'Domain', fields: ['domain_id', 'primary_domain_id', 'secondary_domain_id'] },
		{ key: 'classes', label: 'Class', fields: ['class_id'] },
		{ key: 'categories', label: 'Category', fields: ['category'] },
		{ key: 'tiers', label: 'Tier', fields: ['tier'], prefix: 'Tier' },
		{ key: 'types', label: 'Type', fields: ['type'] },
		{ key: 'levels', label: 'Level', fields: ['level_requirement'], prefix: 'Level' }
	];

	let dashboard = $state<Dashboard | null>(null);
	let items = $state<AdminCompendiumItem[]>([]);
	let referenceItems = $state<AdminCompendiumItem[]>([]);
	let selectedItemType = $state<HomebrewTable | ''>('');
	let selectedItemKey = $state('');
	let filtersExpanded = $state(false);
	let listFilters = $state<Record<FilterKey, string[]>>({
		sources: [],
		domains: [],
		classes: [],
		categories: [],
		tiers: [],
		types: [],
		levels: []
	});
	let editorItem = $state<MutableItem | null>(null);
	let createMode = $state(false);
	let loadError = $state('');
	let saveError = $state('');
	let isLoading = $state(false);
	let isSaving = $state(false);
	let routeStateKey = $state('');

	const selectedItem = $derived(
		items.find((item) => itemKey(item) === selectedItemKey) ?? null
	);
	const totalItems = $derived(
		dashboard?.counts.reduce((total: number, count) => total + count.count, 0) ?? 0
	);
	const entityTypes = $derived(
		[...(dashboard?.item_types ?? [])].sort((a, b) => itemTypeLabel(a).localeCompare(itemTypeLabel(b)))
	);
	const selectedTypeCount = $derived(selectedItemType ? countFor(selectedItemType) : totalItems);
	const filteredItems = $derived(
		items
			.filter((item) => !selectedItemType || item.item_type === selectedItemType)
			.filter((item) => matchesListFilters(item))
			.sort(compareListItems)
	);
	const sourceFilterOptions = $derived(
		[...new Set(items.map((item) => item.source_key))]
			.sort((a, b) => sourceLabel(a).localeCompare(sourceLabel(b)))
			.map((sourceKey) => ({ value: sourceKey, label: sourceLabel(sourceKey) }))
	);
	const domainFilterOptions = $derived(
		optionItems('domains').map((item) => ({ value: item.item_id, label: referenceLabel(item) }))
	);
	const classFilterOptions = $derived(
		optionItems('classes').map((item) => ({ value: item.item_id, label: referenceLabel(item) }))
	);
	const categoryFilterOptions = $derived(uniqueItemValues('category'));
	const tierFilterOptions = $derived(uniqueItemValues('tier'));
	const typeFilterOptions = $derived(uniqueItemValues('type'));
	const levelFilterOptions = $derived(uniqueItemValues('level_requirement'));
	const activeFilterDefinitions = $derived(
		FILTER_DEFINITIONS.filter((definition) => filterDefinitionAvailable(definition))
	);
	const activeFilterCount = $derived(
		Object.values(listFilters).reduce((total, values) => total + values.length, 0)
	);

	function itemKey(item: AdminCompendiumItem) {
		return `${item.source_key}:${item.item_type}:${item.item_id}`;
	}

	function slugId(value: unknown) {
		if (typeof value !== 'string') return '';
		return value
			.trim()
			.toLowerCase()
			.replace(/['"]/g, '')
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_+|_+$/g, '');
	}

	function itemTypeLabel(itemType: string) {
		return itemType
			.split('_')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function countFor(itemType: HomebrewTable) {
		return (
			dashboard?.counts
				.filter((count) => count.item_type === itemType)
				.reduce((total, count) => total + count.count, 0) ?? 0
		);
	}

	function cloneItem(item: unknown): MutableItem {
		return JSON.parse(JSON.stringify(item ?? {})) as MutableItem;
	}

	function optionItems(itemType: HomebrewTable) {
		return [...items, ...referenceItems]
			.filter((item) => item.item_type === itemType)
			.sort((a, b) => a.title.localeCompare(b.title) || a.item_id.localeCompare(b.item_id));
	}

	function sourceLabel(sourceKey: SourceKey | string | undefined) {
		return (
			dashboard?.sources.find((source) => source.source_key === sourceKey)?.short_title ??
			sourceKey ??
			'Source'
		);
	}

	function referenceLabel(item: AdminCompendiumItem) {
		const currentSourceKey = editorItem?.source_key as SourceKey | undefined;
		if (!currentSourceKey || item.source_key === currentSourceKey) return item.title;
		return `${item.title} (${sourceLabel(item.source_key)})`;
	}

	function referenceTitle(itemType: HomebrewTable, itemId: unknown) {
		if (typeof itemId !== 'string' || !itemId) return '';
		return optionItems(itemType).find((item) => item.item_id === itemId)?.title ?? itemId;
	}

	function compareText(left: unknown, right: unknown) {
		return String(left ?? '').localeCompare(String(right ?? ''), undefined, {
			numeric: true,
			sensitivity: 'base'
		});
	}

	function compareListItems(left: AdminCompendiumItem, right: AdminCompendiumItem) {
		if (left.item_type === 'domain_cards' && right.item_type === 'domain_cards') {
			return (
				compareText(referenceTitle('domains', left.item?.domain_id), referenceTitle('domains', right.item?.domain_id)) ||
				compareText(left.item?.level_requirement, right.item?.level_requirement) ||
				compareText(left.title, right.title) ||
				compareText(left.item_id, right.item_id)
			);
		}
		return compareText(left.title, right.title) || compareText(left.item_id, right.item_id);
	}

	function listSummary(item: AdminCompendiumItem) {
		const parts = [sourceLabel(item.source_key)];
		const value = (field: string) => item.item?.[field];
		const add = (label: string, candidate: unknown) => {
			if (candidate == null || candidate === '') return;
			parts.push(label ? `${label} ${candidate}` : String(candidate));
		};

		add('', referenceTitle('domains', value('domain_id')));
		const primaryDomain = referenceTitle('domains', value('primary_domain_id'));
		const secondaryDomain = referenceTitle('domains', value('secondary_domain_id'));
		if (primaryDomain || secondaryDomain) {
			parts.push([primaryDomain, secondaryDomain].filter(Boolean).join(' / '));
		}
		add('', referenceTitle('classes', value('class_id')));
		add('Level', value('level_requirement'));
		add('Tier', value('tier'));
		add('', value('category'));
		add('', value('type'));
		add('', value('range'));

		return [...new Set(parts.filter(Boolean))].join(' / ');
	}

	function uniqueItemValues(field: string) {
		return [...new Set(items.map((item) => item.item?.[field]).filter((value) => value != null && value !== ''))]
			.map((value) => String(value))
			.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
			.map((value) => ({ value, label: value }));
	}

	function fieldValues(item: AdminCompendiumItem, fields: string[]) {
		return fields
			.map((field) => (field === 'source_key' ? item.source_key : item.item?.[field]))
			.filter((value) => value != null && value !== '')
			.map((value) => String(value));
	}

	function matchesFilterDefinition(item: AdminCompendiumItem, definition: FilterDefinition) {
		const selectedValues = listFilters[definition.key];
		if (selectedValues.length === 0) return true;
		return fieldValues(item, definition.fields).some((value) => selectedValues.includes(value));
	}

	function matchesListFilters(item: AdminCompendiumItem) {
		return FILTER_DEFINITIONS.every((definition) => matchesFilterDefinition(item, definition));
	}

	function filterOptions(definition: FilterDefinition) {
		if (definition.key === 'sources') return sourceFilterOptions;
		if (definition.key === 'domains') return domainFilterOptions;
		if (definition.key === 'classes') return classFilterOptions;
		if (definition.key === 'categories') return categoryFilterOptions;
		if (definition.key === 'tiers') return tierFilterOptions;
		if (definition.key === 'types') return typeFilterOptions;
		if (definition.key === 'levels') return levelFilterOptions;
		return [];
	}

	function filterDefinitionAvailable(definition: FilterDefinition) {
		if (filterOptions(definition).length === 0) return false;
		if (definition.key === 'sources') return true;
		return items.some((item) => fieldValues(item, definition.fields).length > 0);
	}

	function filterOptionLabel(definition: FilterDefinition, label: string) {
		return definition.prefix ? `${definition.prefix} ${label}` : label;
	}

	function setFilter(key: FilterKey, values: string[]) {
		listFilters = { ...listFilters, [key]: values };
	}

	function selectValues(event: Event) {
		const select = event.currentTarget as HTMLSelectElement;
		return [...select.selectedOptions].map((option) => option.value);
	}

	function clearFilters() {
		listFilters = {
			sources: [],
			domains: [],
			classes: [],
			categories: [],
			tiers: [],
			types: [],
			levels: []
		};
	}

	function toggleFilters() {
		filtersExpanded = !filtersExpanded;
	}

	function referenceTypesFor(itemType: HomebrewTable | ''): HomebrewTable[] {
		if (itemType === 'classes') {
			return [
				'domains',
				'subclasses',
				'primary_weapons',
				'secondary_weapons',
				'armor',
				'loot',
				'consumables'
			];
		}
		if (itemType === 'subclasses') {
			return ['classes', 'domain_cards', 'primary_weapons', 'secondary_weapons', 'armor'];
		}
		if (itemType === 'domain_cards') return ['domains'];
		if (itemType === 'environments') return ['adversaries'];
		return [];
	}

	function itemQuery() {
		const params = new URLSearchParams();
		if (selectedItemType) params.set('item_type', selectedItemType);
		const query = params.toString();
		return query ? `?${query}` : '';
	}

	function editorHref(itemType: HomebrewTable) {
		return `/admin/compendium/${itemType}`;
	}

	function clearSelection() {
		selectedItemKey = '';
		editorItem = null;
		createMode = false;
		saveError = '';
	}

	async function navigateToType(itemType: HomebrewTable) {
		await goto(editorHref(itemType), { noScroll: true });
	}

	async function loadDashboard() {
		loadError = '';
		try {
			dashboard = await getApi<Dashboard>('/admin/compendium');
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to load admin dashboard';
		}
	}

	async function loadItems() {
		loadError = '';
		isLoading = true;
		try {
			items = await getApi<AdminCompendiumItem[]>(`/admin/compendium/items${itemQuery()}`);
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to load compendium items';
		} finally {
			isLoading = false;
		}
	}

	async function loadReferences() {
		const referenceTypes = referenceTypesFor(selectedItemType);
		if (referenceTypes.length === 0) {
			referenceItems = [];
			return;
		}
		try {
			const batches = await Promise.all(
				referenceTypes.map((itemType) =>
					getApi<AdminCompendiumItem[]>(`/admin/compendium/items?item_type=${itemType}`)
				)
			);
			referenceItems = batches.flat();
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to load reference data';
		}
	}

	function selectItem(item: AdminCompendiumItem) {
		createMode = false;
		selectedItemKey = itemKey(item);
		editorItem = { ...cloneItem(item.item), source_key: item.source_key };
		saveError = '';
	}

	function startCreate(itemType: HomebrewTable) {
		const sourceKey = dashboard?.sources[0]?.source_key ?? '';
		createMode = true;
		selectedItemType = itemType;
		selectedItemKey = '';
		editorItem = defaultItem(itemType, sourceKey as SourceKey);
		saveError = '';
	}

	function removeEmptyOptionalFields(item: MutableItem, keys: string[]) {
		const next = { ...item };
		for (const key of keys) {
			if (next[key] === '') delete next[key];
		}
		return next;
	}

	function itemForSave(item: MutableItem, itemType: HomebrewTable) {
		if (itemType === 'classes') {
			return removeEmptyOptionalFields(item, [
				'primary_domain_id',
				'secondary_domain_id',
				'spellcast_trait',
				'suggested_primary_weapon_id',
				'suggested_secondary_weapon_id',
				'suggested_armor_id'
			]);
		}
		if (itemType === 'subclasses') {
			return removeEmptyOptionalFields(item, ['class_id', 'spellcast_trait']);
		}
		return item;
	}

	async function saveItem() {
		if (!editorItem || !selectedItemType) return;
		saveError = '';
		isSaving = true;
		try {
			const sourceKey = editorItem.source_key as SourceKey | undefined;
			if (!sourceKey) throw new Error('Source is required');
			const itemId = createMode ? slugId(editorItem.title) : selectedItem?.item_id;
			if (createMode && !itemId) throw new Error('Title is required to derive an item ID');
			const item = itemForSave(editorItem, selectedItemType);
			const payload = {
				item_type: selectedItemType,
				item_id: itemId,
				source_key: sourceKey,
				original_source_key: selectedItem?.source_key,
				item: { ...item, source_key: sourceKey }
			};
			if (!payload.item_id) throw new Error('Item ID is required');
			if (createMode) await postApi<void>('/admin/compendium/items', payload);
			else await patchApi<void>('/admin/compendium/items', payload);
			const savedItemKey = `${payload.source_key}:${payload.item_type}:${payload.item_id}`;
			selectedItemKey = savedItemKey;
			createMode = false;
			await loadDashboard();
			await loadItems();
			const savedItem = items.find((item) => itemKey(item) === savedItemKey);
			if (savedItem) selectItem(savedItem);
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Unable to save compendium item';
		} finally {
			isSaving = false;
		}
	}

	async function deleteItem() {
		if (!selectedItem || !confirm(`Delete ${selectedItem.title}?`)) return;
		saveError = '';
		isSaving = true;
		try {
			await deleteApi<void>('/admin/compendium/items', {
				item_type: selectedItem.item_type,
				item_id: selectedItem.item_id,
				source_key: selectedItem.source_key
			});
			selectedItemKey = '';
			editorItem = null;
			await loadDashboard();
			await loadItems();
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Unable to delete compendium item';
		} finally {
			isSaving = false;
		}
	}

	function defaultFeature() {
		return { title: '', description_html: '', character_modifiers: [], weapon_modifiers: [] };
	}

	function defaultBaseCard(sourceKey: SourceKey) {
		return {
			source_key: sourceKey,
			title: '',
			description_html: '',
			image_url: '',
			artist_name: '',
			features: [defaultFeature()]
		};
	}

	function defaultDomainCard(sourceKey: SourceKey) {
		return {
			source_key: sourceKey,
			title: '',
			image_url: '',
			artist_name: '',
			features: [defaultFeature()],
			level_requirement: 1,
			recall_cost: 0,
			category: 'ability'
		};
	}

	function defaultWeapon(sourceKey: SourceKey) {
		return {
			source_key: sourceKey,
			title: '',
			description_html: '',
			level_requirement: 1,
			type: 'Physical',
			available_traits: ['agility'],
			range: 'Melee',
			features: [],
			attack_roll_bonus: 0,
			damage_bonus: 0,
			damage_dice: 'd6',
			available_damage_types: ['phy'],
			burden: 0
		};
	}

	function defaultItem(itemType: HomebrewTable, sourceKey: SourceKey): MutableItem {
		if (itemType === 'primary_weapons' || itemType === 'secondary_weapons') return defaultWeapon(sourceKey);
		if (itemType === 'armor') {
			return {
				source_key: sourceKey,
				level_requirement: 1,
				title: '',
				description_html: '',
				max_armor: 0,
				damage_thresholds: { major: 0, severe: 0 },
				features: []
			};
		}
		if (itemType === 'loot') {
			return {
				source_key: sourceKey,
				rarity_roll: 1,
				title: '',
				description_html: '',
				character_modifiers: [],
				weapon_modifiers: []
			};
		}
		if (itemType === 'consumables') {
			return { source_key: sourceKey, rarity_roll: 1, title: '', description_html: '' };
		}
		if (itemType === 'beastforms') {
			return {
				source_key: sourceKey,
				level_requirement: 1,
				title: '',
				category: '',
				character_trait: { trait: 'agility', bonus: 0 },
				attack: { range: 'Melee', trait: 'agility', damage_dice: 'd6', damage_bonus: 0, damage_type: 'phy' },
				advantages: [],
				evasion_bonus: 0,
				features: []
			};
		}
		if (itemType === 'classes') {
			return {
				source_key: sourceKey,
				title: '',
				image_url: '',
				artist_name: '',
				description_html: '',
				starting_evasion: 10,
				starting_max_hp: 6,
				hope_feature: defaultFeature(),
				class_features: [],
				subclass_ids: [],
				suggested_traits: {},
				starting_inventory: {
					gold_coins: 0,
					free_gear: [],
					loot_or_consumable_options: [],
					class_gear_options: []
				},
				background_questions: [],
				connection_questions: [],
				character_description_suggestions: {
					clothes: '',
					eyes: '',
					body: '',
					skin: '',
					attitude: ''
				}
			};
		}
		if (itemType === 'subclasses') {
			return {
				source_key: sourceKey,
				title: '',
				description_html: '',
				image_url: '',
				artist_name: '',
				foundation_card: { ...defaultBaseCard(sourceKey), level_up_options: [] },
				specialization_card: { ...defaultBaseCard(sourceKey), level_up_options: [] },
				mastery_card: { ...defaultBaseCard(sourceKey), level_up_options: [] }
			};
		}
		if (itemType === 'domains') {
			return {
				source_key: sourceKey,
				title: '',
				description_html: '',
				color: '#6d46d9',
				foreground_color: '#ffffff',
				image_url: '',
				artist_name: ''
			};
		}
		if (itemType === 'domain_cards') {
			return defaultDomainCard(sourceKey);
		}
		if (
			itemType === 'ancestry_cards' ||
			itemType === 'community_cards' ||
			itemType === 'transformation_cards'
		) {
			return defaultBaseCard(sourceKey);
		}
		if (itemType === 'adversaries') {
			return {
				source_key: sourceKey,
				title: '',
				tier: 1,
				type: 'Standard',
				image_url: '',
				artist_name: '',
				description: '',
				motives_tactics: '',
				difficulty: 10,
				thresholds: { major: 0, severe: 0 },
				max_hp: 1,
				max_stress: 1,
				attack_modifier: 0,
				standard_attack: { name: '', range: 'Melee', damage_dice: 'd6', damage_bonus: 0, damage_type: 'phy' },
				experiences: [],
				experience_modifiers: [],
				features: []
			};
		}
		return {
			source_key: sourceKey,
			title: '',
			description: '',
			tier: 1,
			image_url: '',
			artist_name: '',
			type: 'Exploration',
			impulses: '',
			difficulty: 10,
			potential_adversaries: '',
			potential_adversaries_ids: [],
			features: []
		};
	}

	function addFeature(target: MutableItem, key = 'features') {
		target[key] = [...(target[key] ?? []), defaultFeature()];
	}

	function ensureSubclassCard(target: MutableItem, key: string) {
		target[key] ??= { features: [], options: [] };
		target[key].features ??= [];
	}

	function addSubclassCardFeature(target: MutableItem, key: string) {
		ensureSubclassCard(target, key);
		addFeature(target[key]);
	}

	function removeSubclassCardFeature(target: MutableItem, key: string, index: number) {
		ensureSubclassCard(target, key);
		removeArrayItem(target[key], 'features', index);
	}

	function addAdversaryFeature(target: MutableItem) {
		target.features = [
			...(target.features ?? []),
			{ type: 'Passive', name: '', max_uses: null, description_html: '' }
		];
	}

	function addEnvironmentFeature(target: MutableItem) {
		target.features = [
			...(target.features ?? []),
			{ type: 'Passive', name: '', description_html: '', questions: '' }
		];
	}

	function removeArrayItem(target: MutableItem, key: string, index: number) {
		target[key] = (target[key] ?? []).filter((_: unknown, itemIndex: number) => itemIndex !== index);
	}

	function addString(target: MutableItem, key: string) {
		target[key] = [...(target[key] ?? []), ''];
	}

	function updateString(target: MutableItem, key: string, index: number, value: string) {
		const next = [...(target[key] ?? [])];
		next[index] = value;
		target[key] = next;
	}

	function updateNumberArray(target: MutableItem, key: string, index: number, value: string) {
		const next = [...(target[key] ?? [])];
		next[index] = Number(value);
		target[key] = next;
	}

	function ensureStartingInventory(target: MutableItem) {
		target.starting_inventory ??= {};
		target.starting_inventory.gold_coins ??= 0;
		target.starting_inventory.free_gear ??= [];
		target.starting_inventory.loot_or_consumable_options ??= [];
		target.starting_inventory.class_gear_options ??= [];
	}

	function addStartingInventoryString(target: MutableItem, key: 'free_gear' | 'class_gear_options') {
		ensureStartingInventory(target);
		target.starting_inventory[key] = [...target.starting_inventory[key], ''];
	}

	function updateStartingInventoryString(
		target: MutableItem,
		key: 'free_gear' | 'class_gear_options',
		index: number,
		value: string
	) {
		ensureStartingInventory(target);
		const next = [...target.starting_inventory[key]];
		next[index] = value;
		target.starting_inventory[key] = next;
	}

	function removeStartingInventoryString(
		target: MutableItem,
		key: 'free_gear' | 'class_gear_options',
		index: number
	) {
		ensureStartingInventory(target);
		target.starting_inventory[key] = target.starting_inventory[key].filter(
			(_: unknown, itemIndex: number) => itemIndex !== index
		);
	}

	function addStartingInventoryChoice(target: MutableItem) {
		ensureStartingInventory(target);
		target.starting_inventory.loot_or_consumable_options = [
			...target.starting_inventory.loot_or_consumable_options,
			{ type: 'consumable', id: '' }
		];
	}

	function updateStartingInventoryChoiceType(
		target: MutableItem,
		index: number,
		value: 'loot' | 'consumable'
	) {
		ensureStartingInventory(target);
		const next = [...target.starting_inventory.loot_or_consumable_options];
		next[index] = { type: value, id: '' };
		target.starting_inventory.loot_or_consumable_options = next;
	}

	function updateStartingInventoryChoiceId(target: MutableItem, index: number, value: string) {
		ensureStartingInventory(target);
		const next = [...target.starting_inventory.loot_or_consumable_options];
		next[index] = { ...next[index], id: value };
		target.starting_inventory.loot_or_consumable_options = next;
	}

	function removeStartingInventoryChoice(target: MutableItem, index: number) {
		ensureStartingInventory(target);
		target.starting_inventory.loot_or_consumable_options =
			target.starting_inventory.loot_or_consumable_options.filter(
				(_: unknown, itemIndex: number) => itemIndex !== index
			);
	}

	function traitValue(target: MutableItem | null, key: string, trait: string) {
		const value = target?.[key]?.[trait];
		return typeof value === 'number' ? String(value) : '';
	}

	function updateTraitValue(target: MutableItem, key: string, trait: string, value: string) {
		const next = { ...(target[key] ?? {}) };
		if (value === '') {
			delete next[trait];
		} else {
			next[trait] = Number(value);
		}
		target[key] = next;
	}

	function clearTraitValues(target: MutableItem, key: string) {
		target[key] = {};
	}

	function subclassOverrideValue(target: MutableItem | null, key: string) {
		if (!target || !(key in target)) return '__inherit';
		return target[key] ?? '';
	}

	function updateSubclassOverride(target: MutableItem, key: string, value: string) {
		if (value === '__inherit') {
			delete target[key];
			return;
		}
		target[key] = value === '' ? null : value;
	}

	onMount(() => {
		void loadDashboard();
	});

	$effect(() => {
		const type = data.type;
		const nextRouteStateKey = type;
		if (routeStateKey === nextRouteStateKey) return;
		untrack(() => {
			routeStateKey = nextRouteStateKey;
			selectedItemType = type;
			selectedItemKey = '';
			editorItem = null;
			createMode = false;
			clearFilters();
			filtersExpanded = false;
		});
	});

	$effect(() => {
		selectedItemType;
		untrack(() => void loadItems());
	});

	$effect(() => {
		selectedItemType;
		untrack(() => void loadReferences());
	});
</script>

<svelte:head>
	<title>Compendium Manager | Daggerlore</title>
	<meta
		name="description"
		content="Daggerlore administrative tools for managing source and community data."
	/>
</svelte:head>

<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col px-6 py-8">
	<section class="border-border/60 flex flex-col gap-5 border-b pb-6 md:flex-row md:items-end md:justify-between">
		<div>
			<div class="flex items-center gap-3 text-accent">
				<ShieldCheck class="size-6" />
				<p class="text-sm font-semibold tracking-wide uppercase">Admin</p>
			</div>
			<h1 class="mt-3 text-3xl font-bold text-foreground">
				{itemTypeLabel(selectedItemType)} Manager
			</h1>
			<p class="mt-2 text-sm text-muted-foreground">
				Signed in as {data.user.name ?? data.user.email ?? 'an administrator'}.
			</p>
		</div>
	</section>

	{#if loadError}
		<p class="border-destructive/50 bg-destructive/10 mt-6 rounded-md border p-3 text-sm text-destructive">
			{loadError}
		</p>
	{/if}

	<section class="grid gap-4 py-6 md:grid-cols-3">
		<div class="border-border/70 bg-card/50 rounded-lg border p-4">
			<Database class="size-5 text-accent" />
			<p class="mt-3 text-2xl font-semibold text-foreground">{totalItems}</p>
			<p class="text-sm text-muted-foreground">Official items</p>
		</div>
		<div class="border-border/70 bg-card/50 rounded-lg border p-4">
			<p class="text-2xl font-semibold text-foreground">{dashboard?.sources.length ?? 0}</p>
			<p class="text-sm text-muted-foreground">Sources</p>
		</div>
		<div class="border-border/70 bg-card/50 rounded-lg border p-4">
			<p class="text-2xl font-semibold text-foreground">{selectedTypeCount}</p>
			<p class="text-sm text-muted-foreground">
				{selectedItemType ? itemTypeLabel(selectedItemType) : 'Selected type'} items
			</p>
		</div>
	</section>

	<section class="mb-5 rounded-lg border border-border/70 bg-card/40 p-4 text-sm text-muted-foreground">
		Editing saves a new version for the selected item. Choose the entity source in the identity
		section before saving.
	</section>

	<section class="grid min-h-[42rem] gap-5 lg:grid-cols-[18rem_20rem_minmax(0,1fr)]">
		<aside class="border-border/70 bg-card/40 overflow-hidden rounded-lg border">
			<div class="border-border/70 border-b p-4">
				<p class="font-semibold text-foreground">Entity Sections</p>
				<p class="text-sm text-muted-foreground">Manage each data type independently.</p>
			</div>
			<div class="max-h-[38rem] overflow-auto p-2">
				{#each entityTypes as itemType}
					<a
						href={editorHref(itemType)}
						class="hover:bg-muted/70 flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors {selectedItemType ===
						itemType
							? 'bg-muted text-foreground'
							: 'text-muted-foreground'}"
						onclick={(event) => {
							event.preventDefault();
							void navigateToType(itemType);
						}}
					>
						<span>{itemTypeLabel(itemType)}</span>
						<span class="text-xs">{countFor(itemType)}</span>
					</a>
				{/each}
			</div>
		</aside>

		<aside class="border-border/70 bg-card/40 flex min-h-0 flex-col rounded-lg border">
			<div class="border-border/70 flex items-center justify-between border-b p-4">
				<div>
					<p class="font-semibold text-foreground">
						{selectedItemType ? itemTypeLabel(selectedItemType) : 'Items'}
					</p>
					<p class="text-sm text-muted-foreground">{filteredItems.length} items</p>
				</div>
				{#if selectedItemType}
					<div class="flex gap-2">
						<Button size="sm" variant="outline" class="gap-2" onclick={toggleFilters}>
							Filters{#if activeFilterCount > 0} ({activeFilterCount}){/if}
						</Button>
						<Button size="sm" variant="outline" class="gap-2" onclick={() => startCreate(selectedItemType as HomebrewTable)}>
							<Plus class="size-4" />
							New
						</Button>
					</div>
				{/if}
			</div>
			{#if selectedItemType && filtersExpanded}
				<div class="border-border/70 grid gap-3 border-b p-3">
					<div class="flex items-center justify-between gap-3">
						<p class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Filters</p>
						<div class="flex gap-2">
							<Button
								size="sm"
								variant="ghost"
								class="h-7 px-2 text-xs"
								onclick={clearFilters}
								disabled={activeFilterCount === 0}
							>
								Clear
							</Button>
							<Button
								size="sm"
								variant="ghost"
								class="h-7 px-2 text-xs"
								onclick={() => (filtersExpanded = false)}
							>
								Hide
							</Button>
						</div>
					</div>
					<div class="grid gap-2 md:grid-cols-2">
						{#each activeFilterDefinitions as definition}
							{@const options = filterOptions(definition)}
							<label class="filter-field">
								<span>{definition.label}</span>
								<select
									multiple
									size={Math.min(Math.max(options.length, 2), 5)}
									value={listFilters[definition.key]}
									onchange={(event) => setFilter(definition.key, selectValues(event))}
								>
									{#each options as option}
										<option value={option.value} selected={listFilters[definition.key].includes(option.value)}>
											{filterOptionLabel(definition, option.label)}
										</option>
									{/each}
								</select>
							</label>
						{/each}
					</div>
				</div>
			{/if}
			<div class="min-h-0 flex-1 overflow-auto p-2">
				{#if isLoading}
					<p class="p-3 text-sm text-muted-foreground">Loading...</p>
				{:else if filteredItems.length === 0}
					<p class="p-3 text-sm text-muted-foreground">No items found.</p>
				{:else}
					{#each filteredItems as item}
						<button
							type="button"
							class="hover:bg-muted/70 w-full rounded-md px-3 py-2 text-left text-sm transition-colors {selectedItemKey ===
							itemKey(item)
								? 'bg-muted text-foreground'
								: 'text-muted-foreground'}"
							onclick={() => selectItem(item)}
					>
						<span class="block truncate font-medium">{item.title}</span>
						<span class="block truncate text-xs">{listSummary(item)}</span>
						</button>
					{/each}
				{/if}
			</div>
		</aside>

		<section class="border-border/70 bg-card/40 flex min-h-0 flex-col rounded-lg border">
			<div class="border-border/70 flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
				<div class="min-w-0">
					<p class="truncate text-lg font-semibold text-foreground">
						{createMode ? `New ${selectedItemType ? itemTypeLabel(selectedItemType) : 'Item'}` : (selectedItem?.title ?? 'Select an item')}
					</p>
					<p class="truncate text-sm text-muted-foreground">
						{sourceLabel((editorItem?.source_key ?? selectedItem?.source_key) as SourceKey | undefined)}
						{#if selectedItemType} / {itemTypeLabel(selectedItemType)}{/if}
						{#if selectedItem && !createMode} / current v{selectedItem.current_version}{/if}
					</p>
				</div>
				<div class="flex gap-2">
					<Button class="w-fit gap-2" onclick={saveItem} disabled={!editorItem || isSaving}>
						<Save class="size-4" />
						Save
					</Button>
					<Button
						variant="destructive"
						class="w-fit gap-2"
						onclick={deleteItem}
						disabled={!selectedItem || createMode || isSaving}
					>
						<Trash2 class="size-4" />
						Delete
					</Button>
				</div>
			</div>

			{#if saveError}
				<p class="border-destructive/50 bg-destructive/10 m-4 rounded-md border p-3 text-sm text-destructive">
					{saveError}
				</p>
			{/if}

			<div class="min-h-0 flex-1 overflow-auto p-4">
				{#if !editorItem || !selectedItemType}
					<p class="text-sm text-muted-foreground">Select an item or create one from an entity section.</p>
				{:else}
					{#if selectedItemType === 'domain_cards'}
						<DomainCardEditor
							bind:item={editorItem}
							sources={dashboard?.sources ?? []}
							domains={optionItems('domains')}
							{sourceLabel}
						/>
					{:else}
						<div class="grid gap-6">
						<section class="admin-panel">
							<h2>Identity</h2>
							<div class="grid gap-4 md:grid-cols-2">
								<label class="admin-field">
									<span>Source</span>
									<select class="admin-input" bind:value={editorItem.source_key} required>
										{#each dashboard?.sources ?? [] as source}
											<option value={source.source_key}>{source.short_title} - {source.name}</option>
										{/each}
									</select>
								</label>
								<label class="admin-field">
									<span>Title</span>
									<input class="admin-input" bind:value={editorItem.title} />
								</label>
								{#if 'image_url' in editorItem}
									<label class="admin-field">
										<span>Image URL</span>
										<input class="admin-input" bind:value={editorItem.image_url} />
									</label>
								{/if}
								{#if 'artist_name' in editorItem}
									<label class="admin-field">
										<span>Artist</span>
										<input class="admin-input" bind:value={editorItem.artist_name} />
									</label>
								{/if}
							</div>
							{#if 'description_html' in editorItem}
								<label class="admin-field">
									<span>Description</span>
									<textarea class="admin-textarea" bind:value={editorItem.description_html}></textarea>
								</label>
							{/if}
							{#if 'description' in editorItem}
								<label class="admin-field">
									<span>Description</span>
									<textarea class="admin-textarea" bind:value={editorItem.description}></textarea>
								</label>
							{/if}
						</section>

						{#if selectedItemType === 'domains'}
							<section class="admin-panel">
								<h2>Domain Display</h2>
								<div class="grid gap-4 md:grid-cols-3">
									<label class="admin-field">
										<span>Color</span>
										<input class="admin-input h-12" type="color" bind:value={editorItem.color} />
									</label>
									<label class="admin-field">
										<span>Foreground</span>
										<input class="admin-input h-12" type="color" bind:value={editorItem.foreground_color} />
									</label>
								</div>
							</section>
						{/if}

						{#if selectedItemType === 'classes'}
							<section class="admin-panel">
								<h2>Class Setup</h2>
								<div class="grid gap-4 md:grid-cols-2">
									<label class="admin-field">
										<span>Primary Domain</span>
										<select class="admin-input" bind:value={editorItem.primary_domain_id}>
											<option value="">None</option>
											{#each optionItems('domains') as domain}
												<option value={domain.item_id}>{referenceLabel(domain)}</option>
											{/each}
										</select>
									</label>
									<label class="admin-field">
										<span>Secondary Domain</span>
										<select class="admin-input" bind:value={editorItem.secondary_domain_id}>
											<option value="">None</option>
											{#each optionItems('domains') as domain}
												<option value={domain.item_id}>{referenceLabel(domain)}</option>
											{/each}
										</select>
									</label>
									<label class="admin-field">
										<span>Starting Evasion</span>
										<input class="admin-input" type="number" bind:value={editorItem.starting_evasion} />
									</label>
									<label class="admin-field">
										<span>Starting HP</span>
										<input class="admin-input" type="number" bind:value={editorItem.starting_max_hp} />
									</label>
									<label class="admin-field">
										<span>Default Spellcast Trait</span>
										<select class="admin-input" bind:value={editorItem.spellcast_trait}>
											<option value="">None</option>
											{#each TRAITS as trait}
												<option value={trait}>{trait}</option>
											{/each}
										</select>
									</label>
								</div>
								<div class="grid gap-3">
									<p class="text-sm font-medium text-foreground">Suggested Stats</p>
									<div class="grid gap-3 md:grid-cols-3">
										{#each TRAITS as trait}
											<label class="admin-field">
												<span>{trait}</span>
												<input
													class="admin-input"
													type="number"
													value={traitValue(editorItem, 'suggested_traits', trait)}
													onchange={(event) =>
														updateTraitValue(editorItem!, 'suggested_traits', trait, event.currentTarget.value)}
												/>
											</label>
										{/each}
									</div>
								</div>
								<div class="grid gap-3">
									<p class="text-sm font-medium text-foreground">Suggested Equipment</p>
									<div class="grid gap-4 md:grid-cols-3">
										<label class="admin-field">
											<span>Primary Weapon</span>
											<select class="admin-input" bind:value={editorItem.suggested_primary_weapon_id}>
												<option value="">None</option>
												{#each optionItems('primary_weapons') as weapon}
													<option value={weapon.item_id}>{referenceLabel(weapon)}</option>
												{/each}
											</select>
										</label>
										<label class="admin-field">
											<span>Secondary Weapon</span>
											<select class="admin-input" bind:value={editorItem.suggested_secondary_weapon_id}>
												<option value="">None</option>
												{#each optionItems('secondary_weapons') as weapon}
													<option value={weapon.item_id}>{referenceLabel(weapon)}</option>
												{/each}
											</select>
										</label>
										<label class="admin-field">
											<span>Armor</span>
											<select class="admin-input" bind:value={editorItem.suggested_armor_id}>
												<option value="">None</option>
												{#each optionItems('armor') as armor}
													<option value={armor.item_id}>{referenceLabel(armor)}</option>
												{/each}
											</select>
										</label>
									</div>
								</div>
								<div class="grid gap-4">
									<div>
										<p class="text-sm font-medium text-foreground">Starting Inventory</p>
										<p class="text-xs text-muted-foreground">
											Items offered during character creation for this class.
										</p>
									</div>
									<label class="admin-field md:w-48">
										<span>Gold Coins</span>
										<input
											class="admin-input"
											type="number"
											value={editorItem.starting_inventory?.gold_coins ?? 0}
											onchange={(event) => {
												ensureStartingInventory(editorItem!);
												editorItem!.starting_inventory.gold_coins = Number(event.currentTarget.value);
											}}
										/>
									</label>
									<div class="grid gap-3">
										<div class="flex items-center justify-between gap-3">
											<p class="text-sm font-medium text-foreground">Free Gear</p>
											<Button size="sm" variant="outline" onclick={() => addStartingInventoryString(editorItem!, 'free_gear')}>Add</Button>
										</div>
										{#if (editorItem.starting_inventory?.free_gear ?? []).length === 0}
											<p class="text-sm text-muted-foreground">No free gear configured.</p>
										{:else}
											{#each editorItem.starting_inventory?.free_gear ?? [] as entry, index}
												<div class="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
													<input
														class="admin-input"
														value={entry}
														placeholder="Free gear item"
														onchange={(event) =>
															updateStartingInventoryString(
																editorItem!,
																'free_gear',
																index,
																event.currentTarget.value
															)}
													/>
													<Button size="sm" variant="outline" onclick={() => removeStartingInventoryString(editorItem!, 'free_gear', index)}>Remove</Button>
												</div>
											{/each}
										{/if}
									</div>
									<div class="grid gap-3">
										<div class="flex items-center justify-between gap-3">
											<p class="text-sm font-medium text-foreground">Loot or Consumable Choices</p>
											<Button size="sm" variant="outline" onclick={() => addStartingInventoryChoice(editorItem!)}>Add</Button>
										</div>
										{#if (editorItem.starting_inventory?.loot_or_consumable_options ?? []).length === 0}
											<p class="text-sm text-muted-foreground">No loot or consumable choices configured.</p>
										{:else}
											{#each editorItem.starting_inventory?.loot_or_consumable_options ?? [] as option, index}
												<div class="grid gap-2 md:grid-cols-[10rem_minmax(0,1fr)_auto]">
													<select
														class="admin-input"
														value={option.type}
														onchange={(event) =>
															updateStartingInventoryChoiceType(
																editorItem!,
																index,
																event.currentTarget.value as 'loot' | 'consumable'
															)}
													>
														<option value="consumable">Consumable</option>
														<option value="loot">Loot</option>
													</select>
													<select
														class="admin-input"
														value={option.id}
														onchange={(event) =>
															updateStartingInventoryChoiceId(editorItem!, index, event.currentTarget.value)}
													>
														<option value="">Select item</option>
														{#each optionItems(option.type === 'loot' ? 'loot' : 'consumables') as item}
															<option value={item.item_id}>{referenceLabel(item)}</option>
														{/each}
													</select>
													<Button size="sm" variant="outline" onclick={() => removeStartingInventoryChoice(editorItem!, index)}>Remove</Button>
												</div>
											{/each}
										{/if}
									</div>
									<div class="grid gap-3">
										<div class="flex items-center justify-between gap-3">
											<p class="text-sm font-medium text-foreground">Class Gear Choices</p>
											<Button size="sm" variant="outline" onclick={() => addStartingInventoryString(editorItem!, 'class_gear_options')}>Add</Button>
										</div>
										{#if (editorItem.starting_inventory?.class_gear_options ?? []).length === 0}
											<p class="text-sm text-muted-foreground">No class gear choices configured.</p>
										{:else}
											{#each editorItem.starting_inventory?.class_gear_options ?? [] as entry, index}
												<div class="grid gap-2 md:grid-cols-[minmax(0,1fr)_auto]">
													<input
														class="admin-input"
														value={entry}
														placeholder="Class gear choice"
														onchange={(event) =>
															updateStartingInventoryString(
																editorItem!,
																'class_gear_options',
																index,
																event.currentTarget.value
															)}
													/>
													<Button size="sm" variant="outline" onclick={() => removeStartingInventoryString(editorItem!, 'class_gear_options', index)}>Remove</Button>
												</div>
											{/each}
										{/if}
									</div>
									<label class="admin-field">
										<span>Spellbook Prompt</span>
										<input
											class="admin-input"
											value={editorItem.starting_inventory?.spellbook_prompt ?? ''}
											placeholder="Optional prompt for spellbook-style items"
											onchange={(event) => {
												ensureStartingInventory(editorItem!);
												editorItem!.starting_inventory.spellbook_prompt =
													event.currentTarget.value || undefined;
											}}
										/>
									</label>
								</div>
								<div class="grid gap-3">
									<div class="flex items-center justify-between">
										<p class="text-sm font-medium text-foreground">Subclasses</p>
										<Button size="sm" variant="outline" onclick={() => addString(editorItem!, 'subclass_ids')}>Add</Button>
									</div>
									{#each editorItem.subclass_ids ?? [] as subclassId, index}
										<div class="flex gap-2">
											<select
												class="admin-input"
												value={subclassId}
												onchange={(event) => updateString(editorItem!, 'subclass_ids', index, event.currentTarget.value)}
											>
												<option value="">Select subclass</option>
												{#each optionItems('subclasses') as subclass}
													<option value={subclass.item_id}>{referenceLabel(subclass)}</option>
												{/each}
											</select>
											<Button size="sm" variant="outline" onclick={() => removeArrayItem(editorItem!, 'subclass_ids', index)}>Remove</Button>
										</div>
									{/each}
								</div>
							</section>
						{/if}

						{#if selectedItemType === 'subclasses'}
							<section class="admin-panel">
								<h2>Subclass Setup</h2>
								<div class="grid gap-4 md:grid-cols-2">
									<label class="admin-field">
										<span>Class</span>
										<select class="admin-input" bind:value={editorItem.class_id}>
											<option value="">None</option>
											{#each optionItems('classes') as characterClass}
												<option value={characterClass.item_id}>{referenceLabel(characterClass)}</option>
											{/each}
										</select>
									</label>
									<label class="admin-field">
										<span>Spellcast Trait Override</span>
										<select class="admin-input" bind:value={editorItem.spellcast_trait}>
											<option value="">None</option>
											{#each TRAITS as trait}
												<option value={trait}>{trait}</option>
											{/each}
										</select>
									</label>
								</div>
								<div class="grid gap-3">
									<div class="flex items-center justify-between gap-3">
										<div>
											<p class="text-sm font-medium text-foreground">Suggested Stats Override</p>
											<p class="text-xs text-muted-foreground">
												Leave blank to use the selected class suggestions.
											</p>
										</div>
										<Button size="sm" variant="outline" onclick={() => clearTraitValues(editorItem!, 'suggested_traits')}>Clear</Button>
									</div>
									<div class="grid gap-3 md:grid-cols-3">
										{#each TRAITS as trait}
											<label class="admin-field">
												<span>{trait}</span>
												<input
													class="admin-input"
													type="number"
													value={traitValue(editorItem, 'suggested_traits', trait)}
													onchange={(event) =>
														updateTraitValue(editorItem!, 'suggested_traits', trait, event.currentTarget.value)}
												/>
											</label>
										{/each}
									</div>
								</div>
								<div class="grid gap-3">
									<p class="text-sm font-medium text-foreground">Suggested Equipment Overrides</p>
									<div class="grid gap-4 md:grid-cols-3">
										<label class="admin-field">
											<span>Primary Weapon</span>
											<select
												class="admin-input"
												value={subclassOverrideValue(editorItem, 'suggested_primary_weapon_id')}
												onchange={(event) =>
													updateSubclassOverride(
														editorItem!,
														'suggested_primary_weapon_id',
														event.currentTarget.value
													)}
											>
												<option value="__inherit">Use class default</option>
												<option value="">None</option>
												{#each optionItems('primary_weapons') as weapon}
													<option value={weapon.item_id}>{referenceLabel(weapon)}</option>
												{/each}
											</select>
										</label>
										<label class="admin-field">
											<span>Secondary Weapon</span>
											<select
												class="admin-input"
												value={subclassOverrideValue(editorItem, 'suggested_secondary_weapon_id')}
												onchange={(event) =>
													updateSubclassOverride(
														editorItem!,
														'suggested_secondary_weapon_id',
														event.currentTarget.value
													)}
											>
												<option value="__inherit">Use class default</option>
												<option value="">None</option>
												{#each optionItems('secondary_weapons') as weapon}
													<option value={weapon.item_id}>{referenceLabel(weapon)}</option>
												{/each}
											</select>
										</label>
										<label class="admin-field">
											<span>Armor</span>
											<select
												class="admin-input"
												value={subclassOverrideValue(editorItem, 'suggested_armor_id')}
												onchange={(event) =>
													updateSubclassOverride(editorItem!, 'suggested_armor_id', event.currentTarget.value)}
											>
												<option value="__inherit">Use class default</option>
												<option value="">None</option>
												{#each optionItems('armor') as armor}
													<option value={armor.item_id}>{referenceLabel(armor)}</option>
												{/each}
											</select>
										</label>
									</div>
								</div>
								<div class="grid gap-4">
									{#each [
										{ key: 'foundation_card', label: 'Foundation' },
										{ key: 'specialization_card', label: 'Specialization' },
										{ key: 'mastery_card', label: 'Mastery' }
									] as card}
										<div class="rounded-md border border-border/70 bg-background/50 p-3">
											<div class="mb-3 flex items-center justify-between gap-3">
												<div>
													<p class="text-sm font-medium text-foreground">{card.label} Features</p>
													<p class="text-xs text-muted-foreground">
														Shown on the {card.label.toLowerCase()} subclass card.
													</p>
												</div>
												<Button
													size="sm"
													variant="outline"
													onclick={() => addSubclassCardFeature(editorItem!, card.key)}
												>
													Add Feature
												</Button>
											</div>
											<div class="grid gap-3">
												{#if (editorItem[card.key]?.features ?? []).length === 0}
													<p class="text-sm text-muted-foreground">No features configured.</p>
												{:else}
													{#each editorItem[card.key]?.features ?? [] as feature, index}
														<div class="rounded-md border border-border/70 bg-card/60 p-3">
															<div class="mb-3 flex items-center justify-between gap-3">
																<input
																	class="admin-input"
																	placeholder="Feature title"
																	bind:value={feature.title}
																/>
																<Button
																	size="sm"
																	variant="outline"
																	onclick={() =>
																		removeSubclassCardFeature(editorItem!, card.key, index)}
																>
																	Remove
																</Button>
															</div>
															<textarea
																class="admin-textarea"
																placeholder="Feature text"
																bind:value={feature.description_html}
															></textarea>
														</div>
													{/each}
												{/if}
											</div>
										</div>
									{/each}
								</div>
							</section>
						{/if}

						{#if selectedItemType === 'primary_weapons' || selectedItemType === 'secondary_weapons'}
							<section class="admin-panel">
								<h2>Weapon Stats</h2>
								<div class="grid gap-4 md:grid-cols-3">
									<label class="admin-field">
										<span>Level</span>
										<input class="admin-input" type="number" bind:value={editorItem.level_requirement} />
									</label>
									<label class="admin-field">
										<span>Type</span>
										<select class="admin-input" bind:value={editorItem.type}>
											{#each WEAPON_TYPES as type}
												<option value={type}>{type}</option>
											{/each}
										</select>
									</label>
									<label class="admin-field">
										<span>Range</span>
										<select class="admin-input" bind:value={editorItem.range}>
											{#each RANGES as range}
												<option value={range}>{range}</option>
											{/each}
										</select>
									</label>
									<label class="admin-field">
										<span>Attack Bonus</span>
										<input class="admin-input" type="number" bind:value={editorItem.attack_roll_bonus} />
									</label>
									<label class="admin-field">
										<span>Damage Dice</span>
										<input class="admin-input" bind:value={editorItem.damage_dice} />
									</label>
									<label class="admin-field">
										<span>Damage Bonus</span>
										<input class="admin-input" type="number" bind:value={editorItem.damage_bonus} />
									</label>
								</div>
							</section>
						{/if}

						{#if selectedItemType === 'armor'}
							<section class="admin-panel">
								<h2>Armor Stats</h2>
								<div class="grid gap-4 md:grid-cols-4">
									<label class="admin-field">
										<span>Level</span>
										<input class="admin-input" type="number" bind:value={editorItem.level_requirement} />
									</label>
									<label class="admin-field">
										<span>Max Armor</span>
										<input class="admin-input" type="number" bind:value={editorItem.max_armor} />
									</label>
									<label class="admin-field">
										<span>Major</span>
										<input class="admin-input" type="number" bind:value={editorItem.damage_thresholds.major} />
									</label>
									<label class="admin-field">
										<span>Severe</span>
										<input class="admin-input" type="number" bind:value={editorItem.damage_thresholds.severe} />
									</label>
								</div>
							</section>
						{/if}

						{#if selectedItemType === 'adversaries'}
							<section class="admin-panel">
								<h2>Adversary Stats</h2>
								<div class="grid gap-4 md:grid-cols-3">
									<label class="admin-field">
										<span>Tier</span>
										<input class="admin-input" type="number" min="1" max="4" bind:value={editorItem.tier} />
									</label>
									<label class="admin-field">
										<span>Type</span>
										<select class="admin-input" bind:value={editorItem.type}>
											{#each ADVERSARY_TYPES as type}
												<option value={type}>{type}</option>
											{/each}
										</select>
									</label>
									<label class="admin-field">
										<span>Difficulty</span>
										<input class="admin-input" type="number" bind:value={editorItem.difficulty} />
									</label>
									<label class="admin-field">
										<span>HP</span>
										<input class="admin-input" type="number" bind:value={editorItem.max_hp} />
									</label>
									<label class="admin-field">
										<span>Stress</span>
										<input class="admin-input" type="number" bind:value={editorItem.max_stress} />
									</label>
									<label class="admin-field">
										<span>Attack Modifier</span>
										<input class="admin-input" type="number" bind:value={editorItem.attack_modifier} />
									</label>
								</div>
								<label class="admin-field">
									<span>Motives & Tactics</span>
									<textarea class="admin-textarea" bind:value={editorItem.motives_tactics}></textarea>
								</label>
							</section>
						{/if}

						{#if selectedItemType === 'environments'}
							<section class="admin-panel">
								<h2>Environment Setup</h2>
								<div class="grid gap-4 md:grid-cols-3">
									<label class="admin-field">
										<span>Tier</span>
										<input class="admin-input" type="number" min="1" max="4" bind:value={editorItem.tier} />
									</label>
									<label class="admin-field">
										<span>Type</span>
										<select class="admin-input" bind:value={editorItem.type}>
											{#each ENVIRONMENT_TYPES as type}
												<option value={type}>{type}</option>
											{/each}
										</select>
									</label>
									<label class="admin-field">
										<span>Difficulty</span>
										<input class="admin-input" type="number" bind:value={editorItem.difficulty} />
									</label>
								</div>
								<label class="admin-field">
									<span>Impulses</span>
									<textarea class="admin-textarea" bind:value={editorItem.impulses}></textarea>
								</label>
								<label class="admin-field">
									<span>Potential Adversaries</span>
									<textarea class="admin-textarea" bind:value={editorItem.potential_adversaries}></textarea>
								</label>
							</section>
						{/if}

						{#if selectedItemType === 'beastforms'}
							<section class="admin-panel">
								<h2>Beastform Stats</h2>
								<div class="grid gap-4 md:grid-cols-3">
									<label class="admin-field">
										<span>Level</span>
										<input class="admin-input" type="number" bind:value={editorItem.level_requirement} />
									</label>
									<label class="admin-field">
										<span>Category</span>
										<input class="admin-input" bind:value={editorItem.category} />
									</label>
									<label class="admin-field">
										<span>Evasion Bonus</span>
										<input class="admin-input" type="number" bind:value={editorItem.evasion_bonus} />
									</label>
								</div>
							</section>
						{/if}

						{#if 'rarity_roll' in editorItem}
							<section class="admin-panel">
								<h2>Availability</h2>
								<label class="admin-field md:w-48">
									<span>Rarity Roll</span>
									<input class="admin-input" type="number" bind:value={editorItem.rarity_roll} />
								</label>
							</section>
						{/if}

						{#if 'features' in editorItem && selectedItemType !== 'adversaries' && selectedItemType !== 'environments'}
							<section class="admin-panel">
								<div class="flex items-center justify-between">
									<h2>Features</h2>
									<Button size="sm" variant="outline" onclick={() => addFeature(editorItem!)}>Add Feature</Button>
								</div>
								<div class="grid gap-3">
									{#each editorItem.features ?? [] as feature, index}
										<div class="rounded-md border border-border/70 bg-background/60 p-3">
											<div class="mb-3 flex items-center justify-between gap-3">
												<input class="admin-input" placeholder="Feature title" bind:value={feature.title} />
												<Button size="sm" variant="outline" onclick={() => removeArrayItem(editorItem!, 'features', index)}>Remove</Button>
											</div>
											<textarea class="admin-textarea" placeholder="Feature text" bind:value={feature.description_html}></textarea>
										</div>
									{/each}
								</div>
							</section>
						{/if}

						{#if selectedItemType === 'adversaries'}
							<section class="admin-panel">
								<div class="flex items-center justify-between">
									<h2>Adversary Features</h2>
									<Button size="sm" variant="outline" onclick={() => addAdversaryFeature(editorItem!)}>Add Feature</Button>
								</div>
								<div class="grid gap-3">
									{#each editorItem.features ?? [] as feature, index}
										<div class="rounded-md border border-border/70 bg-background/60 p-3">
											<div class="mb-3 grid gap-3 md:grid-cols-[1fr_10rem_8rem_auto]">
												<input class="admin-input" placeholder="Feature name" bind:value={feature.name} />
												<select class="admin-input" bind:value={feature.type}>
													<option value="Action">Action</option>
													<option value="Reaction">Reaction</option>
													<option value="Passive">Passive</option>
												</select>
												<input
													class="admin-input"
													type="number"
													placeholder="Uses"
													value={feature.max_uses ?? ''}
													onchange={(event) => {
														const value = event.currentTarget.value;
														feature.max_uses = value === '' ? null : Number(value);
													}}
												/>
												<Button size="sm" variant="outline" onclick={() => removeArrayItem(editorItem!, 'features', index)}>Remove</Button>
											</div>
											<textarea class="admin-textarea" placeholder="Feature text" bind:value={feature.description_html}></textarea>
										</div>
									{/each}
								</div>
							</section>
						{/if}

						{#if selectedItemType === 'environments'}
							<section class="admin-panel">
								<div class="flex items-center justify-between">
									<h2>Environment Features</h2>
									<Button size="sm" variant="outline" onclick={() => addEnvironmentFeature(editorItem!)}>Add Feature</Button>
								</div>
								<div class="grid gap-3">
									{#each editorItem.features ?? [] as feature, index}
										<div class="rounded-md border border-border/70 bg-background/60 p-3">
											<div class="mb-3 grid gap-3 md:grid-cols-[1fr_10rem_auto]">
												<input class="admin-input" placeholder="Feature name" bind:value={feature.name} />
												<select class="admin-input" bind:value={feature.type}>
													<option value="Action">Action</option>
													<option value="Reaction">Reaction</option>
													<option value="Passive">Passive</option>
												</select>
												<Button size="sm" variant="outline" onclick={() => removeArrayItem(editorItem!, 'features', index)}>Remove</Button>
											</div>
											<textarea class="admin-textarea" placeholder="Feature text" bind:value={feature.description_html}></textarea>
											<textarea class="admin-textarea mt-3" placeholder="Questions" bind:value={feature.questions}></textarea>
										</div>
									{/each}
								</div>
							</section>
						{/if}

						{#if selectedItemType === 'classes'}
							<section class="admin-panel">
								<h2>Class Text</h2>
								<label class="admin-field">
									<span>Hope Feature Title</span>
									<input class="admin-input" bind:value={editorItem.hope_feature.title} />
								</label>
								<label class="admin-field">
									<span>Hope Feature Text</span>
									<textarea class="admin-textarea" bind:value={editorItem.hope_feature.description_html}></textarea>
								</label>
								<div class="grid gap-3">
									<div class="flex items-center justify-between">
										<p class="text-sm font-medium text-foreground">Class Features</p>
										<Button size="sm" variant="outline" onclick={() => addFeature(editorItem!, 'class_features')}>Add Feature</Button>
									</div>
									{#if (editorItem.class_features ?? []).length === 0}
										<p class="text-sm text-muted-foreground">No class features configured.</p>
									{:else}
										{#each editorItem.class_features ?? [] as feature, index}
											<div class="rounded-md border border-border/70 bg-background/60 p-3">
												<div class="mb-3 flex items-center justify-between gap-3">
													<input class="admin-input" placeholder="Feature title" bind:value={feature.title} />
													<Button size="sm" variant="outline" onclick={() => removeArrayItem(editorItem!, 'class_features', index)}>Remove</Button>
												</div>
												<textarea class="admin-textarea" placeholder="Feature text" bind:value={feature.description_html}></textarea>
											</div>
										{/each}
									{/if}
								</div>
								<div class="grid gap-6">
									<div class="question-group">
										<div class="flex items-center justify-between">
											<p class="text-sm font-medium text-foreground">Background Questions</p>
											<Button size="sm" variant="outline" onclick={() => addString(editorItem!, 'background_questions')}>Add</Button>
										</div>
										{#each editorItem.background_questions ?? [] as question, index}
											<div class="question-row">
												<textarea class="admin-textarea question-input" value={question} onchange={(event) => updateString(editorItem!, 'background_questions', index, event.currentTarget.value)}></textarea>
												<Button size="sm" variant="outline" onclick={() => removeArrayItem(editorItem!, 'background_questions', index)}>Remove</Button>
											</div>
										{/each}
									</div>
									<div class="question-group">
										<div class="flex items-center justify-between">
											<p class="text-sm font-medium text-foreground">Connection Questions</p>
											<Button size="sm" variant="outline" onclick={() => addString(editorItem!, 'connection_questions')}>Add</Button>
										</div>
										{#each editorItem.connection_questions ?? [] as question, index}
											<div class="question-row">
												<textarea class="admin-textarea question-input" value={question} onchange={(event) => updateString(editorItem!, 'connection_questions', index, event.currentTarget.value)}></textarea>
												<Button size="sm" variant="outline" onclick={() => removeArrayItem(editorItem!, 'connection_questions', index)}>Remove</Button>
											</div>
										{/each}
									</div>
								</div>
							</section>
						{/if}

						{#if selectedItemType === 'adversaries'}
							<section class="admin-panel">
								<h2>Experiences</h2>
								<div class="grid gap-3">
									{#each editorItem.experiences ?? [] as experience, index}
										<div class="grid gap-2 md:grid-cols-[1fr_6rem_auto]">
											<input class="admin-input" value={experience} onchange={(event) => updateString(editorItem!, 'experiences', index, event.currentTarget.value)} />
											<input class="admin-input" type="number" value={editorItem.experience_modifiers?.[index] ?? 0} onchange={(event) => updateNumberArray(editorItem!, 'experience_modifiers', index, event.currentTarget.value)} />
											<Button size="sm" variant="outline" onclick={() => {
												removeArrayItem(editorItem!, 'experiences', index);
												removeArrayItem(editorItem!, 'experience_modifiers', index);
											}}>Remove</Button>
										</div>
									{/each}
									<Button size="sm" variant="outline" class="w-fit" onclick={() => {
										addString(editorItem!, 'experiences');
										editorItem!.experience_modifiers = [...(editorItem!.experience_modifiers ?? []), 0];
									}}>Add Experience</Button>
								</div>
							</section>
						{/if}
						</div>
					{/if}
				{/if}
			</div>
		</section>
	</section>
</main>

<Footer />

<style>
	.admin-input {
		height: 2.5rem;
		border-radius: 0.375rem;
		border: 1px solid #5a4b78;
		background: #16121f;
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.04),
			0 1px 0 rgb(255 255 255 / 0.03);
		padding: 0 0.75rem;
		color: #f4f0ff;
		font-size: 0.875rem;
		width: 100%;
	}

	.admin-textarea {
		min-height: 7rem;
		resize: vertical;
		border-radius: 0.375rem;
		border: 1px solid #5a4b78;
		background: #16121f;
		box-shadow:
			inset 0 0 0 1px rgb(255 255 255 / 0.04),
			0 1px 0 rgb(255 255 255 / 0.03);
		padding: 0.75rem;
		color: #f4f0ff;
		font-size: 0.875rem;
		line-height: 1.45;
		width: 100%;
	}

	.admin-input:hover,
	.admin-textarea:hover {
		border-color: #8f74c7;
	}

	.admin-input:focus,
	.admin-textarea:focus {
		border-color: #bca4ff;
		box-shadow:
			0 0 0 2px rgb(188 164 255 / 0.28),
			inset 0 0 0 1px rgb(255 255 255 / 0.06);
		outline: none;
	}

	.admin-input:disabled,
	.admin-textarea:disabled {
		border-style: solid;
		border-color: #3e344f;
		background: #211b2a;
		color: #cfc7dd;
		opacity: 1;
	}

	.admin-input::placeholder,
	.admin-textarea::placeholder {
		color: hsl(var(--muted-foreground) / 0.75);
	}

	.admin-field {
		display: grid;
		gap: 0.375rem;
		font-size: 0.875rem;
	}

	.admin-field span {
		font-weight: 500;
		color: hsl(var(--foreground));
	}

	.filter-field {
		display: grid;
		gap: 0.25rem;
		font-size: 0.75rem;
	}

	.filter-field span {
		font-weight: 600;
		color: hsl(var(--muted-foreground));
	}

	.filter-field select {
		width: 100%;
		border-radius: 0.375rem;
		border: 1px solid #4c3f63;
		background: #16121f;
		color: #f4f0ff;
		font-size: 0.8125rem;
		padding: 0.25rem;
	}

	.filter-field option {
		padding: 0.2rem 0.35rem;
	}

	.filter-field select:focus {
		border-color: #bca4ff;
		box-shadow: 0 0 0 2px rgb(188 164 255 / 0.22);
		outline: none;
	}

	.admin-panel {
		display: grid;
		gap: 1rem;
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--border) / 0.7);
		background: #201a29;
		padding: 1rem;
	}

	.admin-panel h2 {
		font-size: 1rem;
		font-weight: 700;
		color: hsl(var(--foreground));
	}

	.question-group {
		display: grid;
		gap: 0.75rem;
		min-width: 0;
	}

	.question-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 0.75rem;
		align-items: start;
	}

	.question-input {
		min-height: 4.75rem;
		resize: vertical;
	}

	@media (max-width: 900px) {
		.question-row {
			grid-template-columns: 1fr;
		}
	}
</style>
