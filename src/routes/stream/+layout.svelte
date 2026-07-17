<script lang="ts">
	const { children } = $props();
</script>

<svelte:head>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

{@render children?.()}
