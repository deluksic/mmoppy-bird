// @ts-check

const _ = require('lodash');

/**
 * Generates a random number, given seed.
 * @param {number} seed 
 */
function random(seed) {
    var x = Math.sin(seed) * 10000;
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
        this.x = 48;
        this.y = 200;
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
        this.hspeed = 4;
        this.jumpSpeed = -6;
        this.gravity = 0.3;
        this.ceiling = 0;
        this.floor = 600;
        this.seed = 0;
        this.wallThickness = 120;
        this.wallGap = 250;
        this.wallSeparation = 400;
        this.birdRadius = 40;

        /** @type {BirdState[]} */
        this.states = [];
    }

    /**
     * Init should be called first before doing anything with the simulation.
     * Resets the states array and adds the initial state.
     * @returns {BirdState} The initial state
     */
    init() {
        // TODO: this.seed = seed;
        this.seed = 0;
        let initState = new BirdState();
        this.states = [initState];
        return initState;
    }

    lastState() {
        if (!this.states) {
            throw new Error("Call init on a simulation before doing anything else.")
        }
        return _.last(this.states);
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
        let lastState = this.lastState();
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
        return newState;
    }

    /**
     * Returns validity of jump.
     * @param {BirdState} birdState 
     * @param {number} time 
     * @returns {boolean}
     */
    validateJump(birdState, time) {
        let collisionTime = this.nextBirdCollision(birdState);
        return collisionTime > time;
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
            lerp(this.ceiling + this.wallGap / 2, this.floor - this.wallGap / 2, rnd));
        return wall;
    }

    /**
     * Generates all walls existing between given x values.
     * @param {number} x0 
     * @param {number} x1 
     * @returns {Wall[]}
     */
    wallsBetween(x0, x1) {
        x0 = Math.max(x0, this.wallSeparation);
        x1 = Math.max(x1, this.wallSeparation);
        let id1 = Math.floor(x0 / this.wallSeparation);
        let id2 = Math.floor(1 + x1 / this.wallSeparation);
        let walls = [];
        for (let i = id1; i <= id2; ++i) {
            walls.push(this.wallAt(i));
        }
        return walls;
    }

    /**
     * Returns time needed for a bird to collide with a vertical line, not
     * including the ends of the line.
     * If there is no collision, +inf is returned.
     * @param {BirdState} birdState 
     * @param {number} lineX
     * @param {number} lineY0
     * @param {number} lineY1
     * @returns {number}
     */
    birdVerticalLineCollision(birdState, lineX, lineY0, lineY1) {
        let time = (lineX - birdState.x - this.birdRadius) / this.hspeed;
        if (time < 0) {
            return Number.POSITIVE_INFINITY;
        }
        let newBirdState = this.calcState(birdState, birdState.time + time);
        if (newBirdState.y < lineY0 || newBirdState.y > lineY1) {
            return Number.POSITIVE_INFINITY;
        }
        return time;
    }

    /**
     * Returns time needed for a bird to collide with a horizontal line, not
     * including the ends of the line.
     * If there is no collision, +inf is returned.
     * @param {BirdState} birdState 
     * @param {number} lineY
     * @param {number} lineX0
     * @param {number} lineX1
     * @returns {number}
     */
    birdHorizontalLineCollision(birdState, lineY, lineX0, lineX1) {
        let side = Math.sign(lineY - birdState.y);
        let a = 0.5 * this.gravity;
        let b = birdState.vspeed;
        let c = birdState.y - lineY + this.birdRadius * side;
        let D = b * b - 4 * a * c;
        if (D >= 0) {
            let t = (-b + Math.sqrt(D) * side) / (2 * a);
            if (t < 0) {
                return Number.POSITIVE_INFINITY;
            }
            let newx = birdState.x + this.hspeed * t;
            if (newx < lineX0 || newx > lineX1) {
                return Number.POSITIVE_INFINITY;
            }
            return t;
        }
        return Number.POSITIVE_INFINITY;
    }

    /**
     * Returns time needed for a bird to collide with a point.
     * If the point is behind the bird or the bird doesnt collide, 
     * it is going to return negative value.
     * @param {BirdState} birdState 
     * @param {number} px
     * @param {number} py
     * @param {number} maxTime
     * @param {number} step
     * @returns {number}
     */
    birdPointCollision(birdState, px, py, maxTime, step) {
        let dx = birdState.x - px;
        let dy = birdState.y - py;
        let vx = this.hspeed;
        let vy = birdState.vspeed;
        let g = this.gravity;
        let r = this.birdRadius;
        /**
         * @param {number} x0 
         * @param {number} y0 
         * @param {number} x1 
         * @param {number} y1 
         * @returns {number}
         */
        function dot(x0, y0, x1, y1) {
            return x0 * x1 + y0 * y1;
        }
        let a = g * g / 4;
        let b = dot(0, g, vx, vy);
        let c = dot(vx, vy, vx, vy) + dot(0, g, dx, dy);
        let d = 2 * dot(vx, vy, dx, dy);
        let e = dot(dx, dy, dx, dy) - r * r;

        /**
         * Quatric function to find the root of.
         * @param {number} t 
         */
        function quat(t) {
            return (((a * t + b) * t + c) * t + d) * t + e;
        }

        /**
         * Derivative of quatric function.
         * @param {number} t 
         */
        function dquat(t) {
            return ((4 * a * t + 3 * b) * t + 2 * c) * t + d;
        }

        /**
         * Refines using Newton's method.
         * @param {number} t
         * @param {number} precision Integer
         */
        function refine(t, precision = 10) {
            for (let i = 0; i < precision; ++i) {
                let d = dquat(t);
                if (d == 0) return Number.POSITIVE_INFINITY;
                t -= quat(t) / d;
                t = Math.min(Math.max(0, t), maxTime);
            }
            return t;
        }

        if (quat(0) <= 0) {
            // the circle is already colliding with the point
            return Number.POSITIVE_INFINITY;
        }
        for (let t = 0; t < maxTime; t += step) {
            let distSq = quat(t);
            if (distSq <= 0) {
                return refine(t - step / 2);
            }
        }
        return Number.POSITIVE_INFINITY;
    }

    /**
     * Returns time needed for a bird to collide with a given wall.
     * If
     * @param {BirdState} birdState 
     * @param {Wall} wall 
     * @param {number} maxTime 
     * @returns {number}
     */
    birdWallCollision(birdState, wall, maxTime) {
        let tVertLineBottom = this.birdVerticalLineCollision(birdState, wall.x, wall.y + this.wallGap / 2, this.floor);
        let tVertLineTop = this.birdVerticalLineCollision(birdState, wall.x, this.ceiling, wall.y - this.wallGap / 2);
        let tHorzLineBottom = this.birdHorizontalLineCollision(birdState, wall.y + this.wallGap / 2, wall.x, wall.x + this.wallThickness);
        let tHorzLineTop = this.birdHorizontalLineCollision(birdState, wall.y - this.wallGap / 2, wall.x, wall.x + this.wallThickness);
        let time = Math.min(tVertLineBottom, tVertLineTop, tHorzLineBottom, tHorzLineTop, maxTime);
        let tPointBottomLeft = this.birdPointCollision(birdState, wall.x, wall.y + this.wallGap / 2, time, 0.5);
        let tPointBottomRight = this.birdPointCollision(birdState, wall.x + this.wallThickness, wall.y + this.wallGap / 2, time, 0.5);
        let tPointTopLeft = this.birdPointCollision(birdState, wall.x, wall.y - this.wallGap / 2, time, 0.5);
        let tPointTopRight = this.birdPointCollision(birdState, wall.x + this.wallThickness, wall.y - this.wallGap / 2, time, 0.5);
        time = Math.min(time, tPointBottomLeft, tPointBottomRight, tPointTopLeft, tPointTopRight);
        return time;
    }

    /**
     * @param {BirdState} birdState 
     */
    birdFloorCollision(birdState) {
        return this.birdHorizontalLineCollision(birdState, this.floor, birdState.x, birdState.x + 10000);
    }

    /**
     * Calculates a time where the bird hits the first obstacle.
     * @param {BirdState} birdState 
     */
    nextBirdCollision(birdState) {
        // @ts-ignore
        /** @type {Wall} */
        let wall = _.find(this.wallsBetween(birdState.x - this.wallThickness, birdState.x), wall => wall.x >= birdState.x - this.wallThickness);
        let floorCollisionTime = this.birdFloorCollision(birdState);
        let wallCollisionTime = this.birdWallCollision(birdState, wall, floorCollisionTime);
        return birdState.time + Math.min(wallCollisionTime, floorCollisionTime);
    }
}

module.exports = {
    BirdState,
    Simulation,
    Wall
}