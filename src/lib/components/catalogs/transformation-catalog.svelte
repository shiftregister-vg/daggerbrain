<script lang="ts">
	import type { CompendiumContent, Transformation } from '@domain/schemas/compendium';
	import type { SourceKey } from '@domain/schemas/rules';
	import Input from '$lib/components/ui/input/input.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Select from '$lib/components/ui/select';
	import Search from '@lucide/svelte/icons/search';
	import Dropdown from '$lib/components/utility/dropdown.svelte';
	import HomebrewBadge from '$lib/components/decorations/badges/homebrew-badge.svelte';
	import CampaignBadge from '$lib/components/decorations/badges/campaign-badge.svelte';
	import TransformationComponent from '$lib/components/compendium-items/transformation.svelte';
	import { getSourcesContext } from '$lib/state/sources.svelte';
	import { sortEntriesByTitle } from '$lib/utils';

	let {
		onSelect,
		disabledIds = [],
		compendium,
		available_source_keys
	}: {
		onSelect: (transformationId: string) => void;
		disabledIds?: string[];
		compendium: CompendiumContent;
		available_source_keys: SourceKey[];
	} = $props();

	const sourceCtx = getSourcesContext();

	let searchQuery = $state('');
	let sourceFilter = $state<SourceKey | ''>('');

	function matchesSearch(transformation: Transformation, query: string): boolean {
		if (!query.trim()) return true;
		const q = query.toLowerCase();
		return (
			transformation.title.toLowerCase().includes(q) ||
			transformation.description_html.toLowerCase().includes(q) ||
			transformation.features.some(
				(feature) =>
					feature.name.toLowerCase().includes(q) ||
					feature.description_html.toLowerCase().includes(q)
			) ||
			transformation.questions.some((question) => question.toLowerCase().includes(q))
		);
	}

	const allTransformations = $derived(sortEntriesByTitle(Object.entries(compendium.transformations)));

	const filteredTransformations = $derived(
		allTransformations.filter(([, transformation]) => {
			if (!matchesSearch(transformation, searchQuery)) return false;
			if (sourceFilter !== '' && transformation.source_key !== sourceFilter) return false;
			return true;
		})
	);

	const hasActiveFilter = $derived(searchQuery.trim() !== '' || sourceFilter !== '');
</script>

<div class="flex flex-col gap-4">
	<div class="flex flex-col gap-2">
		<div class="relative">
			<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input bind:value={searchQuery} placeholder="Search transformations..." class="pl-9" />
		</div>

		<div class="flex flex-wrap justify-center gap-2">
			<Select.Root type="single" value={sourceFilter} onValueChange={(value) => (sourceFilter = value as SourceKey | '')}>
				<Select.Trigger class="w-32">
					{sourceFilter
						? sourceCtx.sources.find((source) => source.source_key === sourceFilter)?.name ||
							sourceFilter
						: 'All Sources'}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="">All Sources</Select.Item>
					{#each available_source_keys as key}
						<Select.Item value={key}>
							{sourceCtx.sources.find((source) => source.source_key === key)?.name || key}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
	</div>

	<div class="flex flex-col gap-2">
		{#if !hasActiveFilter}
			<p class="py-4 text-center text-sm text-muted-foreground">Search or use the filters above</p>
		{:else if filteredTransformations.length === 0}
			<p class="py-4 text-center text-sm text-muted-foreground">
				{searchQuery.trim() ? 'No transformations match your search' : 'No transformations available'}
			</p>
		{:else}
			{#each filteredTransformations as [id, transformation]}
				{#snippet title_snippet()}
					<div class="gap-4 text-left">
						<p class="text-md font-medium">{transformation.title}</p>
						<p class="flex items-center gap-1.5 truncate text-[10px] leading-none text-muted-foreground italic">
							{#if transformation.source_key === 'Homebrew'}
								<HomebrewBadge class="size-3" />
							{:else if transformation.source_key === 'Campaign'}
								<CampaignBadge class="size-3" />
							{/if}
							{sourceCtx.sources.find((source) => source.source_key === transformation.source_key)
								?.name ?? transformation.source_key}
						</p>
					</div>
				{/snippet}

				<Dropdown {title_snippet} class="border-2">
					<div class="flex flex-col gap-3">
						<Button size="sm" disabled={disabledIds.includes(id)} onclick={() => onSelect(id)}>
							{disabledIds.includes(id) ? 'Added' : 'Select'}
						</Button>
						<TransformationComponent {transformation} />
					</div>
				</Dropdown>
			{/each}
		{/if}
	</div>
</div>
