<script lang="ts">
	import AppShell from './app-shell.svelte';

	const { children } = $props();
</script>

<AppShell {children} />
