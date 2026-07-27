WITH refs AS (
	SELECT c.id, direct.item_type, direct.item_id
	FROM "characters" c
	CROSS JOIN LATERAL (
		VALUES
			('ancestry_cards', c."character"->>'ancestry_card_id'),
			('community_cards', c."character"->>'community_card_id'),
			('transformations', c."character"->>'transformation_card_id'),
			('classes', c."character"->>'primary_class_id'),
			('classes', c."character"->>'secondary_class_id'),
			('subclasses', c."character"->>'primary_subclass_id'),
			('subclasses', c."character"->>'secondary_subclass_id'),
			('domains', c."character"->>'secondary_class_domain_id'),
			('beastforms', c."character"#>>'{chosen_beastform,beastform_id}')
	) AS direct(item_type, item_id)
	WHERE direct.item_id IS NOT NULL AND direct.item_id <> ''
	UNION ALL
	SELECT c.id, 'ancestry_cards', value
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(c."character"->'additional_ancestry_card_ids', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'community_cards', value
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(c."character"->'additional_community_card_ids', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'transformations', value
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements_text(coalesce(c."character"->'additional_transformation_card_ids', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'ancestry_cards', choice.value->>'top_ancestry_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_each(coalesce(c."character"->'mixed_ancestry_choices', '{}'::jsonb)) AS choice(key, value)
	UNION ALL
	SELECT c.id, 'ancestry_cards', choice.value->>'bottom_ancestry_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_each(coalesce(c."character"->'mixed_ancestry_choices', '{}'::jsonb)) AS choice(key, value)
	UNION ALL
	SELECT c.id, 'domain_cards', item.value->>'card_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements(coalesce(c."character"->'loadout_domain_card_ids', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'domain_cards', item.value->>'card_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements(coalesce(c."character"->'additional_domain_card_ids', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'domain_cards', card.value->>'card_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_each(coalesce(c."character"->'level_up_domain_card_ids', '{}'::jsonb)) AS level(level_key, level_value)
	CROSS JOIN LATERAL jsonb_each(level.level_value) AS card(slot_key, value)
	UNION ALL
	SELECT c.id, 'primary_weapons', item.value->>'base_primary_weapon_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements(coalesce(c."character"#>'{inventory,primary_weapons}', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'secondary_weapons', item.value->>'base_secondary_weapon_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements(coalesce(c."character"#>'{inventory,secondary_weapons}', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'armor', item.value->>'base_armor_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements(coalesce(c."character"#>'{inventory,armor}', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'loot', item.value->>'base_loot_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements(coalesce(c."character"#>'{inventory,loot}', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'consumables', item.value->>'base_consumable_id'
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_array_elements(coalesce(c."character"#>'{inventory,consumables}', '[]'::jsonb)) AS item(value)
	UNION ALL
	SELECT c.id, 'character_sheet_addons', addon.value
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_object_keys(coalesce(c."character"->'sheet_addon_choices', '{}'::jsonb)) AS addon(value)
	UNION ALL
	SELECT c.id, 'character_sheet_addons', addon.value
	FROM "characters" c
	CROSS JOIN LATERAL jsonb_object_keys(coalesce(c."character"->'sheet_addon_resources', '{}'::jsonb)) AS addon(value)
),
used_refs AS (
	SELECT DISTINCT id, item_type, item_id
	FROM refs
	WHERE item_id IS NOT NULL AND item_id <> ''
),
pins AS (
	SELECT
		used_refs.id,
		jsonb_object_agg(
			o."source_key" || ':' || o."item_type" || ':' || o."item_id",
			o."current_version"
		) AS item_versions
	FROM used_refs
	INNER JOIN "official_compendium_items" o
		ON o."item_type" = used_refs.item_type
		AND o."item_id" = used_refs.item_id
		AND o."deleted_at" IS NULL
	GROUP BY used_refs.id
)
UPDATE "characters" c
SET
	"character" = jsonb_set(
		c."character",
		'{official_item_versions}',
		pins.item_versions || coalesce(c."character"->'official_item_versions', '{}'::jsonb),
		true
	),
	"updated_at" = now()
FROM pins
WHERE c.id = pins.id;
