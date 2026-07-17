type Subscriber = {
	channel: string;
	controller: ReadableStreamDefaultController<Uint8Array>;
};

const encoder = new TextEncoder();
const subscribers = new Set<Subscriber>();

function send(controller: ReadableStreamDefaultController<Uint8Array>, event: string, data: unknown) {
	controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

export function publish(channel: string, data: unknown = {}) {
	for (const subscriber of subscribers) {
		if (subscriber.channel === channel) {
			send(subscriber.controller, 'message', data);
		}
	}
}

export function eventStream(channel: string) {
	let subscriber: Subscriber | undefined;
	let heartbeat: ReturnType<typeof setInterval> | undefined;

	return new ReadableStream<Uint8Array>({
		start(controller) {
			subscriber = { channel, controller };
			subscribers.add(subscriber);
			send(controller, 'open', { channel });

			heartbeat = setInterval(() => {
				controller.enqueue(encoder.encode(': heartbeat\n\n'));
			}, 25_000);

			return () => {
				if (heartbeat) clearInterval(heartbeat);
				if (subscriber) subscribers.delete(subscriber);
			};
		},
		cancel() {
			if (heartbeat) clearInterval(heartbeat);
			if (subscriber) subscribers.delete(subscriber);
		}
	});
}
