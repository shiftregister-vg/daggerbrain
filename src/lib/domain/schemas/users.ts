import { zid } from '../ids';
import { z } from 'zod';
import { CompendiumContentIdsSchema } from './compendium';

export const UserSchema = z.object({
	campaign_ids: z.array(zid('campaigns')),
	character_count: z.number(),
	homebrew_count: z.number(),
	is_admin: z.boolean(),
	invite_accepted: z.boolean().default(false),
	homebrew_vault: CompendiumContentIdsSchema
});
export type User = z.infer<typeof UserSchema>;
