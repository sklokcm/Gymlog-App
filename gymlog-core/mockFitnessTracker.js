export class MockFitnessTracker{
    constructor(){
        this.heartRates = [];
        this.isTracking = false;
    }

    async *createHeartRateStream(){
        while(this.isTracking){
            await new Promise(resolve=>setTimeout(resolve, 2000));

            if(!this.isTracking) break;

            const currentHr = Math.floor(Math.random() * 51) + 110;

            yield currentHr;
        }
    }

    async startTracking(){
        this.isTracking = true;
        this.heartRates = [];

        for await(const hr of this.createHeartRateStream()){
            this.heartRates.push(hr);
        }
    }

    stopTracking(){
        this.isTracking = false;
        if(this.heartRates.length === 0 ) return 0;
        const sum = this.heartRates.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.heartRates.length);
    }
}
