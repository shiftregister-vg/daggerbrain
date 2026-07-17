// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { DefaultSession } from '@auth/core/types';
import type { R2Bucket } from '@cloudflare/workers-types';
import type { Component } from 'svelte';

declare module '@auth/core/types' {
	interface Session {
		user?: {
			id: string;
		} & DefaultSession['user'];
	}
}

declare global {
	namespace App {
		interface Platform {
			env: {
				R2_IMAGES: R2Bucket;
				R2_USERCONTENT: R2Bucket;
			};
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

declare module '*.svx' {
	export const metadata: {
		title: string;
		description: string;
		date: number;
		published: boolean;
		updated?: number;
		coverImage?: string;
		author: {
			name: string;
			role?: string;
			avatar?: string;
		};
	};

	const component: Component;
	export default component;
}

export {};
