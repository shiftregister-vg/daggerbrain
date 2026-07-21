<script lang="ts">
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Database from '@lucide/svelte/icons/database';
	import Download from '@lucide/svelte/icons/download';
	import Save from '@lucide/svelte/icons/save';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Upload from '@lucide/svelte/icons/upload';
	import { onMount } from 'svelte';
	import { getApi, patchApi, postApi } from '$lib/api/client';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import type { HomebrewTable } from '@domain/permissions';
	import type { SourceKey } from '@domain/schemas/rules';
	import type { SourceMetadata } from '@domain/schemas/sources';

	type Dashboard = {
		sources: (SourceMetadata & { enabled: boolean })[];
		versions: [];
		item_types: HomebrewTable[];
		counts: { source_key: SourceKey; item_type: HomebrewTable; count: number }[];
	};

	type ImportResult = {
		sources_upserted: number;
		items_created: number;
		items_updated: number;
		versions_imported: number;
		versions_skipped: number;
		version_conflicts: number;
		current_version_conflicts: number;
	};

	let { data } = $props();

	let dashboard = $state<Dashboard | null>(null);
	let newSource = $state({ source_key: '', name: '', short_title: '', enabled: true });
	let sourceEditorOpen = $state(false);
	let sourceDraft = $state<(SourceMetadata & { enabled: boolean }) | null>(null);
	let loadError = $state('');
	let saveError = $state('');
	let transferMessage = $state('');
	let isExporting = $state(false);
	let isImporting = $state(false);
	let savingSourceKey = $state('');
	let importInput = $state<HTMLInputElement | null>(null);

	const entityTypes = $derived(
		[...(dashboard?.item_types ?? [])].sort((a, b) => itemTypeLabel(a).localeCompare(itemTypeLabel(b)))
	);
	const totalItems = $derived(
		entityTypes.reduce((total, itemType) => total + countFor(itemType), 0)
	);

	function itemTypeLabel(itemType: string) {
		return itemType
			.split('_')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function countFor(itemType: HomebrewTable) {
		return (
			dashboard?.counts
				.filter((count) => count.item_type === itemType)
				.reduce((total, count) => total + count.count, 0) ?? 0
		);
	}

	function editorHref(itemType: HomebrewTable) {
		return `/admin/compendium/${itemType}`;
	}

	function sourceCount(sourceKey: SourceKey) {
		return (
			dashboard?.counts
				.filter((count) => count.source_key === sourceKey)
				.reduce((total, count) => total + count.count, 0) ?? 0
		);
	}

	async function loadDashboard() {
		loadError = '';
		try {
			dashboard = await getApi<Dashboard>('/admin/compendium');
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to load compendium dashboard';
		}
	}

	function openSourceEditor(source: SourceMetadata & { enabled: boolean }) {
		sourceDraft = { ...source };
		sourceEditorOpen = true;
	}

	async function saveSource() {
		if (!sourceDraft) return;
		saveError = '';
		savingSourceKey = sourceDraft.source_key;
		try {
			await patchApi('/admin/compendium/sources', {
				source_key: sourceDraft.source_key,
				name: sourceDraft.name,
				short_title: sourceDraft.short_title,
				enabled: sourceDraft.enabled
			});
			sourceEditorOpen = false;
			sourceDraft = null;
			await loadDashboard();
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Unable to save source';
		} finally {
			savingSourceKey = '';
		}
	}

	async function createSource() {
		saveError = '';
		savingSourceKey = newSource.source_key;
		try {
			await postApi('/admin/compendium/sources', newSource);
			newSource = { source_key: '', name: '', short_title: '', enabled: true };
			await loadDashboard();
		} catch (error) {
			saveError = error instanceof Error ? error.message : 'Unable to create source';
		} finally {
			savingSourceKey = '';
		}
	}

	async function exportCompendium() {
		loadError = '';
		transferMessage = '';
		isExporting = true;
		try {
			const transfer = await getApi<Record<string, unknown>>('/admin/compendium/export');
			const blob = new Blob([JSON.stringify(transfer, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const anchor = document.createElement('a');
			anchor.href = url;
			anchor.download = `daggerlore-compendium-${new Date().toISOString().slice(0, 10)}.json`;
			anchor.click();
			URL.revokeObjectURL(url);
			transferMessage = 'Compendium export downloaded.';
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to export compendium data';
		} finally {
			isExporting = false;
		}
	}

	async function importCompendiumFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		loadError = '';
		transferMessage = '';
		isImporting = true;
		try {
			const transfer = JSON.parse(await file.text()) as unknown;
			const result = await postApi<ImportResult>('/admin/compendium/import', transfer);
			await loadDashboard();
			transferMessage = [
				`Sources ${result.sources_upserted}`,
				`items created ${result.items_created}`,
				`items advanced ${result.items_updated}`,
				`versions imported ${result.versions_imported}`,
				`versions skipped ${result.versions_skipped}`,
				`version conflicts ${result.version_conflicts}`,
				`current version conflicts ${result.current_version_conflicts}`
			].join(' / ');
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to import compendium data';
		} finally {
			isImporting = false;
			input.value = '';
		}
	}

	onMount(() => {
		void loadDashboard();
	});
</script>

<svelte:head>
	<title>Compendium Manager | Daggerlore</title>
	<meta
		name="description"
		content="Daggerlore administrative tools for managing compendium data."
	/>
</svelte:head>

<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col px-6 py-8">
	<section class="border-border/60 flex flex-col gap-5 border-b pb-6 md:flex-row md:items-end md:justify-between">
		<div>
			<div class="flex items-center gap-3 text-accent">
				<ShieldCheck class="size-6" />
				<p class="text-sm font-semibold tracking-wide uppercase">Admin</p>
			</div>
			<h1 class="mt-3 text-3xl font-bold text-foreground">Compendium Manager</h1>
			<p class="mt-2 text-sm text-muted-foreground">
				Signed in as {data.user.name ?? data.user.email ?? 'an administrator'}.
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button variant="outline" class="w-fit gap-2" onclick={exportCompendium} disabled={isExporting}>
				<Download class="size-4" />
				Export
			</Button>
			<Button
				variant="outline"
				class="w-fit gap-2"
				onclick={() => importInput?.click()}
				disabled={isImporting}
			>
				<Upload class={isImporting ? 'size-4 animate-pulse' : 'size-4'} />
				Import
			</Button>
			<input
				bind:this={importInput}
				type="file"
				accept="application/json,.json"
				class="hidden"
				onchange={importCompendiumFile}
			/>
		</div>
	</section>

	{#if loadError}
		<p class="border-destructive/50 bg-destructive/10 mt-6 rounded-md border p-3 text-sm text-destructive">
			{loadError}
		</p>
	{/if}
	{#if saveError}
		<p class="border-destructive/50 bg-destructive/10 mt-6 rounded-md border p-3 text-sm text-destructive">
			{saveError}
		</p>
	{/if}
	{#if transferMessage}
		<p class="border-border/70 bg-card/50 mt-6 rounded-md border p-3 text-sm text-muted-foreground">
			{transferMessage}
		</p>
	{/if}

	<section class="grid gap-4 py-6 md:grid-cols-3">
		<div class="rounded-lg border border-border/70 bg-card/50 p-4">
			<Database class="size-5 text-accent" />
			<p class="mt-3 text-2xl font-semibold text-foreground">{totalItems}</p>
			<p class="text-sm text-muted-foreground">Official items</p>
		</div>
		<div class="rounded-lg border border-border/70 bg-card/50 p-4">
			<p class="text-2xl font-semibold text-foreground">{dashboard?.sources.length ?? 0}</p>
			<p class="text-sm text-muted-foreground">Sources</p>
		</div>
		<div class="rounded-lg border border-border/70 bg-card/50 p-4">
			<p class="text-2xl font-semibold text-foreground">{entityTypes.length}</p>
			<p class="text-sm text-muted-foreground">Entity sections</p>
		</div>
	</section>

	<section class="mb-8 overflow-hidden rounded-lg border border-border/70 bg-card/40">
		<div class="border-b border-border/70 px-4 py-3">
			<h2 class="text-lg font-semibold text-foreground">Sources</h2>
			<p class="text-sm text-muted-foreground">Create and enable builder sources.</p>
		</div>
		<div class="source-list">
			<form
				class="source-grid source-create-row"
				onsubmit={(event) => {
					event.preventDefault();
					void createSource();
				}}
			>
				<label class="admin-field">
					<span>New Key</span>
					<input class="admin-input" bind:value={newSource.source_key} placeholder="key" required />
				</label>
				<label class="admin-field">
					<span>Name</span>
					<input class="admin-input" bind:value={newSource.name} placeholder="Source name" required />
				</label>
				<label class="admin-field">
					<span>Short Title</span>
					<input class="admin-input" bind:value={newSource.short_title} placeholder="Short title" required />
				</label>
				<label class="source-enabled">
					<input type="checkbox" bind:checked={newSource.enabled} />
					<span>Enabled</span>
				</label>
				<div class="source-meta"></div>
				<div class="source-action">
					<Button
						type="submit"
						size="sm"
						variant="outline"
						class="h-[2.125rem]"
						disabled={!newSource.source_key.trim() || !newSource.name.trim() || !newSource.short_title.trim()}
					>
						Create
					</Button>
				</div>
			</form>
			{#if !dashboard}
				<p class="px-4 py-3 text-sm text-muted-foreground">Loading sources...</p>
			{:else}
				{#each dashboard.sources as source}
					<div class="source-grid source-existing-row">
						<div class="source-readonly">
							<span>Key</span>
							<strong>{source.source_key}</strong>
						</div>
						<div class="source-readonly">
							<span>Name</span>
							<button
								type="button"
								class="source-name-button"
								onclick={() => openSourceEditor(source)}
							>
								{source.name}
							</button>
						</div>
						<div class="source-readonly">
							<span>Short Title</span>
							<strong>{source.short_title}</strong>
						</div>
						<span class={source.enabled ? 'source-status enabled' : 'source-status'}>
							{source.enabled ? 'Enabled' : 'Disabled'}
						</span>
						<span class="source-meta">{sourceCount(source.source_key)} items</span>
						<div class="source-action">
							<Button
								size="sm"
								variant="outline"
								class="h-[2.125rem]"
								onclick={() => openSourceEditor(source)}
							>
								Edit
							</Button>
						</div>
					</div>
				{/each}
			{/if}
		</div>
	</section>

	<section class="grid gap-4 pb-8 md:grid-cols-2 xl:grid-cols-3">
		{#if !dashboard}
			<p class="text-sm text-muted-foreground">Loading...</p>
		{:else}
			{#each entityTypes as itemType}
				<a
					href={editorHref(itemType)}
					class="group rounded-lg border border-border/70 bg-card/50 p-5 transition-colors hover:bg-muted/50"
				>
					<div class="flex items-start justify-between gap-4">
						<div>
							<h2 class="text-lg font-semibold text-foreground">{itemTypeLabel(itemType)}</h2>
							<p class="mt-2 text-sm text-muted-foreground">
								{countFor(itemType)} items
							</p>
						</div>
						<ArrowRight class="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
					</div>
				</a>
			{/each}
		{/if}
	</section>
</main>

<Dialog.Root bind:open={sourceEditorOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Edit Source</Dialog.Title>
			<Dialog.Description>
				Changes are only saved when you confirm this dialog.
			</Dialog.Description>
		</Dialog.Header>

		{#if sourceDraft}
			<form
				class="grid gap-4 py-4"
				onsubmit={(event) => {
					event.preventDefault();
					void saveSource();
				}}
			>
				<label class="admin-field">
					<span>Key</span>
					<input class="admin-input" value={sourceDraft.source_key} disabled />
				</label>
				<label class="admin-field">
					<span>Name</span>
					<input class="admin-input" bind:value={sourceDraft.name} required />
				</label>
				<label class="admin-field">
					<span>Short Title</span>
					<input class="admin-input" bind:value={sourceDraft.short_title} required />
				</label>
				<label class="source-enabled">
					<input type="checkbox" bind:checked={sourceDraft.enabled} />
					<span>Available to builders</span>
				</label>
			</form>
		{/if}

		<Dialog.Footer class="flex gap-3">
			<Dialog.Close class="text-muted-foreground">Cancel</Dialog.Close>
			<Button
				class="gap-2"
				onclick={saveSource}
				disabled={!sourceDraft?.name.trim() || !sourceDraft?.short_title.trim() || savingSourceKey === sourceDraft?.source_key}
			>
				<Save class="size-4" />
				Save Source
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Footer />

<style>
	.source-list {
		display: grid;
	}

	.source-grid {
		display: grid;
		grid-template-columns: minmax(7rem, 0.7fr) minmax(13rem, 1.8fr) minmax(8rem, 0.8fr) 7rem 5rem auto;
		align-items: end;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		border-bottom: 1px solid hsl(var(--border) / 0.55);
	}

	.source-grid:last-child {
		border-bottom: 0;
	}

	.source-create-row {
		background: hsl(var(--background) / 0.28);
	}

	.source-existing-row:hover {
		background: hsl(var(--muted) / 0.25);
	}

	.source-readonly {
		display: grid;
		gap: 0.25rem;
		min-height: 2.125rem;
		align-content: center;
	}

	.source-readonly span {
		color: hsl(var(--muted-foreground));
		font-size: 0.75rem;
	}

	.source-readonly strong,
	.source-name-button {
		color: hsl(var(--foreground));
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.2;
	}

	.source-name-button {
		width: fit-content;
		max-width: 100%;
		border-radius: 0.25rem;
		text-align: left;
		text-decoration: underline;
		text-underline-offset: 0.2rem;
	}

	.source-name-button:hover {
		color: hsl(var(--accent));
	}

	.admin-field {
		display: grid;
		gap: 0.25rem;
		font-size: 0.75rem;
		color: hsl(var(--foreground));
	}

	.admin-field span {
		color: hsl(var(--muted-foreground));
	}

	.admin-input {
		height: 2.125rem;
		border-radius: 0.375rem;
		border: 1px solid hsl(var(--border));
		background: hsl(var(--background));
		padding: 0 0.625rem;
		color: hsl(var(--foreground));
		font-size: 0.875rem;
	}

	.source-enabled {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.125rem;
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.source-status {
		display: inline-flex;
		align-items: center;
		min-height: 2.125rem;
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
		white-space: nowrap;
	}

	.source-status.enabled {
		color: hsl(var(--foreground));
	}

	.source-meta {
		display: inline-flex;
		align-items: center;
		min-height: 2.125rem;
		color: hsl(var(--muted-foreground));
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.source-action {
		height: 2.125rem;
		justify-self: end;
	}

	@media (max-width: 900px) {
		.source-grid {
			grid-template-columns: 1fr 1fr;
		}

		.source-meta,
		.source-action {
			justify-self: start;
		}
	}
</style>
