import { ExerciseFactory, ExerciseHistory, AsyncUtils, ExerciseLibrary, workoutDataStreamer, MockFitnessTracker } from 'gymlog-core';
import { renderStatistics } from 'ui';

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

    historyBtn.addEventListener('click', ()=>{RenderHistory();
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


    //Rendering history screen

    async function RenderHistory(){
        const historyList = document.getElementById('history-list');

        historyList.innerHTML = '<div class="status-message">Loading history...</div>';

        await new Promise(resolve => setTimeout(resolve, 300));

        try{const data = ExerciseHistory.loadHistory();
        
        historyList.innerHTML='';

        if (data.length===0){
            historyList.innerHTML = "<p> It's empty( </p>";
            return;
        }

        await AsyncUtils.asyncForEach(data.slice().reverse(), async(workout)=>{
            const card = document.createElement('div');
            card.classList.add('history-card');

            //для плавної появи
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

            card.innerHTML=`
                <div class="history-header">
                    <span class="history-date">${workout.date}</span>
                    <button class="delete-workout-btn" data-id="${workout.id}">
            Delete
                    </button>
                </div>
                <div class="history-body">
                    <p><strong>Volume:</strong> ${workout.volume}</p>
                    <p><strong>Sets:</strong> ${workout.sets}</p>
                    <p><strong>Duration:</strong> ${workout.duration}</p>
                    <p><strong>Avg HR:</strong>  ${workout.avgHr} bpm</p>
                </div>
                <button class="secondary-btn view-details-btn" data-id="${workout.id}">View Details</button>
            `

            historyList.appendChild(card);

            //сама плавна поява
            setTimeout(()=>{
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 8)

            await new Promise(resolve => setTimeout(resolve, 300));//пауза між промальовуванням карток 
        });
        }catch(error){
            console.error("Failed to render history:", error);
        
            historyList.innerHTML = `
            <div class="error-container" style="text-align: center; color: #d9534f; padding: 20px;">
                <p>Error loading history</p>
                <small>${error.message}</small>
                <br>
                <button onclick="RenderHistory()" class="secondary-btn" style="margin-top: 10px;">Retry</button>
            </div>`;
        }
    }

    //"View Details Button"

    const historyList = document.getElementById('history-list');

    historyList.addEventListener('click', showDetails);

    function showDetails(e){
        if(e.target.classList.contains('view-details-btn')){
            const button = e.target;

            const existingDetails = button.nextElementSibling;
            if (existingDetails && existingDetails.classList.contains('workout-details-panel')) {
                existingDetails.remove(); 
                button.textContent = 'View Details';
                return;
            }

            const workoutId = button.getAttribute('data-id');
            const historyData = ExerciseHistory.loadHistory();

            const workout = historyData.find(w => w.id.toString() === workoutId);
            if(!workout) return;

            const detailsDiv = document.createElement('div');

            detailsDiv.classList.add('workout-details-panel');

            detailsDiv.style.cssText = "margin-top: 15px; padding-top: 15px; border-top: 1px dashed #ccc;";
        
            let innerContent = '';
            workout.exercises.forEach(exercise => {
                innerContent += `<h4 style="margin: 10px 0 5px 0;">${exercise.name}</h4>`;
                innerContent += `<ul style="margin: 0; padding-left: 20px; color: #555;">`;
            
                exercise.sets.forEach((set, index) => {
                    innerContent += `<li>Set ${index + 1}: ${set.weight}kg x ${set.reps} reps</li>`;
                });
            
                innerContent += `</ul>`;
            });
        
            detailsDiv.innerHTML = innerContent;
            button.parentElement.appendChild(detailsDiv);

            button.textContent = "Hide Details";
        }

    }


    //Deleting History

    historyList.addEventListener('click', deleteHistory);

    function deleteHistory(e){
        const target = e.target;
        if (target.classList.contains('delete-workout-btn') || target.closest('.delete-workout-btn')){
            const btn = target.closest('.delete-workout-btn');
            const workoutId = btn.getAttribute('data-id');

            if (confirm("Delete this workout?")) {
            ExerciseHistory.deleteWorkout(workoutId);
            
            RenderHistory(); 
        }
        }
    }

    //Library rendering
    const libraryCardContainer = document.getElementById('library-cards-container');
    const saveNewExBtn = document.getElementById('save-new-ex-btn');

    function getEmbedUrl(url){
        if(!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`;
        }
        return null;
    }
    function renderLibrary(){
        const exercises = ExerciseLibrary.getExercises();
        libraryCardContainer.innerHTML='';
        exercises.slice().reverse().forEach(ex=>{
            const card = document.createElement('div');
            card.style.cssText="background: white; border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left;";

            const url = getEmbedUrl(ex.video);
            let videoHTML = '';
            if (url) {
                videoHTML = `
                <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px; margin-bottom: 10px;">
                    <iframe src="${url}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" allowfullscreen></iframe>
                </div>`;
            }

            card.innerHTML = `
                ${videoHTML}
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <h3 style="margin: 0; font-size: 1.2rem; color: #2c3e50;">${ex.name}</h3>
                    <button class="delete-library-ex-btn" data-id="${ex.id}" style="background: none; border: none; color: #dc3545; font-size: 1.2rem; cursor: pointer;">Delete</button>
                </div>
                <p style="margin: 0; font-size: 0.95rem; color: #6c757d; line-height: 1.4;">${ex.description}</p>
            `;

            libraryCardContainer.appendChild(card);
        });
    }
    saveNewExBtn.addEventListener('click',()=>{
        const nameInput = document.getElementById('new-ex-name');
        const descInput = document.getElementById('new-ex-desc');
        const videoInput = document.getElementById('new-ex-video');
        
        const name = nameInput.value.trim();
        const desc = descInput.value.trim();
        const video = videoInput.value.trim();

        if (!name) {
            alert("Input exersice name!!!");
            return;
        }

        ExerciseLibrary.saveNewExercise(name, desc, video);
        nameInput.value="";
        descInput.value="";
        videoInput.value="";

        renderLibrary();
        RenderSearchList();
    } );
    libraryCardContainer.addEventListener('click', (e)=>{
        if(e.target.classList.contains('delete-library-ex-btn')){
            const exId = e.target.getAttribute('data-id');
            if (confirm("Delete this exercise?")) {
                ExerciseLibrary.deleteExercise(exId);
                renderLibrary();
                RenderSearchList();
            }
        }
    });
});







