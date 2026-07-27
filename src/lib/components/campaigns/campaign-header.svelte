<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { getCampaignContext } from '$lib/state/campaign.svelte';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Input from '$lib/components/ui/input/input.svelte';
	import Play from '@lucide/svelte/icons/play';
	import Settings from '@lucide/svelte/icons/settings';
	import TvMinimalPlay from '@lucide/svelte/icons/tv-minimal-play';
	import { cn } from '$lib/utils';

	let {
		campaignId,
		isGM,
		onStreamSettingsClick,
		onSettingsClick,
		onPlayerSettingsClick
	}: {
		campaignId: string;
		isGM: boolean;
		onStreamSettingsClick: () => void;
		onSettingsClick: () => void;
		onPlayerSettingsClick: () => void;
	} = $props();

	const campaignCtx = getCampaignContext();
	const campaign = $derived(campaignCtx.campaign);
	let editingName = $state(false);
</script>

{#if campaign}
	<div
		class="sticky top-[calc(var(--navbar-height,3.5rem)-1px)] z-20 w-full bg-background sm:top-0"
	>
		<div class="w-full bg-primary/50">
			<div
				class="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-4"
			>
				<div class="flex items-center gap-2 truncate">
					<a
						href="/campaigns"
						class={cn(
							buttonVariants({ variant: 'link' }),
							'hidden px-0 text-muted-foreground sm:flex'
						)}
					>
						Campaigns
					</a>
					<ChevronRight class="hidden size-3.5 text-muted-foreground sm:block" />

					<a
						href="/campaigns"
						class={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'shrink-0 sm:hidden')}
					>
						<ChevronLeft class="shrink-0" />
					</a>

					{#if isGM && editingName}
						<Input
							class="-ml-2 border-none px-2"
							autofocus
							onblur={() => (editingName = false)}
							bind:value={campaign.name}
							placeholder="Campaign name"
						/>
					{:else}
						<button
							type="button"
							onclick={() => (editingName = true)}
							class={cn(
								buttonVariants({ variant: 'ghost' }),
								'-ml-2 truncate px-2',
								!isGM && 'pointer-events-none'
							)}
						>
							<span class="truncate">{campaign.name || 'Unnamed Campaign'}</span>
						</button>
					{/if}
				</div>

				<div class="flex shrink-0 items-center gap-2">
					{#if isGM}
						<button
							type="button"
							class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-7')}
							title="Stream Overlay"
							onclick={onStreamSettingsClick}
						>
							<TvMinimalPlay class="size-3.5" />
							<span class="hidden sm:block">Stream Overlay</span>
						</button>
					{/if}

					<button
						type="button"
						class={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'h-7')}
						onclick={isGM ? onSettingsClick : onPlayerSettingsClick}
					>
						<Settings class="size-3.5" />
						<span class="hidden sm:block">Settings</span>
					</button>

					<a href={`/campaigns/${campaignId}/live`} class={buttonVariants({ size: 'sm' })}>
						<span>Launch</span>
						<Play class="size-3.5" />
					</a>
				</div>
			</div>
		</div>
	</div>
{/if}
