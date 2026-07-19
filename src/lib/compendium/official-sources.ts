import { SRD_COMPENDIUM, SRD_SOURCE_METADATA } from '../../compendium/SRD';
import { HAF_COMPENDIUM, HAF_SOURCE_METADATA } from '../../compendium/Hope_and_Fear';
import { THE_VOID_COMPENDIUM, THE_VOID_SOURCE_METADATA } from '../../compendium/The_Void';
import type { CompendiumContent } from '@domain/schemas/compendium';
import type { SourceMetadata } from '@domain/schemas/sources';
import type { SourceKey } from '@domain/schemas/rules';
import { merge_compendium_content } from '$lib/utils';

const OFFICIAL_SOURCE_METADATA = {
	SRD: SRD_SOURCE_METADATA,
	HAF: HAF_SOURCE_METADATA,
	'The Void': THE_VOID_SOURCE_METADATA
} satisfies Partial<Record<SourceKey, SourceMetadata>>;

const OFFICIAL_COMPENDIUMS = {
	SRD: SRD_COMPENDIUM,
	HAF: HAF_COMPENDIUM,
	'The Void': THE_VOID_COMPENDIUM
} satisfies Partial<Record<SourceKey, CompendiumContent>>;

export function getOfficialSourceMetadata(sourceKey: SourceKey): SourceMetadata | null {
	return OFFICIAL_SOURCE_METADATA[sourceKey as keyof typeof OFFICIAL_SOURCE_METADATA] ?? null;
}

export function getOfficialSourcesFromKeys(sourceKeys: SourceKey[]): SourceMetadata[] {
	return sourceKeys.flatMap((sourceKey) => {
		const source = OFFICIAL_SOURCE_METADATA[sourceKey as keyof typeof OFFICIAL_SOURCE_METADATA];
		return source ? [source] : [];
	});
}

export function getOfficialCompendiumFromSourceKeys(sourceKeys: SourceKey[]): CompendiumContent {
	return merge_compendium_content(
		...sourceKeys.flatMap((sourceKey) => {
			const compendium = OFFICIAL_COMPENDIUMS[sourceKey as keyof typeof OFFICIAL_COMPENDIUMS];
			return compendium ? [compendium] : [];
		})
	);
}
