WITH refs AS (
	SELECT id, 'ancestry_cards' AS item_type, json_extract(character, '$.ancestry_card_id') AS item_id FROM characters
	UNION ALL
	SELECT id, 'community_cards', json_extract(character, '$.community_card_id') FROM characters
	UNION ALL
	SELECT id, 'transformations', json_extract(character, '$.transformation_card_id') FROM characters
	UNION ALL
	SELECT id, 'classes', json_extract(character, '$.primary_class_id') FROM characters
	UNION ALL
	SELECT id, 'classes', json_extract(character, '$.secondary_class_id') FROM characters
	UNION ALL
	SELECT id, 'subclasses', json_extract(character, '$.primary_subclass_id') FROM characters
	UNION ALL
	SELECT id, 'subclasses', json_extract(character, '$.secondary_subclass_id') FROM characters
	UNION ALL
	SELECT id, 'domains', json_extract(character, '$.secondary_class_domain_id') FROM characters
	UNION ALL
	SELECT id, 'beastforms', json_extract(character, '$.chosen_beastform.beastform_id') FROM characters
	UNION ALL
	SELECT c.id, 'ancestry_cards', item.value
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.additional_ancestry_card_ids'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'community_cards', item.value
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.additional_community_card_ids'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'transformations', item.value
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.additional_transformation_card_ids'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'ancestry_cards', json_extract(choice.value, '$.top_ancestry_id')
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.mixed_ancestry_choices'), '{}')) AS choice
	UNION ALL
	SELECT c.id, 'ancestry_cards', json_extract(choice.value, '$.bottom_ancestry_id')
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.mixed_ancestry_choices'), '{}')) AS choice
	UNION ALL
	SELECT c.id, 'domain_cards', json_extract(item.value, '$.card_id')
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.loadout_domain_card_ids'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'domain_cards', json_extract(item.value, '$.card_id')
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.additional_domain_card_ids'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'domain_cards', json_extract(card.value, '$.card_id')
	FROM characters c, json_tree(coalesce(json_extract(c.character, '$.level_up_domain_card_ids'), '{}')) AS card
	WHERE card.type = 'object' AND json_extract(card.value, '$.card_id') IS NOT NULL
	UNION ALL
	SELECT c.id, 'primary_weapons', json_extract(item.value, '$.base_primary_weapon_id')
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.inventory.primary_weapons'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'secondary_weapons', json_extract(item.value, '$.base_secondary_weapon_id')
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.inventory.secondary_weapons'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'armor', json_extract(item.value, '$.base_armor_id')
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.inventory.armor'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'loot', json_extract(item.value, '$.base_loot_id')
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.inventory.loot'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'consumables', json_extract(item.value, '$.base_consumable_id')
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.inventory.consumables'), '[]')) AS item
	UNION ALL
	SELECT c.id, 'character_sheet_addons', addon.key
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.sheet_addon_choices'), '{}')) AS addon
	UNION ALL
	SELECT c.id, 'character_sheet_addons', addon.key
	FROM characters c, json_each(coalesce(json_extract(c.character, '$.sheet_addon_resources'), '{}')) AS addon
),
used_refs AS (
	SELECT DISTINCT id, item_type, item_id
	FROM refs
	WHERE item_id IS NOT NULL AND item_id <> ''
),
pins AS (
	SELECT
		used_refs.id,
		json_group_object(
			o.source_key || ':' || o.item_type || ':' || o.item_id,
			o.current_version
		) AS item_versions
	FROM used_refs
	INNER JOIN official_compendium_items o
		ON o.item_type = used_refs.item_type
		AND o.item_id = used_refs.item_id
		AND o.deleted_at IS NULL
	GROUP BY used_refs.id
)
UPDATE characters
SET
	character = json_set(
		character,
		'$.official_item_versions',
		json_patch(
			coalesce((SELECT item_versions FROM pins WHERE pins.id = characters.id), '{}'),
			coalesce(json_extract(character, '$.official_item_versions'), '{}')
		)
	),
	updated_at = unixepoch() * 1000
WHERE id IN (SELECT id FROM pins);
