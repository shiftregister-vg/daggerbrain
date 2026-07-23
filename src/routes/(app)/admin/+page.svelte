<script lang="ts">
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Database from '@lucide/svelte/icons/database';
	import Users from '@lucide/svelte/icons/users';
	import Settings from '@lucide/svelte/icons/settings';
	import MessageSquare from '@lucide/svelte/icons/message-square';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { Button } from '$lib/components/ui/button';

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
	</section>

	<section class="grid gap-4 py-8 md:grid-cols-2 lg:grid-cols-4">
		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<Database class="size-5 text-accent" />
			<h2 class="mt-4 text-lg font-semibold text-foreground">Compendium Data</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Manage official sources, versions, classes, domains, heritages, adversaries, and equipment.
			</p>
			<Button href="/admin/compendium" size="sm" class="mt-4 w-fit">Open Manager</Button>
		</div>

		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<Users class="size-5 text-accent" />
			<h2 class="mt-4 text-lg font-semibold text-foreground">Users</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				List accounts, review activity, disable access, ban users, and invalidate active sessions.
			</p>
			<Button href="/admin/users" size="sm" class="mt-4 w-fit">Open Users</Button>
		</div>

		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<Settings class="size-5 text-accent" />
			<h2 class="mt-4 text-lg font-semibold text-foreground">System</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Manage maintenance mode and review application access controls.
			</p>
			<Button href="/admin/system" size="sm" class="mt-4 w-fit">Open Settings</Button>
		</div>

		<div class="border-border/70 bg-card/50 rounded-lg border p-5">
			<MessageSquare class="size-5 text-accent" />
			<h2 class="mt-4 text-lg font-semibold text-foreground">Feedback</h2>
			<p class="mt-2 text-sm text-muted-foreground">
				Review user-submitted feedback, bugs, feature requests, and content reports.
			</p>
			<Button href="/admin/feedback" size="sm" class="mt-4 w-fit">Open Feedback</Button>
		</div>
	</section>
</main>

<Footer />
