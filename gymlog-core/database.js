export class DatabaseService {
    constructor() {
        this.storageKey = 'gymlog-history';
    }

    async getAllWorkouts() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = JSON.parse(localStorage.getItem(this.storageKey)) || [];
                resolve(data);
            }, 400); 
        });
    }

    async saveWorkout(workout) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const history = JSON.parse(localStorage.getItem(this.storageKey)) || [];
                history.push(workout);
                localStorage.setItem(this.storageKey, JSON.stringify(history));
                resolve({ success: true, id: workout.id });
            }, 500);
        });
    }

    async deleteWorkout(id) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let history = JSON.parse(localStorage.getItem(this.storageKey)) || [];
                history = history.filter(w => w.id !== id);
                localStorage.setItem(this.storageKey, JSON.stringify(history));
                resolve({ success: true });
            }, 300);
        });
    }
}

export const api = new DatabaseService();