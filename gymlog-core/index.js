export class ExerciseFactory{
    static create(name, sets){
        return {
            id:Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: name,
            sets: sets,
        }
    }
}

export class ExerciseHistory{
    static saveWorkout(workoutData){
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
            duration: "1h 14min",
            exercises: workoutData
        };

        history.push(workoutSummary);
        localStorage.setItem('gymlog-history', JSON.stringify(history));

        return workoutSummary;
    }

    static loadHistory() {
        return JSON.parse(localStorage.getItem('gymlog-history')) || [];
    }
}