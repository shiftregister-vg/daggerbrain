<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Users from '@lucide/svelte/icons/users';
	import Search from '@lucide/svelte/icons/search';
	import MailPlus from '@lucide/svelte/icons/mail-plus';
	import Copy from '@lucide/svelte/icons/copy';
	import X from '@lucide/svelte/icons/x';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import * as Select from '$lib/components/ui/select';
	import { deleteApi, getApi, postApi } from '$lib/api/client';
	import { onMount } from 'svelte';

	type AdminUser = {
		id: string;
		name: string | null;
		email: string | null;
		image: string | null;
		is_admin: boolean;
		invite_accepted_at: string | number | null;
		status: 'active' | 'disabled' | 'banned';
		character_count: number;
		campaign_count: number;
		encounter_count: number;
		homebrew_count: number;
		session_count: number;
		created_at: string | number;
	};
	type Invitation = {
		id: string;
		invite_type: 'admin' | 'campaign';
		email: string | null;
		invite_code: string;
		campaign_name: string | null;
		created_by_name: string | null;
		accepted_by_name: string | null;
		accepted_at: string | number | null;
		revoked_at: string | number | null;
		expires_at: string | number | null;
		created_at: string | number;
		status: 'pending' | 'accepted' | 'revoked' | 'expired';
	};

	let users = $state<AdminUser[]>([]);
	let invitations = $state<Invitation[]>([]);
	let query = $state('');
	let origin = $state('');
	let inviteExpirationHours = $state('168');
	let loadError = $state('');
	let inviteError = $state('');
	let inviteMessage = $state('');
	let isLoading = $state(true);
	let isCreatingInvite = $state(false);
	let revokingInviteId = $state('');
	let showClosedInvites = $state(false);

	const filteredUsers = $derived(
		users.filter((user) => {
			const text = `${user.name ?? ''} ${user.email ?? ''} ${user.id}`.toLowerCase();
			return text.includes(query.trim().toLowerCase());
		})
	);
	const activeCount = $derived(users.filter((user) => user.status === 'active').length);
	const disabledCount = $derived(users.filter((user) => user.status === 'disabled').length);
	const pendingInviteCount = $derived(
		invitations.filter((invitation) => invitation.status === 'pending').length
	);
	const closedInviteCount = $derived(
		invitations.filter((invitation) => invitation.status === 'accepted' || invitation.status === 'revoked')
			.length
	);
	const visibleInvitations = $derived(
		showClosedInvites
			? invitations
			: invitations.filter(
					(invitation) => invitation.status !== 'accepted' && invitation.status !== 'revoked'
				)
	);

	function statusClass(status: AdminUser['status']) {
		if (status === 'banned') return 'border-orange-500/70 bg-orange-500/15 text-orange-200';
		if (status === 'disabled') return 'border-yellow-500/70 bg-yellow-500/15 text-yellow-100';
		return 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100';
	}

	function formatDate(value: string | number) {
		if (!value) return 'Unknown';
		const date = typeof value === 'number' ? new Date(value) : new Date(value);
		if (Number.isNaN(date.getTime())) return String(value);
		return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
	}

	function formatNullableDate(value: string | number | null) {
		if (!value) return 'None';
		return formatDate(value);
	}

	function invitationStatusClass(status: Invitation['status']) {
		if (status === 'accepted') return 'border-emerald-500/60 bg-emerald-500/10 text-emerald-100';
		if (status === 'revoked') return 'border-muted bg-muted/30 text-muted-foreground';
		if (status === 'expired') return 'border-orange-500/70 bg-orange-500/15 text-orange-200';
		return 'border-accent/60 bg-accent/10 text-accent';
	}

	function invitationUrl(invitation: Invitation) {
		return `${origin}/invites/${invitation.invite_code}`;
	}

	async function loadUsers() {
		isLoading = true;
		loadError = '';
		try {
			users = await getApi<AdminUser[]>('/admin/users');
			invitations = await getApi<Invitation[]>('/admin/invitations');
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to load users';
		} finally {
			isLoading = false;
		}
	}

	async function createInvite() {
		if (isCreatingInvite) return;
		isCreatingInvite = true;
		inviteError = '';
		inviteMessage = '';
		try {
			invitations = await postApi<Invitation[]>('/admin/invitations', {
				expires_in_hours: Number(inviteExpirationHours)
			});
			const latest = invitations.find((invitation) => invitation.status === 'pending');
			inviteMessage = latest ? `Invite link created: ${invitationUrl(latest)}` : 'Invite link created.';
		} catch (error) {
			inviteError = error instanceof Error ? error.message : 'Unable to create invite';
		} finally {
			isCreatingInvite = false;
		}
	}

	async function copyInvite(invitation: Invitation) {
		if (!origin) return;
		await navigator.clipboard.writeText(invitationUrl(invitation));
		inviteMessage = 'Invite link copied.';
	}

	async function revokeInvite(invitationId: string) {
		if (revokingInviteId) return;
		revokingInviteId = invitationId;
		inviteError = '';
		inviteMessage = '';
		try {
			invitations = await deleteApi<Invitation[]>(`/admin/invitations/${invitationId}`);
			inviteMessage = 'Invite revoked.';
		} catch (error) {
			inviteError = error instanceof Error ? error.message : 'Unable to revoke invite';
		} finally {
			revokingInviteId = '';
		}
	}

	onMount(() => {
		origin = window.location.origin;
		loadUsers();
	});
</script>

<svelte:head>
	<title>Users Admin | Daggerlore</title>
	<meta name="description" content="Daggerlore user administration." />
</svelte:head>

<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col px-6 py-10">
	<section class="border-border/60 border-b pb-8">
		<div class="flex items-center gap-3 text-accent">
			<ShieldCheck class="size-6" />
			<p class="text-sm font-semibold tracking-wide uppercase">Admin</p>
		</div>
		<div class="mt-4 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="text-3xl font-bold text-foreground">Users Manager</h1>
				<p class="mt-2 text-sm text-muted-foreground">Review accounts and moderate access.</p>
			</div>
			<Button href="/admin" variant="outline">Dashboard</Button>
		</div>
	</section>

	<section class="grid gap-4 py-8 md:grid-cols-4">
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<Users class="size-5 text-accent" />
			<p class="mt-4 text-3xl font-bold">{users.length}</p>
			<p class="text-sm text-muted-foreground">Total users</p>
		</div>
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<p class="text-3xl font-bold">{activeCount}</p>
			<p class="text-sm text-muted-foreground">Active</p>
		</div>
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<p class="text-3xl font-bold">{disabledCount}</p>
			<p class="text-sm text-muted-foreground">Disabled</p>
		</div>
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<p class="text-3xl font-bold">{pendingInviteCount}</p>
			<p class="text-sm text-muted-foreground">Pending Invites</p>
		</div>
	</section>

	<section class="border-border/70 bg-card/40 mb-8 overflow-hidden rounded-lg border">
		<div class="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b p-4">
			<div>
				<h2 class="text-lg font-semibold">Invitations</h2>
				<p class="text-sm text-muted-foreground">
					Admin invites are one-time links. Campaign invite acceptances are tracked here.
				</p>
			</div>
			<form
				class="flex w-full flex-wrap items-end gap-2 md:w-auto"
				onsubmit={(event) => {
					event.preventDefault();
					createInvite();
				}}
			>
				<label class="grid min-w-44 gap-1 text-sm">
					<span class="text-muted-foreground">Expires After</span>
					<Select.Root type="single" bind:value={inviteExpirationHours}>
						<Select.Trigger>
							{#snippet children()}
								{inviteExpirationHours === '24'
									? '24 hours'
									: inviteExpirationHours === '72'
										? '3 days'
										: inviteExpirationHours === '168'
											? '7 days'
											: '30 days'}
							{/snippet}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="24">24 hours</Select.Item>
							<Select.Item value="72">3 days</Select.Item>
							<Select.Item value="168">7 days</Select.Item>
							<Select.Item value="720">30 days</Select.Item>
						</Select.Content>
					</Select.Root>
				</label>
				<Button type="submit" disabled={isCreatingInvite}>
					<MailPlus class="size-4" />
					Generate Invite Link
				</Button>
				{#if closedInviteCount > 0}
					<Button
						type="button"
						variant="outline"
						onclick={() => (showClosedInvites = !showClosedInvites)}
					>
						{showClosedInvites ? 'Hide Closed' : `Show Closed (${closedInviteCount})`}
					</Button>
				{/if}
			</form>
		</div>

		{#if inviteError}
			<p class="mx-4 mt-4 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
				{inviteError}
			</p>
		{/if}
		{#if inviteMessage}
			<p class="mx-4 mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
				{inviteMessage}
			</p>
		{/if}

		{#if invitations.length === 0}
			<p class="p-4 text-sm text-muted-foreground">No invitations have been recorded yet.</p>
		{:else if visibleInvitations.length === 0}
			<p class="p-4 text-sm text-muted-foreground">
				No pending or expired invites. Use “Show Closed” to view accepted and revoked invites.
			</p>
		{:else}
			<div class="divide-border/70 divide-y">
				{#each visibleInvitations as invitation}
					<div class="grid gap-4 p-4 lg:grid-cols-[7rem_minmax(14rem,1fr)_minmax(12rem,1fr)_8rem_8rem_8rem]">
						<div>
							<span class={`rounded-full border px-2 py-1 text-xs font-semibold capitalize ${invitationStatusClass(invitation.status)}`}>
								{invitation.status}
							</span>
						</div>
						<div class="min-w-0">
							<p class="truncate font-semibold">
								{invitation.invite_type === 'campaign'
									? invitation.campaign_name || 'Campaign Invite'
									: invitation.status === 'pending' && origin
										? invitationUrl(invitation)
										: 'Admin Invite'}
							</p>
							<p class="truncate text-sm text-muted-foreground capitalize">
								{invitation.invite_type} invite
							</p>
						</div>
						<div class="min-w-0 text-sm text-muted-foreground">
							{#if invitation.accepted_by_name}
								Accepted by {invitation.accepted_by_name}
							{:else if invitation.created_by_name}
								Created by {invitation.created_by_name}
							{:else}
								No user yet
							{/if}
						</div>
						<p class="text-sm text-muted-foreground">{formatDate(invitation.created_at)}</p>
						<p class="text-sm text-muted-foreground">{formatNullableDate(invitation.expires_at)}</p>
						<div class="flex justify-end gap-2">
							{#if invitation.invite_type === 'admin' && invitation.status === 'pending'}
								<Button variant="outline" size="sm" onclick={() => copyInvite(invitation)}>
									<Copy class="size-4" />
									Copy
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={revokingInviteId === invitation.id}
									onclick={() => revokeInvite(invitation.id)}
								>
									<X class="size-4" />
									Revoke
								</Button>
							{:else}
								<span class="text-sm text-muted-foreground">
									{formatNullableDate(invitation.accepted_at)}
								</span>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section class="border-border/70 bg-card/40 overflow-hidden rounded-lg border">
		<div class="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b p-4">
			<div>
				<h2 class="text-lg font-semibold">Accounts</h2>
				<p class="text-sm text-muted-foreground">{filteredUsers.length} shown</p>
			</div>
			<label class="relative block w-full max-w-sm">
				<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input bind:value={query} placeholder="Search users" class="pl-9" />
			</label>
		</div>

		{#if loadError}
			<p class="p-4 text-sm text-destructive">{loadError}</p>
		{:else if isLoading}
			<p class="p-4 text-sm text-muted-foreground">Loading users...</p>
		{:else if filteredUsers.length === 0}
			<p class="p-4 text-sm text-muted-foreground">No users found.</p>
		{:else}
			<div class="divide-border/70 divide-y">
				{#each filteredUsers as user}
					<a
						href={`/admin/users/${user.id}`}
						class="grid gap-4 p-4 transition-colors hover:bg-muted/40 lg:grid-cols-[minmax(18rem,1.5fr)_8rem_repeat(5,6rem)_8rem]"
					>
						<div class="min-w-0">
							<p class="truncate font-semibold text-foreground">{user.name || 'Unnamed User'}</p>
							<p class="truncate text-sm text-muted-foreground">{user.email || user.id}</p>
						</div>
						<div>
							<span class={`rounded-full border px-2 py-1 text-xs font-semibold capitalize ${statusClass(user.status)}`}>
								{user.status}
							</span>
							{#if user.is_admin}
								<span class="ml-2 rounded-full border border-accent/50 bg-accent/10 px-2 py-1 text-xs text-accent">
									Admin
								</span>
							{/if}
						</div>
						<p class="text-sm text-muted-foreground">{user.character_count} chars</p>
						<p class="text-sm text-muted-foreground">{user.campaign_count} campaigns</p>
						<p class="text-sm text-muted-foreground">{user.encounter_count} encounters</p>
						<p class="text-sm text-muted-foreground">{user.homebrew_count} homebrew</p>
						<p class="text-sm text-muted-foreground">{user.session_count} sessions</p>
						<p class="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
					</a>
				{/each}
			</div>
		{/if}
	</section>
</main>

<Footer />
