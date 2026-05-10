export function* createID(){
    let counter = 1;
    while(true){
        yield `workout_${Date.now()}_${counter}`;
    }
}