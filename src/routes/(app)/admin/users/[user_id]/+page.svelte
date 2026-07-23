<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Ban from '@lucide/svelte/icons/ban';
	import Power from '@lucide/svelte/icons/power';
	import RotateCcw from '@lucide/svelte/icons/rotate-ccw';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { getApi, patchApi } from '$lib/api/client';
	import { onMount } from 'svelte';

	type AdminUser = {
		id: string;
		name: string | null;
		email: string | null;
		image: string | null;
		is_admin: boolean;
		invite_accepted_at: string | number | null;
		status: 'active' | 'disabled' | 'banned';
		disabled_at: string | number | null;
		disabled_reason: string | null;
		banned_at: string | number | null;
		ban_reason: string | null;
		created_at: string | number;
		updated_at: string | number;
		character_count: number;
		campaign_count: number;
		encounter_count: number;
		homebrew_count: number;
		session_count: number;
	};

	let { data } = $props();

	let user = $state<AdminUser | null>(null);
	let disableReason = $state('');
	let banReason = $state('');
	let loadError = $state('');
	let actionError = $state('');
	let actionMessage = $state('');
	let isLoading = $state(true);
	let isSaving = $state(false);

	function statusClass(status: AdminUser['status']) {
		if (status === 'banned') return 'border-orange-500/70 bg-orange-500/15 text-orange-200';
		if (status === 'disabled') return 'border-yellow-500/70 bg-yellow-500/15 text-yellow-100';
		return 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100';
	}

	function formatDate(value: string | number | null) {
		if (!value) return 'None';
		const date = typeof value === 'number' ? new Date(value) : new Date(value);
		if (Number.isNaN(date.getTime())) return String(value);
		return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
	}

	async function loadUser() {
		isLoading = true;
		loadError = '';
		try {
			user = await getApi<AdminUser>(`/admin/users/${data.userId}`);
			disableReason = user.disabled_reason ?? '';
			banReason = user.ban_reason ?? '';
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to load user';
		} finally {
			isLoading = false;
		}
	}

	async function runAction(action: 'disable' | 'enable' | 'ban' | 'unban' | 'invalidate') {
		if (!user || isSaving) return;
		isSaving = true;
		actionError = '';
		actionMessage = '';
		try {
			if (action === 'disable') {
				user = await patchApi(`/admin/users/${user.id}/disabled`, {
					disabled: true,
					reason: disableReason
				});
				actionMessage = 'User disabled and sessions invalidated.';
			} else if (action === 'enable') {
				user = await patchApi(`/admin/users/${user.id}/disabled`, { disabled: false });
				disableReason = '';
				actionMessage = 'User re-enabled.';
			} else if (action === 'ban') {
				user = await patchApi(`/admin/users/${user.id}/ban`, { banned: true, reason: banReason });
				actionMessage = 'User banned and sessions invalidated.';
			} else if (action === 'unban') {
				user = await patchApi(`/admin/users/${user.id}/ban`, { banned: false });
				banReason = '';
				actionMessage = 'User unbanned.';
			} else {
				user = await patchApi(`/admin/users/${user.id}/invalidate`, {});
				actionMessage = 'User sessions invalidated.';
			}
		} catch (error) {
			actionError = error instanceof Error ? error.message : 'Unable to update user';
		} finally {
			isSaving = false;
		}
	}

	onMount(loadUser);
</script>

<svelte:head>
	<title>{user?.name || user?.email || 'User'} | Users Admin | Daggerlore</title>
	<meta name="description" content="Daggerlore user administration detail." />
</svelte:head>

<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col px-6 py-10">
	<section class="border-border/60 border-b pb-8">
		<div class="flex items-center gap-3 text-accent">
			<ShieldCheck class="size-6" />
			<p class="text-sm font-semibold tracking-wide uppercase">Admin</p>
		</div>
		<div class="mt-4 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="text-3xl font-bold text-foreground">{user?.name || 'User Detail'}</h1>
				<p class="mt-2 text-sm text-muted-foreground">{user?.email || data.userId}</p>
			</div>
			<Button href="/admin/users" variant="outline">Back to Users</Button>
		</div>
	</section>

	{#if loadError}
		<p class="py-8 text-sm text-destructive">{loadError}</p>
	{:else if isLoading || !user}
		<p class="py-8 text-sm text-muted-foreground">Loading user...</p>
	{:else}
		<section class="grid gap-4 py-8 md:grid-cols-5">
			<div class="border-border/70 bg-card/50 rounded-lg border p-5 md:col-span-2">
				<div class="flex items-center gap-4">
					<img
						src={user.image || '/images/art/portrait-placeholder.webp'}
						alt=""
						class="size-16 rounded-full border object-cover"
					/>
					<div class="min-w-0">
						<p class="truncate text-lg font-semibold">{user.name || 'Unnamed User'}</p>
						<p class="truncate text-sm text-muted-foreground">{user.email || user.id}</p>
						<div class="mt-3 flex flex-wrap gap-2">
							<span class={`rounded-full border px-2 py-1 text-xs font-semibold capitalize ${statusClass(user.status)}`}>
								{user.status}
							</span>
							{#if user.is_admin}
								<span class="rounded-full border border-accent/50 bg-accent/10 px-2 py-1 text-xs text-accent">
									Admin
								</span>
							{/if}
						</div>
					</div>
				</div>
			</div>
			<div class="border-border/70 bg-card/50 rounded-lg border p-5">
				<p class="text-3xl font-bold">{user.character_count}</p>
				<p class="text-sm text-muted-foreground">Characters</p>
			</div>
			<div class="border-border/70 bg-card/50 rounded-lg border p-5">
				<p class="text-3xl font-bold">{user.campaign_count}</p>
				<p class="text-sm text-muted-foreground">Campaigns</p>
			</div>
			<div class="border-border/70 bg-card/50 rounded-lg border p-5">
				<p class="text-3xl font-bold">{user.session_count}</p>
				<p class="text-sm text-muted-foreground">Active Sessions</p>
			</div>
		</section>

		<section class="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
			<div class="border-border/70 bg-card/40 rounded-lg border p-5">
				<h2 class="text-lg font-semibold">Account Details</h2>
				<dl class="mt-4 grid gap-3 text-sm">
					<div>
						<dt class="text-muted-foreground">User ID</dt>
						<dd class="break-all">{user.id}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Invite Accepted</dt>
						<dd>{formatDate(user.invite_accepted_at)}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Created</dt>
						<dd>{formatDate(user.created_at)}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Updated</dt>
						<dd>{formatDate(user.updated_at)}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Disabled At</dt>
						<dd>{formatDate(user.disabled_at)}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Banned At</dt>
						<dd>{formatDate(user.banned_at)}</dd>
					</div>
					<div>
						<dt class="text-muted-foreground">Other Content</dt>
						<dd>
							{user.encounter_count} encounters, {user.homebrew_count} homebrew items
						</dd>
					</div>
				</dl>
			</div>

			<div class="border-border/70 bg-card/40 rounded-lg border p-5">
				<h2 class="text-lg font-semibold">Moderation</h2>
				<p class="mt-1 text-sm text-muted-foreground">
					Disabling or banning a user also invalidates their active sessions.
				</p>

				{#if actionError}
					<p class="mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
						{actionError}
					</p>
				{/if}
				{#if actionMessage}
					<p class="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
						{actionMessage}
					</p>
				{/if}

				<div class="mt-5 grid gap-5">
					<div class="rounded-lg border border-border/70 p-4">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div>
								<h3 class="font-semibold">Disable Access</h3>
								<p class="text-sm text-muted-foreground">
									Use for temporary account holds or support investigation.
								</p>
							</div>
							{#if user.disabled_at}
								<Button variant="outline" disabled={isSaving} onclick={() => runAction('enable')}>
									<Power class="size-4" />
									Enable
								</Button>
							{:else}
								<Button variant="destructive" disabled={isSaving || user.is_admin} onclick={() => runAction('disable')}>
									<Power class="size-4" />
									Disable
								</Button>
							{/if}
						</div>
						<Textarea
							bind:value={disableReason}
							placeholder="Disable reason"
							class="mt-4 min-h-24"
							disabled={Boolean(user.disabled_at)}
						/>
					</div>

					<div class="rounded-lg border border-orange-500/40 bg-orange-500/5 p-4">
						<div class="flex flex-wrap items-start justify-between gap-3">
							<div>
								<h3 class="font-semibold">Ban User</h3>
								<p class="text-sm text-muted-foreground">
									Use for stronger moderation where future access should be blocked.
								</p>
							</div>
							{#if user.banned_at}
								<Button variant="outline" disabled={isSaving} onclick={() => runAction('unban')}>
									<Ban class="size-4" />
									Unban
								</Button>
							{:else}
								<Button variant="destructive" disabled={isSaving || user.is_admin} onclick={() => runAction('ban')}>
									<Ban class="size-4" />
									Ban
								</Button>
							{/if}
						</div>
						<Textarea
							bind:value={banReason}
							placeholder="Ban reason"
							class="mt-4 min-h-24"
							disabled={Boolean(user.banned_at)}
						/>
					</div>

					<div class="rounded-lg border border-border/70 p-4">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<div>
								<h3 class="font-semibold">Invalidate Sessions</h3>
								<p class="text-sm text-muted-foreground">
									Force the user to authenticate again without changing account status.
								</p>
							</div>
							<Button variant="outline" disabled={isSaving || user.is_admin} onclick={() => runAction('invalidate')}>
								<RotateCcw class="size-4" />
								Invalidate
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	{/if}
</main>

<Footer />
