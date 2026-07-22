<script lang="ts">
	import { getCharacterContext } from '$lib/state/character.svelte';
	import Textarea from '$lib/components/ui/textarea/textarea.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';

	const characterCtx = getCharacterContext();
	const derived_character_data = $derived(characterCtx.derived_character_data);
	const character = $derived(characterCtx.character);
	const transformation = $derived(derived_character_data?.transformation_card);

	function resetQuestions() {
		if (!character || !transformation) return;
		character.transformation_questions = transformation.questions.map((question) => ({
			question,
			answer: ''
		}));
	}
</script>

{#if character && transformation}
	{#each character.transformation_questions ?? [] as item}
		<div class="flex flex-col gap-3 rounded-md bg-primary/50 p-3">
			<p class="text-sm">{item.question}</p>
			<Textarea bind:value={item.answer} placeholder="Your answer..." class="min-h-24" />
		</div>
	{/each}

	{#if transformation.questions.length > 0}
		<div class="flex justify-end">
			<Button variant="link" onclick={resetQuestions} class="gap-2 text-muted-foreground">
				<RotateCcw class="size-4" />
				Reset
			</Button>
		</div>
	{:else}
		<p class="text-sm text-muted-foreground italic">
			This transformation does not have questions to answer.
		</p>
	{/if}
{/if}
