import _ from 'lodash';

export class BirdState {
    /** Position x in units */
    public x: number;
    /** Position y in units */
    public y: number;
    /** Speed in units/frame */
    public vspeed: number = 0;
    /** Frame number */
    public time: number = 0;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Bird {
    public callsign: string;
    constructor(callsign: string) {
        this.callsign = callsign;
    }
}

export class Simulation {
    public startX: number = 0;
    public startY: number = 100;
    public hspeed: number = 5;
    public jumpSpeed: number = 10;
    public gravity: number = -1;
    public ceiling: number = 200;
    public seed: number;
    public bird: Bird;
    public states: BirdState[];

    constructor(bird: Bird, seed: number) {
        this.bird = bird;
        this.states = [];
        this.seed = seed;
    }

    /**
     * Add a jump discontinuity at a given time.
     * NOTE: time must be integer, in frames.
     * @param time Integer time in frames
     * @returns New state after jump
     */
    public addJump(time: number): BirdState {
        if (time % 1 !== 0) {
            throw new Error("Time stamp must be integer.");
        }
        let lastState = _.last(this.states);
        let newState: BirdState | null = null;
        if (_.isUndefined(lastState)) {
            newState = new BirdState(this.startX, this.startY);
        } else {
            if (time <= lastState.time) {
                throw new Error("New jump can not be older than the last one.");
            }
            newState = this.calcState(lastState, time);
            newState.vspeed = this.jumpSpeed; // this performs the jump
        }
        this.states.push(newState);
        return newState;
    }

    /**
     * Calculates the parabolic motion given a 'last' state and current time.
     * NOTE: Time can be a fraction too.
     * @param time Time in frames
     * @returns Calculated state
     */
    private calcState(last: BirdState, time: number): BirdState {
        if (time < last.time) {
            throw new Error("Can not get state in the past.")
        }
        let dt = time - last.time;
        return {
            time: time,
            x: last.x + this.hspeed * dt,
            y: last.y + last.vspeed * dt + 0.5 * this.gravity * dt * dt,
            vspeed: last.vspeed + this.gravity * dt,
        }
    }

    /**
     * Calculates intermediary state, based on all the jumps and given time.
     * @param time Time in frames
     */
    public positionAt(time: number): BirdState {
        let currentState = _.first(this.states);
        for (let i = 1; i < this.states.length; ++i) {
            if (this.states[i].time > time) {
                currentState = this.states[i - 1];
                break;
            }
        }
        if (currentState) {
            return currentState;
        }
    }
}