// @ts-check
// IMPORTANT: Use relative paths, because Node won't be happy!
const {
    BirdState
} = require('../core/simulation');

/**
 * @abstract
 */
class NetworkEvent {
    /**
     * @param {string} name
     * @param {SocketIO.Socket | SocketIOClient.Socket} socket 
     */
    constructor(name, socket) {
        this.name = name;
        /** @type {SocketIO.Socket} */
        // @ts-ignore, because SocketIOClient.Socket
        // lacks some stuff but we don't care
        this.socket = socket;
    }
}

/**
 * @template I
 * @extends {NetworkEvent}
 */
class Message extends NetworkEvent {
    /**
     * @param {(data: I) => void} callback
     */
    register(callback) {
        this.socket.on(this.name, callback);
    }

    /**
     * @param {I} data
     */
    emit(data) {
        this.socket.emit(this.name, data);
    }

    /**
     * @param {I} data
     */
    broadcast(data) {
        this.socket.broadcast.emit(this.name, data);
    }
}

/**
 * @template I
 * @template O
 * @extends {NetworkEvent}
 */
class RPC extends NetworkEvent {
    /**
     * @param {(data: I, output: (res: O) => void) => void} callback
     */
    register(callback) {
        this.socket.on(this.name, callback);
    }

    /**
     * @param {I} data
     * @param {(res: O) => void} cb
     */
    call(data, cb) {
        this.socket.emit(this.name, data, cb);
    }
}

/** @typedef {string} PlayerID */
/** @typedef {number} Timestamp */

class PlayerState {
    /**
     * @param {string} id 
     */
    constructor(id) {
        this.id = id;
        this.birdState = new BirdState();
        this.username = id;
        /** @type {number | null} */
        this.highscore = null;
    }
}

class Events {
    /**
     * @param {SocketIO.Socket | SocketIOClient.Socket} socket
     */
    constructor(socket) {
        /** @type {Message<PlayerState>} */
        this.PlayerJoined = new Message('PlayerJoined', socket)
        /** @type {Message<PlayerID>} */
        this.PlayerLeft = new Message('PlayerLeft', socket)
        /** @type {Message<{[playerid: string]: Partial<PlayerState>}>} */
        this.PlayersUpdate = new Message('PlayerUpdate', socket)
        /** @type {RPC<Timestamp, PlayerState>} */
        this.CmdJump = new RPC('CmdJump', socket)
        /** @type {RPC<number, number>} */
        this.RPCTest = new RPC('RPCTest', socket)
        /** @type {RPC<string, boolean>} */
        this.RPCSetUsername = new RPC('RPCSetUsename', socket)
    }
}

module.exports = {
    Events,
    PlayerState,
}