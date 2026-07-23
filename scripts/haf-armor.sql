BEGIN;

INSERT INTO official_sources (source_key, metadata, enabled, created_at, updated_at, deleted_at)
VALUES (
  'HAF',
  '{"source_key":"HAF","name":"Hope and Fear","short_title":"H&F"}',
  1,
  unixepoch() * 1000,
  unixepoch() * 1000,
  NULL
)
ON CONFLICT(source_key) DO UPDATE SET
  metadata = excluded.metadata,
  enabled = 1,
  updated_at = unixepoch() * 1000,
  deleted_at = NULL;

CREATE TEMP TABLE _haf_armor (
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item TEXT NOT NULL,
  PRIMARY KEY (item_type, item_id)
);

INSERT INTO _haf_armor (item_type, item_id, item)
VALUES
('armor', 'mage_robes', '{"source_key":"HAF","level_requirement":1,"title":"Mage Robes","description_html":"","max_armor":2,"damage_thresholds":{"major":4,"severe":10},"features":[{"title":"Enchanted","description_html":"Gain a bonus to your damage thresholds equal to your Spellcast trait.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'brigandine_armor', '{"source_key":"HAF","level_requirement":1,"title":"Brigandine Armor","description_html":"","max_armor":3,"damage_thresholds":{"major":6,"severe":12},"features":[{"title":"Lined","description_html":"Mark a Stress to negate Minor damage.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'scale_mail_armor', '{"source_key":"HAF","level_requirement":1,"title":"Scale Mail Armor","description_html":"","max_armor":3,"damage_thresholds":{"major":7,"severe":14},"features":[{"title":"Cumbersome","description_html":"-1 to Finesse","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'banded_armor', '{"source_key":"HAF","level_requirement":1,"title":"Banded Armor","description_html":"","max_armor":4,"damage_thresholds":{"major":8,"severe":16},"features":[{"title":"Bulky","description_html":"-1 to Evasion; when you take Severe damage, you must mark a Stress.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'improved_mage_robes', '{"source_key":"HAF","level_requirement":2,"title":"Improved Mage Robes","description_html":"","max_armor":3,"damage_thresholds":{"major":6,"severe":15},"features":[{"title":"Enchanted","description_html":"Gain a bonus to your damage thresholds equal to your Spellcast trait.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'improved_brigandine_armor', '{"source_key":"HAF","level_requirement":2,"title":"Improved Brigandine Armor","description_html":"","max_armor":4,"damage_thresholds":{"major":9,"severe":19},"features":[{"title":"Lined","description_html":"Mark a Stress to negate Minor damage.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'improved_scale_mail_armor', '{"source_key":"HAF","level_requirement":2,"title":"Improved Scale Mail Armor","description_html":"","max_armor":4,"damage_thresholds":{"major":11,"severe":23},"features":[{"title":"Cumbersome","description_html":"-1 to Finesse","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'improved_banded_armor', '{"source_key":"HAF","level_requirement":2,"title":"Improved Banded Armor","description_html":"","max_armor":5,"damage_thresholds":{"major":13,"severe":27},"features":[{"title":"Bulky","description_html":"-1 to Evasion; when you take Severe damage, you must mark a Stress.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'enchanter_s_robes', '{"source_key":"HAF","level_requirement":2,"title":"Enchanter''s Robes","description_html":"","max_armor":4,"damage_thresholds":{"major":9,"severe":20},"features":[{"title":"Mnemonic","description_html":"Once per scene, you can recall a domain card from your vault without paying its Recall Cost.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'hawkguard_s_mantle', '{"source_key":"HAF","level_requirement":2,"title":"Hawkguard''s Mantle","description_html":"","max_armor":4,"damage_thresholds":{"major":9,"severe":20},"features":[{"title":"Gliding","description_html":"You can glide up to Far range and are immune to damage from falling.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'spidersilk_tunic', '{"source_key":"HAF","level_requirement":2,"title":"Spidersilk Tunic","description_html":"","max_armor":4,"damage_thresholds":{"major":9,"severe":20},"features":[{"title":"Wall-Crawling","description_html":"+1 Evasion; you can walk on walls as easily as on the ground.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'stormthread_habit', '{"source_key":"HAF","level_requirement":2,"title":"Stormthread Habit","description_html":"","max_armor":4,"damage_thresholds":{"major":9,"severe":20},"features":[{"title":"Absorbing","description_html":"Once per scene when you take magic damage, you can clear an Armor Slot.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'wyrdwood_splint_armor', '{"source_key":"HAF","level_requirement":2,"title":"Wyrdwood Splint Armor","description_html":"","max_armor":5,"damage_thresholds":{"major":10,"severe":21},"features":[{"title":"Quick-Striding","description_html":"You can''t be Restrained and can move up to Far range as part of an action roll.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'trollhide_cuirass', '{"source_key":"HAF","level_requirement":2,"title":"Trollhide Cuirass","description_html":"","max_armor":5,"damage_thresholds":{"major":11,"severe":23},"features":[{"title":"Self-Healing","description_html":"When you take a rest, clear an Armor Slot.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'gilded_sunplate', '{"source_key":"HAF","level_requirement":2,"title":"Gilded Sunplate","description_html":"","max_armor":5,"damage_thresholds":{"major":12,"severe":26},"features":[{"title":"Resplendent","description_html":"Once per scene when you spend Hope, you can clear an Armor Slot.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'advanced_mage_robes', '{"source_key":"HAF","level_requirement":5,"title":"Advanced Mage Robes","description_html":"","max_armor":4,"damage_thresholds":{"major":8,"severe":22},"features":[{"title":"Enchanted","description_html":"Gain a bonus to your damage thresholds equal to your Spellcast trait.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'advanced_brigandine_armor', '{"source_key":"HAF","level_requirement":5,"title":"Advanced Brigandine Armor","description_html":"","max_armor":5,"damage_thresholds":{"major":11,"severe":26},"features":[{"title":"Lined","description_html":"Mark a Stress to negate Minor damage.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'advanced_scale_mail_armor', '{"source_key":"HAF","level_requirement":5,"title":"Advanced Scale Mail Armor","description_html":"","max_armor":5,"damage_thresholds":{"major":13,"severe":30},"features":[{"title":"Cumbersome","description_html":"-1 to Finesse","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'advanced_banded_armor', '{"source_key":"HAF","level_requirement":5,"title":"Advanced Banded Armor","description_html":"","max_armor":6,"damage_thresholds":{"major":15,"severe":34},"features":[{"title":"Bulky","description_html":"-1 to Evasion; when you take Severe damage, you must mark a Stress.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'granminster_s_finery', '{"source_key":"HAF","level_requirement":5,"title":"Granminster''s Finery","description_html":"","max_armor":2,"damage_thresholds":{"major":11,"severe":27},"features":[{"title":"Magnificent","description_html":"Gain a bonus to your Armor Score equal to your Presence.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'astral_raiment', '{"source_key":"HAF","level_requirement":5,"title":"Astral Raiment","description_html":"","max_armor":5,"damage_thresholds":{"major":11,"severe":27},"features":[{"title":"Stellar","description_html":"Mark a Stress to gain advantage on a Spellcast roll.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'cloverweave_cloak', '{"source_key":"HAF","level_requirement":5,"title":"Cloverweave Cloak","description_html":"","max_armor":5,"damage_thresholds":{"major":11,"severe":27},"features":[{"title":"Fortune-Favored","description_html":"Once per scene, you can change a failure with Hope into a success with Fear.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'skywarden_s_lamellar', '{"source_key":"HAF","level_requirement":5,"title":"Skywarden''s Lamellar","description_html":"","max_armor":5,"damage_thresholds":{"major":11,"severe":27},"features":[{"title":"Vigilant","description_html":"+2 to Evasion","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'bloodstone_plate_armor', '{"source_key":"HAF","level_requirement":5,"title":"Bloodstone Plate Armor","description_html":"","max_armor":6,"damage_thresholds":{"major":13,"severe":35},"features":[{"title":"Bloodthirsty","description_html":"When you critically succeed on a weapon attack within Melee range, clear a Hit Point.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'deep_forged_coral_armor', '{"source_key":"HAF","level_requirement":5,"title":"Deep-Forged Coral Armor","description_html":"","max_armor":6,"damage_thresholds":{"major":13,"severe":35},"features":[{"title":"Aquatic","description_html":"You can breathe underwater and gain advantage on Agility Rolls while submerged.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'legendary_mage_robes', '{"source_key":"HAF","level_requirement":8,"title":"Legendary Mage Robes","description_html":"","max_armor":5,"damage_thresholds":{"major":10,"severe":31},"features":[{"title":"Enchanted","description_html":"Gain a bonus to your damage thresholds equal to your Spellcast trait.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'legendary_brigandine_armor', '{"source_key":"HAF","level_requirement":8,"title":"Legendary Brigandine Armor","description_html":"","max_armor":6,"damage_thresholds":{"major":13,"severe":35},"features":[{"title":"Lined","description_html":"Mark a Stress to negate Minor damage.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'legendary_scale_mail_armor', '{"source_key":"HAF","level_requirement":8,"title":"Legendary Scale Mail Armor","description_html":"","max_armor":6,"damage_thresholds":{"major":15,"severe":39},"features":[{"title":"Cumbersome","description_html":"-1 to Finesse","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'legendary_banded_armor', '{"source_key":"HAF","level_requirement":8,"title":"Legendary Banded Armor","description_html":"","max_armor":7,"damage_thresholds":{"major":17,"severe":43},"features":[{"title":"Bulky","description_html":"-1 to Evasion; when you take Severe damage, you must mark a Stress.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'darkweave_shroud', '{"source_key":"HAF","level_requirement":8,"title":"Darkweave Shroud","description_html":"","max_armor":5,"damage_thresholds":{"major":13,"severe":36},"features":[{"title":"Ghostwalker","description_html":"Once per rest, mark a Stress to move up to Close range through solid objects.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'godbound_laminar', '{"source_key":"HAF","level_requirement":8,"title":"Godbound Laminar","description_html":"","max_armor":6,"damage_thresholds":{"major":13,"severe":36},"features":[{"title":"Divine","description_html":"When you mark an Armor Slot, gain a Hope.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'circle_forged_dreadplate', '{"source_key":"HAF","level_requirement":8,"title":"Circle-Forged Dreadplate","description_html":"","max_armor":6,"damage_thresholds":{"major":14,"severe":38},"features":[{"title":"Accursed","description_html":"When you mark any number of Hit Points from an attack, roll a d4. On a result of 4, the attacker must mark an equal number of Stress.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'rune_forged_exosuit', '{"source_key":"HAF","level_requirement":8,"title":"Rune-Forged Exosuit","description_html":"","max_armor":7,"damage_thresholds":{"major":12,"severe":39},"features":[{"title":"Attuned","description_html":"The maximum number of domain cards in your loadout is reduced by one, but you gain a bonus to your damage thresholds equal to your tier.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'hallowed_heroplate', '{"source_key":"HAF","level_requirement":8,"title":"Hallowed Heroplate","description_html":"","max_armor":7,"damage_thresholds":{"major":13,"severe":35},"features":[{"title":"Blessed","description_html":"Once per long rest, you can spend any number of Hope before you make the Risk It All death move. You gain a bonus to the result of your Hope Die equal to the number of Hope spent.","character_modifiers":[],"weapon_modifiers":[]}]}'),
('armor', 'resonant_harness', '{"source_key":"HAF","level_requirement":8,"title":"Resonant Harness","description_html":"","max_armor":7,"damage_thresholds":{"major":15,"severe":40},"features":[{"title":"Vitreous","description_html":"When you would take Severe or greater damage, you can mark 2 Armor Slots to negate that damage. If you do, you gain a -5 penalty to your damage thresholds until you choose to repair your armor as a downtime move.","character_modifiers":[],"weapon_modifiers":[]}]}');

INSERT INTO official_compendium_items (
  item_type,
  item_id,
  source_key,
  current_version,
  created_at,
  updated_at,
  deleted_at
)
SELECT
  item_type,
  item_id,
  'HAF',
  1,
  unixepoch() * 1000,
  unixepoch() * 1000,
  NULL
FROM _haf_armor
WHERE true
ON CONFLICT(source_key, item_type, item_id) DO UPDATE SET
  current_version = 1,
  updated_at = unixepoch() * 1000,
  deleted_at = NULL;

INSERT INTO official_compendium_item_versions (
  item_type,
  item_id,
  source_key,
  item_version,
  label,
  changelog,
  item,
  created_at,
  published_at,
  deleted_at
)
SELECT
  item_type,
  item_id,
  'HAF',
  1,
  'Initial Import',
  '',
  item,
  unixepoch() * 1000,
  unixepoch() * 1000,
  NULL
FROM _haf_armor
WHERE true
ON CONFLICT(source_key, item_type, item_id, item_version) DO UPDATE SET
  label = excluded.label,
  changelog = excluded.changelog,
  item = excluded.item,
  published_at = unixepoch() * 1000,
  deleted_at = NULL;

DROP TABLE _haf_armor;

COMMIT;
