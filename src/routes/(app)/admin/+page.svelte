<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Database from '@lucide/svelte/icons/database';
	import Users from '@lucide/svelte/icons/users';
	import Settings from '@lucide/svelte/icons/settings';
	import Footer from '$lib/components/navigation/footer.svelte';

	const { data } = $props();
</script>

<svelte:head>
	<title>Admin | Daggerlore</title>
	<meta
		name="description"
		content="Daggerlore administrative tools for managing source and community data."
	/>
</svelte:head>

<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col px-6 py-10">
	<section class="border-border/60 border-b pb-8">
		<div class="flex items-center gap-3 text-accent">
			<ShieldCheck class="size-6" />
			<p class="text-sm font-semibold tracking-wide uppercase">Admin</p>
		</div>
		<h1 class="mt-4 text-3xl font-bold text-foreground">Admin Dashboard</h1>
		<p class="mt-3 max-w-2xl text-muted-foreground">
			Signed in as {data.user.name ?? data.user.email ?? 'an administrator'}.
		</p>
	</section>

	<section class="grid gap-4 py-8 md:grid-cols-3">
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<Database class="size-5 text-accent" />
			<h2 class="mt-4 text-lg font-semibold text-foreground">Compendium Data</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Placeholder for managing official classes, domains, heritages, adversaries, and equipment.
			</p>
		</div>

		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<Users class="size-5 text-accent" />
			<h2 class="mt-4 text-lg font-semibold text-foreground">Users</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Placeholder for account lookup, role management, and support workflows.
			</p>
		</div>

		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<Settings class="size-5 text-accent" />
			<h2 class="mt-4 text-lg font-semibold text-foreground">System</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Placeholder for operational settings and future admin-only actions.
			</p>
		</div>
	</section>
</main>

<Footer />
