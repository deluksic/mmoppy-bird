// @ts-check

const _ = require('lodash');

/**
 * Generates a random number, given seed.
 * @param {number} seed 
 */
function random(seed) {
    var x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

/**
 * Linearly interpolates from a to b, given k [0, 1].
 * @param {number} a 
 * @param {number} b 
 * @param {number} k
 */
function lerp(a, b, k) {
    return a + k * (b - a);
}

class BirdState {
    constructor() {
        this.x = 0;
        this.y = 100;
        this.vspeed = 0;
        this.time = 0;
        this.valid = true;
    }
}

class Wall {
    /**
     * @param {number} index
     * @param {number} x
     * @param {number} y
     */
    constructor(index, x, y) {
        this.index = index;
        this.x = x;
        this.y = y;
    }
}

class Simulation {

    constructor() {
        this.hspeed = 10;
        this.jumpSpeed = 8;
        this.gravity = -0.5;
        this.ceiling = 200;
        this.floor = -220;
        this.seed = 0;
        this.wallThickness = 20;
        this.wallGap = 150;
        this.wallSeparation = 300;

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
        let initState = new BirdState();
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
        if (!this.states) {
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
            throw new Error("Can not get state in the past.");
        }
        if (!previous.valid) {
            return previous;
        }
        let dt = time - previous.time;
        /** @type {BirdState} */
        let newState = {
            time: time,
            x: previous.x + this.hspeed * dt,
            y: previous.y + previous.vspeed * dt + 0.5 * this.gravity * dt * dt,
            vspeed: previous.vspeed + this.gravity * dt,
            valid: previous.valid
        };
        newState.valid = newState.y > this.floor && newState.y < this.ceiling;
        return newState;
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

    /**
     * Generates a wall at a given index.
     * @param {number} index Integer value, index of the wall
     */
    wallAt(index) {
        let rnd = random(this.seed + index + (1 + Math.abs(this.seed)) * index);
        let wall = new Wall(
            index,
            index * this.wallSeparation,
            lerp(this.floor + this.wallGap / 2, this.ceiling - this.wallGap / 2, rnd));
        return wall;
    }

    /**
     * Generates all walls existing between given x values.
     * @param {number} x0 
     * @param {number} x1 
     * @returns {Wall[]}
     */
    wallsBetween(x0, x1) {
        let id1 = Math.floor(x0 / this.wallSeparation);
        let id2 = Math.floor(1 + x1 / this.wallSeparation);
        let walls = [];
        for (let i = id1; i <= id2; ++i) {
            walls.push(this.wallAt(i));
        }
        return walls;
    }
}

module.exports = {
    BirdState,
    Simulation,
    Wall
}