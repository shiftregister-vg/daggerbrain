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

CREATE TEMP TABLE _haf_tier2_magic_primary_weapons (
  item_id TEXT PRIMARY KEY,
  item TEXT NOT NULL
);

INSERT INTO _haf_tier2_magic_primary_weapons (item_id, item)
VALUES
('improved_brightsword', '{"source_key":"HAF","title":"Improved Brightsword","description_html":"","level_requirement":2,"type":"Magical","available_traits":["strength"],"range":"Melee","features":[],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d10","available_damage_types":["mag"],"burden":2}'),
('improved_shadowblade', '{"source_key":"HAF","title":"Improved Shadowblade","description_html":"","level_requirement":2,"type":"Magical","available_traits":["presence"],"range":"Melee","features":[{"title":"Otherworldly","description_html":"On a successful attack, you can deal physical or magic damage.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":3,"damage_dice":"1d8","available_damage_types":["phy","mag"],"burden":1}'),
('improved_enchanted_chakram', '{"source_key":"HAF","title":"Improved Enchanted Chakram","description_html":"","level_requirement":2,"type":"Magical","available_traits":["finesse"],"range":"Close","features":[{"title":"Ricochet","description_html":"When you throw this weapon, it returns to your hand. When you make an attack, you can mark a Stress to target another creature within Very Close range of the first target with that attack.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":4,"damage_dice":"1d6","available_damage_types":["mag"],"burden":1}'),
('improved_casting_dagger', '{"source_key":"HAF","title":"Improved Casting Dagger","description_html":"","level_requirement":2,"type":"Magical","available_traits":["instinct"],"range":"Close","features":[{"title":"Versatile","description_html":"This weapon can also be used with these statistics--Instinct, Melee, d8+3.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":3,"damage_dice":"1d6","available_damage_types":["mag"],"burden":1}'),
('improved_runelock_pistol', '{"source_key":"HAF","title":"Improved Runelock Pistol","description_html":"","level_requirement":2,"type":"Magical","available_traits":["knowledge"],"range":"Far","features":[{"title":"Reloading","description_html":"After you make an attack, roll a d6. On a result of 1, you must mark a Stress to reload this weapon before you can fire it again.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d6","available_damage_types":["mag"],"burden":1}'),
('improved_arcane_rifle', '{"source_key":"HAF","title":"Improved Arcane Rifle","description_html":"","level_requirement":2,"type":"Magical","available_traits":["agility"],"range":"Very Far","features":[{"title":"Aimed","description_html":"Your attack has disadvantage if the target is within Very Close range of you or within Melee range of one of your allies. You can mark a Stress to ignore this penalty.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d10","available_damage_types":["mag"],"burden":2}'),
('enchanted_shillelagh', '{"source_key":"HAF","title":"Enchanted Shillelagh","description_html":"","level_requirement":2,"type":"Magical","available_traits":["strength"],"range":"Melee","features":[{"title":"Protective","description_html":"+1 to your Armor Score","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":3,"damage_dice":"1d8","available_damage_types":["mag"],"burden":1}'),
('displacement_razor', '{"source_key":"HAF","title":"Displacement Razor","description_html":"","level_requirement":2,"type":"Magical","available_traits":["finesse"],"range":"Melee","features":[{"title":"Omnipresent","description_html":"You can make attacks against targets within Very Far range, but must do so with disadvantage.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":3,"damage_dice":"1d8","available_damage_types":["mag"],"burden":2}'),
('spellbound_bangles', '{"source_key":"HAF","title":"Spellbound Bangles","description_html":"","level_requirement":2,"type":"Magical","available_traits":["knowledge"],"range":"Melee","features":[],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d10","available_damage_types":["mag"],"burden":2}'),
('fury_gem', '{"source_key":"HAF","title":"Fury Gem","description_html":"","level_requirement":2,"type":"Magical","available_traits":["instinct"],"range":"Close","features":[{"title":"Burning","description_html":"When you roll the maximum result on a damage die, the target must mark a Stress.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":3,"damage_dice":"1d8","available_damage_types":["mag"],"burden":1}'),
('enchanted_lute', '{"source_key":"HAF","title":"Enchanted Lute","description_html":"","level_requirement":2,"type":"Magical","available_traits":["presence"],"range":"Close","features":[{"title":"Invigorating","description_html":"On a successful attack, roll a d4. On a result of 4, clear a Stress.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":3,"damage_dice":"1d8","available_damage_types":["mag"],"burden":2}'),
('splintershaft_bow', '{"source_key":"HAF","title":"Splintershaft Bow","description_html":"","level_requirement":2,"type":"Magical","available_traits":["agility"],"range":"Far","features":[{"title":"Volleyed","description_html":"Spend a Hope to target a group of creatures within range. Targets you succeed against take half damage.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d6","available_damage_types":["mag"],"burden":2}');

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
  'primary_weapons',
  item_id,
  'HAF',
  1,
  unixepoch() * 1000,
  unixepoch() * 1000,
  NULL
FROM _haf_tier2_magic_primary_weapons
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
  'primary_weapons',
  item_id,
  'HAF',
  1,
  'Initial Import',
  '',
  item,
  unixepoch() * 1000,
  unixepoch() * 1000,
  NULL
FROM _haf_tier2_magic_primary_weapons
WHERE true
ON CONFLICT(source_key, item_type, item_id, item_version) DO UPDATE SET
  label = excluded.label,
  changelog = excluded.changelog,
  item = excluded.item,
  published_at = unixepoch() * 1000,
  deleted_at = NULL;

DROP TABLE _haf_tier2_magic_primary_weapons;

COMMIT;
