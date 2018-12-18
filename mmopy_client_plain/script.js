window.onload = () => {
	mod = (x, y) => ((x % y) + y) %y;

	let canvas = document.getElementById("canvas");
	let ctx = canvas.getContext("2d");

	var offset = 0;
	var assetDone = 0;

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

	let bird = [1, 2, 3, 4, 5, 6, 7, 8].map((x) => {
		let image = new Image();
		image.src = "asset/bird/frame-" + x + ".png";
		image.onload = () => ++assetDone;
		return image;
	});

	var resizeCanvas = () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	
	var drawGrass = () => {
		ctx.save();
		ctx.translate(-offset * 0.5, 0);
		ctx.fillStyle = grassPattern;
		ctx.fillRect(offset * 0.5, canvas.height - 150, canvas.width, 50);
		ctx.restore();
	}

	var drawGround = () => {
		ctx.save();
		ctx.translate(-offset * 0.5, 0);
		ctx.fillStyle = groundPattern;
		ctx.fillRect(offset * 0.5, canvas.height - 100, canvas.width, 100);
		ctx.restore();
	}

	var drawCloud = (x, y, speedFactor) => {
		ctx.save();
		ctx.translate(mod(x - offset * speedFactor + 100, canvas.width + 400) - 400, y);
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
		ctx.fillRect(0, 0, canvas.width, canvas.height - 150);
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
		ctx.fillRect(offset * 0.1, 100, canvas.width, canvas.height);
		ctx.restore();
	}

	var drawBird = (x, y, name, rotation) => {
		ctx.save();
		ctx.scale(0.15, 0.15);
		ctx.translate(x, y);

		let middleX = 762/2;
		let middleY = 603/2;

		ctx.translate(middleX, middleY);
		ctx.rotate(rotation);
		ctx.translate(-middleX, -middleY);

		let frame = ((offset / 4) % 7) | 0;
		ctx.drawImage(bird[frame], 100, 300);

		ctx.translate(middleX, middleY);
		ctx.rotate(- rotation);
		ctx.translate(-middleX, -middleY);

		ctx.fillStyle = 'rgb(135, 0, 235)';
		ctx.font = "160px Sans";
		ctx.fillText(name, 0, 200);
		ctx.restore();
	}

	resizeCanvas();
	window.onresize = () => resizeCanvas();

	var runLoop = () => {
		if(assetDone <= 7) {
			window.requestAnimationFrame(runLoop);
			return;
		}
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawSky();
		drawSkyline();
		drawClouds();
		drawGround();
		drawGrass();
		let y = ((Math.sin(offset / 20) + 1) * 1200) | 0;
		let rotate = ((Math.sin(offset / 20 + 2)));
		drawBird(510, y, "Petar", rotate);
		offset += 1;

		window.requestAnimationFrame(runLoop);
	}

	runLoop();
}


