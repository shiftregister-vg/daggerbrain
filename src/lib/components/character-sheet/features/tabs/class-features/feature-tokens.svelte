<script lang="ts">
	import { getCharacterContext } from '$lib/state/character.svelte';
	import { cn } from '$lib/utils';

	let {
		tokenKey,
		max
	}: {
		tokenKey: string;
		max: number;
	} = $props();

	const characterCtx = getCharacterContext();
	const character = $derived(characterCtx.character);
	const canEdit = $derived(characterCtx.canEdit);
	const value = $derived(Number(character?.feature_choices[tokenKey]?.[0] ?? 0));
	const slotCount = $derived(Math.max(0, Math.min(20, Math.trunc(max))));

	function setValue(nextValue: number) {
		if (!character || !canEdit) return;
		character.feature_choices[tokenKey] = [
			String(Math.max(0, Math.min(slotCount, Math.trunc(nextValue))))
		];
	}
</script>

{#if slotCount > 0}
	<div class="flex flex-wrap items-center gap-1.5" aria-label="Feature token tracker">
		{#each Array(slotCount) as _, index}
			<button
				type="button"
				disabled={!canEdit}
				class={cn(
					'size-4 rounded-full border-2 border-muted-foreground transition-colors',
					index < value ? 'bg-muted-foreground' : 'bg-transparent',
					canEdit && 'hover:border-foreground',
					!canEdit && 'cursor-default'
				)}
				aria-label="feature-token-slot"
				onclick={() => setValue(index >= value ? index + 1 : index)}
			></button>
		{/each}
	</div>
{/if}
