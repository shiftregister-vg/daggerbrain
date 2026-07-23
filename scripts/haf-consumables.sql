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

CREATE TEMP TABLE _haf_consumables (
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  item TEXT NOT NULL,
  PRIMARY KEY (item_type, item_id)
);

INSERT INTO _haf_consumables (item_type, item_id, item)
VALUES
('consumables', 'warding_candle', '{"source_key":"HAF","rarity_roll":1,"title":"Warding Candle","description_html":"You can light this candle to fill an area within Close range with a halo of light. A creature outside the halo can''t enter it if they have ill intent toward a creature within it. The candle burns for an hour."}'),
('consumables', 'iridian_dust', '{"source_key":"HAF","rarity_roll":2,"title":"Iridian Dust","description_html":"This multicolored powder sticks to everything and prevents creatures covered in it from becoming Hidden."}'),
('consumables', 'verglasian_seed', '{"source_key":"HAF","rarity_roll":3,"title":"Verglasian Seed","description_html":"You can use this ice shard to instantly freeze an area of water up to Close range."}'),
('consumables', 'cupbearer_s_bezoar', '{"source_key":"HAF","rarity_roll":4,"title":"Cupbearer''s Bezoar","description_html":"You can swallow this bezoar to become immune to poisons until your next long rest."}'),
('consumables', 'mossmantle_potion', '{"source_key":"HAF","rarity_roll":5,"title":"Mossmantle Potion","description_html":"You can drink this tea to perfectly blend into natural environments until your next rest."}'),
('consumables', 'lyrebird_lozenge', '{"source_key":"HAF","rarity_roll":6,"title":"Lyrebird Lozenge","description_html":"You can dissolve this lozenge in your mouth to perfectly mimic any voice you''ve heard until the end of the scene."}'),
('consumables', 'vial_of_featherfall', '{"source_key":"HAF","rarity_roll":7,"title":"Vial of Featherfall","description_html":"You can drink this potion to ignore damage from falling for the next 10 minutes."}'),
('consumables', 'chimeric_saliva', '{"source_key":"HAF","rarity_roll":8,"title":"Chimeric Saliva","description_html":"You can apply this saliva to a weapon that deals physical damage to change its damage type to magic until your next rest."}'),
('consumables', 'packet_of_space_dust', '{"source_key":"HAF","rarity_roll":9,"title":"Packet of Space Dust","description_html":"This dust causes anything it covers to become lighter than air. One packet contains enough dust to cover the contents of a picnic basket, and the effects last for an hour."}'),
('consumables', 'pipeweed', '{"source_key":"HAF","rarity_roll":10,"title":"Pipeweed","description_html":"When you choose the Clear Stress downtime move during a short rest, you can smoke this non-intoxicating leaf to clear an additional Stress. Any other PCs who chose the Clear Stress downtime move also gain this benefit."}'),
('consumables', 'deathseer_s_powder', '{"source_key":"HAF","rarity_roll":11,"title":"Deathseer''s Powder","description_html":"You can sprinkle this powder over a recently deceased corpse to conjure a spectral reprise of their final minute of life."}'),
('consumables', 'slayer_s_salt', '{"source_key":"HAF","rarity_roll":12,"title":"Slayer''s Salt","description_html":"You can spread this salt in a line along windowsills or thresholds to create a magical barrier that undead creatures can''t cross until the line is broken."}'),
('consumables', 'yakamel_milk', '{"source_key":"HAF","rarity_roll":13,"title":"Yakamel Milk","description_html":"After consuming this milk, the next time you clear 1 or more Hit Points, you clear an additional Hit Point."}'),
('consumables', 'glowmoss_mushroom', '{"source_key":"HAF","rarity_roll":14,"title":"Glowmoss Mushroom","description_html":"You can break this mushroom into pieces, causing it to glow bright blue until your next long rest."}'),
('consumables', 'red_ooze_oil', '{"source_key":"HAF","rarity_roll":15,"title":"Red Ooze Oil","description_html":"You can coat your weapon in this oil. The next successful attack you make with this weapon deals an extra 1d8 magic damage and temporarily Ignites the target. While Ignited, the target takes 1d4 magic damage when they take the spotlight."}'),
('consumables', 'instant_camp', '{"source_key":"HAF","rarity_roll":16,"title":"Instant Camp","description_html":"You can unfold this small mechanical box into a camping tent large enough to safely house six people. The tent collapses at the end of your next long rest."}'),
('consumables', 'bundle_of_spiderlegs', '{"source_key":"HAF","rarity_roll":17,"title":"Bundle of Spiderlegs","description_html":"You can eat these spiderlegs to walk on walls until your next rest."}'),
('consumables', 'ciscan_fog_bottle', '{"source_key":"HAF","rarity_roll":18,"title":"Ciscan Fog Bottle","description_html":"You can break this jar to fill the area within Close range with magical mist. A creature who enters the mist clears a Stress and becomes Hidden."}'),
('consumables', 'snapthorn_seed', '{"source_key":"HAF","rarity_roll":19,"title":"Snapthorn Seed","description_html":"You can throw this seed at a point you can see. It explodes into a tangle of binding vines that temporarily Restrains all creatures within Close range of that point."}'),
('consumables', 'sprite_bottle', '{"source_key":"HAF","rarity_roll":20,"title":"Sprite Bottle","description_html":"When you mark your last Hit Point, this bottle shatters to release the Sprite inside. The Sprite clears all your Hit Points before fading from the Mortal Realm."}'),
('consumables', 'gravity_bomb', '{"source_key":"HAF","rarity_roll":21,"title":"Gravity Bomb","description_html":"You can throw this peach-sized mechanical orb at a point within Far range. It implodes and pulls all creatures and objects within Close range of that point into Melee range with it."}'),
('consumables', 'gossip_flower', '{"source_key":"HAF","rarity_roll":22,"title":"Gossip Flower","description_html":"You can plant this seed in soil. It instantly grows into a small flower that records everything it hears for up to one week. When plucked, the flower recites what it recorded in real time, then withers."}'),
('consumables', 'displacement_token', '{"source_key":"HAF","rarity_roll":23,"title":"Displacement Token","description_html":"You can swallow this token to conjure two illusions of yourself that you can control. Each illusion lasts until it takes damage or until your next rest."}'),
('consumables', 'night_hag_s_dust', '{"source_key":"HAF","rarity_roll":24,"title":"Night Hag''s Dust","description_html":"You can blow this dust in an adversary''s face to prevent them from clearing Stress until your next long rest."}'),
('consumables', 'self_sewing_thread', '{"source_key":"HAF","rarity_roll":25,"title":"Self-Sewing Thread","description_html":"You can use this thread to clear either a Hit Point or 2 Armor Slots."}'),
('consumables', 'stonemason_s_fortune', '{"source_key":"HAF","rarity_roll":26,"title":"Stonemason''s Fortune","description_html":"When you throw this gray brick on the ground, it immediately grows into a 6-foot-tall, 10-foot-wide, and 2-foot-deep wall of solid stone."}'),
('consumables', 'mnemonic_potion', '{"source_key":"HAF","rarity_roll":27,"title":"Mnemonic Potion","description_html":"You can drink this potion to Utilize an Experience without spending a Hope."}'),
('consumables', 'salamander_salve', '{"source_key":"HAF","rarity_roll":28,"title":"Salamander Salve","description_html":"You can apply this salve to your skin to make yourself immune to heat until your next rest."}'),
('consumables', 'green_ooze_oil', '{"source_key":"HAF","rarity_roll":29,"title":"Green Ooze Oil","description_html":"You can coat your weapon in this oil. The next successful attack you make with this weapon deals an extra 1d8 magic damage and temporarily Corrodes the target. While Corroded, the target gains a -2 penalty to their damage thresholds."}'),
('consumables', 'sunlight_orb', '{"source_key":"HAF","rarity_roll":30,"title":"Sunlight Orb","description_html":"You can shatter this orb to make the area within Very Far range appear as though it''s sunlit daytime for the next 24 hours."}'),
('consumables', 'moonlight_orb', '{"source_key":"HAF","rarity_roll":31,"title":"Moonlight Orb","description_html":"You can shatter this orb to make the area within Very Far range appear as though it''s moonlit nighttime for the next 24 hours."}'),
('consumables', 'midas_flask', '{"source_key":"HAF","rarity_roll":32,"title":"Midas Flask","description_html":"You can pour this small flask of alchemical liquid over a mundane item to instantly transmute it into a handful of gold."}'),
('consumables', 'staff_of_reversal', '{"source_key":"HAF","rarity_roll":33,"title":"Staff of Reversal","description_html":"You can break this staff against the ground to reverse one magical transformation or effect within Far range."}'),
('consumables', 'berserker_s_brew', '{"source_key":"HAF","rarity_roll":34,"title":"Berserker''s Brew","description_html":"When you drink this dram of liquid, you gain a bonus to your Strength and a penalty to your Finesse and Knowledge equal to your Instinct (minimum 1). This effect lasts until you make a death move or until your next rest."}'),
('consumables', 'emberite_shard', '{"source_key":"HAF","rarity_roll":35,"title":"Emberite Shard","description_html":"Choose a point within Far range. All targets within Close range of that point must succeed on a Reaction Roll (16) or take 3d6 magic damage and become temporarily Ablaze. While Ablaze, a creature must roll a d4 whenever they make an action roll. On a result of 1, they mark a Hit Point. On a result of 4, they clear the Ablaze condition."}'),
('consumables', 'arcticite_shard', '{"source_key":"HAF","rarity_roll":36,"title":"Arcticite Shard","description_html":"Choose a point within Far range. All targets within Close range of that point must succeed on a Reaction Roll (16) or take 3d6 magic damage and become temporarily Restrained by ice."}'),
('consumables', 'fulgurite_shard', '{"source_key":"HAF","rarity_roll":37,"title":"Fulgurite Shard","description_html":"Choose a point within Far range. All targets within Close range of that point must succeed on a Reaction Roll (16) or take 3d6 magic damage and mark 1d4 Stress as lightning crackles through the area."}'),
('consumables', 'demiurge_s_draught', '{"source_key":"HAF","rarity_roll":38,"title":"Demiurge''s Draught","description_html":"You can drink this draught to gain a +1 bonus to your Proficiency for your next successful attack roll."}'),
('consumables', 'cockerel_claw_tea', '{"source_key":"HAF","rarity_roll":39,"title":"Cockerel Claw Tea","description_html":"You can drink this tea to refresh your features as if you had taken a long rest."}'),
('consumables', 'potion_of_vigilance', '{"source_key":"HAF","rarity_roll":40,"title":"Potion of Vigilance","description_html":"You can drink this potion to gain a +1 bonus to your Evasion until you mark a Hit Point."}'),
('consumables', 'cacophonous_concoction', '{"source_key":"HAF","rarity_roll":41,"title":"Cacophonous Concoction","description_html":"When you drink this potion, anything you say or do in the next hour becomes impossible for a witness to recount. Any attempts they make to communicate what they saw, heard, or otherwise sensed comes out garbled or nonsensical."}'),
('consumables', 'nightmare_mead', '{"source_key":"HAF","rarity_roll":42,"title":"Nightmare Mead","description_html":"You can drink this potion to discover the deepest fear of the next person you make eye contact with. When you do, the GM gains a Fear."}'),
('consumables', 'stake_of_abjuration', '{"source_key":"HAF","rarity_roll":43,"title":"Stake of Abjuration","description_html":"You can hammer this stake into the ground and make a proclamation. Until your next rest, a creature within Far range of the stake who transgresses that proclamation must mark a Stress. The stake lasts until your next rest, then it shatters."}'),
('consumables', 'psychopomp_s_shroud', '{"source_key":"HAF","rarity_roll":44,"title":"Psychopomp''s Shroud","description_html":"You can place this shroud over the corpse of a recently deceased creature. The creature''s spirit enters the shroud and becomes your spectral assistant until the next sunrise, when they pass through the veil of death and take the shroud with them."}'),
('consumables', 'phial_of_deep_ink', '{"source_key":"HAF","rarity_roll":45,"title":"Phial of Deep Ink","description_html":"You can drink this bottle of ink to transform into a cephalopod of roughly your size for the next hour. You gain rubbery skin, soft bones, the ability to breathe underwater, and new limbs until you have eight total."}'),
('consumables', 'mesmer_s_tonic', '{"source_key":"HAF","rarity_roll":46,"title":"Mesmer''s Tonic","description_html":"When you drink this tonic, the only thing you can hear until your next rest are the surface thoughts of creatures within Very Close range."}'),
('consumables', 'invisibility_potion', '{"source_key":"HAF","rarity_roll":47,"title":"Invisibility Potion","description_html":"You are Hidden until you deal damage to another creature or until your next rest."}'),
('consumables', 'formoid_serum', '{"source_key":"HAF","rarity_roll":48,"title":"Formoid Serum","description_html":"You can drink this potion to become a swarm of 16 million ants until the end of the scene. You keep and have access to all equipment, loot, and features."}'),
('consumables', 'steelskin_salve', '{"source_key":"HAF","rarity_roll":49,"title":"Steelskin Salve","description_html":"You can apply this salve to your skin to gain a bonus to your damage thresholds equal to your tier until the end of the scene."}'),
('consumables', 'godling_s_pomelo', '{"source_key":"HAF","rarity_roll":50,"title":"Godling''s Pomelo","description_html":"You can eat this citrus fruit to clear all Hit Points and Stress."}'),
('consumables', 'snakeskin_spirit', '{"source_key":"HAF","rarity_roll":51,"title":"Snakeskin Spirit","description_html":"You can drink this potion to slough off your outer layer of skin and heal a scar."}'),
('consumables', 'magic_user_s_malison', '{"source_key":"HAF","rarity_roll":52,"title":"Magic-User''s Malison","description_html":"When you release this spellcaster''s trapped soul, you can cast one spell from a card in your vault as if it were in your loadout. This doesn''t work for permanently vaulted cards."}'),
('consumables', 'quintessential_severant', '{"source_key":"HAF","rarity_roll":53,"title":"Quintessential Severant","description_html":"You can use this magic blade to cut one magical or metaphysical bond, such as an enchantment, contract, magical tether, or divine oath. When you do, the blade shatters."}'),
('consumables', 'mask_of_the_echoed_self', '{"source_key":"HAF","rarity_roll":54,"title":"Mask of the Echoed Self","description_html":"You can wear this mask during your next level up to swap the values of any of your traits. When you do, the mask becomes your permanent face."}'),
('consumables', 'necroprancer_s_bell', '{"source_key":"HAF","rarity_roll":55,"title":"Necroprancer''s Bell","description_html":"You can break this rusted, clapperless bell against the ground to summon a skeletal steed that climbs out of the earth and serves you until the next sunrise."}'),
('consumables', 'drakemantle', '{"source_key":"HAF","rarity_roll":56,"title":"Drakemantle","description_html":"You can use this enchanted ancient dragon hide to gain draconic characteristics until the end of the scene, when the hide falls aways in tatters. Until then, you can fly and gain a +5 bonus to your damage thresholds and a +1 bonus to your Proficiency."}'),
('consumables', 'gambler_s_fallacy', '{"source_key":"HAF","rarity_roll":57,"title":"Gambler''s Fallacy","description_html":"You can spend any number of handfuls of gold by placing them into this slotted ceramic jar shaped like a pig. When you throw the jar at a point within Far range, it explodes and deals 1d20 magic damage for each handful of gold spent to all creatures within Close range of that point. All gold within the jar is destroyed."}'),
('consumables', 'lionheart_tonic', '{"source_key":"HAF","rarity_roll":58,"title":"Lionheart Tonic","description_html":"You can drink this tonic to gain a +1 bonus to your Proficiency until you roll with Fear."}'),
('consumables', 'tears_of_the_undying_hero', '{"source_key":"HAF","rarity_roll":59,"title":"Tears of the Undying Hero","description_html":"When you drink this potion, death can''t touch you until your next long rest. When you would mark your last Hit Point, instead of making a death move, you make one final action roll before falling into a dreamless slumber until an ally chooses the Tend to Wounds downtime move to clear your Hit Points."}'),
('consumables', 'featherstep_potion', '{"source_key":"HAF","rarity_roll":60,"title":"Featherstep Potion","description_html":"You can drink this potion to sprout small wings from your ankles that give you a bonus to your Evasion equal to your tier until your next rest."}');

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
FROM _haf_consumables
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
FROM _haf_consumables
WHERE true
ON CONFLICT(source_key, item_type, item_id, item_version) DO UPDATE SET
  label = excluded.label,
  changelog = excluded.changelog,
  item = excluded.item,
  published_at = unixepoch() * 1000,
  deleted_at = NULL;

DROP TABLE _haf_consumables;

COMMIT;
