import type { DomainCard } from '@domain/schemas/compendium';

export const BLOOD_DOMAIN_CARDS = {
	blood_spike: {
		source_key: 'The Void',
		domain_id: 'blood',
		artist_name: '',
		// image_url: '/api/images/card/art/domains/arcana/blood-spike.webp',
		image_url: '',
		category: 'spell',
		title: 'Blood Spike',
		level_requirement: 1,
		recall_cost: 1,
		applies_in_vault: false,
		forced_in_loadout: false,
		forced_in_vault: false,
		options: [],
		tokens_enabled: false,
		features: [
			{
				weapon_modifiers: [],
				title: '',
				description_html:
					'Make a **Spellcast Roll** against a target within Close range. On a success, **spend a Hope** to deal **d8+2** magic damage to the target using your Proficiency, and the target marks a Stress. If you have at least 3 Hit Points marked, the damage die is a **d10** instead.',
				character_modifiers: []
			}
		]
	},
	lifeblood_talisman: {
		source_key: 'The Void',
		domain_id: 'blood',
		artist_name: '',
		// image_url: '/api/images/card/art/domains/arcana/lifeblood-talisman.webp',
		image_url: '',
		category: 'spell',
		title: 'Lifeblood Talisman',
		level_requirement: 1,
		recall_cost: 0,
		applies_in_vault: false,
		forced_in_loadout: false,
		forced_in_vault: false,
		options: [],
		tokens_enabled: false,
		features: [
			{
				weapon_modifiers: [],
				title: '',
				description_html:
					'**Mark a Hit Point** to conjure a talisman infused with your life essence. When the bearer of the talisman would take Severe or greater damage, they can destroy the talisman and reduce the damage by two thresholds. The talisman otherwise disappears when you take a rest or cast this spell again.',
				character_modifiers: []
			}
		]
	},
	power_through_pain: {
		source_key: 'The Void',
		domain_id: 'blood',
		artist_name: '',
		// image_url: '/api/images/card/art/domains/arcana/power-through-pain.webp',
		image_url: '',
		category: 'spell',
		title: 'Power Through Pain',
		level_requirement: 1,
		recall_cost: 1,
		applies_in_vault: false,
		forced_in_loadout: false,
		forced_in_vault: false,
		options: [],
		tokens_enabled: true,
		features: [
			{
				weapon_modifiers: [],
				title: '',
				description_html:
					'When you mark a Hit Point, place a token on this card. On a successful attack, you can spend any number of tokens from this card to gain a 1d6 damage bonus on the attack for each token spent. This card can hold a maximum number of tokens equal to your Spellcast trait. Clear all tokens from this card when you take a long rest.',
				character_modifiers: []
			}
		]
	},
	brand_of_castigation: {
		source_key: 'The Void',
		domain_id: 'blood',
		artist_name: '',
		// image_url: '/api/images/card/art/domains/arcana/burning-gore.webp',
		image_url: '',
		category: 'spell',
		title: 'Brand of Castigation',
		level_requirement: 2,
		recall_cost: 1,
		applies_in_vault: false,
		forced_in_loadout: false,
		forced_in_vault: false,
		options: [],
		tokens_enabled: false,
		features: [
			{
				weapon_modifiers: [],
				title: '',
				description_html:
					'When you succeed on an attack roll against a target, you can **mark a Stress** to Brand them until you take a long rest or cast this spell again. You always know the direction of the Branded target. If the Branded target deals damage to you, you can remove the Branded condition to make them mark 2 Stress.',
				character_modifiers: []
			}
		]
	},
	palpitations: {
		source_key: 'The Void',
		domain_id: 'blood',
		artist_name: '',
		// image_url: '/api/images/card/art/domains/arcana/burning-gore.webp',
		image_url: '',
		category: 'spell',
		title: 'Palpitations',
		level_requirement: 2,
		recall_cost: 2,
		applies_in_vault: false,
		forced_in_loadout: false,
		forced_in_vault: false,
		options: [],
		tokens_enabled: false,
		features: [
			{
				weapon_modifiers: [],
				title: '',
				description_html:
					'When you or an ally makes an action roll to frighten or intimidate a creature within Close range, you can **spend a Hope** to give the roll advantage. On a success, the target marks a Stress.<br/>Additionally, once per long rest, you can **spend a Hope** to calm yourself or a willing creature within Close range, letting the target clear 2 Stress.',
				character_modifiers: []
			}
		]
	},
	burning_gore: {
		source_key: 'The Void',
		domain_id: 'blood',
		artist_name: '',
		// image_url: '/api/images/card/art/domains/arcana/burning-gore.webp',
		image_url: '',
		category: 'spell',
		title: 'Burning Gore',
		level_requirement: 3,
		recall_cost: 3,
		applies_in_vault: false,
		forced_in_loadout: false,
		forced_in_vault: false,
		options: [],
		tokens_enabled: false,
		features: [
			{
				weapon_modifiers: [],
				title: '',
				description_html:
					"Make a **Spellcasting Roll (13)**. On a success, **mark a Hit Point** to inflame a group's lifeblood within Far range, making each target **mark a Hit Point**. If you have at least 3 Hit Points marked, each target marks 2 Hit Points instead.",
				character_modifiers: []
			}
		]
	}
} as const satisfies Record<string, DomainCard>;
