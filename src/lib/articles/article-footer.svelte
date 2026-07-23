<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import ExternalLink from '@lucide/svelte/icons/external-link';

	let { class: className = '' } = $props();

	const communitySettings = $derived(page.data.system_settings?.operations.community);
	const showCommunityFooter = $derived(
		communitySettings?.roadmap_enabled || communitySettings?.discord_enabled
	);
</script>

{#if showCommunityFooter}
	<div class={cn('space-y-2 rounded-lg bg-primary-muted/70 p-4 shadow', className)}>
		<div class="mb-4 flex items-center justify-between border-b border-muted-foreground/20 pb-1">
			<p class="text-md font-bold">Join the community!</p>
			{#if communitySettings?.roadmap_enabled}
				<Button variant="link" size="sm" href="/roadmap" class="text-muted-foreground">
					See the roadmap
					<ExternalLink />
				</Button>
			{/if}
		</div>
		<div class="flex flex-wrap items-center gap-4">
			{#if communitySettings?.discord_enabled}
				<Button
					class="bg-[#5865F2] hover:bg-[#5865F2]/80"
					target="_blank"
					href="https://discord.gg/"
				>
					Join the Discord
				</Button>
			{/if}
		</div>
	</div>
{/if}
