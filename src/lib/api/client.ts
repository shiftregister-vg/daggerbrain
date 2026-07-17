export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
	const response = await fetch(`/api/app${path}`, {
		...options,
		headers: {
			'content-type': 'application/json',
			...(options.headers ?? {})
		}
	});

	if (!response.ok) {
		const message = await response.text();
		throw new Error(message || `Request failed with ${response.status}`);
	}

	if (response.status === 204) {
		return undefined as T;
	}

	return (await response.json()) as T;
}

export function getApi<T>(path: string) {
	return apiRequest<T>(path);
}

export function postApi<T>(path: string, body: unknown) {
	return apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export function patchApi<T>(path: string, body: unknown) {
	return apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body) });
}

export function deleteApi<T>(path: string, body?: unknown) {
	return apiRequest<T>(path, {
		method: 'DELETE',
		body: body === undefined ? undefined : JSON.stringify(body)
	});
}
