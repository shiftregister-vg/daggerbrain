<script lang="ts">
	import { page } from '$app/state';
	import { artEncounters, screenshotEncounter } from '$lib/assets/images';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { cn } from '$lib/utils';
	import Mockup from '$lib/components/decorations/device-mockup.svelte';
	import { signIn } from '@auth/sveltekit/client';

	let { children } = $props();
	const isMarketingRoute = $derived(page.url.pathname === '/encounters');
	const isLoggedIn = $derived(!!page.data.session?.user);
</script>

{#if isLoggedIn}
	{@render children()}
{:else}
		{#if isMarketingRoute}
			<main class="relative min-h-[calc(100dvh-var(--navbar-height,3.5rem))] overflow-hidden">
				<div
					class="encounters-fade-container pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-full w-full overflow-hidden"
				>
					<enhanced:img
						src={artEncounters}
						alt=""
						fetchpriority="high"
						sizes="100vw"
						class="h-full w-full object-cover object-center"
					/>
				</div>

				<div
					class={cn(
						'relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10',
						'pr-[calc(env(safe-area-inset-right)+1rem)] pl-[calc(env(safe-area-inset-left)+1rem)]'
					)}
				>
					<section class="mt-4 flex flex-col items-center gap-6 text-center">
						<h1 class="font-eveleth text-lg">Encounter Builder</h1>
						<p class="max-w-[560px]">
							Build encounters faster with adversaries, environments, and a Battle Points calculator
							all in one place. With notes, editable adversaries and environments, and dice rolling
							built in, creating balanced encounters is simple.
						</p>
						<button
							type="button"
							onclick={() => signIn('google')}
							class={cn(buttonVariants(), 'w-min')}
						>
							Build Your First Encounter
						</button>

						<div class="relative mt-4 mb-8 max-w-[500px]">
							<Mockup class="aspect-auto sm:w-[500px]">
								<enhanced:img
									src={screenshotEncounter}
									alt="tablet encounter planning screenshot"
									sizes="(min-width: 640px) 500px, calc(100vw - 2rem)"
									class="size-full object-cover object-top"
								/>
							</Mockup>
						</div>
					</section>
				</div>

				<div class="relative mb-8 w-full bg-background/90 shadow-xl">
					<div class="mx-auto flex max-w-xl flex-col items-center gap-4 px-4 pt-6 pb-8 text-center">
						<h2 class="text-lg font-bold">Plan dynamic encounters in minutes</h2>
						<p>
							From social encounters, to massive combats, Daggerbrain helps GMs organize encounter
							details without slowing down session prep.
						</p>
						<button
							type="button"
							onclick={() => signIn('google')}
							class={cn(buttonVariants(), 'w-min')}
						>
							Start Building
						</button>
					</div>
				</div>
			</main>

			<Footer />
		{:else}
			<div class="flex min-h-[calc(100dvh-var(--navbar-height,3.5rem))] items-center justify-center">
				<button type="button" onclick={() => signIn('google')} class={cn(buttonVariants(), 'w-min')}>
					Sign In
				</button>
			</div>
		{/if}
{/if}

<style>
	.encounters-fade-container {
		mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 100%);
		-webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.2) 100%);
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
	}
</style>
