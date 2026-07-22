<script lang="ts">
	import Minus from '@lucide/svelte/icons/minus';
	import Plus from '@lucide/svelte/icons/plus';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { getCharacterContext } from '$lib/state/character.svelte';
	import { cn, renderMarkdown } from '$lib/utils';
	import type { CharacterSheetAddon } from '@domain/schemas/compendium';

	type AddonEntry = { id: string; addon: CharacterSheetAddon };

	const characterCtx = getCharacterContext();
	const character = $derived(characterCtx.character);
	const canEdit = $derived(characterCtx.canEdit);
	const derived_character_data = $derived(characterCtx.derived_character_data);
	const compendium = $derived(characterCtx.character_compendium);

	const sheetAddons = $derived.by((): AddonEntry[] => {
		if (!compendium) return [];

		const seen = new Set<string>();
		const ids = [
			...(derived_character_data?.primary_subclass?.sheet_addon_ids ?? []),
			...(derived_character_data?.secondary_subclass?.sheet_addon_ids ?? [])
		];

		return ids.flatMap((id) => {
			if (seen.has(id)) return [];
			seen.add(id);
			const addon = compendium.character_sheet_addons[id];
			return addon ? [{ id, addon }] : [];
		});
	});

	function choiceKey(addonId: string, sectionIndex: number) {
		return `${addonId}:${sectionIndex}`;
	}

	function selected(addonId: string, sectionIndex: number, optionId: string) {
		return character?.sheet_addon_choices?.[choiceKey(addonId, sectionIndex)]?.includes(optionId) ?? false;
	}

	function toggle(addonId: string, sectionIndex: number, optionId: string, checked: boolean) {
		if (!character || !canEdit) return;

		character.sheet_addon_choices ??= {};
		const key = choiceKey(addonId, sectionIndex);
		const current = new Set(character.sheet_addon_choices[key] ?? []);
		if (checked) {
			current.add(optionId);
		} else {
			current.delete(optionId);
		}
		const nextValues = [...current];
		if (nextValues.length === 0) {
			delete character.sheet_addon_choices[key];
		} else {
			character.sheet_addon_choices[key] = nextValues;
		}
	}

	function resourceValue(addonId: string) {
		return character?.sheet_addon_resources?.[addonId] ?? 0;
	}

	function setResource(addonId: string, max: number, value: number) {
		if (!character || !canEdit) return;

		character.sheet_addon_resources ??= {};
		character.sheet_addon_resources[addonId] = Math.max(0, Math.min(max, Math.trunc(value)));
	}
</script>

{#if character && sheetAddons.length > 0}
	<div class="flex flex-col gap-4">
		{#each sheetAddons as { id, addon }}
			<section class="rounded-lg border bg-primary-muted p-3">
				<div class="flex flex-col gap-1">
					<h3 class="text-base font-semibold">{addon.title}</h3>
					{#if addon.description_html}
						<div class="text-xs leading-relaxed text-muted-foreground">
							{@html renderMarkdown(addon.description_html)}
						</div>
					{/if}
				</div>

				{#if addon.resource && addon.resource.max > 0}
					<div class="mt-3 rounded-md border bg-background/70 p-3">
						<div class="flex items-center justify-between gap-3">
							<div class="min-w-0">
								<p class="text-sm font-semibold">{addon.resource.title}</p>
								{#if addon.resource.description_html}
									<div class="mt-1 text-xs leading-relaxed text-muted-foreground">
										{@html renderMarkdown(addon.resource.description_html)}
									</div>
								{/if}
							</div>
							<div class="flex shrink-0 items-center gap-2">
								<Button
									size="icon"
									variant="outline"
									disabled={!canEdit || resourceValue(id) <= 0}
									onclick={() => setResource(id, addon.resource!.max, resourceValue(id) - 1)}
								>
									<Minus class="size-4" />
								</Button>
								<span class="w-12 text-center text-sm font-semibold">
									{resourceValue(id)} / {addon.resource.max}
								</span>
								<Button
									size="icon"
									variant="outline"
									disabled={!canEdit || resourceValue(id) >= addon.resource.max}
									onclick={() => setResource(id, addon.resource!.max, resourceValue(id) + 1)}
								>
									<Plus class="size-4" />
								</Button>
							</div>
						</div>
					</div>
				{/if}

				<div class="mt-4 flex flex-col gap-4">
					{#each addon.sections as section, sectionIndex}
						<div class="flex flex-col gap-2">
							<div>
								<p class="text-xs font-semibold uppercase text-muted-foreground">
									{section.title || (section.tier ? `Tier ${section.tier}` : 'Options')}
								</p>
								{#if section.description_html}
									<div class="text-xs leading-relaxed text-muted-foreground">
										{@html renderMarkdown(section.description_html)}
									</div>
								{/if}
							</div>

							<div class="grid gap-2">
								{#each section.options as option}
									{@const isSelected = selected(id, sectionIndex, option.option_id)}
									<Label
										class={cn(
											'cursor-pointer rounded-md border bg-background/70 p-2 text-xs leading-relaxed text-muted-foreground',
											!canEdit && 'cursor-default',
											isSelected && 'border-primary/60 bg-primary/20 text-foreground'
										)}
									>
										<Checkbox
											disabled={!canEdit}
											checked={isSelected}
											onCheckedChange={(checked) =>
												toggle(id, sectionIndex, option.option_id, checked === true)}
										/>
										<div class="flex min-w-0 flex-col gap-1">
											<span class="font-semibold">{option.title}</span>
											{#if option.description_html}
												<span>{@html renderMarkdown(option.description_html)}</span>
											{/if}
										</div>
									</Label>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>
		{/each}
	</div>
{:else}
	<p class="text-sm text-muted-foreground">No additional sheets are available for this character.</p>
{/if}
