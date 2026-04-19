import { ExerciseFactory, ExerciseHistory } from 'gymlog-core';

document.addEventListener('DOMContentLoaded', () => {
    
    //Navigation
    const homeScreen = document.getElementById('home-screen');
    const workoutScreen = document.getElementById('workout-screen');
    const statisticsScreen = document.getElementById('statistics-screen');
    const historyScreen = document.getElementById('history-screen');

    
    const startBtn = document.getElementById('start-workout-btn');
    const finishBtn = document.getElementById('finish-workout-btn');
    const statsBtn = document.getElementById('statistics-btn');
    const historyBtn = document.getElementById('history-btn');
    const exitBtn = document.getElementsByClassName('exit');

    function navigateTo(screenToShow) {
        const allScreens = document.querySelectorAll('.screen');
        allScreens.forEach(screen => {
            screen.classList.add('hidden');
        });

        screenToShow.classList.remove('hidden');
    }

    startBtn.addEventListener('click', () => navigateTo(workoutScreen));

    finishBtn.addEventListener('click', () => {
        navigateTo(homeScreen);
    });

    statsBtn.addEventListener('click', ()=>navigateTo(statisticsScreen));

    historyBtn.addEventListener('click', ()=>{RenderHistory();
                                             navigateTo(historyScreen)});

    exitBtn[0].addEventListener('click', ()=>navigateTo(homeScreen));
    exitBtn[1].addEventListener('click', ()=>navigateTo(homeScreen));


    //Adding exercises to a workout
    const selectExercise = document.getElementById('exercise-selector');
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
        
        <div class="set-inputs">
            <input type="number" placeholder="Weight (kg)" class="input-field">
            <input type="number" placeholder="Reps" class="input-field">
        </div>
        `;

        exercisesContainer.appendChild(newExercise);
    }


    //Adding sets
    exercisesContainer.addEventListener('click', addSet);

    function addSet(e){
        if(e.target.classList.contains('add-set-btn')){
            const currentExercise = e.target.closest('.exercise-card');

            const newSet = document.createElement('div');
            newSet.classList.add('set-inputs');

            newSet.innerHTML=`
                <input type="number" placeholder="Weight (kg)" class="input-field">
                <input type="number" placeholder="Reps" class="input-field">
            `

            currentExercise.appendChild(newSet);
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
            ExerciseHistory.saveWorkout(workoutData);
            document.getElementById('exercises-container').innerHTML = '';
        } 
        else {
            alert("Not a single set was done!");
        }

    }


    //Rendering history screen

    function RenderHistory(){
        const historyList = document.getElementById('history-list');
        const data = ExerciseHistory.loadHistory();
        
        historyList.innerHTML=' ';

        if (data.length===0){
            historyList.innerHTML = "<p> It's empty( </p>";
            return;
        }

        data.slice().reverse().forEach(workout=>{
            const card = document.createElement('div');
            card.classList.add('history-card');

            card.innerHTML=`
                <div class="history-header">
                    <span class="history-date">${workout.date}</span>
                </div>
                <div class="history-body">
                    <p><strong>Volume:</strong> ${workout.volume}</p>
                    <p><strong>Sets:</strong> ${workout.sets}</p>
                    <p><strong>Duration:</strong> ${workout.duration}</p>
                </div>
                <button class="secondary-btn view-details-btn" data-id="${workout.id}">View Details</button>
            `

            historyList.appendChild(card);
        })
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
});