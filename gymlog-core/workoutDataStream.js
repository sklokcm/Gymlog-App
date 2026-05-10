export class workoutDataStreamer{
    static async *getWorkoutStream(){
        const history = JSON.parse(localStorage.getItem('gymlog-history'))||[];
        for(const workout of history){
            await new Promise(resolve => setTimeout(resolve, 10));
            yield workout;
        }
    }
}