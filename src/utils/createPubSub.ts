type Handler = (event?: any) => void;
type WildcardHandler = (type?: string, event?: any) => void;

interface PubSub {
    sub(type: string, handler: Handler): void;
    sub(type: "*", handler: WildcardHandler): void;
    pub(type: string, event?: any): void;
}

/**
 * Micro functional event emitter / pubsub.
 * Based on mitt project https://github.com/developit/mitt
 */
export default function createPubSub(): PubSub {
    const subs: { [key: string]: Handler[] } = {};

    return {
        /**
         * Register an event handler for the given type.
         *
         * @param type Type of event to listen for, or `"*"` for all events
         * @param handler Function to call in response to given event
         * @returns Unsubscribe function
         */
        sub(type: string, handler: Handler) {
            (subs[type] || (subs[type] = [])).push(handler);

            return () => {
                subs[type].splice(subs[type].indexOf(handler) >>> 0, 1);
            };
        },

        /**
         * Invoke all handlers for the given type.
         * If present, `"*"` handlers are invoked after type-matched handlers.
         *
         * @param type The event type to invoke
         * @param [payload] Any value (object is recommended and powerful), passed to each handler
         */
        pub(type: string, payload: any) {
            (subs[type] || []).slice().forEach((handler: Handler) => handler(payload));
            (subs["*"] || []).slice().forEach((handler: WildcardHandler) => handler(type, payload));
        }
    };
}
