export { EventEmitter, appEvent } from "./eventEmmiter.js";
export {AsyncUtils} from "./asyncUtils.js"
export {workoutDataStreamer} from "./workoutDataStream.js";
export {PriorityQueue} from "./priorityQueue.js";
export {createID} from "./idGenerator.js";
export {MockFitnessTracker} from "./mockFitnessTracker.js"
import { createID, workoutIdGen } from "./idGenerator.js";
import {apiProxy} from "./apiProxy.js";
import { api } from "./database.js";


export class ExerciseFactory{
    static create(name, sets){
        return {
            id:Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: name,
            sets: sets,
        }
    }
}


export class ExerciseLibrary{
    static async getExercises(){
        return await apiProxy.getAllExercises();
    }
    static async saveNewExercise(name, description, video){
        const exercises = await this.getExercises();

        const exists = exercises.some(ex => ex.name.toLowerCase() === name.toLowerCase());
        if(!exists){
            const NewExercise = {
                id: "ex_" + Date.now(),
                name: name,
                description: description,
                video: video || "no link"
            };
            await apiProxy.saveExercise(NewExercise);
            return true;
        }
        return false;
    }
    static async deleteExercise(id){
        return await apiProxy.deleteExercise(id);
    }
    
    
}

export class ExerciseHistory{
    static async saveWorkout(workoutData, duration, avgHR){
        let volume = 0, sets = 0;
         
        workoutData.forEach(exercise => {
            sets += exercise.sets.length;
            exercise.sets.forEach(set=>{
                volume += (set.reps * set.weight);
            })
        });


        const date = { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = new Date().toLocaleString('en-US', date);

        const workoutSummary = {
            id: workoutIdGen.next().value,
            date: formattedDate,
            volume: volume,
            sets: sets,
            duration: duration || "00:00:00",
            avgHr: avgHR,
            exercises: workoutData
        };

        await apiProxy.saveWorkout(workoutSummary);
        return workoutSummary;
    }

    static async loadHistory() {
        return await apiProxy.getAllWorkouts();
    }

    static async deleteWorkout(id){
        return await apiProxy.deleteWorkout(id);
    }
}






