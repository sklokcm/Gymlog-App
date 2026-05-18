import { api } from './database.js';

export const apiProxy = new Proxy(api, {
    get(target, prop) {
        const originalValue = target[prop];

        if (typeof originalValue === 'function') {
            return async function(...args) {
                console.log(`[Proxy] Fetch to database: ${prop}`);
                try {
                    const result = await originalValue.apply(target, args);
                    return result;
                } catch (error) {
                    console.error(`[Proxy] Error ${prop}:`, error);
                    throw error;
                }
            };
        }
        return originalValue;
    }
});