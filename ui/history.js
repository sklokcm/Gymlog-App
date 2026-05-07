import { ExerciseHistory, AsyncUtils, appEvent } from "gymlog-core";

const historyList = document.getElementById('history-list');

export async function renderHistory(){
    historyList.innerHTML = '<div class="status-message">Loading history...</div>';

    await new Promise(resolve => setTimeout(resolve, 300));

    try{
        const data = ExerciseHistory.loadHistory();
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
                    <button class="delete-workout-btn" data-id="${workout.id}">Delete</button>
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
            <button class="secondary-btn retry-btn" style="margin-top: 10px;">Retry</button>
        </div>`;
    }
}


export function viewDetails(){
    historyList.addEventListener('click', (e)=>{
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
    });
}

export function deleteWorkout(){
    historyList.addEventListener('click', (e)=>{
        const target = e.target;
        if (target.classList.contains('delete-workout-btn') || target.closest('.delete-workout-btn')){
            const btn = target.closest('.delete-workout-btn');
            const workoutId = btn.getAttribute('data-id');

            if (confirm("Delete this workout?")) {
            ExerciseHistory.deleteWorkout(workoutId);
            renderHistory(); 
            appEvent.emit('historyUpdated', { action: 'deleted' });
            }
        }
    });
}


export function retryHistory() {
    historyList.addEventListener('click', (e) => {
        if (e.target.classList.contains('retry-btn')) {
            renderHistory();
        }
    });
}   

    