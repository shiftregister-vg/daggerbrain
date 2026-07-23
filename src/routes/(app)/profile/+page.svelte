<script lang="ts">
	import { page } from '$app/state';
	import { artCharacters } from '$lib/assets/images';
	import FeedbackDialog from '$lib/components/feedback/feedback-dialog.svelte';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import Loader from '$lib/components/utility/loader.svelte';
	import { signOut } from '@auth/sveltekit/client';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { fade } from 'svelte/transition';

	const user = $derived(page.data.session?.user);
	const communitySettings = $derived(page.data.system_settings?.operations.community);
	const showProfileActions = $derived(
		communitySettings?.contact_enabled || communitySettings?.roadmap_enabled
	);
</script>

<div class="relative min-h-[calc(100dvh-var(--navbar-height,3.5rem))]">
	<div
		class="characters-fade-container pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-full w-full overflow-hidden"
	>
		<enhanced:img
			src={artCharacters}
			alt=""
			fetchpriority="high"
			sizes="100vw"
			class="characters-fade-container h-full w-full object-cover object-center"
		/>
	</div>

	<Loader isLoading={!user} />

	{#if user}
		<div
			transition:fade
			class="@container pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]"
		>
			<div class="mx-auto flex w-full max-w-4xl flex-col justify-center gap-4 px-4 py-6">
				<section class="rounded border border-white/5 bg-card p-5 shadow">
					<div class="flex items-center gap-4">
						<img
							src={user.image || '/images/art/portrait-placeholder.webp'}
							alt={user.name || user.email || 'Profile'}
							class="size-16 rounded-full border-2 border-accent object-cover"
						/>
						<div class="min-w-0">
							<h1 class="truncate text-xl font-bold">{user.name || 'Profile'}</h1>
							{#if user.email}
								<p class="truncate text-sm text-muted-foreground">{user.email}</p>
							{/if}
						</div>
					</div>
				</section>

				{#if showProfileActions}
					<section class="grid gap-4 rounded border border-white/5 bg-card p-5 shadow sm:grid-cols-2">
						{#if communitySettings?.contact_enabled}
							<div class="flex flex-col gap-3">
								<p class="text-sm font-medium">Have Questions?</p>
								<FeedbackDialog triggerText="Contact Me" variant="default" size="sm" class="w-min" />
							</div>
						{/if}
						{#if communitySettings?.roadmap_enabled}
							<div class="flex flex-col gap-3">
								<p class="text-sm font-medium">See what's brewing</p>
								<Button
									size="sm"
									variant="secondary"
									href="/roadmap"
									class="w-min bg-secondary/50 hover:bg-secondary/30"
								>
									See the roadmap
								</Button>
							</div>
						{/if}
					</section>
				{/if}

				<Button
					onclick={() => signOut({ redirectTo: '/' })}
					variant="link"
					class="w-min pl-0"
				>
					<LogOut /><span>Sign out</span>
				</Button>
			</div>
		</div>
	{/if}
</div>

<Footer />

<style>
	.characters-fade-container {
		mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);
		-webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 100%);
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
	}
</style>
