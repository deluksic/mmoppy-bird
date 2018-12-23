# MMOpy Bird
FER Virtual Environments 2018/2019. MMO flappy bird clone. Node server, socket.io, webgl.

## Organization
This project is split into 3 parts:
- core
- client
- server

**Core** contains main logic of the game. Also network code.

**Client** contains presentation logic. This can be a console output or a fancy 3D webgl game.

**Server** listens for websocket connections and sends information about other players.

They share the same `node_modules` folder.

## Running server
To run the development server you need: 
- nodejs, npm

Then, in this (**root**) directory run:
```
npm install
npm start
```
This installs all dependencies and runs the development server. The code will auto-generate once you make a change to any of the server's or client's `.js` files.

This server serves the latest build from the client on `https://localhost:8080/`.