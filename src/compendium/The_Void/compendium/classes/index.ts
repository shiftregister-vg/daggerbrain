import type { CharacterClass } from '@domain/schemas/compendium';

export const CLASSES = {
	blood_hunter: {
		source_key: 'The Void',
		starting_evasion: 11,
		starting_max_hp: 6,
		suggested_traits: {
			agility: 2,
			strength: -1,
			finesse: 1,
			instinct: 1,
			presence: 0,
			knowledge: 0
		},
		title: 'Blood Hunter',
		image_url: '',
		artist_name: '',
		description_html:
			'Blood Hunters practice hemocraft, channeling blood magic in pursuit of dangerous creatures and grim truths.',
		hope_feature: {
			title: 'Blood Maledict',
			description_html:
				'**Spend 3 Hope** when an adversary within Close range succeeds on an attack roll to force a reroll with disadvantage.',
			character_modifiers: [],
			weapon_modifiers: []
		},
		primary_domain_id: 'blood',
		secondary_domain_id: 'bone',
		class_features: [
			{
				title: 'Crimson Rite',
				description_html:
					'Mark a Hit Point to enchant an active weapon with blood magic. Successful attacks with the enchanted weapon deal extra magic damage that scales by level.',
				character_modifiers: [],
				weapon_modifiers: []
			},
			{
				title: 'Grim Psychometry',
				description_html:
					'Make a Spellcast Roll to read the violence left in a nearby place, gaining advantage to track or recall information about the creature you glimpse.',
				character_modifiers: [],
				weapon_modifiers: []
			}
		],
		subclass_ids: [
			'blood_hunter_order_of_the_lycan',
			'blood_hunter_order_of_the_mutant',
			'blood_hunter_order_of_the_specter'
		],
		suggested_primary_weapon_id: 'longsword',
		suggested_secondary_weapon_id: undefined,
		suggested_armor_id: 'leather_armor',
		starting_inventory: {
			gold_coins: 10,
			free_gear: ['Torch', '50 feet of rope', 'Basic Supplies'],
			loot_or_consumable_options: [
				{ type: 'consumable', id: 'minor_health_potion' },
				{ type: 'consumable', id: 'minor_stamina_potion' }
			],
			class_gear_options: ['A steel needle', "A vial holding a foe's blood"],
			spellbook_prompt: undefined
		},
		background_questions: [
			'Which blood relative taught you a lesson that kept you alive?',
			'What brought you to hemocraft, and how does that shape your practice?',
			'Who or what was your first kill?'
		],
		connection_questions: [
			'What act of bloodshed brought us together?',
			'What about blood magic makes you concerned for me?',
			'What hunting technique are we known for?'
		],
		character_description_suggestions: {
			clothes: 'bloodstained, crimson, distressed, patched, rune-patterned, snug, spiky',
			eyes: 'carnations, earth, endless ocean, fire, ivy, lilacs, night, seafoam, winter',
			body: 'broad, carved, curvy, lanky, rotund, short, stocky, tall, thin, tiny, toned',
			skin: 'ashes, clover, falling snow, fine sand, obsidian, rose, sapphire, wisteria',
			attitude: 'a stern mentor, a dashing vampire, a starving wolf, a surgeon, a thundercloud'
		}
	},
	summoner: {
		source_key: 'The Void',
		starting_evasion: 10,
		starting_max_hp: 5,
		suggested_traits: {
			agility: 0,
			strength: -1,
			finesse: 1,
			instinct: 1,
			presence: 0,
			knowledge: 2
		},
		title: 'Summoner',
		image_url: '',
		artist_name: '',
		description_html:
			'Summoners use occult rites to call otherworldly entities that aid their allies and hinder their enemies.',
		hope_feature: {
			title: 'Aid of the Spirits',
			description_html:
				'**Spend 3 Hope** to distribute 2 Hope among one or more PCs within Far range, then clear a Stress.',
			character_modifiers: [],
			weapon_modifiers: []
		},
		primary_domain_id: 'blood',
		secondary_domain_id: 'splendor',
		class_features: [
			{
				title: 'Summon Entity',
				description_html:
					'Mark a Stress to summon entities from your class and subclass circles. They remain nearby, perform harmless tasks, and can be commanded with Spellcast Rolls.',
				character_modifiers: [],
				weapon_modifiers: []
			}
		],
		subclass_ids: ['summoner_necromancy', 'summoner_theurgy'],
		suggested_primary_weapon_id: 'greatstaff',
		suggested_secondary_weapon_id: undefined,
		suggested_armor_id: 'leather_armor',
		starting_inventory: {
			gold_coins: 10,
			free_gear: ['Torch', '50 feet of rope', 'Basic Supplies'],
			loot_or_consumable_options: [
				{ type: 'consumable', id: 'minor_health_potion' },
				{ type: 'consumable', id: 'minor_stamina_potion' }
			],
			class_gear_options: [
				'A harmless spirit trapped inside a glass bottle',
				'A pair of mysterious coins'
			],
			spellbook_prompt: undefined
		},
		background_questions: [
			'What precautions do you take when summoning entities?',
			'Who forbade your magical practice, and why did you reject them?',
			'What entity escaped your control, and what do you fear it might do?'
		],
		connection_questions: [
			'What question do you need my help to answer?',
			'Why did I refuse to research an occult ritual for you?',
			'What part of yourself do you see in me?'
		],
		character_description_suggestions: {
			clothes: 'somber, majestic, ceremonial, motley, minimalistic, bejeweled',
			eyes: 'carnations, earth, endless ocean, fire, ivy, lilacs, night, seafoam, winter',
			body: 'broad, carved, curvy, lanky, rotund, short, stocky, tall, thin, tiny, toned',
			skin: 'ashes, clover, falling snow, fine sand, obsidian, rose, sapphire, wisteria',
			attitude: 'a gravedigger, a peacock, an oracle, a fanatic, a gardener'
		}
	}
} as const satisfies Record<string, CharacterClass>;
