// @ts-check

const _ = require('lodash');

class BirdState {
    /**
     * @param {number} x 
     * @param {number} y 
     */
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vspeed = 0;
        this.time = 0;
    }
}

class Simulation {
    constructor() {
        this.startX = 0;
        this.startY = 100;
        this.hspeed = 10;
        this.jumpSpeed = 8;
        this.gravity = -0.5;
        this.ceiling = 200;
        this.seed = 0;

        /** @type {BirdState[]} */
        this.states = [];
    }

    /**
     * Init should be called first before doing anything with the simulation.
     * Resets the states array and adds the initial state.
     * @param {number} seed
     * @returns {BirdState} The initial state
     */
    init(seed) {
        this.seed = seed;
        let initState = new BirdState(this.startX, this.startY);
        this.states = [initState];
        return initState;
    }

    /**
     * Add a jump discontinuity at a given time.
     * NOTE: time must be integer, in frames.
     * @param {number} time Integer time in frames
     * @returns {BirdState} New state after jump
     */
    addJump(time) {
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
     * @param {BirdState} previous Previous state
     * @param {number} time Time in frames (fraction is OK)
     * @returns {BirdState} Calculated state
     */
    calcState(previous, time) {
        if (time < previous.time) {
            throw new Error("Can not get state in the past.")
        }
        let dt = time - previous.time;
        return {
            time: time,
            x: previous.x + this.hspeed * dt,
            y: previous.y + previous.vspeed * dt + 0.5 * this.gravity * dt * dt,
            vspeed: previous.vspeed + this.gravity * dt,
        }
    }

    /**
     * Calculates intermediary state, based on all the jumps and given time.
     * @param {number} time Time in frames (fraction is OK)
     * @returns {BirdState} Calculated state
     */
    positionAt(time) {
        if (_.isEmpty(this.states)) {
            throw new Error("Call init on a simulation before doing anything else.")
        }
        if (_.isNumber(time)) {
            let i = _.findLastIndex(this.states, (s) => s.time <= time);
            if (i >= 0) {
                return this.calcState(this.states[i], time);
            }
        } else {
            return _.last(this.states);
        }
        throw new Error("Could not find any states that are earlier than current time.");
    }
}

module.exports = {
    BirdState,
    Simulation
}