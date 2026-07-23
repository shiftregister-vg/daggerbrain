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

CREATE TEMP TABLE _haf_loot (
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item TEXT NOT NULL,
  PRIMARY KEY (item_type, item_id)
);

INSERT INTO _haf_loot (item_type, item_id, item)
VALUES
('loot', 'caltrops', '{"source_key":"HAF","rarity_roll":1,"title":"Caltrops","description_html":"You can spread these caltrops in a Very Close area around you. A creature hastening through that area must mark a Stress.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'grapnel', '{"source_key":"HAF","rarity_roll":2,"title":"Grapnel","description_html":"You gain advantage on action rolls to climb sheer surfaces.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'ball_bearings', '{"source_key":"HAF","rarity_roll":3,"title":"Ball Bearings","description_html":"This pouch contains perfectly smooth metal spheres.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'box_of_dragon_dust', '{"source_key":"HAF","rarity_roll":4,"title":"Box of Dragon Dust","description_html":"This snuffbox is filled with combustible powder.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'nighthawker_s_ring', '{"source_key":"HAF","rarity_roll":5,"title":"Nighthawker''s Ring","description_html":"Spend a Hope to activate the gemstone in this ring until the end of the scene. While active, the gemstone changes color to indicate the wearer''s proximity to hidden treasure: warm colors for near, cool colors for far.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'elven_spyglass', '{"source_key":"HAF","rarity_roll":6,"title":"Elven Spyglass","description_html":"You can use this spyglass to magnify your vision a hundredfold.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'gourmet_granules', '{"source_key":"HAF","rarity_roll":7,"title":"Gourmet Granules","description_html":"This savory powder makes any food it''s sprinkled on delicious and healthy, no matter how bland or rotten it is.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'collapsible_pole', '{"source_key":"HAF","rarity_roll":8,"title":"Collapsible Pole","description_html":"You can break down this 18-foot pole into six interlinked 3-foot segments.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'blackwing_quill', '{"source_key":"HAF","rarity_roll":9,"title":"Blackwing Quill","description_html":"This writing quill never runs out of ink or needs to be sharpened.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'silee_s_folding_knife', '{"source_key":"HAF","rarity_roll":10,"title":"Silee''s Folding Knife","description_html":"This 3-inch blade has an edge that easily cuts through anything except the handle it''s stored in.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'windup_toy', '{"source_key":"HAF","rarity_roll":11,"title":"Windup Toy","description_html":"This small mechanical device is shaped like a strixwolf pup and can be programmed to perform simple tricks.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'loaded_dice', '{"source_key":"HAF","rarity_roll":12,"title":"Loaded Dice","description_html":"You can choose what result this set of weighted dice rolls with a successful Finesse Roll (14). If you roll with Fear, anyone watching knows the dice are loaded.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'hollowbark_horn', '{"source_key":"HAF","rarity_roll":13,"title":"Hollowbark Horn","description_html":"You can blow this horn to summon a small woodland creature to perform a simple task.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'self_tying_rope', '{"source_key":"HAF","rarity_roll":14,"title":"Self-Tying Rope","description_html":"You can command this rope to tie or untie itself.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'thief_s_compass', '{"source_key":"HAF","rarity_roll":15,"title":"Thief''s Compass","description_html":"This compass points the way toward the nearest exit while indoors and the closest entrance while outdoors.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'traveler_s_bell', '{"source_key":"HAF","rarity_roll":16,"title":"Traveler''s Bell","description_html":"Once per long rest, you can ring this bell to magically open the shortest safe path through rough terrain for 1 hour.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'mandragorian_torch', '{"source_key":"HAF","rarity_roll":17,"title":"Mandragorian Torch","description_html":"This torch gives off light only the bearer can see.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'boots_of_supple_mystique', '{"source_key":"HAF","rarity_roll":18,"title":"Boots of Supple Mystique","description_html":"While wearing these boots, you don''t leave tracks or footprints.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'zephyr_s_jar', '{"source_key":"HAF","rarity_roll":19,"title":"Zephyr''s Jar","description_html":"You can open this empty jar during inclement weather to capture the storm and leave behind clear skies. The storm remains inside until unleashed by reopening the jar.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'returning_ring', '{"source_key":"HAF","rarity_roll":20,"title":"Returning Ring","description_html":"When you throw your primary weapon while wearing this ring, the weapon appears in your hand immediately after the attack.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'kingfisher_s_net', '{"source_key":"HAF","rarity_roll":21,"title":"Kingfisher''s Net","description_html":"Once per long rest, you can use this net to scoop one live fish out of any amount of water, no matter how unlikely it is for that water to have fish in it.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'titan_s_girdle', '{"source_key":"HAF","rarity_roll":22,"title":"Titan''s Girdle","description_html":"Once per scene, you can activate this girdle to gain a +1 bonus to your Proficiency for your next attack.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'iron_veil', '{"source_key":"HAF","rarity_roll":23,"title":"Iron Veil","description_html":"This chain-link head covering renders the wearer invisible to fey creatures.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'furball_bag', '{"source_key":"HAF","rarity_roll":24,"title":"Furball Bag","description_html":"Once per rest, you can produce 2d20 harmless, cat-sized fur creatures of indeterminate origin and species from this bag.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'whisperstep_anklet', '{"source_key":"HAF","rarity_roll":25,"title":"Whisperstep Anklet","description_html":"This anklet makes your steps silent as long as you don''t move faster than walking speed.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'enchanter_s_loupe', '{"source_key":"HAF","rarity_roll":26,"title":"Enchanter''s Loupe","description_html":"You can use this loupe to see through illusions and enchantments.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'escher_s_mirrorball', '{"source_key":"HAF","rarity_roll":27,"title":"Escher''s Mirrorball","description_html":"Once per long rest, you can command this fist-sized silver orb to capture an omnidirectional image of its surroundings on its surface. This image lasts until your next long rest.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'cheater_s_coin', '{"source_key":"HAF","rarity_roll":28,"title":"Cheater''s Coin","description_html":"When you flip this coin, you can spend a Hope to determine which side it lands on.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'gravewarden_s_bell', '{"source_key":"HAF","rarity_roll":29,"title":"Gravewarden''s Bell","description_html":"This bell rings when a ghost or undead creature moves within Far range of it.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'reliquary_of_the_sightless_saint', '{"source_key":"HAF","rarity_roll":30,"title":"Reliquary of the Sightless Saint","description_html":"You gain a +1 bonus to your Hope Die when you make the Risk It All death move.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'map_of_revelation', '{"source_key":"HAF","rarity_roll":31,"title":"Map of Revelation","description_html":"You can attune this map to one creature at a time. The map always shows the attuned creature''s location.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'dagginae_s_obsidian_slate', '{"source_key":"HAF","rarity_roll":32,"title":"Dagginae''s Obsidian Slate","description_html":"This wafer-thin sheet of volcanic glass is used by archivists to keep notes. Any information etched onto its surface disappears but can be recalled via a command you set.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'gadiman_s_backpack', '{"source_key":"HAF","rarity_roll":33,"title":"Gadiman''s Backpack","description_html":"Once per rest, you can spend a Hope to conjure a mundane item up to a cubic foot in size inside this satchel.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'eclipse_coin', '{"source_key":"HAF","rarity_roll":34,"title":"Eclipse Coin","description_html":"Once per rest, flip a coin. On heads, you gain a +1 bonus to attack rolls until your next successful attack. On tails, you gain +1 to your Evasion until an attack fails against you.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'sorcerer_s_hat', '{"source_key":"HAF","rarity_roll":35,"title":"Sorcerer''s Hat","description_html":"This conical blue hat is covered in silver stars. Once per rest, you can cast a spell from your vault with a Recall Cost equal to or less than your tier. This doesn''t work for permanently vaulted cards.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'ghoulskin_gloves', '{"source_key":"HAF","rarity_roll":36,"title":"Ghoulskin Gloves","description_html":"When you attack with a physical weapon while wearing these gloves, the damage is considered both physical and magic.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'gloves_of_alacrity', '{"source_key":"HAF","rarity_roll":37,"title":"Gloves of Alacrity","description_html":"When you would mark a Stress to reload a weapon, you don''t mark it.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'insomniac_s_periapt', '{"source_key":"HAF","rarity_roll":38,"title":"Insomniac''s Periapt","description_html":"When you take a rest without clearing Hit Points or Stress, you gain a +2 bonus to attack and damage rolls until your next rest.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'wildrider_s_saddle', '{"source_key":"HAF","rarity_roll":39,"title":"Wildrider''s Saddle","description_html":"This saddle grants any animal it''s strapped onto the ability to understand their rider''s commands.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'soul_twin_circlets', '{"source_key":"HAF","rarity_roll":40,"title":"Soul-Twin Circlets","description_html":"Two creatures can wear this pair of circlets. You can spend a Hope to switch places with whoever is wearing the other circlet.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'namer_s_oracle', '{"source_key":"HAF","rarity_roll":41,"title":"Namer''s Oracle","description_html":"Once per session, you can roll this set of runic dice to reveal the full name of the last person you touched.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'crucible_frames', '{"source_key":"HAF","rarity_roll":42,"title":"Crucible Frames","description_html":"These eyeglasses reveal weak points in objects and creatures. Three times per rest, you can spend a Hope to gain advantage on an attack roll.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'two_faced_aegis_brooch', '{"source_key":"HAF","rarity_roll":43,"title":"Two-Faced Aegis Brooch","description_html":"Once per rest, flip a coin. On heads, you become immune to the next physical damage you take. On tails, you become immune to the next magic damage you take.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'knockback_bracelets', '{"source_key":"HAF","rarity_roll":44,"title":"Knockback Bracelets","description_html":"On a successful weapon attack, you can knock your target back up to Close range from their location.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'force_disc', '{"source_key":"HAF","rarity_roll":45,"title":"Force Disc","description_html":"This shimmering two-dimensional disc of magical force has a 4-foot diameter and is magically tethered to a pebble. The disc always floats 3 feet north of, and at the same elevation as, the pebble. The pebble has a mass equal to one-hundredth of the total mass carried by the disc.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'molepaw_mittens', '{"source_key":"HAF","rarity_roll":46,"title":"Molepaw Mittens","description_html":"Spend a Hope to swim through earth as if it were water for the next 10 minutes.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'timekeeper_s_pendant', '{"source_key":"HAF","rarity_roll":47,"title":"Timekeeper''s Pendant","description_html":"You can choose an additional downtime move each rest.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'iron_dagger_pendant', '{"source_key":"HAF","rarity_roll":48,"title":"Iron Dagger Pendant","description_html":"Once per long rest, you can spend a Hope to tell the pendant a creature''s name. The pendant gently pulls you toward that creature''s current location until your next long rest.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'collar_of_ascendancy', '{"source_key":"HAF","rarity_roll":49,"title":"Collar of Ascendancy","description_html":"An animal who wears this collar gains the ability to speak and understand common speech.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'temporal_sanctuary', '{"source_key":"HAF","rarity_roll":50,"title":"Temporal Sanctuary","description_html":"A PC who takes a rest in the temporal sanctuary can choose an additional downtime move.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'hero_s_helm', '{"source_key":"HAF","rarity_roll":51,"title":"Hero''s Helm","description_html":"When you critically succeed on an attack, all allies within Close range gain a Hope.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'rings_of_friendship', '{"source_key":"HAF","rarity_roll":52,"title":"Rings of Friendship","description_html":"Two creatures can wear this pair of rings shaped like coiled snakes. You can spend the Hope of whoever is wearing the other ring (with their permission) as if it were your own.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'rings_of_camaraderie', '{"source_key":"HAF","rarity_roll":53,"title":"Rings of Camaraderie","description_html":"Two creatures can wear this pair of wooden rings. You can mark the Stress of whoever is wearing the other ring (with their permission) as if it were your own.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'rings_of_alliance', '{"source_key":"HAF","rarity_roll":54,"title":"Rings of Alliance","description_html":"Two creatures can wear this pair of rose gold rings. Once per session, you can initiate a Tag Team Roll with whoever is wearing the other ring without spending Hope or counting against your session limit for Tag Team Rolls.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'phobophage_s_circlet', '{"source_key":"HAF","rarity_roll":55,"title":"Phobophage''s Circlet","description_html":"When the GM spends a Fear, roll a d4. Once per scene on a result of 4, you clear a Stress.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'quillshawl', '{"source_key":"HAF","rarity_roll":56,"title":"Quillshawl","description_html":"If an adversary attacks you within Melee range, they must succeed on a Reaction Roll (12) or mark a Hit Point.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'warp_pendant', '{"source_key":"HAF","rarity_roll":57,"title":"Warp Pendant","description_html":"Once per rest, mark a Stress to teleport to a location you can clearly see.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'portal_frames', '{"source_key":"HAF","rarity_roll":58,"title":"Portal Frames","description_html":"This pair of small ornate frames, one red and one blue, are connected. Anything that passes into one exits from the other.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'communion_relic', '{"source_key":"HAF","rarity_roll":59,"title":"Communion Relic","description_html":"Once per rest, you can spend a Hope to use an ally''s Experience as if it were your own. You can carry only one relic.","character_modifiers":[],"weapon_modifiers":[]}'),
('loot', 'augur_s_relic', '{"source_key":"HAF","rarity_roll":60,"title":"Augur''s Relic","description_html":"Once per long rest, you can activate your Hope feature without spending Hope. You can carry only one relic.","character_modifiers":[],"weapon_modifiers":[]}');

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
FROM _haf_loot
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
FROM _haf_loot
WHERE true
ON CONFLICT(source_key, item_type, item_id, item_version) DO UPDATE SET
  label = excluded.label,
  changelog = excluded.changelog,
  item = excluded.item,
  published_at = unixepoch() * 1000,
  deleted_at = NULL;

DROP TABLE _haf_loot;

COMMIT;
