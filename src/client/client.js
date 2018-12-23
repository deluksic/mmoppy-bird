// @ts-check
const io = require('socket.io-client');
const {
    Events,
    PlayerState
} = require('core/networking');

/** @type {{[key: string]: PlayerState}} */
const players = {};

/** @type {PlayerState} */
const localPlayer = new PlayerState(undefined);

const socket = io();
socket.on('connect', onConnect);

const events = new Events(socket);
events.PlayerJoined.register(onPlayerJoined);
events.PlayerLeft.register(onPlayerLeft);
events.PlayersUpdate.register(onPlayersUpdate);

/**
 * Shortcut to update both local player and players entry.
 * @param {PlayerState} player 
 */
function _updateLocalPlayer(player) {
    Object.assign(localPlayer, player);
    Object.assign(players, {
        [player.id]: player
    });
}

/**
 * @param {number} timestamp
 * @param {(bs: PlayerState) => void} cb
 */
function jump(timestamp, cb = null) {
    events.CmdJump.call(timestamp, ps => {
        _updateLocalPlayer(ps);
        cb && cb(ps);
    });
}

/**
 * @param {number} x
 * @param {(res: number) => void} cb
 */
function rpcTest(x, cb) {
    events.RPCTest.call(x, cb);
}

/**
 * @param {string} username 
 * @param {(response: boolean) => void} cb 
 */
function setUsername(username, cb = null) {
    events.RPCSetUsername.call(username, (response) => {
        if (response) {
            localPlayer.username = username;
            _updateLocalPlayer(localPlayer);
        }
        cb && cb(response);
    })
}

function onConnect() {
    console.log(`Connected as user ${socket.id}.`);
    _updateLocalPlayer(new PlayerState(socket.id));
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
    delete players[playerid];
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
    setUsername,
    players,
    localPlayer
}