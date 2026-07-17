<script lang="ts">
	import { page } from '$app/state';
	import { signIn } from '@auth/sveltekit/client';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';

	let { children } = $props();
	const isLoggedIn = $derived(!!page.data.session?.user);
</script>

{#if isLoggedIn}
	{@render children()}
{:else}
	<div class="flex min-h-[calc(100dvh-var(--navbar-height,3.5rem))] items-center justify-center">
		<button type="button" onclick={() => signIn('google')} class={cn(buttonVariants(), 'w-min')}>
			Sign In
		</button>
	</div>
{/if}
