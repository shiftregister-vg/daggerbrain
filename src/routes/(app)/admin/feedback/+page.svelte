<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Search from '@lucide/svelte/icons/search';
	import Save from '@lucide/svelte/icons/save';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import { getApi, patchApi } from '$lib/api/client';
	import { onMount } from 'svelte';

	type FeedbackStatus = 'new' | 'reviewing' | 'resolved' | 'archived';
	type Feedback = {
		id: string;
		user_id: string | null;
		user_name: string | null;
		user_email: string | null;
		name: string | null;
		email: string | null;
		category: string;
		subject: string;
		message: string;
		page_url: string | null;
		user_agent: string | null;
		status: FeedbackStatus;
		admin_notes: string | null;
		resolved_at: string | number | null;
		created_at: string | number;
		updated_at: string | number;
	};

	let feedback = $state<Feedback[]>([]);
	let selected = $state<Feedback | null>(null);
	let query = $state('');
	let statusFilter = $state<FeedbackStatus | 'all'>('all');
	let adminNotes = $state('');
	let status = $state<FeedbackStatus>('new');
	let isLoading = $state(true);
	let isSaving = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	const filteredFeedback = $derived(
		feedback.filter((item) => {
			if (statusFilter !== 'all' && item.status !== statusFilter) return false;
			const text =
				`${item.subject} ${item.message} ${item.category} ${item.name ?? ''} ${item.email ?? ''} ${item.user_name ?? ''} ${item.user_email ?? ''}`.toLowerCase();
			return text.includes(query.trim().toLowerCase());
		})
	);
	const newCount = $derived(feedback.filter((item) => item.status === 'new').length);
	const openCount = $derived(
		feedback.filter((item) => item.status === 'new' || item.status === 'reviewing').length
	);
	const hasSelectionChanges = $derived(
		Boolean(selected && (selected.status !== status || (selected.admin_notes ?? '') !== adminNotes))
	);

	function formatDate(value: string | number | null) {
		if (!value) return 'None';
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return String(value);
		return new Intl.DateTimeFormat(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(date);
	}

	function reporter(item: Feedback) {
		return item.user_name || item.name || item.user_email || item.email || 'Anonymous';
	}

	function statusClass(value: FeedbackStatus) {
		if (value === 'new') return 'border-orange-500/70 bg-orange-500/15 text-orange-100';
		if (value === 'reviewing') return 'border-accent/70 bg-accent/10 text-accent';
		if (value === 'resolved') return 'border-emerald-500/70 bg-emerald-500/10 text-emerald-100';
		return 'border-muted bg-muted/30 text-muted-foreground';
	}

	function selectFeedback(item: Feedback) {
		selected = item;
		status = item.status;
		adminNotes = item.admin_notes ?? '';
		successMessage = '';
		errorMessage = '';
	}

	async function loadFeedback() {
		isLoading = true;
		errorMessage = '';
		try {
			feedback = await getApi<Feedback[]>('/admin/feedback');
			if (selected) {
				selected = feedback.find((item) => item.id === selected?.id) ?? null;
			}
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to load feedback';
		} finally {
			isLoading = false;
		}
	}

	async function saveFeedback() {
		if (!selected || isSaving || !hasSelectionChanges) return;
		isSaving = true;
		errorMessage = '';
		successMessage = '';
		try {
			const updated = await patchApi<Feedback>(`/admin/feedback/${selected.id}`, {
				status,
				admin_notes: adminNotes
			});
			feedback = feedback.map((item) => (item.id === updated.id ? updated : item));
			selectFeedback(updated);
			successMessage = 'Feedback updated.';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to update feedback';
		} finally {
			isSaving = false;
		}
	}

	onMount(loadFeedback);
</script>

<svelte:head>
	<title>Feedback Admin | Daggerlore</title>
	<meta name="description" content="Daggerlore feedback administration." />
</svelte:head>

<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl flex-col px-6 py-10">
	<section class="border-border/60 border-b pb-8">
		<div class="flex items-center gap-3 text-accent">
			<ShieldCheck class="size-6" />
			<p class="text-sm font-semibold tracking-wide uppercase">Admin</p>
		</div>
		<div class="mt-4 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="text-3xl font-bold text-foreground">Feedback Manager</h1>
				<p class="mt-2 text-sm text-muted-foreground">
					Review feedback submitted through the contact page.
				</p>
			</div>
			<Button href="/admin" variant="outline">Dashboard</Button>
		</div>
	</section>

	<section class="grid gap-4 py-8 md:grid-cols-3">
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<MessageSquare class="size-5 text-accent" />
			<p class="mt-4 text-3xl font-bold">{feedback.length}</p>
			<p class="text-sm text-muted-foreground">Total submissions</p>
		</div>
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<p class="text-3xl font-bold">{newCount}</p>
			<p class="text-sm text-muted-foreground">New</p>
		</div>
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<p class="text-3xl font-bold">{openCount}</p>
			<p class="text-sm text-muted-foreground">Open</p>
		</div>
	</section>

	{#if errorMessage}
		<p class="mb-4 rounded border border-destructive/60 bg-destructive/10 p-3 text-sm text-destructive">
			{errorMessage}
		</p>
	{/if}
	{#if successMessage}
		<p class="mb-4 rounded border border-emerald-500/60 bg-emerald-500/10 p-3 text-sm text-emerald-100">
			{successMessage}
		</p>
	{/if}

	<section class="grid gap-5 lg:grid-cols-[minmax(320px,0.9fr)_minmax(0,1.1fr)]">
		<div class="border-border/70 bg-card/40 overflow-hidden rounded-lg border">
			<div class="border-border/70 flex flex-wrap items-center gap-3 border-b p-4">
				<div class="relative min-w-64 flex-1">
					<Search class="absolute top-2.5 left-3 size-4 text-muted-foreground" />
					<input
						class="h-10 w-full rounded-md border border-border bg-card pr-3 pl-9 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
						placeholder="Search feedback"
						bind:value={query}
					/>
				</div>
				<select
					class="h-10 rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
					bind:value={statusFilter}
				>
					<option value="all">All</option>
					<option value="new">New</option>
					<option value="reviewing">Reviewing</option>
					<option value="resolved">Resolved</option>
					<option value="archived">Archived</option>
				</select>
			</div>
			<div class="max-h-[720px] overflow-y-auto p-2">
				{#if isLoading}
					<p class="p-4 text-sm text-muted-foreground">Loading feedback...</p>
				{:else if filteredFeedback.length === 0}
					<p class="p-4 text-sm text-muted-foreground">No feedback found.</p>
				{:else}
					{#each filteredFeedback as item (item.id)}
						<button
							type="button"
							class="w-full rounded-md p-3 text-left hover:bg-muted/40 {selected?.id === item.id
								? 'bg-muted/60'
								: ''}"
							onclick={() => selectFeedback(item)}
						>
							<div class="flex items-start justify-between gap-3">
								<div class="min-w-0">
									<p class="truncate font-semibold text-foreground">{item.subject}</p>
									<p class="truncate text-sm text-muted-foreground">
										{reporter(item)} / {item.category}
									</p>
								</div>
								<span class="rounded-full border px-2 py-0.5 text-xs {statusClass(item.status)}">
									{item.status}
								</span>
							</div>
							<p class="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.message}</p>
							<p class="mt-2 text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
						</button>
					{/each}
				{/if}
			</div>
		</div>

		<div class="border-border/70 bg-card/40 overflow-hidden rounded-lg border">
			<div class="border-border/70 sticky top-[var(--navbar-height,0px)] z-10 flex flex-wrap items-center justify-between gap-3 border-b bg-card p-4">
				<div>
					<h2 class="text-xl font-semibold">
						{selected?.subject ?? 'Select feedback'}
					</h2>
					<p class="text-sm text-muted-foreground">
						{selected ? `${reporter(selected)} / ${formatDate(selected.created_at)}` : 'Choose a submission to review.'}
					</p>
				</div>
				<Button class="gap-2" disabled={!selected || isSaving || !hasSelectionChanges} onclick={saveFeedback}>
					<Save class="size-4" />
					{isSaving ? 'Saving...' : 'Save'}
				</Button>
			</div>

			{#if selected}
				<div class="space-y-6 p-5">
					<div class="grid gap-4 sm:grid-cols-2">
						<div>
							<p class="text-xs font-semibold text-muted-foreground uppercase">Reporter</p>
							<p class="mt-1">{reporter(selected)}</p>
							{#if selected.email || selected.user_email}
								<a
									class="text-sm text-muted-foreground underline hover:text-accent"
									href={`mailto:${selected.email ?? selected.user_email}`}
								>
									{selected.email ?? selected.user_email}
								</a>
							{/if}
						</div>
						<div>
							<p class="text-xs font-semibold text-muted-foreground uppercase">Status</p>
							<select
								class="mt-1 h-10 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50"
								bind:value={status}
							>
								<option value="new">New</option>
								<option value="reviewing">Reviewing</option>
								<option value="resolved">Resolved</option>
								<option value="archived">Archived</option>
							</select>
						</div>
					</div>

					<div>
						<p class="text-xs font-semibold text-muted-foreground uppercase">Message</p>
						<p class="mt-2 whitespace-pre-wrap rounded-md border border-border bg-background/40 p-4 text-sm">
							{selected.message}
						</p>
					</div>

					<div class="grid gap-4 text-sm sm:grid-cols-2">
						<div>
							<p class="text-xs font-semibold text-muted-foreground uppercase">Submitted From</p>
							{#if selected.page_url}
								<a class="break-all underline hover:text-accent" href={selected.page_url} target="_blank" rel="noreferrer">
									{selected.page_url}
								</a>
							{:else}
								<p class="text-muted-foreground">None</p>
							{/if}
						</div>
						<div>
							<p class="text-xs font-semibold text-muted-foreground uppercase">Resolved</p>
							<p>{formatDate(selected.resolved_at)}</p>
						</div>
					</div>

					<label class="grid gap-2">
						<span class="text-xs font-semibold text-muted-foreground uppercase">Admin Notes</span>
						<Textarea class="min-h-40" bind:value={adminNotes} />
					</label>

					<details class="rounded-md border border-border bg-background/30 p-4 text-sm">
						<summary class="cursor-pointer font-semibold">Technical Context</summary>
						<div class="mt-3 space-y-3 text-muted-foreground">
							<p><span class="font-semibold text-foreground">ID:</span> {selected.id}</p>
							<p><span class="font-semibold text-foreground">User ID:</span> {selected.user_id ?? 'None'}</p>
							<p class="break-all"><span class="font-semibold text-foreground">User Agent:</span> {selected.user_agent ?? 'None'}</p>
						</div>
					</details>
				</div>
			{:else}
				<p class="p-5 text-sm text-muted-foreground">
					Select a feedback submission from the list to view details and update its status.
				</p>
			{/if}
		</div>
	</section>
</main>

<Footer />
