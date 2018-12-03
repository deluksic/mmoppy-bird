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
