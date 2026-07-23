<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { signIn } from '@auth/sveltekit/client';
	import { untrack } from 'svelte';
	import { artCampaigns } from '$lib/assets/images';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Footer from '$lib/components/navigation/footer.svelte';
	import LoadError from '$lib/components/utility/load-error.svelte';
	import Loader from '$lib/components/utility/loader.svelte';
	import { getUserContext } from '$lib/state/user.svelte';
	import { cn } from '$lib/utils';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import { createApiResource } from '$lib/state/api-resource.svelte';
	import { getApi, postApi } from '$lib/api/client';

	const userCtx = getUserContext();
	const inviteCode = $derived(page.params.uid ?? '');
	const inviteQuery = createApiResource<{
		campaign_id: string;
		campaign_name: string;
		is_member: boolean;
	} | null>(
		async () =>
			!userCtx.isLoading && userCtx.user && inviteCode ? await getApi(`/invites/${inviteCode}`) : null
	);
	const inviteStatus = $derived(inviteQuery.data ?? null);
	const isLoading = $derived(userCtx.isLoading || inviteQuery.isLoading);
	const loadError = $derived(userCtx.error || inviteQuery.error);
	const signedInUserId = $derived(userCtx.user?._id ?? null);

	let displayName = $state('');
	let joining = $state(false);
	let joinError = $state('');
	let hasInitializedDisplayName = $state(false);

	$effect(() => {
		if (hasInitializedDisplayName) return;
		if (!userCtx.user) return;
		displayName = userCtx.user?.name || userCtx.user?.email || '';
		hasInitializedDisplayName = true;
	});

	$effect(() => {
		inviteCode;
		signedInUserId;
		if (userCtx.isLoading || !signedInUserId || !inviteCode) return;
		untrack(() => void inviteQuery.refresh());
	});

	$effect(() => {
		if (inviteStatus?.is_member) {
			goto(`/campaigns/${inviteStatus.campaign_id}`);
		}
	});

	async function handleJoin() {
		if (!inviteStatus) {
			joinError = 'Campaign not found';
			return;
		}

		joining = true;
		joinError = '';

		try {
			const { id } = await postApi<{ id: string }>(`/invites/${inviteCode}/join`, {
				displayName: displayName.trim()
			});
			await userCtx.refresh();
			goto(`/campaigns/${id}`);
		} catch (error) {
			joinError = error instanceof Error ? error.message : 'Failed to join campaign';
			joining = false;
		}
	}
</script>

<div class="relative min-h-[calc(100dvh-var(--navbar-height,3.5rem))]">
	<Loader {isLoading} />
	<div
		class="campaigns-fade-container pointer-events-none absolute right-0 bottom-0 left-0 z-0 h-64 w-full overflow-hidden"
	>
		<enhanced:img
			src={artCampaigns}
			alt=""
			fetchpriority="high"
			sizes="100vw"
			class="campaigns-fade-container h-full w-full object-cover object-center"
		/>
	</div>

	<div
		class={cn(
			'relative z-10 flex h-full w-full flex-col items-center justify-start',
			'pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)]'
		)}
	>
		{#if isLoading || inviteStatus?.is_member}
			<div></div>
		{:else if !userCtx.user}
			<div class="flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
				<div class="flex flex-col items-center gap-2 text-center">
					<h1 class="font-eveleth text-2xl">Join Campaign</h1>
					<p class="max-w-md text-sm text-muted-foreground">
						Sign in with Google to accept this campaign invite and create your Daggerlore account.
					</p>
				</div>
				<div class="mx-auto w-full max-w-[420px] rounded-xl border bg-card p-6 text-center shadow-lg">
					<Button
						type="button"
						class="w-full"
						onclick={() => signIn('google', { redirectTo: page.url.pathname })}
					>
						Sign In to Accept Invite
					</Button>
				</div>
			</div>
		{:else if loadError || !inviteStatus}
			<LoadError />
		{:else}
			<div class="flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
				<div class="flex flex-col items-center gap-2 text-center">
					<h1 class="font-eveleth text-2xl">Join Campaign</h1>
					<p class="max-w-md text-sm text-muted-foreground">
						You&apos;re joining from a campaign invite link. Add a display name and head to the
						table.
					</p>
				</div>

				<div class="mx-auto w-full max-w-[500px] rounded-xl border bg-card shadow-lg">
					<div class="border-b px-6 py-5 text-center">
						<p class="text-[10px] font-medium tracking-[0.24em] text-muted-foreground uppercase">
							Campaign
						</p>
						<p class="mt-2 font-eveleth text-lg">
							{inviteStatus.campaign_name || 'Unnamed Campaign'}
						</p>
					</div>

					<form
						class="flex flex-col gap-4 px-6 py-5"
						onsubmit={(event) => {
							event.preventDefault();
							handleJoin();
						}}
					>
						<div class="flex flex-col gap-2">
							<label for="join-display-name" class="text-sm font-medium"
								>Display Name (optional)</label
							>
							<Input
								id="join-display-name"
								type="text"
								placeholder="Enter your display name"
								bind:value={displayName}
							/>
						</div>

						{#if joinError}
							<div
								class="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive"
							>
								{joinError}
							</div>
						{/if}

						<Button type="submit" class="w-full" size="sm" disabled={joining}>
							{#if joining}
								<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
								Joining...
							{:else}
								Join Campaign
							{/if}
						</Button>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>

<Footer />

<style>
	.campaigns-fade-container {
		mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
		-webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0) 100%);
		mask-size: 100% 100%;
		-webkit-mask-size: 100% 100%;
	}
</style>
