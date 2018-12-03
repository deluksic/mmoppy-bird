import _ from 'lodash';

export class Jump {
    /** Frame number */
    time: number;
}

export class BirdState {
    /** Position x in units */
    x: number;
    /** Position y in units */
    y: number;
    /** Speed in units/frame */
    vspeed: number;
    /** Frame number */
    time: number;
}

export class Bird {
    public callsign: string;
    constructor(callsign: string) {
        this.callsign = callsign;
    }
}

export class Simulation {
    public hspeed: number = 5;
    public gravity: number = -1;
    public ceiling: number = 200;
    public seed: number;
    public bird: Bird;
    public jumps: Jump[];

    public lastState: BirdState;

    constructor(bird: Bird) {
        this.bird = bird;
        this.jumps = [];
        this.lastState = {
            x: 0,
            y: 0,
            vspeed: 0,
            time: 0,
        }
    }

    /**
     * Add a jump discontinuity at a given time.
     * NOTE: time must be integer, in frames.
     * @param time Integer time in frames
     */
    public addJump(time: number) {
        if (time % 1 !== 0) {
            throw new Error("Time stamp must be integer.");
        }
        if (!_.isEmpty(this.jumps) && _.last(this.jumps).time >= time) {
            throw new Error("New jump can not be older than the last one.");
        }
        this.jumps.push({ time: time });
        this.lastState = this.getPosition(time);
    }

    /**
     * Gets the position of the bird given last jump and current time.
     * NOTE: Time can be a fraction too.
     * @param time Time in frames
     */
    public getPosition(time: number): BirdState {
        if (time < this.lastState.time) {
            throw new Error("Can not get position in the past.")
        }
        let dt = time - this.lastState.time;
        return {
            time: time,
            x: this.lastState.x + this.hspeed,
            y: this.lastState.y +
                this.lastState.vspeed * dt +
                0.5 * this.gravity * dt * dt,
            vspeed: this.lastState.vspeed + this.gravity * dt,
        }
    }
}