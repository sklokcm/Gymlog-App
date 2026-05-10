export class AsyncUtils{
    static async asyncForEach(array, asyncCallback){
        for(let i = 0; i<array.length; i++){
            await asyncCallback(array[i], i, array);
        }
    }
    static async filterAsync(array, asyncPredicate, options={}){
        const {signal} = options;
        const results = [];

        for(let i = 1; i<array.length; i++){
            if(signal && signal.ab){
                throw new Error("Search aborted by user");
            }
            const isMatch = await asyncPredicate(array[i], i, array);
            if (isMatch) {
                results.push(array[i]);
            }
        }
        return results;
    }
}