# MMOpy Bird
FER Virtual Environments 2018/2019. MMO flappy bird clone. Node server, websocket, webgl.

## Organization
This project is split into 3 parts:
- mmopy_core
- mmopy_client
- mmopy_server

**Core** contains main logic of the game.

**Client** contains presentation logic. This can be a console output or a fancy 3D webgl game.

**Server** listens for websocket connections and sends information about other players.

All of them are `yarn` workspaces, so that `mmopy_core` can be included in both `mmopy_server` and `mmopy_client`.
They also share the same `node_modules` folder.

## Running server
To run the development server you need: 
- nodejs, npm, yarn

Then, in this (**root**) directory run:
```
yarn install
cd mmopy_server
yarn start
```
This installs all dependencies and runs the development server. The code will auto-generate once you make a change to any of the server's `.ts` files.

This also serves the latest build from the client on `https://localhost:3000/`.

## Running the client

```
cd mmopy_client
yarn start
```

This will start a development server on a free port and build the app as you edit source.
You might actually want to just build once:

```
cd mmopy_client
yarn build
```