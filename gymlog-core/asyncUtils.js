export class AsyncUtils{
    static async asyncForEach(array, asyncCallback){
        for(let i = 0; i<array.length; i++){
            await asyncCallback(array[i], i, array);
        }
    }
}