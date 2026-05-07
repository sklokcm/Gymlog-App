import { ExerciseFactory, ExerciseHistory, AsyncUtils, ExerciseLibrary, workoutDataStreamer, MockFitnessTracker, appEvent } from 'gymlog-core';
import { renderStatistics, renderLibrary, addExerciseToLibrary, deleteExerciseFromLibrary, renderHistory, viewDetails, deleteWorkout, retryHistory} from 'ui';

document.addEventListener('DOMContentLoaded', () => {
    
    //Navigation
    const homeScreen = document.getElementById('home-screen');
    const workoutScreen = document.getElementById('workout-screen');
    const statisticsScreen = document.getElementById('statistics-screen');
    const historyScreen = document.getElementById('history-screen');
    const libraryScreen = document.getElementById('library-screen');

    
    const startBtn = document.getElementById('start-workout-btn');
    const finishBtn = document.getElementById('finish-workout-btn');
    const statsBtn = document.getElementById('statistics-btn');
    const historyBtn = document.getElementById('history-btn');
    const libraryBtn = document.getElementById('library-btn')
    const exitBtn = document.getElementsByClassName('exit');

    function navigateTo(screenToShow) {
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.add('hidden');
        });

        screenToShow.classList.remove('hidden');
    }

    
    let workoutTimerInterval;
    let workoutSeconds;
    const timerDisplay = document.getElementById('active-workout-timer');
    const fitnessTracker = new MockFitnessTracker;

    startBtn.addEventListener('click', () => {navigateTo(workoutScreen),
        workoutSeconds = 0;
        timerDisplay.textContent = "00:00:00";
        if(workoutTimerInterval) clearInterval(workoutTimerInterval);

        workoutTimerInterval = setInterval(()=>{
            workoutSeconds++;
            const h = String(Math.floor(workoutSeconds / 3600)).padStart(2, '0');
            const m = String(Math.floor((workoutSeconds % 3600) / 60)).padStart(2, '0');
            const s = String(workoutSeconds % 60).padStart(2, '0');
            timerDisplay.textContent = `${h}:${m}:${s}`;
        }, 1000);

        fitnessTracker.startTracking();
    });

    finishBtn.addEventListener('click', () => {
        navigateTo(homeScreen);
    });

    statsBtn.addEventListener('click', async ()=>{
        navigateTo(statisticsScreen);

        await renderStatistics();

        statisticsScreen.innerHTML += `<button class="danger-btn exit" id="stats-exit-btn">Exit</button>`;

        document.getElementById('stats-exit-btn').addEventListener('click', () => navigateTo(homeScreen));
    });

    historyBtn.addEventListener('click', ()=>{renderHistory();
                                             navigateTo(historyScreen)});

    libraryBtn.addEventListener('click', ()=>{renderLibrary();
            navigateTo(libraryScreen)});

    exitBtn[0].addEventListener('click', ()=>navigateTo(homeScreen));
    exitBtn[1].addEventListener('click', ()=>navigateTo(homeScreen));
    exitBtn[2].addEventListener('click', ()=>navigateTo(homeScreen));




    function RenderSearchList(){
        const exercises = ExerciseLibrary.getExercises();
        const datalist = document.getElementById('exercise-datalist');

        datalist.innerHTML="";

        exercises.forEach(ex =>{
            const option = document.createElement('option');
            option.value = ex.name;
            datalist.appendChild(option);
        });
    }
    RenderSearchList();


    //Adding exercises to a workout
    const selectExercise = document.getElementById('exercises-search');
    const addExerciseBtn = document.getElementById('add-exercise-btn');
    const exercisesContainer = document.getElementById('exercises-container');

    addExerciseBtn.addEventListener('click', addExercise);

    function addExercise(){
        const exerciseName = selectExercise.value;

        const newExercise=document.createElement('div');
        newExercise.classList.add('exercise-card');

        newExercise.innerHTML = `
        <div class="exercise-header">
            <h3>${exerciseName}</h3>
            <button class="add-set-btn">+</button>
        </div>
        <div class="set-container">
            <div class="set-inputs">
                <input type="number" placeholder="Weight (kg)" class="input-field">
                <input type="number" placeholder="Reps" class="input-field">
                <button class="remove-set-btn">-</button>
            </div>
        </div>
        <button class="remove-exercise-btn" > Delete Exercise </button> 
        `;

        exercisesContainer.appendChild(newExercise);
    }

    //Deleting exercise from a workout
    exercisesContainer.addEventListener('click', deleteExercise);
    function deleteExercise(e){
        if(e.target.classList.contains('remove-exercise-btn') || e.target.closest('.remove-exercise-btn')){
            const card = e.target.closest('.exercise-card');
            card.remove();
        }
    }


    //Adding sets
    exercisesContainer.addEventListener('click', addSet);
    function addSet(e){
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
    }

    //Deleting sets
    exercisesContainer.addEventListener('click', deleteSet);
    function deleteSet(e) {
    if (e.target.classList.contains('remove-set-btn')) {
        e.target.closest('.set-inputs').remove();
        }
    }








    //Recording data

    finishBtn.addEventListener('click', CollectData);

    function CollectData(){
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
            clearInterval(workoutTimerInterval);
            const time = timerDisplay.textContent;
            const heartRate = fitnessTracker.stopTracking();

            ExerciseHistory.saveWorkout(workoutData, time, heartRate);

            document.getElementById('exercises-container').innerHTML = '';
            timerDisplay.textContent = "00:00:00";
        } 
        else {
            alert("Not a single set was done!");
        }

    }

    viewDetails();
    deleteWorkout();
    retryHistory();

    addExerciseToLibrary();
    deleteExerciseFromLibrary();

    function updateDatalist(data) {
        console.log(`Updating datalist because ${data.name} has been added!`);
        RenderSearchList(); 
    }

    appEvent.subscribe('libraryUpdated', updateDatalist);

    setTimeout(() => {
    appEvent.unsubscribe('libraryUpdated', updateDatalist);
    }, 10000);

});





