<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Settings from '@lucide/svelte/icons/settings';
	import Save from '@lucide/svelte/icons/save';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Switch from '$lib/components/ui/switch';
	import { getApi, patchApi } from '$lib/api/client';
	import { onMount } from 'svelte';

	type OperationsSettings = {
		maintenance_enabled: boolean;
		maintenance_message: string;
		invite_only_enabled: boolean;
		contact_email: string;
		community: {
			articles_enabled: boolean;
			changelog_enabled: boolean;
			roadmap_enabled: boolean;
			faq_enabled: boolean;
			contact_enabled: boolean;
			discord_enabled: boolean;
			socials_enabled: boolean;
		};
	};

	type SystemSettingsResponse = {
		operations: OperationsSettings;
	};

	const defaultOperations: OperationsSettings = {
		maintenance_enabled: false,
		maintenance_message: 'Daggerlore is being upgraded!',
		invite_only_enabled: true,
		contact_email: 'scribe@daggerlore.com',
		community: {
			articles_enabled: true,
			changelog_enabled: true,
			roadmap_enabled: true,
			faq_enabled: true,
			contact_enabled: true,
			discord_enabled: true,
			socials_enabled: true
		}
	};

	let operations = $state<OperationsSettings>({ ...defaultOperations });
	let savedChecksum = $state(JSON.stringify(defaultOperations));
	let isLoading = $state(true);
	let isSaving = $state(false);
	let errorMessage = $state('');
	let successMessage = $state('');

	const currentChecksum = $derived(JSON.stringify(operations));
	const hasChanges = $derived(currentChecksum !== savedChecksum);
	const visibleCommunityItems = $derived(
		Object.values(operations.community).filter(Boolean).length
	);

	async function loadSettings() {
		isLoading = true;
		errorMessage = '';
		try {
			const response = await getApi<SystemSettingsResponse>('/admin/system');
			operations = { ...defaultOperations, ...response.operations };
			operations.community = { ...defaultOperations.community, ...response.operations.community };
			savedChecksum = JSON.stringify(operations);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to load system settings';
		} finally {
			isLoading = false;
		}
	}

	async function saveSettings() {
		if (isSaving || !hasChanges) return;
		isSaving = true;
		errorMessage = '';
		successMessage = '';
		try {
			const response = await patchApi<SystemSettingsResponse>('/admin/system', operations);
			operations = { ...defaultOperations, ...response.operations };
			operations.community = { ...defaultOperations.community, ...response.operations.community };
			savedChecksum = JSON.stringify(operations);
			successMessage = 'System settings saved.';
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Unable to save system settings';
		} finally {
			isSaving = false;
		}
	}

	onMount(loadSettings);
</script>

<svelte:head>
	<title>System Settings | Daggerlore</title>
	<meta name="description" content="Daggerlore system administration settings." />
</svelte:head>

<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col px-6 py-10">
	<section class="border-border/60 border-b pb-8">
		<div class="flex items-center gap-3 text-accent">
			<ShieldCheck class="size-6" />
			<p class="text-sm font-semibold tracking-wide uppercase">Admin</p>
		</div>
		<div class="mt-4 flex flex-wrap items-end justify-between gap-4">
			<div>
				<h1 class="text-3xl font-bold text-foreground">System Settings</h1>
				<p class="mt-2 text-sm text-muted-foreground">
					Operational controls for access and maintenance behavior.
				</p>
			</div>
			<Button href="/admin" variant="outline">Dashboard</Button>
		</div>
	</section>

	<section class="grid gap-4 py-8 md:grid-cols-3">
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<Settings class="size-5 text-accent" />
			<p class="mt-4 text-3xl font-bold">{operations.maintenance_enabled ? 'On' : 'Off'}</p>
			<p class="text-sm text-muted-foreground">Maintenance Mode</p>
		</div>
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<p class="text-3xl font-bold">{operations.invite_only_enabled ? 'On' : 'Off'}</p>
			<p class="text-sm text-muted-foreground">Invite Only</p>
		</div>
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<p class="text-3xl font-bold">{visibleCommunityItems}</p>
			<p class="text-sm text-muted-foreground">Community Items</p>
		</div>
	</section>

	<section class="border-border/70 bg-card/40 overflow-hidden rounded-lg border">
		<div class="border-border/70 flex flex-wrap items-center justify-between gap-3 border-b p-4">
			<div>
				<h2 class="text-lg font-semibold">Operations</h2>
				<p class="text-sm text-muted-foreground">
					Changes apply immediately after saving. Admin users bypass maintenance mode.
				</p>
			</div>
			<Button class="gap-2" disabled={isLoading || isSaving || !hasChanges} onclick={saveSettings}>
				<Save class="size-4" />
				{isSaving ? 'Saving...' : 'Save'}
			</Button>
		</div>

		<div class="space-y-8 p-5">
			{#if errorMessage}
				<div class="border-destructive/70 bg-destructive/10 rounded-md border p-3 text-sm text-destructive">
					{errorMessage}
				</div>
			{/if}
			{#if successMessage}
				<div class="rounded-md border border-emerald-500/50 bg-emerald-500/10 p-3 text-sm text-emerald-100">
					{successMessage}
				</div>
			{/if}

			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h3 class="font-semibold text-foreground">Maintenance Mode</h3>
					<p class="mt-1 max-w-2xl text-sm text-muted-foreground">
						When enabled, non-admin users are redirected to the maintenance page.
					</p>
				</div>
				<Switch.Root bind:checked={operations.maintenance_enabled} disabled={isLoading} />
			</div>

			<label class="grid gap-2">
				<span class="font-semibold text-foreground">Maintenance Message</span>
				<Textarea
					class="min-h-28"
					bind:value={operations.maintenance_message}
					disabled={isLoading}
					maxlength={500}
				/>
				<span class="text-xs text-muted-foreground">
					This message appears on the public maintenance page.
				</span>
			</label>

			<label class="grid gap-2">
				<span class="font-semibold text-foreground">Contact Email</span>
				<input
					class="inset-shadow flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm shadow-sm ring-offset-background transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
					type="email"
					bind:value={operations.contact_email}
					disabled={isLoading}
				/>
				<span class="text-xs text-muted-foreground">
					Used for contact links, legal pages, and the public contact form.
				</span>
			</label>

			<div class="border-border/70 rounded-lg border p-4">
				<div class="flex flex-wrap items-start justify-between gap-4">
					<div>
						<h3 class="font-semibold text-foreground">Invite Only Access</h3>
						<p class="mt-1 max-w-2xl text-sm text-muted-foreground">
							Invite-only access is currently enforced by the access system. New users must claim a
							valid one-time invite link before using the app.
						</p>
					</div>
					<Switch.Root checked={operations.invite_only_enabled} disabled />
				</div>
			</div>

			<div class="border-border/70 rounded-lg border p-4">
				<div class="mb-4">
					<h3 class="font-semibold text-foreground">Community Navigation</h3>
					<p class="mt-1 text-sm text-muted-foreground">
						Disable entries that should not appear in the Community tab. If every entry is disabled,
						the Community tab is hidden.
					</p>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<label class="flex items-center justify-between gap-4 rounded-md bg-muted/30 p-3">
						<span>Articles</span>
						<Switch.Root bind:checked={operations.community.articles_enabled} disabled={isLoading} />
					</label>
					<label class="flex items-center justify-between gap-4 rounded-md bg-muted/30 p-3">
						<span>Changelog</span>
						<Switch.Root bind:checked={operations.community.changelog_enabled} disabled={isLoading} />
					</label>
					<label class="flex items-center justify-between gap-4 rounded-md bg-muted/30 p-3">
						<span>Roadmap</span>
						<Switch.Root bind:checked={operations.community.roadmap_enabled} disabled={isLoading} />
					</label>
					<label class="flex items-center justify-between gap-4 rounded-md bg-muted/30 p-3">
						<span>FAQ</span>
						<Switch.Root bind:checked={operations.community.faq_enabled} disabled={isLoading} />
					</label>
					<label class="flex items-center justify-between gap-4 rounded-md bg-muted/30 p-3">
						<span>Contact</span>
						<Switch.Root bind:checked={operations.community.contact_enabled} disabled={isLoading} />
					</label>
					<label class="flex items-center justify-between gap-4 rounded-md bg-muted/30 p-3">
						<span>Discord</span>
						<Switch.Root bind:checked={operations.community.discord_enabled} disabled={isLoading} />
					</label>
					<label class="flex items-center justify-between gap-4 rounded-md bg-muted/30 p-3">
						<span>Social Icons</span>
						<Switch.Root bind:checked={operations.community.socials_enabled} disabled={isLoading} />
					</label>
				</div>
			</div>
		</div>
	</section>
</main>

<Footer />
