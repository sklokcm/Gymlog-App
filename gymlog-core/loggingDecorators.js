export function withLogging(fn, actionName = "Action") {
    return async function(...args) {
        console.log(`Початок: ${actionName}`);
        const startTime = performance.now();

        try {
            const result = await fn(...args);
            
            const endTime = performance.now();
            console.log(`Завершено: ${actionName} (Час: ${(endTime - startTime).toFixed(2)} мс)`);
            return result;
            
        } catch (error) {
            const endTime = performance.now();
            console.error(`Помилка: ${actionName} (Час: ${(endTime - startTime).toFixed(2)} мс)`, error);
            throw error; 
        }
    };
}