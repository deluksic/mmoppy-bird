// @ts-check
const {
    Simulation
} = require('core/simulation');
const {
    jump,
    rpcTest,
    players,
    localPlayer,
    setUsername
} = require('client/client');

/** @type {Simulation} */
let currentSimulation;
let offset = 0;

let cameraShift = 100;

/** @type {HTMLCanvasElement} */
let canvas;

/** @type {CanvasRenderingContext2D} */
let context;

var assetDone = 0;
var isGameOver = false;

/** @type {CanvasPattern} */
let groundPattern;
/** @type {CanvasPattern} */
let grassPattern;
/** @type {CanvasPattern} */
let skylinePattern;

let ferLogo = new Image();
ferLogo.src = "assets/FER_logo.png";

let bird = [1, 2, 3, 4, 5, 6, 7, 8].map((x) => {
    let image = new Image();
    image.src = "assets/bird/frame-" + x + ".png";
    image.onload = () => ++assetDone;
    return image;
})

/**
 * @param {number} x
 * @param {number} y
 */
function mod(x, y) {
    return ((x % y) + y) % y;
}

function startSimulation() {
    currentSimulation = new Simulation();
    currentSimulation.init(123);
    offset = 0;
}

function init() {
    let username = prompt("Enter your name");
    username && setUsername(username);

    // @ts-ignore
    canvas = document.getElementById("main_canvas");

    canvas.width = 1280;
    canvas.height = 720;
    canvas.onmousedown = (e) => {
        playerAction();
        e.preventDefault();
    }

    context = canvas.getContext("2d");

    initPatterns();

    startSimulation();

    // Testing out networking
    rpcTest(10, (res) => console.log(res));
}

function initPatterns() {
    let ground = new Image();
    ground.src = "assets/ground.jpg";
    ground.onload = () => groundPattern = context.createPattern(ground, 'repeat');

    let grass = new Image();
    grass.src = "assets/grass.jpg";
    grass.onload = () => grassPattern = context.createPattern(grass, 'repeat');

    let skyline = new Image();
    skyline.src = "assets/skyline.png";
    skyline.onload = () => skylinePattern = context.createPattern(skyline, 'repeat');
}

function drawFERLogo(playerX) {
    context.globalAlpha = 0.50;
    context.drawImage(ferLogo, 500 - playerX * 0.25, 250, ferLogo.width, ferLogo.height);
    context.globalAlpha = 1.0;
}

var drawGrass = (playerX) => {
    context.save();
    context.translate(-playerX, 0);
    context.fillStyle = grassPattern;
    context.fillRect(playerX, canvas.height - 150, canvas.width, 50);
    context.restore();
}

var drawGround = (playerX) => {
    context.save();
    context.translate(-playerX, 0);
    context.fillStyle = groundPattern;
    context.fillRect(playerX, canvas.height - 100, canvas.width, 100);
    context.restore();
}

/**
 * @param {number} x
 * @param {number} y
 * @param {number} speedFactor
 */
var drawCloud = (x, y, speedFactor) => {
    context.save();
    context.translate(mod(x - offset * speedFactor + 100, canvas.width + 400) - 400, y);
    context.beginPath();
    context.moveTo(170, 80);
    context.bezierCurveTo(130, 100, 130, 150, 230, 150);
    context.bezierCurveTo(250, 180, 320, 180, 340, 150);
    context.bezierCurveTo(420, 150, 420, 120, 390, 100);
    context.bezierCurveTo(430, 40, 370, 30, 340, 50);
    context.bezierCurveTo(320, 5, 250, 20, 250, 50);
    context.bezierCurveTo(200, 5, 150, 20, 170, 80);
    context.closePath();
    context.lineWidth = 5;
    context.fillStyle = '#ffffffaa';
    context.fill();
    context.restore();
}

var drawSky = () => {
    context.fillStyle = 'rgb(135, 206, 235)';
    context.fillRect(0, 0, canvas.width, canvas.height - 150);
}

var drawSkyline = () => {
    context.save();
    context.translate(-offset * 0.1, 0);
    context.globalAlpha = 0.10;
    context.fillStyle = skylinePattern;
    context.fillRect(offset * 0.1, 100, canvas.width, canvas.height);
    context.restore();
}

/**
 * @param {number} x
 * @param {number} y
 * @param {string} name
 * @param {number} rotation
 */
var drawBird = (playerX, x, y, name, rotation) => {
    playerX -= cameraShift;
    let frame = ((offset / 4) % 7) | 0;
    let middleX = bird[frame].width / 2;
    let middleY = bird[frame].height / 2;

    context.save();
    context.translate(x - playerX, y);

    context.translate(-middleX / 8, -middleY / 8);
    context.scale(0.15, 0.15);

    context.translate(middleX, middleY);
    context.rotate(rotation);
    context.translate(-middleX, -middleY);

    context.drawImage(bird[frame], 0, 0);

    context.translate(middleX, middleY);
    context.rotate(-rotation);
    context.translate(-middleX, -middleY);

    context.fillStyle = 'rgb(135, 0, 235)';
    context.font = "160px Sans";

    context.fillText(name, 0, 0);
    context.restore();

}

function drawLeaderboard() {
    context.fillStyle = "rgb(135, 0, 235)";
    context.font = "32px Sans";
    var offset = 0;
    var playerObjects = Object.keys(players).map(v => players[v]);
    playerObjects.sort((a, b) => b.highscore - a.highscore);
    for (let playerid in playerObjects) {
        let entry = playerObjects[playerid];
        context.fillText((parseInt(playerid) + 1) + ". " + entry.username + " : " + entry.highscore, 900, offset * 50 + 100);
        ++offset
    }
}

/**
 * @param {number} x
 * @param {number} yMiddle
 */
function drawPillar(playerX, x, yMiddle) {
    playerX -= cameraShift;
    context.fillStyle = "rgb(0, 0, 0)";
    let topHeight = yMiddle - currentSimulation.wallGap / 2;
    let bottom = yMiddle + currentSimulation.wallGap / 2;
    let bottomHeight = currentSimulation.floor - bottom;
    context.fillRect(x - playerX, 0, currentSimulation.wallThickness, topHeight);
    context.fillRect(x - playerX, bottom, currentSimulation.wallThickness, bottomHeight);
}

function drawPillars(playerX, pillars) {
    pillars.forEach(pillar => {
        drawPillar(playerX, pillar.x, pillar.y)
    });
}

function gameOver() {
    isGameOver = true;
}

function playerAction() {
    let time = offset + 1;
    if (!isGameOver) {
        currentSimulation.addJump(time);
        jump(time, ps => {
            console.log(`Server says you jumped at ${ps.birdState.time}.`);
        });
    } else {
        jump(time, ps => {
            console.log(`Game over? Server says: ${!ps.birdState.valid}.`)
            startSimulation();
            isGameOver = false;
        });
    }
}

function render() {

    if (assetDone <= 7) {
        return;
    }

    let playerPosition = currentSimulation.positionAt(offset);

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawSky();
    drawSkyline();
    drawFERLogo(playerPosition.x);
    drawCloud(170, 80, 1.0);
    drawPillars(playerPosition.x, currentSimulation.wallsBetween(playerPosition.x - 1000, playerPosition.x + 4000));
    drawCloud(1000, 40, 0.9);
    drawCloud(830, 20, 0.8);
    drawGround(playerPosition.x);
    drawGrass(playerPosition.x);
    drawLeaderboard();

    // Draw other players
    // TODO: Choppy!
    for (let playerid in players) {
        let player = players[playerid];
        if (player.id === localPlayer.id) {
            continue;
        }
        drawBird(
            playerPosition.x,
            player.birdState.x,
            -player.birdState.y * 10 + 1500,
            player.username,
            -player.birdState.vspeed / 15
        );
    }

    // Draw local player
    drawBird(
        0,
        0,
        playerPosition.y,
        localPlayer.username,
        playerPosition.vspeed / 15
    );

    // Draw local player colision
    let collisionState = currentSimulation.calcState(
        localPlayer.birdState,
        localPlayer.birdState.time + currentSimulation.birdWallCollision(
            localPlayer.birdState,
            currentSimulation.wallsBetween(localPlayer.birdState.x, localPlayer.birdState.x)[1]
        )
    );

    drawBird(
        playerPosition.x,
        collisionState.x,
        collisionState.y,
        `${localPlayer.username}-col`,
        collisionState.vspeed / 15
    );

    if (!playerPosition.valid) {
        gameOver();
    }

    if (!isGameOver) {
        ++offset;
    }
}

module.exports = {
    init,
    render
}