import { ExerciseLibrary, ExerciseFactory } from "gymlog-core";

const selectExercise = document.getElementById('exercises-search');
const addExerciseBtn = document.getElementById('add-exercise-btn');
const exercisesContainer = document.getElementById('exercises-container');
const finishBtn = document.getElementById('finish-workout-btn');

export function renderSearchList(){
    const exercises = ExerciseLibrary.getExercises();
    selectExercise.innerHTML="";
    if(exercises.length===0){
        selectExercise.innerHTML = `<option value="" disabled selected>Library is empty</option>`;
        addExerciseBtn.disabled = true;
        return;
    }
    addExerciseBtn.disabled = false;
    exercises.forEach(ex =>{
        const option = document.createElement('option');
        option.value = ex.name;
        option.textContent = ex.name;
        selectExercise.appendChild(option);
    });
}

export function addExercise(){
    addExerciseBtn.addEventListener('click', ()=>{
        const exerciseName = selectExercise.value;

        const newExercise=document.createElement('div');
        newExercise.classList.add('exercise-card');

        newExercise.innerHTML = `
            <div class="exercise-header">
            <h3>${exerciseName}</h3>
            <button class="add-set-btn">+</button>
            </div>
            <div class="set-container">
                <div class = "set-inputs">
                    <input type="number" placeholder="Weight (kg)" class="input-field">
                    <input type="number" placeholder="Reps" class="input-field">
                    <button class="remove-set-btn">-</button>
                </div>
            </div>
            <button class="remove-exercise-btn" > Delete Exercise </button> 
            `;

        exercisesContainer.appendChild(newExercise);
    });
}
    
export function deleteExercise(){
    exercisesContainer.addEventListener('click', (e)=>{
        if(e.target.classList.contains('remove-exercise-btn') || e.target.closest('.remove-exercise-btn')){
            const card = e.target.closest('.exercise-card');
            card.remove();
        }
    });
}

export function editSets(){
    exercisesContainer.addEventListener('click', (e)=>{
        if(e.target.classList.contains('add-set-btn')){
            const currentExercise = e.target.closest('.exercise-card');

            const setContainer = currentExercise.querySelector('.set-container');

            const newSet = document.createElement('div');
            newSet.classList.add('set-inputs');

            newSet.innerHTML=`
                <input type="number" placeholder="Weight (kg)" class="input-field">
                <input type="number" placeholder="Reps" class="input-field">
                <button class="remove-set-btn">-</button>
            `;

            setContainer.appendChild(newSet);
        }
        if (e.target.classList.contains('remove-set-btn')) {
        e.target.closest('.set-inputs').remove();
        }
    });  
}

export function collectData(onFinish){
    finishBtn.addEventListener('click', ()=>{
        const workoutData = [];
        const allCards = document.querySelectorAll('.exercise-card');
        allCards.forEach(card =>{
            const name = card.querySelector('h3').textContent;

            const setRows = card.querySelectorAll('.set-inputs');
            const collectedSets = [];

            setRows.forEach(row => {
                const inputs = row.querySelectorAll('input');
                const weight = inputs[0].value;
                const reps = inputs[1].value;

                if (weight !== "" && reps !== "") {
                    collectedSets.push({
                        weight: Number(weight),
                        reps: Number(reps)
                    });
                }
                });
            if (collectedSets.length > 0) {
                workoutData.push(ExerciseFactory.create(name, collectedSets));
            }
        });
        if (workoutData.length > 0) {
            if(typeof(onFinish)==='function'){
                onFinish(workoutData);
            }
            exercisesContainer.innerHTML = "";
        } 
        else {
            alert("Not a single set was done!");
            onFinish(null);
        }
    });
}
    