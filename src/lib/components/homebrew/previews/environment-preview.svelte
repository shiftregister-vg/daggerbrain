<script lang="ts">
	import type { Environment } from '@domain/schemas/compendium';
	import EnvironmentComponent from '$lib/components/compendium-items/environment.svelte';

	let { environment }: { environment: Environment } = $props();
</script>

<EnvironmentComponent {environment} class="w-full" />
