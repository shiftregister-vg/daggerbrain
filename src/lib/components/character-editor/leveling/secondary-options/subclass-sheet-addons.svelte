<script lang="ts">
	import type { Character } from '@domain/schemas/characters';
	import type { CharacterSheetAddon, CompendiumContent, Subclass } from '@domain/schemas/compendium';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import { cn, renderMarkdown } from '$lib/utils';

	let {
		character,
		compendium,
		subclass
	}: {
		character: Character;
		compendium: CompendiumContent;
		subclass: Subclass;
	} = $props();

	type AddonEntry = { id: string; addon: CharacterSheetAddon };

	const addOns = $derived.by((): AddonEntry[] =>
		(subclass.sheet_addon_ids ?? [])
			.map((id) => ({ id, addon: compendium.character_sheet_addons[id] }))
			.filter((entry): entry is AddonEntry => Boolean(entry.addon))
	);

	function choiceKey(addonId: string, sectionIndex: number) {
		return `${addonId}:${sectionIndex}`;
	}

	function selected(addonId: string, sectionIndex: number, optionId: string) {
		return character.sheet_addon_choices?.[choiceKey(addonId, sectionIndex)]?.includes(optionId) ?? false;
	}

	function toggle(addonId: string, sectionIndex: number, optionId: string, checked: boolean) {
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
</script>

{#if addOns.length > 0}
	<div class="flex flex-col gap-3">
		{#each addOns as { id, addon }}
			<div class="rounded-lg border bg-primary-muted p-3">
				<div class="flex flex-col gap-1">
					<p class="text-sm font-semibold">{addon.title}</p>
					{#if addon.description_html}
						<div class="text-xs text-muted-foreground">
							{@html renderMarkdown(addon.description_html)}
						</div>
					{/if}
				</div>

				{#if addon.resource}
					<div class="mt-3 rounded-md border bg-background/60 p-2">
						<p class="text-xs font-semibold uppercase text-muted-foreground">
							{addon.resource.title}
							{#if addon.resource.max > 0}
								<span class="font-normal">Max {addon.resource.max}</span>
							{/if}
						</p>
						{#if addon.resource.description_html}
							<div class="mt-1 text-xs text-muted-foreground">
								{@html renderMarkdown(addon.resource.description_html)}
							</div>
						{/if}
					</div>
				{/if}

				<div class="mt-3 flex flex-col gap-3">
					{#each addon.sections as section, sectionIndex}
						<div class="flex flex-col gap-2">
							<div>
								<p class="text-xs font-semibold uppercase text-muted-foreground">
									{section.title || (section.tier ? `Tier ${section.tier}` : 'Options')}
								</p>
								{#if section.description_html}
									<div class="text-xs text-muted-foreground">
										{@html renderMarkdown(section.description_html)}
									</div>
								{/if}
							</div>

							<div class="grid gap-2 sm:grid-cols-2">
								{#each section.options as option}
									{@const isSelected = selected(id, sectionIndex, option.option_id)}
									<Label
										class={cn(
											'cursor-pointer rounded-md border bg-background/70 p-2 text-xs text-muted-foreground',
											isSelected && 'border-primary/60 bg-primary/20 text-foreground'
										)}
									>
										<Checkbox
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
			</div>
		{/each}
	</div>
{/if}
