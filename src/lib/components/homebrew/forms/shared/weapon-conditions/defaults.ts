import type { WeaponCondition } from '@domain/schemas/rules';

export function defaultRangeWeaponCondition(): Extract<WeaponCondition, { type: 'range' }> {
	return {
		type: 'range',
		ranges: ['Melee']
	};
}

export function defaultDamageTypeWeaponCondition(): Extract<
	WeaponCondition,
	{ type: 'damage_type' }
> {
	return {
		type: 'damage_type',
		damage_type: 'phy'
	};
}
