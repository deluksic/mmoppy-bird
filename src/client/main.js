// @ts-check
const {
    Simulation
} = require('core/simulation');
const {
    jump,
    rpcTest,
    players
} = require('client/client');

/** @type {Simulation} */
let currentSimulation;
let offset = 0;

/** @type {HTMLCanvasElement} */
let canvas;

/** @type {CanvasRenderingContext2D} */
let context;

var assetDone = 0;
var isGameOver = false;

/** @type {string} */
let playerName;

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

let leaderboard = [
    ["david", 128],
    ["petar", 96]
];

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
    playerName = prompt("Enter your name");

    // @ts-ignore
    canvas = document.getElementById("main_canvas");

    canvas.width = 1280;
    canvas.height = 720;
    canvas.onmousedown = () => playerAction();

    context = canvas.getContext("2d");

    initPatterns();

    startSimulation();

    // Testing out networking
    setInterval(() => {
        jump(performance.now());
    }, 5000);
    rpcTest(10);
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

function drawFERLogo() {
    context.globalAlpha = 0.50;
    context.drawImage(ferLogo, 500 - offset * 0.25, 250, ferLogo.width, ferLogo.height);
    context.globalAlpha = 1.0;
}

var drawGrass = () => {
    context.save();
    context.translate(-offset * 0.5, 0);
    context.fillStyle = grassPattern;
    context.fillRect(offset * 0.5, canvas.height - 150, canvas.width, 50);
    context.restore();
}

var drawGround = () => {
    context.save();
    context.translate(-offset * 0.5, 0);
    context.fillStyle = groundPattern;
    context.fillRect(offset * 0.5, canvas.height - 100, canvas.width, 100);
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
var drawBird = (x, y, name, rotation) => {
    context.save();
    context.scale(0.15, 0.15);
    context.translate(x, y);

    let frame = ((offset / 4) % 7) | 0;

    let middleX = bird[frame].width / 2;
    let middleY = bird[frame].height / 2;

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
    for (let index in leaderboard) {
        let entry = leaderboard[index];
        context.fillText((parseInt(index) + 1) + ". " + entry[0] + " : " + entry[1], 900, offset * 50 + 100);
        ++offset
    }
}

/**
 * @param {number} x
 * @param {number} yMiddle
 */
function drawPillar(x, yMiddle) {
    context.fillStyle = "rgb(0, 0, 0)";
    context.fillRect(x - offset * 0.5, 0, 80, 500 * yMiddle);
    context.fillRect(x - offset * 0.5, 500 * yMiddle + 300, 80, 1000);
}

function drawPillars() {
    drawPillar(400, 0.5);
    drawPillar(800, 0.25);
    drawPillar(1200, 0.75);
    drawPillar(1600, 0.5);
}

function gameOver() {
    isGameOver = true;
}

function playerAction() {
    if (!isGameOver) {
        currentSimulation.addJump(offset + 1);
    } else {
        startSimulation();
        isGameOver = false;
    }
}

function render() {

    if (assetDone <= 7) {
        return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawSky();
    drawSkyline();
    drawFERLogo();
    drawCloud(170, 80, 1.0);
    drawPillars();
    drawCloud(1000, 40, 0.9);
    drawCloud(830, 20, 0.8);
    drawGround();
    drawGrass();
    drawLeaderboard();

    let playerPosition = currentSimulation.positionAt(offset);

    drawBird(
        playerPosition.x,
        -playerPosition.y * 10 + 1500,
        playerName,
        -playerPosition.vspeed / 15
    );

    if (playerPosition.y < -220) {
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