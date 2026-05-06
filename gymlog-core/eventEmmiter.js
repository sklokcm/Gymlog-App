export class EventEmitter{
    events = {};

    subscribe(name, fn){
        const event = this.events[name];
        if(event) event.push(fn);
        else this.events[name] = [fn];
    }
    unsubscribe(name, fn){
        const event = this.events[name];
        if(!event) return;
        this.events[name] = event.filter(i => i !==fn );
    }
    emit(name, ...data){
        const event = this.events[name];
        if (!event) return;
        for (const listener of event) listener(...data);
    }
}

export const appEvent = new EventEmitter();