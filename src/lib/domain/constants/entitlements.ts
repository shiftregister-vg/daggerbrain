import { SRD_SOURCE_METADATA } from '../../../compendium/SRD';
import { HAF_SOURCE_METADATA } from '../../../compendium/Hope_and_Fear';
import { THE_VOID_SOURCE_METADATA } from '../../../compendium/The_Void';
import type { SourceKey } from '../schemas/rules';
import type { SourceMetadata } from '../schemas/sources';

export const ADVENTURER_PLAN_SLUG = 'adventurer';
export const FREE_PLAN_SLUG = 'free_user';

export const UNLIMITED_CHARACTERS_FEATURE_SLUG = 'unlimited_characters';
export const UNLIMITED_HOMEBREW_FEATURE_SLUG = 'unlimited_homebrew';

export const CHARACTER_LIMIT = 6;
export const HOMEBREW_LIMIT = 20;

export const OFFICIAL_SOURCE_METADATA: Partial<Record<SourceKey, SourceMetadata>> = {
	SRD: SRD_SOURCE_METADATA,
	HAF: HAF_SOURCE_METADATA,
	'The Void': THE_VOID_SOURCE_METADATA
};

export const DEFAULT_UNLOCKED_SOURCES: SourceKey[] = ['SRD', 'HAF', 'The Void'];
