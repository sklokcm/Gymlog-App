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
        alert('Training has been successfully saved! 💪'); 
    });

    statsBtn.addEventListener('click', ()=>navigateTo(statisticsScreen));

    historyBtn.addEventListener('click', ()=>navigateTo(historyScreen));

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

        newExercise.innerHTML=`
        <div>
            <h3>${exerciseName}</h3>
            <button class="add-set-btn">+</button>
        </div>
        <div class="set-inputs">
            <input type="number" placeholder="Вага (кг)" class="input-field">
            <input type="number" placeholder="Повторення" class="input-field">
        </div>
        `
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
                <input type="number" placeholder="Вага (кг)" class="input-field">
                <input type="number" placeholder="Повторення" class="input-field">
            `

            currentExercise.appendChild(newSet);
        }
    }
});