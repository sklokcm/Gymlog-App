import { ExerciseFactory, ExerciseHistory, AsyncUtils, ExerciseLibrary, workoutDataStreamer, MockFitnessTracker, appEvent } from 'gymlog-core';
import { renderStatistics, renderLibrary, addExerciseToLibrary, deleteExerciseFromLibrary, 
    renderHistory, viewDetails, deleteWorkout, retryHistory, 
    renderSearchList, addExercise, deleteExercise, editSets, collectData,
    sortedHistory} from 'ui';

document.addEventListener('DOMContentLoaded', () => {
    
    //Navigation
    const homeScreen = document.getElementById('home-screen');
    const workoutScreen = document.getElementById('workout-screen');
    const statisticsScreen = document.getElementById('statistics-screen');
    const historyScreen = document.getElementById('history-screen');
    const libraryScreen = document.getElementById('library-screen');

    
    const startBtn = document.getElementById('start-workout-btn');
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
    const fitnessTracker = new MockFitnessTracker();
    let isWorkoutActive = false;


    renderSearchList();
    addExercise();
    deleteExercise();
    editSets();

    viewDetails();
    deleteWorkout();
    retryHistory();
    sortedHistory();

    addExerciseToLibrary();
    deleteExerciseFromLibrary();


    startBtn.addEventListener('click', () => {
        if(!isWorkoutActive){
            isWorkoutActive = true;
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

            startBtn.textContent = "Continue workout";
            startBtn.style.backgroundColor = "orange";
        }  
        navigateTo(workoutScreen)
    });

    collectData((data)=>{
        clearInterval(workoutTimerInterval);
        const time = timerDisplay.textContent;
        const heartRate = fitnessTracker.stopTracking();
        timerDisplay.textContent = "00:00:00";
        isWorkoutActive = false;
        startBtn.textContent = "Begin workout";
        startBtn.style.backgroundColor = "";
        if(data!==null){
            ExerciseHistory.saveWorkout(data, time, heartRate);
            appEvent.emit("historyUpdated", {action: "added"});
            alert("Workout saved!");
        }
    
        navigateTo(homeScreen);
    });

    statsBtn.addEventListener('click', async ()=>{
        navigateTo(statisticsScreen);

        await renderStatistics();

        if(!document.getElementById("stats-exit-btn")){
            statisticsScreen.innerHTML += `<button class="danger-btn exit" id="stats-exit-btn">Exit</button>`;
            document.getElementById('stats-exit-btn').addEventListener('click', () => navigateTo(homeScreen));
        }
    });

    historyBtn.addEventListener('click', ()=>{renderHistory();
                                             navigateTo(historyScreen)});

    libraryBtn.addEventListener('click', ()=>{renderLibrary();
            navigateTo(libraryScreen)});

    Array.from(exitBtn).forEach(btn => {
        btn.addEventListener('click', () => navigateTo(homeScreen));
    });


    function updateDatalist(data) {
        console.log(`Updating datalist because ${data.name} has been added!`);
        renderSearchList(); 
    }

    appEvent.subscribe('libraryUpdated', updateDatalist);

    setTimeout(() => {
    appEvent.unsubscribe('libraryUpdated', updateDatalist);
    }, 10000);
});





