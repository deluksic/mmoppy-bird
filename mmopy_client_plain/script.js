window.onload = () => {
	mod = (x, y) => ((x % y) + y) %y;

	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");

	var offset = 0;

	let ground = new Image();
	ground.src = "asset/ground.jpg";
	var groundPattern; 
	ground.onload = () => groundPattern = ctx.createPattern(ground, 'repeat');

	let grass = new Image();
	grass.src = "asset/grass.jpg";
	var grassPattern;
	grass.onload = () => grassPattern = ctx.createPattern(grass, 'repeat');

	let skyline = new Image();
	skyline.src = "asset/skyline.png";
	var skylinePattern;
	skyline.onload = () => skylinePattern = ctx.createPattern(skyline, 'repeat');

	var resizeCanvas = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerWidth * (9 / 16);
	}
	
	var drawGrass = () => {
		ctx.save();
		ctx.translate(-offset * 0.5, 0);
		ctx.fillStyle = grassPattern;
		ctx.fillRect(offset * 0.5, window.innerHeight - 300, window.innerWidth, 50);
		ctx.restore();
	}

	var drawGround = () => {
		ctx.save();
		ctx.translate(-offset * 0.5, 0);
		ctx.fillStyle = groundPattern;
		ctx.fillRect(offset * 0.5, window.innerHeight - 250, window.innerWidth, 100);
		ctx.restore();
	}

	var drawCloud = (x, y, speedFactor) => {
		ctx.save();
		ctx.translate(mod(x - offset * speedFactor + 100, window.innerWidth + 400) - 400, y);
		ctx.beginPath();
		ctx.moveTo(170, 80);
		ctx.bezierCurveTo(130, 100, 130, 150, 230, 150);
		ctx.bezierCurveTo(250, 180, 320, 180, 340, 150);
		ctx.bezierCurveTo(420, 150, 420, 120, 390, 100);
		ctx.bezierCurveTo(430, 40, 370, 30, 340, 50);
		ctx.bezierCurveTo(320, 5, 250, 20, 250, 50);
		ctx.bezierCurveTo(200, 5, 150, 20, 170, 80);
		ctx.closePath();
		ctx.lineWidth = 5;
		ctx.fillStyle = '#ffffffaa';
		ctx.fill();
		ctx.restore();
	}

	var drawSky = () => {
		ctx.fillStyle = 'rgb(135, 206, 235)';
		ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
	}

	var drawClouds = () => {
		drawCloud(170, 80, 1.0);
		drawCloud(1000, 40, 0.9);
		drawCloud(830, 20, 0.8);
	}

	var drawSkyline = () => {
		ctx.save();
		ctx.translate(-offset * 0.1, 0);
		ctx.globalAlpha = 0.10;
		ctx.fillStyle = skylinePattern;
		ctx.fillRect(offset * 0.1, 100, window.innerWidth, window.innerHeight);
		ctx.restore();
	}

	var runLoop = () => {
		resizeCanvas();
		drawSky();
		drawSkyline();
		drawClouds();
		drawGround();
		drawGrass();
		window.requestAnimationFrame(runLoop);
		offset += 1;
	}

	runLoop();
}


