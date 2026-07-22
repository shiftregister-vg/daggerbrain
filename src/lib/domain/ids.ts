import { z } from 'zod';

export type TableNames =
	| 'users'
	| 'sources'
	| 'user_unlocked_sources'
	| 'characters'
	| 'campaigns'
	| 'encounters'
	| 'dice_histories'
	| 'primary_weapons'
	| 'secondary_weapons'
	| 'armor'
	| 'loot'
	| 'consumables'
	| 'beastforms'
	| 'classes'
	| 'subclasses'
	| 'domains'
	| 'domain_cards'
	| 'ancestry_cards'
	| 'community_cards'
	| 'transformations'
	| 'adversaries'
	| 'environments';

export type Id<TableName extends string = string> = string & { readonly __tableName?: TableName };

export function zid<TableName extends string>(_tableName: TableName) {
	return z.string() as z.ZodType<Id<TableName>>;
}
