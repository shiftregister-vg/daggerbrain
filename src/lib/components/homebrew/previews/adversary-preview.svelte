<script lang="ts">
	import type { Adversary } from '@domain/schemas/compendium';
	import AdversaryComponent from '$lib/components/compendium-items/adversary/adversary.svelte';

	let { adversary }: { adversary: Adversary } = $props();
</script>

<AdversaryComponent {adversary} disabled class="w-full" />
