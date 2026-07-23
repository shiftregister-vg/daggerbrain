<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Footer from '$lib/components/navigation/footer.svelte';
	import { Button } from '$lib/components/ui/button';
</script>

<svelte:head>
	<title>Invite Required | Daggerlore</title>
	<meta name="description" content="Daggerlore is invite only." />
</svelte:head>

<main class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
	<div class="rounded-full border border-accent/40 bg-accent/10 p-4 text-accent">
		<ShieldCheck class="size-8" />
	</div>
	<h1 class="mt-6 text-3xl font-bold text-foreground">Invite Required</h1>
	<p class="mt-3 text-muted-foreground">
		Daggerlore is currently invite only. Ask an admin for an invite, or use a campaign invite link
		from your GM to activate your account.
	</p>
	<div class="mt-6 flex flex-wrap justify-center gap-3">
		<Button href="/" variant="outline">Back Home</Button>
		<Button type="button" onclick={() => signOut({ redirectTo: '/' })}>Sign Out</Button>
	</div>
</main>

<Footer />
