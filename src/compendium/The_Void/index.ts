import type { SourceMetadata } from '@domain/schemas/sources';
import type { CompendiumContent } from '@domain/schemas/compendium';
import { COMPENDIUM } from './compendium';

export const THE_VOID_SOURCE_METADATA: SourceMetadata = {
	source_key: 'The Void',
	name: 'The Void',
	short_title: 'Void'
};

export const THE_VOID_COMPENDIUM: CompendiumContent = COMPENDIUM;
