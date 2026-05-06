import { workoutDataStreamer } from 'gymlog-core';

const statisticsScreen = document.getElementById('statistics-screen');
export async function renderStatistics(){
        statisticsScreen.innerHTML = '<h2>Analizing data...</h2>';
        let totalLifetimeVolume=0;
        let totalWorkouts=0;
        const monthHistory = [];
        const now=new Date();
        const currentYear  = now.getFullYear();
        const currentMonth = now.getMonth();
        const stream = workoutDataStreamer.getWorkoutStream();
        try{
            for await (const workout of stream) {
                totalLifetimeVolume += workout.volume;
                totalWorkouts++;

                const workoutDate = new Date(workout.id);
                if(workoutDate.getFullYear() === currentYear && workoutDate.getMonth()=== currentMonth){
                    monthHistory.push(workoutDate.getDate());
                }
            }

            const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
            const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

            const monthName = now.toLocaleString('en-US', {month: 'long', year: 'numeric'});

            let calendarHTML = `
                <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); width: 100%; margin-bottom: 20px;">
                <h3 style="margin-top: 0; text-align: center; color: #2c3e50;">${monthName}</h3>  
                <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; text-align: center;">          
            `;

            const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            weekDays.forEach(day => {
                calendarHTML += `<div style="font-weight: bold; font-size: 0.8rem; color: #6c757d; padding-bottom: 5px;">${day}</div>`;
            });

            for (let i = 0; i < firstDayIndex; i++) {
                calendarHTML += `<div></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                if (monthHistory.includes(day)) {
                    calendarHTML += `<div style="background: #28a745; color: white; border-radius: 5px; padding: 8px 0; font-weight: bold; box-shadow: 0 2px 4px rgba(40,167,69,0.3);">${day}</div>`;
                } else {
                    calendarHTML += `<div style="background: #f8f9fa; border-radius: 5px; padding: 8px 0; color: #495057;">${day}</div>`;
                }
            }
            
            calendarHTML += `</div></div>`;

            statisticsScreen.innerHTML = `
                <h2>Statistics</h2>
                <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); text-align: left; width: 100%; margin-bottom: 20px;">
                    <p style="font-size: 1.2rem; margin-bottom: 10px;"><strong>Total Workouts:</strong> <span style="color: #007bff;">${totalWorkouts}</span></p>
                    <p style="font-size: 1.2rem; margin: 0;"><strong>Total Volume Lifted:</strong> <span style="color: #28a745;">${totalLifetimeVolume} kg</span></p>
                </div>
                ${calendarHTML}
            `;
        }
        catch{
            statisticsScreen.innerHTML = '<h2>Помилка обчислення статистики</h2><button class="danger-btn exit">Exit</button>';
        }
    }