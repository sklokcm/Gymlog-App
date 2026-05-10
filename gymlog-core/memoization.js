export function memoize(fn, options = { limit: 5 }) {
    const cache = new Map();
    const limit = options.limit;

    
    return async function(...args) {
        const key = JSON.stringify(args);

        if (cache.has(key)) {
            const value = cache.get(key);
            cache.delete(key);
            cache.set(key, value);
            
            return value;
        }

        const result = await fn(...args);

        cache.set(key, result);

        if (cache.size > limit) {
            const oldestKey = cache.keys().next().value;
            cache.delete(oldestKey);
        }

        return result;
    };
}