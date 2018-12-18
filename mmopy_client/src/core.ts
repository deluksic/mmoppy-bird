import * as _ from 'lodash';

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
    public gravity: number = -0.7;
    public ceiling: number = 200;
    public seed: number;
    public bird: Bird;
    public states: BirdState[] | undefined;

    constructor(bird: Bird, seed: number) {
        this.bird = bird;
        this.seed = seed;
    }

    /**
     * Init should be called first before doing anything with the simulation.
     * It creates the states array and adds the initial state.
     * @returns The initial state
     */
    public init(): BirdState {
        let initState = new BirdState(this.startX, this.startY);
        this.states = [initState];
        return initState;
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
        if (_.isUndefined(this.states)) {
            throw new Error("Call init on a simulation before doing anything else.")
        }
        let lastState = _.last(this.states);
        if (lastState) {
            if (time <= lastState.time) {
                throw new Error("New jump can not be older than the last one.");
            }
            let newState = this.calcState(lastState, time);
            newState.vspeed = this.jumpSpeed; // this performs the jump
            this.states.push(newState);
            return newState;
        }
        throw new Error("For some reason last returned undefined. This shouldn't happen.");
    }

    /**
     * Calculates the parabolic motion given a 'last' state and current time.
     * @param time Time in frames (fraction is OK)
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
     * @param time Time in frames (fraction is OK)
     */
    public positionAt(time: number): BirdState {
        if (_.isUndefined(this.states)) {
            throw new Error("Call init on a simulation before doing anything else.")
        }
        let i = _.findLastIndex(this.states, (s: BirdState) => s.time <= time);
        if (i >= 0) {
            return this.calcState(this.states[i], time);
        }
        throw new Error("Could not find any states that are earlier than current time.");
    }
}