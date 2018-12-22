// @ts-check
const io = require('socket.io-client');
const {
    Events,
    PlayerState
} = require('core/networking');

/** @type {{[key: string]: PlayerState}} */
const players = {};

const socket = io();
socket.on('connect', onConnect);

const events = new Events(socket);
events.PlayerJoined.register(onPlayerJoined);
events.PlayerLeft.register(onPlayerLeft);
events.PlayersUpdate.register(onPlayersUpdate);

/**
 * @param {number} timestamp 
 */
function jump(timestamp) {
    events.CmdJump.emit(timestamp);
    console.log("You jumped.");
}

/**
 * @param {number} x
 * @param {(res: number) => void} cb
 */
function rpcTest(x, cb) {
    events.RPCTest.call(x, cb);
}

function onConnect() {
    console.log(`Connected as user ${socket.id}.`);
}

/**
 * @param {PlayerState} player 
 */
function onPlayerJoined(player) {
    console.log(`User ${player.id} joined.`);
    players[player.id] = player;
}

/**
 * @param {string} playerid 
 */
function onPlayerLeft(playerid) {
    console.log(`User ${playerid} left.`);
    players[playerid] = undefined;
}

/**
 * @param {{[playerid: string]: Partial<PlayerState>}} playersUpdate
 */
function onPlayersUpdate(playersUpdate) {
    console.log(`Update came: ${JSON.stringify(playersUpdate)}.`);
    Object.assign(players, playersUpdate);
}

module.exports = {
    jump,
    rpcTest,
    players
}