
import type { SourceMetadata } from '@domain/schemas/sources';
import type { CompendiumContent } from '@domain/schemas/compendium';
import { COMPENDIUM } from './compendium';

export const HAF_SOURCE_METADATA: SourceMetadata = {
	source_key: 'HAF',
	name: 'Hope and Fear',
	short_title: 'H&F'
};

export const HAF_COMPENDIUM: CompendiumContent = COMPENDIUM;
