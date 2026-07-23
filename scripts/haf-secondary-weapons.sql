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

CREATE TEMP TABLE _haf_secondary_weapons (
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item TEXT NOT NULL,
  PRIMARY KEY (item_type, item_id)
);

INSERT INTO _haf_secondary_weapons (item_type, item_id, item)
VALUES
('secondary_weapons', 'hatchet', '{"source_key":"HAF","title":"Hatchet","description_html":"","level_requirement":1,"type":"Physical","available_traits":["agility"],"range":"Melee","features":[{"title":"Follow-Up","description_html":"On a successful attack with your primary weapon within Melee range, you can mark a Stress to gain a +1 bonus to your Proficiency for this attack.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":0,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'offhand_brass_knuckles', '{"source_key":"HAF","title":"Offhand Brass Knuckles","description_html":"","level_requirement":1,"type":"Physical","available_traits":["strength"],"range":"Melee","features":[{"title":"Paired","description_html":"+2 to primary weapon damage to targets within Melee range","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":0,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'throwing_knives', '{"source_key":"HAF","title":"Throwing Knives","description_html":"","level_requirement":1,"type":"Physical","available_traits":["finesse"],"range":"Melee","features":[{"title":"Stockpiled","description_html":"You can throw this weapon within Close range by making an attack roll using Finesse. You don''t have to retrieve it, as you always have another on hand.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":0,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'fighting_cloak', '{"source_key":"HAF","title":"Fighting Cloak","description_html":"","level_requirement":1,"type":"Physical","available_traits":["presence"],"range":"Melee","features":[{"title":"Padded","description_html":"+2 to damage thresholds","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":0,"damage_dice":"1d4","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'rune_shield', '{"source_key":"HAF","title":"Rune Shield","description_html":"","level_requirement":1,"type":"Magical","available_traits":["knowledge"],"range":"Melee","features":[{"title":"Protective","description_html":"+1 to Armor Score","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":0,"damage_dice":"1d4","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'focus_runes', '{"source_key":"HAF","title":"Focus Runes","description_html":"","level_requirement":1,"type":"Magical","available_traits":["instinct"],"range":"Very Close","features":[{"title":"Focused","description_html":"+1 to primary weapon damage to targets within Very Close range","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":0,"damage_dice":"1d6","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'improved_hatchet', '{"source_key":"HAF","title":"Improved Hatchet","description_html":"","level_requirement":2,"type":"Physical","available_traits":["agility"],"range":"Melee","features":[{"title":"Follow-Up","description_html":"On a successful attack with your primary weapon within Melee range, you can mark a Stress to gain a +1 bonus to your Proficiency for this attack.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":2,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'improved_offhand_brass_knuckles', '{"source_key":"HAF","title":"Improved Offhand Brass Knuckles","description_html":"","level_requirement":2,"type":"Physical","available_traits":["strength"],"range":"Melee","features":[{"title":"Paired","description_html":"+3 to primary weapon damage to targets within Melee range","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":2,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'improved_throwing_knives', '{"source_key":"HAF","title":"Improved Throwing Knives","description_html":"","level_requirement":2,"type":"Physical","available_traits":["finesse"],"range":"Melee","features":[{"title":"Stockpiled","description_html":"You can throw this weapon within Close range by making an attack roll using Finesse. You don''t have to retrieve it, as you always have another on hand.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":2,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'improved_fighting_cloak', '{"source_key":"HAF","title":"Improved Fighting Cloak","description_html":"","level_requirement":2,"type":"Physical","available_traits":["presence"],"range":"Melee","features":[{"title":"Padded","description_html":"+3 to damage thresholds","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":2,"damage_dice":"1d4","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'improved_rune_shield', '{"source_key":"HAF","title":"Improved Rune Shield","description_html":"","level_requirement":2,"type":"Magical","available_traits":["knowledge"],"range":"Melee","features":[{"title":"Protective","description_html":"+2 to Armor Score","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":2,"damage_dice":"1d4","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'improved_focus_runes', '{"source_key":"HAF","title":"Improved Focus Runes","description_html":"","level_requirement":2,"type":"Magical","available_traits":["instinct"],"range":"Very Close","features":[{"title":"Focused","description_html":"+1 to primary weapon damage to targets within Very Close range","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":2,"damage_dice":"1d6","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'collapsible_baton', '{"source_key":"HAF","title":"Collapsible Baton","description_html":"","level_requirement":2,"type":"Physical","available_traits":["strength"],"range":"Melee","features":[{"title":"Nonlethal","description_html":"When a target would mark any number of Hit Points from an attack with this weapon, they mark an equal number of Stress instead.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":0,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'eldritch_vambrace', '{"source_key":"HAF","title":"Eldritch Vambrace","description_html":"","level_requirement":2,"type":"Magical","available_traits":["instinct"],"range":"Melee","features":[{"title":"Deflecting","description_html":"When you are attacked, you can mark an Armor Slot to gain a bonus to your Evasion equal to your Armor Score against the attack.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":0,"damage_dice":"1d8","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'segmented_staff', '{"source_key":"HAF","title":"Segmented Staff","description_html":"","level_requirement":2,"type":"Physical","available_traits":["agility"],"range":"Very Close","features":[{"title":"Double Duty","description_html":"+1 to Armor Score; +1 to primary weapon damage within Melee range","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":4,"damage_dice":"1d6","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'razor_wire', '{"source_key":"HAF","title":"Razor Wire","description_html":"","level_requirement":2,"type":"Physical","available_traits":["finesse"],"range":"Very Close","features":[{"title":"Entangling","description_html":"On a successful attack with your primary weapon against a target within Very Close range, you can spend a Hope to make the target temporarily Vulnerable.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":3,"damage_dice":"1d6","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'advanced_hatchet', '{"source_key":"HAF","title":"Advanced Hatchet","description_html":"","level_requirement":5,"type":"Physical","available_traits":["agility"],"range":"Melee","features":[{"title":"Follow-Up","description_html":"On a successful attack with your primary weapon within Melee range, you can mark a Stress to gain a +1 bonus to your Proficiency for this attack.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":4,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'advanced_offhand_brass_knuckles', '{"source_key":"HAF","title":"Advanced Offhand Brass Knuckles","description_html":"","level_requirement":5,"type":"Physical","available_traits":["strength"],"range":"Melee","features":[{"title":"Paired","description_html":"+4 to primary weapon damage to targets within Melee range","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":4,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'advanced_throwing_knives', '{"source_key":"HAF","title":"Advanced Throwing Knives","description_html":"","level_requirement":5,"type":"Physical","available_traits":["finesse"],"range":"Melee","features":[{"title":"Stockpiled","description_html":"You can throw this weapon within Close range by making an attack roll using Finesse. You don''t have to retrieve it, as you always have another on hand.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":4,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'advanced_fighting_cloak', '{"source_key":"HAF","title":"Advanced Fighting Cloak","description_html":"","level_requirement":5,"type":"Physical","available_traits":["presence"],"range":"Melee","features":[{"title":"Padded","description_html":"+4 to damage thresholds","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":4,"damage_dice":"1d4","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'advanced_rune_shield', '{"source_key":"HAF","title":"Advanced Rune Shield","description_html":"","level_requirement":5,"type":"Magical","available_traits":["knowledge"],"range":"Melee","features":[{"title":"Protective","description_html":"+3 to Armor Score","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":4,"damage_dice":"1d4","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'advanced_focus_runes', '{"source_key":"HAF","title":"Advanced Focus Runes","description_html":"","level_requirement":5,"type":"Magical","available_traits":["instinct"],"range":"Very Close","features":[{"title":"Focused","description_html":"+1 to primary weapon damage to targets within Very Close range","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":4,"damage_dice":"1d6","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'tinker_s_hammer', '{"source_key":"HAF","title":"Tinker''s Hammer","description_html":"","level_requirement":5,"type":"Physical","available_traits":["strength"],"range":"Melee","features":[{"title":"Trusty","description_html":"+1 to attack rolls made with your primary weapon","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":4,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'vorpal_shard', '{"source_key":"HAF","title":"Vorpal Shard","description_html":"","level_requirement":5,"type":"Magical","available_traits":["knowledge"],"range":"Melee","features":[{"title":"Targeted","description_html":"When you fail a weapon attack, you can spend a Hope to succeed on your next weapon attack.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":0,"damage_dice":"1d4","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'soul_chain', '{"source_key":"HAF","title":"Soul Chain","description_html":"","level_requirement":5,"type":"Magical","available_traits":["presence"],"range":"Very Close","features":[{"title":"Draining","description_html":"On a successful attack, you can spend a Hope to force the target to mark a Stress. If they do, you clear a Stress.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":5,"damage_dice":"1d6","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'war_dart', '{"source_key":"HAF","title":"War Dart","description_html":"","level_requirement":5,"type":"Physical","available_traits":["agility"],"range":"Far","features":[{"title":"Versatile","description_html":"This weapon can also be used with these statistics--Agility, Melee, d8+5.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":5,"damage_dice":"1d6","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'legendary_hatchet', '{"source_key":"HAF","title":"Legendary Hatchet","description_html":"","level_requirement":8,"type":"Physical","available_traits":["agility"],"range":"Melee","features":[{"title":"Follow-Up","description_html":"On a successful attack with your primary weapon within Melee range, you can mark a Stress to gain a +1 bonus to your Proficiency for this attack.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'legendary_offhand_brass_knuckles', '{"source_key":"HAF","title":"Legendary Offhand Brass Knuckles","description_html":"","level_requirement":8,"type":"Physical","available_traits":["strength"],"range":"Melee","features":[{"title":"Paired","description_html":"+5 to primary weapon damage to targets within Melee range","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'legendary_throwing_knives', '{"source_key":"HAF","title":"Legendary Throwing Knives","description_html":"","level_requirement":8,"type":"Physical","available_traits":["finesse"],"range":"Melee","features":[{"title":"Stockpiled","description_html":"You can throw this weapon within Close range by making an attack roll using Finesse. You don''t have to retrieve it, as you always have another on hand.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d8","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'legendary_fighting_cloak', '{"source_key":"HAF","title":"Legendary Fighting Cloak","description_html":"","level_requirement":8,"type":"Physical","available_traits":["presence"],"range":"Melee","features":[{"title":"Padded","description_html":"+5 to damage thresholds","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d4","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'legendary_rune_shield', '{"source_key":"HAF","title":"Legendary Rune Shield","description_html":"","level_requirement":8,"type":"Magical","available_traits":["knowledge"],"range":"Melee","features":[{"title":"Protective","description_html":"+4 to Armor Score","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d4","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'legendary_focus_runes', '{"source_key":"HAF","title":"Legendary Focus Runes","description_html":"","level_requirement":8,"type":"Magical","available_traits":["instinct"],"range":"Very Close","features":[{"title":"Focused","description_html":"+1 to primary weapon damage to targets within Very Close range","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d6","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'void_needle', '{"source_key":"HAF","title":"Void Needle","description_html":"","level_requirement":8,"type":"Physical","available_traits":["finesse"],"range":"Melee","features":[{"title":"Inverted","description_html":"When you roll a weapon attack with Fear, you gain a Hope.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d4","available_damage_types":["phy"],"burden":1}'),
('secondary_weapons', 'echo_blade', '{"source_key":"HAF","title":"Echo Blade","description_html":"","level_requirement":8,"type":"Magical","available_traits":["presence"],"range":"Melee","features":[{"title":"Doubled Up","description_html":"When you succeed on an attack with your primary weapon, you can deal damage to another target within Melee range.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d4","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'mobius_orb', '{"source_key":"HAF","title":"Mobius Orb","description_html":"","level_requirement":8,"type":"Magical","available_traits":["knowledge"],"range":"Melee","features":[{"title":"Recursive","description_html":"When you roll the maximum value on a damage die, roll an additional damage die and add the result to the total damage. This feature can trigger repeatedly.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":6,"damage_dice":"1d8","available_damage_types":["mag"],"burden":1}'),
('secondary_weapons', 'blackblood_tendril', '{"source_key":"HAF","title":"Blackblood Tendril","description_html":"","level_requirement":8,"type":"Magical","available_traits":["instinct"],"range":"Close","features":[{"title":"Poisonous","description_html":"When a target marks any number of Hit Points from an attack you rolled with Fear, they mark an equal number of Stress.","character_modifiers":[],"weapon_modifiers":[]}],"attack_roll_bonus":0,"damage_bonus":8,"damage_dice":"1d6","available_damage_types":["mag"],"burden":1}');

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
FROM _haf_secondary_weapons
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
FROM _haf_secondary_weapons
WHERE true
ON CONFLICT(source_key, item_type, item_id, item_version) DO UPDATE SET
  label = excluded.label,
  changelog = excluded.changelog,
  item = excluded.item,
  published_at = unixepoch() * 1000,
  deleted_at = NULL;

DROP TABLE _haf_secondary_weapons;

COMMIT;
