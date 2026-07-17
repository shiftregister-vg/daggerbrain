import type { AncestryCard } from '../../../../convex/schemas/compendium';

export const ANCESTRY_CARDS = {
	earthkin: {
		source_key: 'HAF',
		// image_url: '/api/images/card/art/ancestries/earthkin.webp',
		image_url: '',
		title: 'Earthkin',
		description_html:
			'Earthkin are descended from earth elementals. They are humanoids whose bodies are a combination of flesh and earth.',
		artist_name: '',
		options: [],
		features: [
			{
				title: 'Stoneskin',
				description_html:
					'Gain a <strong>+1</strong> bonus to your Armor Score and Damage Thresholds.',
				character_modifiers: [
					{
						behaviour: 'bonus',
						target: 'max_armor',
						type: 'flat',
						value: 1,
						character_conditions: []
					},
					{
						behaviour: 'bonus',
						target: 'major_damage_threshold',
						type: 'flat',
						value: 1,
						character_conditions: []
					},
					{
						behaviour: 'bonus',
						target: 'severe_damage_threshold',
						type: 'flat',
						value: 1,
						character_conditions: []
					}
				],
				weapon_modifiers: []
			},
			{
				title: 'Immoveable',
				description_html:
					'While your feet are touching the ground, you cannot be lifted or moved against your will.',
				character_modifiers: [],
				weapon_modifiers: []
			}
		]
	},
	tidekin: {
		source_key: 'HAF',
		image_url: '',
		title: 'Tidekin',
		description_html:
			'Tidekin descend from water elementals. Their bodies blend humanoid form with water-aspected traits.',
		artist_name: '',
		options: [],
		features: [
			{
				title: 'Amphibious',
				description_html: 'You can breathe underwater and move through water naturally.',
				character_modifiers: [],
				weapon_modifiers: []
			},
			{
				title: 'Lifespring',
				description_html:
					'Once per rest, when you have access to a small amount of water, you can mark 2 Stress to heal a Hit Point for yourself or an ally.',
				character_modifiers: [],
				weapon_modifiers: []
			}
		]
	},
	emberkin: {
		source_key: 'HAF',
		image_url: '',
		title: 'Emberkin',
		description_html:
			'Emberkin descend from fire elementals. Their bodies combine humanoid flesh with flame-aspected traits.',
		artist_name: '',
		options: [],
		features: [
			{
				title: 'Fireproof',
				description_html: 'You are immune to damage from magical or mundane flame.',
				character_modifiers: [],
				weapon_modifiers: []
			},
			{
				title: 'Ignition',
				description_html:
					'Mark a Stress to wreathe your primary weapon in flame until the scene ends. While it burns, bright light surrounds you and attacks against targets within Melee range deal +1d6 damage.',
				character_modifiers: [],
				weapon_modifiers: []
			}
		]
	},
	skykin: {
		source_key: 'HAF',
		image_url: '',
		title: 'Skykin',
		description_html:
			'Skykin descend from air elementals. Their bodies blend humanoid form with air-aspected traits.',
		artist_name: '',
		options: [],
		features: [
			{
				title: 'Gale Force',
				description_html:
					'Mark a Stress to create a gust of wind that moves you or an ally up to Very Far range. You can always control the speed at which you fall.',
				character_modifiers: [],
				weapon_modifiers: []
			},
			{
				title: 'Eye of the Storm',
				description_html:
					'Spend 2 Hope to grant +1 Evasion to yourself or an ally until the next time they take Severe damage or you use Eye of the Storm again.',
				character_modifiers: [],
				weapon_modifiers: []
			}
		]
	},
	aetheris: {
		source_key: 'HAF',
		image_url: '',
		title: 'Aetheris',
		description_html:
			'Aetheris are humanoids with radiant auras and glowing eyes, descended from celestial beings from the Hallows Above.',
		artist_name: '',
		options: [],
		features: [
			{
				title: 'Hallowed Aura',
				description_html:
					'Once per rest, when an ally within Close range rolls with Fear, you can make that roll count as Hope instead.',
				character_modifiers: [],
				weapon_modifiers: []
			},
			{
				title: 'Divine Countenance',
				description_html: 'You have advantage on rolls to command or persuade.',
				character_modifiers: [],
				weapon_modifiers: []
			}
		]
	},
	gnome: {
		source_key: 'HAF',
		image_url: '',
		title: 'Gnome',
		description_html:
			'Gnomes are small humanoids recognized by dense musculature, long arms, and large facial features.',
		artist_name: '',
		options: [],
		features: [
			{
				title: 'Nimble Fingers',
				description_html:
					'When you make a Finesse Roll, you can spend 2 Hope to reroll your Hope Die.',
				character_modifiers: [],
				weapon_modifiers: []
			},
			{
				title: 'True Sight',
				description_html: 'You have advantage on rolls to see through illusions.',
				character_modifiers: [],
				weapon_modifiers: []
			}
		]
	}
} as const satisfies Record<string, AncestryCard>;
