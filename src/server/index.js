// @ts-check
// IMPORTANT: Use relative paths, because Node won't be happy!
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const {
    Events,
    PlayerState
} = require('../core/networking');
const {
    Simulation
} = require('../core/simulation');

var app = express();

// Serve up compiled static files
app.use(express.static('./dist'));

// Set up server
var server = http.createServer(app);

// Listen for socketio traffic
var io = socketio.listen(server);

/** @type {{[playerid: string]: PlayerState}} */
const players = {};

// For each socket that connects...
io.sockets.on('connect', function (socket) {
    console.log(`User ${socket.id} connected.`);

    const simulation = new Simulation();
    const player = new PlayerState(socket.id);
    player.birdState = simulation.init(0);
    players[socket.id] = player;

    // Register events
    const events = new Events(socket);
    events.RPCSetUsername.register((username, cb) => {
        player.username = username;
        events.PlayersUpdate.broadcast({
            [player.id]: {
                username
            }
        });
        cb(true); // TODO: prevent users to have same username?
    });
    events.PlayerJoined.broadcast(player);
    events.PlayersUpdate.emit(players);
    events.RPCTest.register((x, cb) => cb(x * x));
    events.CmdJump.register((time, cb) => {
        try {
            let newState = simulation.addJump(time);
            player.highscore = Math.max(player.highscore, newState.time);
            player.birdState = newState;
            events.PlayersUpdate.broadcast({
                [player.id]: player
            });
            cb && cb(player);
            if (!newState.valid) {
                simulation.init(0);
            }
        } catch (ex) {
            console.error(ex);
        }
    });

    // On disconnect, erase player and inform others
    socket.on('disconnect', () => {
        console.log(`User ${player.id} disconnected.`);
        players[player.id] = undefined;
        events.PlayerLeft.broadcast(player.id);
    });
});

server.listen(8080, () => console.log(`Listening on ${JSON.stringify(server.address())}`));