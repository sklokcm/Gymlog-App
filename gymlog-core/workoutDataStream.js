import { apiProxy } from "./apiProxy.js";

export class workoutDataStreamer{
    static async *getWorkoutStream(){
        const history = await apiProxy.getAllWorkouts();
        if(!history) return;
        for(const workout of history){
            await new Promise(resolve => setTimeout(resolve, 10));
            yield workout;
        }
    }
}