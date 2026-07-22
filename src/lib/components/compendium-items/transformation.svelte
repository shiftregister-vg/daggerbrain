<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible';
	import type { Transformation } from '@domain/schemas/compendium';
	import { getSourcesContext } from '$lib/state/sources.svelte';
	import { cn, renderMarkdown } from '$lib/utils';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let {
		transformation,
		class: className = '',
		featuresOpen = $bindable(true),
		questionsOpen = $bindable(true),
		showQuestions = true
	}: {
		transformation: Transformation;
		class?: string;
		featuresOpen?: boolean;
		questionsOpen?: boolean;
		showQuestions?: boolean;
	} = $props();

	const sourceCtx = getSourcesContext();
	const sourceName = $derived(
		sourceCtx.sources.find((source) => source.source_key === transformation.source_key)?.name ??
			transformation.source_key
	);
</script>

<div class={cn('flex max-w-[440px] min-w-[300px] flex-col gap-3 rounded-lg bg-background p-4', className)}>
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0">
			<p class="truncate font-eveleth text-lg text-foreground">{transformation.title}</p>
			<p class="text-xs text-muted-foreground">{sourceName}</p>
		</div>
		<span class="rounded bg-primary-muted px-2 py-1 text-[10px] font-semibold uppercase text-primary">
			Transformation
		</span>
	</div>

	{#if transformation.description_html}
		<div class="markdown-content prose prose-sm max-w-none text-sm text-muted-foreground">
			{@html renderMarkdown(transformation.description_html)}
		</div>
	{/if}

	{#if transformation.features.length > 0}
		<Collapsible.Root bind:open={featuresOpen}>
			<Collapsible.Trigger class="flex w-full items-center gap-1.5 border-y bg-primary-muted/30 px-3 py-2 text-left text-muted-foreground">
				<ChevronRight class={cn('size-4 shrink-0 transition-transform', featuresOpen && 'rotate-90')} />
				<p class="text-sm font-medium">Features</p>
			</Collapsible.Trigger>
			<Collapsible.Content class="flex flex-col gap-3 px-3 pt-4 pb-2">
				{#each transformation.features as feature}
					<div class="grid gap-1">
						<p class="text-sm font-semibold text-foreground">{feature.name}</p>
						<div class="markdown-content text-sm text-muted-foreground [&_li]:mt-1">
							{@html renderMarkdown(feature.description_html)}
						</div>
					</div>
				{/each}
			</Collapsible.Content>
		</Collapsible.Root>
	{/if}

	{#if showQuestions && transformation.questions.length > 0}
		<Collapsible.Root bind:open={questionsOpen}>
			<Collapsible.Trigger class="flex w-full items-center gap-1.5 border-y bg-primary-muted/30 px-3 py-2 text-left text-muted-foreground">
				<ChevronRight class={cn('size-4 shrink-0 transition-transform', questionsOpen && 'rotate-90')} />
				<p class="text-sm font-medium">Questions</p>
			</Collapsible.Trigger>
			<Collapsible.Content class="px-3 pt-4 pb-2">
				<ul class="grid list-disc gap-2 pl-5 text-sm text-muted-foreground">
					{#each transformation.questions as question}
						<li>{@html renderMarkdown(question)}</li>
					{/each}
				</ul>
			</Collapsible.Content>
		</Collapsible.Root>
	{/if}
</div>

<style>
	.markdown-content :global(p + p) {
		margin-top: 0.625rem;
	}

	.markdown-content :global(p + ul),
	.markdown-content :global(p + ol),
	.markdown-content :global(ul + p),
	.markdown-content :global(ol + p) {
		margin-top: 0.625rem;
	}
</style>
