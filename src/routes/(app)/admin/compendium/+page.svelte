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
		versions_replaced: number;
		versions_skipped: number;
		version_conflicts: number;
		current_version_conflicts: number;
	};
	type ImportPreview = {
		summary: {
			sources_created: number;
			sources_updated: number;
			sources_unchanged: number;
			items_created: number;
			items_advanced: number;
			items_unchanged: number;
			versions_imported: number;
			versions_skipped: number;
			version_conflicts: number;
			current_version_conflicts: number;
		};
		sources: Array<{
			source_key: string;
			name: string;
			short_title: string;
			action: string;
			enabled: boolean;
			deleted_at: string | number | null;
		}>;
		items: Array<{
			key: string;
			source_key: string;
			item_type: HomebrewTable;
			item_id: string;
			current_version: number;
			action: string;
			deleted_at: string | number | null;
		}>;
		versions: Array<{
			key: string;
			source_key: string;
			item_type: HomebrewTable;
			item_id: string;
			item_version: number;
			title: string;
			label: string;
			action: string;
			deleted_at: string | number | null;
		}>;
	};
	type ConflictResolutionAction = 'skip' | 'replace' | 'next_version' | 'custom_version';
	type ConflictResolution = { action: ConflictResolutionAction; version?: number };

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
	let importDialogOpen = $state(false);
	let pendingTransfer = $state<unknown>(null);
	let importPreview = $state<ImportPreview | null>(null);
	let importResult = $state<ImportResult | null>(null);
	let conflictResolutions = $state<Record<string, ConflictResolution>>({});

	const entityTypes = $derived(
		[...(dashboard?.item_types ?? [])].sort((a, b) => itemTypeLabel(a).localeCompare(itemTypeLabel(b)))
	);
	const totalItems = $derived(
		entityTypes.reduce((total, itemType) => total + countFor(itemType), 0)
	);
	const attentionVersions = $derived(
		(importPreview?.versions ?? []).filter((version) => needsAttention(version.action))
	);
	const attentionItems = $derived(
		(importPreview?.items ?? []).filter((item) => needsAttention(item.action))
	);
	const attentionSources = $derived(
		(importPreview?.sources ?? []).filter((source) => needsAttention(source.action))
	);
	const attentionCount = $derived(
		attentionVersions.length + attentionItems.length + attentionSources.length
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
		importResult = null;
		isImporting = true;
		try {
			const transfer = JSON.parse(await file.text()) as unknown;
			pendingTransfer = transfer;
			importPreview = await postApi<ImportPreview>('/admin/compendium/import/preview', transfer);
			conflictResolutions = Object.fromEntries(
				importPreview.versions
					.filter((version) => version.action === 'conflict')
					.map((version) => [version.key, { action: 'skip' as const }])
			);
			importDialogOpen = true;
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to preview compendium import';
		} finally {
			isImporting = false;
			input.value = '';
		}
	}

	async function confirmImportCompendium() {
		if (!pendingTransfer) return;
		loadError = '';
		transferMessage = '';
		isImporting = true;
		try {
			importResult = await postApi<ImportResult>('/admin/compendium/import', {
				transfer: pendingTransfer,
				resolutions: { version_conflicts: conflictResolutions }
			});
			await loadDashboard();
			pendingTransfer = null;
			importPreview = null;
			conflictResolutions = {};
			transferMessage = 'Compendium import completed.';
		} catch (error) {
			loadError = error instanceof Error ? error.message : 'Unable to import compendium data';
		} finally {
			isImporting = false;
		}
	}

	function cancelImportCompendium() {
		pendingTransfer = null;
		importPreview = null;
		importResult = null;
		conflictResolutions = {};
		importDialogOpen = false;
	}

	function actionLabel(action: string) {
		return action
			.split('_')
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join(' ');
	}

	function needsAttention(action: string) {
		return action === 'conflict' || action === 'delete' || action === 'restore';
	}

	function setConflictResolution(key: string, resolution: ConflictResolution) {
		conflictResolutions = { ...conflictResolutions, [key]: resolution };
	}

	function conflictResolutionLabel(resolution: ConflictResolution | undefined) {
		if (resolution?.action === 'replace') return 'Replace with import';
		if (resolution?.action === 'next_version') return 'Import as next version';
		if (resolution?.action === 'custom_version') {
			return resolution.version ? `Import as v${resolution.version}` : 'Import as custom version';
		}
		return 'Keep existing';
	}

	function resultText(result: ImportResult) {
		return [
			`Sources ${result.sources_upserted}`,
			`items created ${result.items_created}`,
			`items advanced ${result.items_updated}`,
			`versions imported ${result.versions_imported}`,
			`versions replaced ${result.versions_replaced}`,
			`versions skipped ${result.versions_skipped}`,
			`version conflicts ${result.version_conflicts}`,
			`current version conflicts ${result.current_version_conflicts}`
		].join(' / ');
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

<Dialog.Root bind:open={importDialogOpen}>
	<Dialog.Content class="max-h-[90vh] overflow-auto sm:max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>{importResult ? 'Import Complete' : 'Preview Compendium Import'}</Dialog.Title>
			<Dialog.Description>
				{importResult
					? 'Final import result from the confirmed transfer.'
					: 'Review what will change and what will be ignored before applying this transfer.'}
			</Dialog.Description>
		</Dialog.Header>

		{#if importResult}
			<div class="import-summary">
				<p>{resultText(importResult)}</p>
			</div>
			<Dialog.Footer>
				<Button
					onclick={() => {
						importDialogOpen = false;
						importResult = null;
					}}
				>
					Done
				</Button>
			</Dialog.Footer>
		{:else if importPreview}
			<div class="grid gap-4">
				<div class="preview-grid">
					<div class="preview-stat">
						<span>Sources</span>
						<strong>{importPreview.summary.sources_created + importPreview.summary.sources_updated}</strong>
						<small>{importPreview.summary.sources_unchanged} unchanged</small>
					</div>
					<div class="preview-stat">
						<span>Items</span>
						<strong>{importPreview.summary.items_created + importPreview.summary.items_advanced}</strong>
						<small>{importPreview.summary.items_unchanged} unchanged</small>
					</div>
					<div class="preview-stat">
						<span>Versions</span>
						<strong>{importPreview.summary.versions_imported}</strong>
						<small>{importPreview.summary.versions_skipped} skipped</small>
					</div>
					<div class="preview-stat {importPreview.summary.version_conflicts || importPreview.summary.current_version_conflicts ? 'preview-danger' : ''}">
						<span>Conflicts</span>
						<strong>{importPreview.summary.version_conflicts + importPreview.summary.current_version_conflicts}</strong>
						<small>require review</small>
					</div>
				</div>

				<section class="attention-panel {attentionCount > 0 ? 'has-attention' : ''}">
					<div>
						<h3>Needs Attention</h3>
						<p>
							{attentionCount > 0
								? `${attentionCount} row${attentionCount === 1 ? '' : 's'} should be reviewed before confirming.`
								: 'No conflicts, restores, or deletes were detected.'}
						</p>
					</div>
					{#if attentionCount > 0}
						<div class="attention-list">
							{#each attentionVersions as version}
								<div class="attention-row">
									<div class="attention-detail">
										<div class="attention-heading">
											<span class="attention-action">{actionLabel(version.action)}</span>
											<strong>{version.title}</strong>
											<span>v{version.item_version}</span>
										</div>
										<div class="attention-meta">
											<span>Version</span>
											<span>{version.source_key}</span>
											<span>{itemTypeLabel(version.item_type)}</span>
										</div>
									</div>
									{#if version.action === 'conflict'}
										<label class="resolution-control">
											<span>Resolution</span>
											<select
												value={conflictResolutions[version.key]?.action ?? 'skip'}
												onchange={(event) => {
													const action = (event.currentTarget as HTMLSelectElement)
														.value as ConflictResolutionAction;
													setConflictResolution(version.key, {
														action,
														version:
															action === 'custom_version'
																? (conflictResolutions[version.key]?.version ?? version.item_version + 1)
																: undefined
													});
												}}
											>
												<option value="skip">Keep existing</option>
												<option value="replace">Replace with import</option>
												<option value="next_version">Import as next version</option>
												<option value="custom_version">Import as custom version</option>
											</select>
											{#if conflictResolutions[version.key]?.action === 'custom_version'}
												<input
													type="number"
													min="1"
													value={conflictResolutions[version.key]?.version ?? version.item_version + 1}
													aria-label="Custom import version"
													oninput={(event) => {
														setConflictResolution(version.key, {
															action: 'custom_version',
															version: Number((event.currentTarget as HTMLInputElement).value)
														});
													}}
												/>
											{/if}
										</label>
									{/if}
								</div>
							{/each}
							{#each attentionItems as item}
								<div class="attention-row">
									<div class="attention-detail">
										<div class="attention-heading">
											<span class="attention-action">{actionLabel(item.action)}</span>
											<strong>{item.item_id}</strong>
											<span>current v{item.current_version}</span>
										</div>
										<div class="attention-meta">
											<span>Item</span>
											<span>{item.source_key}</span>
											<span>{itemTypeLabel(item.item_type)}</span>
										</div>
									</div>
								</div>
							{/each}
							{#each attentionSources as source}
								<div class="attention-row">
									<div class="attention-detail">
										<div class="attention-heading">
											<span class="attention-action">{actionLabel(source.action)}</span>
											<strong>{source.name}</strong>
											<span>{source.deleted_at ? 'deleted' : 'active'}</span>
										</div>
										<div class="attention-meta">
											<span>Source</span>
											<span>{source.source_key}</span>
											<span>{source.enabled ? 'enabled' : 'disabled'}</span>
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</section>

				<section class="preview-section">
					<h3>Sources</h3>
					<div class="preview-list">
						{#each importPreview.sources as source}
							<div class="preview-row">
								<span class="preview-action">{actionLabel(source.action)}</span>
								<span>{source.source_key}</span>
								<span>{source.name}</span>
								<span>{source.enabled ? 'enabled' : 'disabled'}</span>
							</div>
						{/each}
					</div>
				</section>

				<section class="preview-section">
					<h3>Versions</h3>
					<div class="preview-list">
						{#each importPreview.versions as version}
							<div class="preview-row {needsAttention(version.action) ? 'preview-conflict' : ''}">
								<span class="preview-action">{actionLabel(version.action)}</span>
								<span>{version.source_key}</span>
								<span>{itemTypeLabel(version.item_type)}</span>
								<span>{version.title}</span>
								<span>v{version.item_version}</span>
								{#if version.action === 'conflict'}
									<span class="preview-resolution">
										{conflictResolutionLabel(conflictResolutions[version.key])}
									</span>
								{/if}
							</div>
						{/each}
					</div>
				</section>

				<section class="preview-section">
					<h3>Items</h3>
					<div class="preview-list">
						{#each importPreview.items as item}
							<div class="preview-row {needsAttention(item.action) ? 'preview-conflict' : ''}">
								<span class="preview-action">{actionLabel(item.action)}</span>
								<span>{item.source_key}</span>
								<span>{itemTypeLabel(item.item_type)}</span>
								<span>{item.item_id}</span>
								<span>current v{item.current_version}</span>
							</div>
						{/each}
					</div>
				</section>
			</div>

			<Dialog.Footer class="mt-4">
				<Button variant="outline" onclick={cancelImportCompendium} disabled={isImporting}>Cancel</Button>
				<Button onclick={confirmImportCompendium} disabled={isImporting}>
					{isImporting ? 'Importing...' : 'Confirm Import'}
				</Button>
			</Dialog.Footer>
		{/if}
	</Dialog.Content>
</Dialog.Root>

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

	.import-summary {
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--border) / 0.7);
		background: hsl(var(--card) / 0.5);
		padding: 1rem;
		color: hsl(var(--muted-foreground));
		font-size: 0.875rem;
	}

	.preview-grid {
		display: grid;
		gap: 0.75rem;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
	}

	.preview-stat {
		display: grid;
		gap: 0.25rem;
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--border) / 0.7);
		background: hsl(var(--card) / 0.5);
		padding: 0.875rem;
	}

	.preview-stat span,
	.preview-stat small {
		color: hsl(var(--muted-foreground));
		font-size: 0.75rem;
	}

	.preview-stat strong {
		color: hsl(var(--foreground));
		font-size: 1.5rem;
		line-height: 1;
	}

	.preview-danger {
		border-color: rgb(245 158 11 / 0.75);
		background: rgb(245 158 11 / 0.12);
	}

	.attention-panel {
		display: grid;
		gap: 0.75rem;
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--border) / 0.7);
		background: hsl(var(--card) / 0.45);
		padding: 1rem;
	}

	.attention-panel.has-attention {
		border-color: rgb(245 158 11 / 0.7);
		background:
			linear-gradient(90deg, rgb(245 158 11 / 0.14), transparent 45%),
			hsl(var(--card) / 0.55);
	}

	.attention-panel h3 {
		color: hsl(var(--foreground));
		font-size: 1rem;
		font-weight: 800;
	}

	.attention-panel p {
		color: hsl(var(--muted-foreground));
		font-size: 0.85rem;
	}

	.attention-list {
		display: grid;
		gap: 0.75rem;
		max-height: 14rem;
		overflow-y: auto;
	}

	.attention-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(14rem, 18rem);
		gap: 0.75rem;
		align-items: start;
		border-radius: 0.5rem;
		border: 1px solid rgb(245 158 11 / 0.45);
		background: rgb(245 158 11 / 0.09);
		padding: 0.75rem;
		color: hsl(var(--foreground));
		font-size: 0.8rem;
		box-shadow: inset 0.25rem 0 0 rgb(245 158 11 / 0.9);
	}

	.attention-detail {
		display: grid;
		gap: 0.375rem;
		min-width: 0;
	}

	.attention-heading,
	.attention-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.75rem;
		align-items: center;
		min-width: 0;
	}

	.attention-heading strong {
		min-width: 0;
		color: hsl(var(--foreground));
		font-size: 0.95rem;
		overflow-wrap: anywhere;
	}

	.attention-heading span:not(.attention-action),
	.attention-meta span {
		color: hsl(var(--muted-foreground));
	}

	.attention-meta span:not(:last-child)::after {
		content: "/";
		margin-left: 0.75rem;
		color: hsl(var(--muted-foreground) / 0.7);
	}

	.attention-action {
		color: rgb(251 191 36);
		font-weight: 800;
	}

	.resolution-control {
		display: grid;
		gap: 0.25rem;
		min-width: 0;
	}

	.resolution-control span {
		color: hsl(var(--muted-foreground));
		font-size: 0.7rem;
		font-weight: 700;
		text-transform: uppercase;
	}

	.resolution-control select,
	.resolution-control input {
		min-height: 2rem;
		border-radius: 0.375rem;
		border: 1px solid hsl(var(--border));
		background: hsl(var(--background));
		color: hsl(var(--foreground));
		padding: 0.25rem 0.5rem;
		font-size: 0.8rem;
	}

	.resolution-control input {
		width: 100%;
	}

	.preview-section {
		display: grid;
		gap: 0.75rem;
	}

	.preview-section h3 {
		color: hsl(var(--foreground));
		font-size: 0.95rem;
		font-weight: 700;
	}

	.preview-list {
		max-height: 16rem;
		overflow-y: auto;
		border-radius: 0.5rem;
		border: 1px solid hsl(var(--border) / 0.7);
	}

	.preview-row {
		display: grid;
		grid-template-columns: 6.5rem 7rem minmax(8rem, 10rem) minmax(0, 1fr) 4rem minmax(8rem, 11rem);
		gap: 0.75rem;
		align-items: center;
		border-bottom: 1px solid hsl(var(--border) / 0.45);
		padding: 0.625rem 0.75rem;
		color: hsl(var(--muted-foreground));
		font-size: 0.8rem;
	}

	.preview-row > span {
		min-width: 0;
		overflow-wrap: anywhere;
	}

	.preview-row:last-child {
		border-bottom: 0;
	}

	.preview-action {
		color: hsl(var(--foreground));
		font-weight: 700;
	}

	.preview-conflict {
		background: rgb(245 158 11 / 0.1);
		box-shadow: inset 0.2rem 0 0 rgb(245 158 11 / 0.85);
	}

	.preview-resolution {
		color: rgb(251 191 36);
		font-weight: 700;
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

	@media (max-width: 760px) {
		.preview-row,
		.attention-row {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}
	}
</style>
