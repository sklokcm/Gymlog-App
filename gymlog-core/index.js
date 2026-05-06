export { EventEmitter, appEvent } from "./eventEmmiter.js";



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
    static exercises = [
        {
            id: "ex_1", 
            name: "Bench Press", 
            description: "Basic chest exercise", 
            video: "https://www.youtube.com/watch?v=SCVCLChPQFY"
        },
        {
            id: "ex_2", 
            name: "Deadlift", 
            description: "Basic legs and lowerback exercise", 
            video: "https://www.youtube.com/watch?v=1ZXobu7JvvE"
        }
    ]
    static getExercises(){
        const saved = localStorage.getItem('library');
        if(saved){
            return JSON.parse(saved);
        }
        
        localStorage.setItem('library', (JSON.stringify(this.exercises)));
        return this.exercises;
    }
    static saveNewExercise(name, description, video){
        const exercises = this.getExercises();

        const exists = exercises.some(ex => ex.name.toLowerCase() === name.toLowerCase());
        if(!exists){
            exercises.push({
                id: "ex_" + Date.now(),
                name: name,
                description: description,
                video: video || "no link"
            })
            localStorage.setItem('library', JSON.stringify(exercises));
            return true;
        }
        return false;
    }
    static deleteExercise(id){
        let exercises = this.getExercises();
        exercises = exercises.filter(ex => ex.id !== id);
        localStorage.setItem('library', JSON.stringify(exercises));
    }
    
    
}

export class ExerciseHistory{
    static saveWorkout(workoutData, duration, avgHR){
        const history = JSON.parse(localStorage.getItem('gymlog-history')) || [];
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
            id: Date.now(),
            date: formattedDate,
            volume: volume,
            sets: sets,
            duration: duration || "00:00:00",
            avgHr: avgHR,
            exercises: workoutData
        };

        history.push(workoutSummary);
        localStorage.setItem('gymlog-history', JSON.stringify(history));

        return workoutSummary;
    }

    static loadHistory() {
        return JSON.parse(localStorage.getItem('gymlog-history')) || [];
    }

    static deleteWorkout(id){
        let history = this.loadHistory();

        history=history.filter(workout=>workout.id.toString()!==id.toString());

        localStorage.setItem('gymlog-history', JSON.stringify(history));
    }
}

export class AsyncUtils{
    static async asyncForEach(array, asyncCallback){
        for(let i = 0; i<array.length; i++){
            await asyncCallback(array[i], i, array);
        }
    }
}

export class workoutDataStreamer{
    static async *getWorkoutStream(){
        const history = JSON.parse(localStorage.getItem('gymlog-history'))||[];
        for(const workout of history){
            await new Promise(resolve => setTimeout(resolve, 10));
            yield workout;
        }
    }
}


export class MockFitnessTracker{
    constructor(){
        this.heartRates = [];
        this.isTracking = false;
    }

    async *createHeartRateStream(){
        while(this.isTracking){
            await new Promise(resolve=>setTimeout(resolve, 2000));

            if(!this.isTracking) break;

            const currentHr = Math.floor(Math.random() * 51) + 110;

            yield currentHr;
        }
    }

    async startTracking(){
        this.isTracking = true;
        this.heartRates = [];

        for await(const hr of this.createHeartRateStream()){
            this.heartRates.push(hr);
        }
    }

    stopTracking(){
        this.isTracking = false;
        if(this.heartRates.length === 0 ) return 0;
        const sum = this.heartRates.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.heartRates.length);
    }
}