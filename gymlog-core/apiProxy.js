import { api } from './databaseService.js';

export const apiProxy = new Proxy(api, {
    get(target, prop) {
        const originalValue = target[prop];

        if (typeof originalValue === 'function') {
            return async function(...args) {
                try {
                    const result = await originalValue.apply(target, args);
                    return result;
                } catch (error) {
                    throw error;
                }
            };
        }
        return originalValue;
    }
});