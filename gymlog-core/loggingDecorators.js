export function withLogging(fn, actionName = "Action") {
    return async function(...args) {
        console.log(`Start: ${actionName}`);
        const startTime = performance.now();

        try {
            const result = await fn.apply(this, args);
            
            const endTime = performance.now();
            console.log(`Finished: ${actionName} (Time: ${(endTime - startTime).toFixed(2)} ms)`);
            return result;
            
        } catch (error) {
            const endTime = performance.now();
            console.error(`Error: ${actionName} (Time: ${(endTime - startTime).toFixed(2)} ms)`, error);
            throw error; 
        }
    };
}