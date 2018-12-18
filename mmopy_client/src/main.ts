import { Bird, Simulation } from './core';
import { AnyARecord } from 'dns';

let currentSimulation: Simulation;
let offset = 0;

let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;

var assetDone = 0;

let groundPattern: CanvasPattern;
let grassPattern: CanvasPattern;
let skylinePattern: CanvasPattern;

let bird = [1, 2, 3, 4, 5, 6, 7, 8].map((x) => {
        let image = new Image();
		image.src = "asset/bird/frame-" + x + ".png";
		image.onload = () => ++assetDone;
		return image;
})

function mod(x: number, y: number) {
    return ((x % y) + y) % y;
}

function startSimulation() {
    let bird = new Bird("petar");
    currentSimulation = new Simulation(bird, 123);

    currentSimulation.init();
    offset = 0;
}

export function init() {
    canvas = document.getElementById("main_canvas") as HTMLCanvasElement;

    canvas.width = 1280;
    canvas.height = 720;

    context = canvas.getContext("2d")!;
	console.log("Hello");
	
	initPatterns();

    startSimulation();
}

function initPatterns() {
    let ground = new Image();
    ground.src = "asset/ground.jpg";
    ground.onload = () => groundPattern = context.createPattern(ground, 'repeat')!;

    let grass = new Image();
    grass.src = "asset/grass.jpg";
    grass.onload = () => grassPattern = context.createPattern(grass, 'repeat')!;

    let skyline = new Image();
    skyline.src = "asset/skyline.png";
	skyline.onload = () => skylinePattern = context.createPattern(skyline, 'repeat')!;
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

var drawCloud = (x: number, y: number, speedFactor: number) => {
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

var drawClouds = () => {
	drawCloud(170, 80, 1.0);
	drawCloud(1000, 40, 0.9);
	drawCloud(830, 20, 0.8);
}

var drawSkyline = () => {
	context.save();
	context.translate(-offset * 0.1, 0);
	context.globalAlpha = 0.10;
	context.fillStyle = skylinePattern;
	context.fillRect(offset * 0.1, 100, canvas.width, canvas.height);
	context.restore();
}

var drawBird = (x: number, y: number, name: string, rotation: number) => {
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
	context.rotate(- rotation);
	context.translate(-middleX, -middleY);

	context.fillStyle = 'rgb(135, 0, 235)';
	context.font = "160px Sans";
	context.fillText(name, 0, 0);
	context.restore();
}

export function playerAction() {
	currentSimulation.addJump(offset + 1);
}

export function render() {
	if(assetDone <= 7) {
		return;
	}

	context.clearRect(0, 0, canvas.width, canvas.height);
	drawSky();
	drawSkyline();
	drawClouds();
	drawGround();
	drawGrass();

	let playerPosition = currentSimulation.positionAt(offset);

	drawBird(
		playerPosition.x,
		-playerPosition.y * 10 + 1500,
		"Petar",
		-playerPosition.vspeed / 15
	);
    ++offset; 
}