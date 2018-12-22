// @ts-check
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const {
    Events,
    PlayerState
} = require('../core/events');

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

    const player = new PlayerState(socket.id);
    players[socket.id] = player;

    // Register events
    const events = new Events(socket);
    events.RPCTest.register((x, cb) => cb(x * x));
    events.PlayerJoined.broadcast(player);
    events.PlayersUpdate.emit(players);
    events.CmdJump.register((time) => {
        console.log(time);
        events.PlayersUpdate.broadcast({
            [player.id]: {
                id: player.id
            }
        });
    });

    // On disconnect, erase player and inform others
    socket.on('disconnect', () => {
        console.log(`User ${player.id} disconnected.`);
        players[player.id] = undefined;
        events.PlayerLeft.broadcast(player.id);
    });
});

server.listen(8080, () => console.log(`Listening on ${JSON.stringify(server.address())}`));