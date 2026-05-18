export class DatabaseService {
    constructor() {
        this.baseURL = 'http://localhost:3000';
    }

    async getAllWorkouts() {
        const response = await fetch (`${this.baseURL}/workouts`);
        return await response.json();
    }
    async saveWorkout(workout) {
        const response = await fetch(`${this.baseURL}/workouts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout)
        });
        return await response.json();
    }

    async deleteWorkout(id) {
        await fetch(`${this.baseURL}/workouts/${id}`, { method: 'DELETE' });
    }


    async getAllExercises() {
        const response = await fetch (`${this.baseURL}/exercises`);
        return await response.json();
    }
    async saveExercise(workout) {
        const response = await fetch(`${this.baseURL}/exercises`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(workout)
        });
        return await response.json();
    }

    async deleteExercise(id) {
        await fetch(`${this.baseURL}/exercises/${id}`, { method: 'DELETE' });
    }
}

export const api = new DatabaseService();