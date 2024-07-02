var screen = document.getElementById("canv");
var ctx = screen.getContext('2d');
var pPlayerX = document.getElementById("fPlayerX");
var pPlayerY = document.getElementById("fPlayerY");
var pPlayerA = document.getElementById("fPlayerA");
var FPS = document.getElementById("FPS");

const input = document.createElement("input");
input.type = "file";
input.addEventListener("change", setTexture);

var nScreenWidth = screen.width;
var nScreenHeight = screen.height;

var fFOV = Math.PI / 4.0;
var fDepth = 16.0;
var fSpeed = 0.3;

var fPlayerX = 14.5;
var fPlayerY = 14.5;
var fPlayerA = 3.1;

var nMapWidth = 16;
var nMapHeight = 16;

var screenAr;
var mapAr;

var map;

var tp1 = new Date();
var tp2 = new Date();

var pressedKeys = { 
	"KeyW": false,
	"KeyA": false,
	"KeyS": false,
	"KeyD": false
};

function controlKeyDown(key) {
	if (pressedKeys[key.code] !== "underfined") {
		pressedKeys[key.code] = true;
	}
}

function controlKeyUp(key) {
	if (pressedKeys[key.code] !== "underfined") {
		pressedKeys[key.code] = false;
	}
}

function gameLoop() {
	tp2 = new Date();
	fElapsedTime = Math.abs(tp2 - tp1);
	tp1 = tp2;

	controlsKeys();
	drawScene();
	drawMap();
	displayParams();
	if (map[(Math.floor(fPlayerX)*nMapWidth + Math.floor(fPlayerY))] != "@") { 
		setTimeout(gameLoop, 0);
	}
	else {
		gameFinish();
	}
}

function displayParams() {
	pPlayerX.innerHTML = fPlayerX;
	pPlayerY.innerHTML = fPlayerY;
	pPlayerA.innerHTML = fPlayerA;
	FPS.innerHTML = 1000/fElapsedTime;
}

function drawScene() {
	ctx.fillRect(0,0,screen.width, screen.height);
	for (var x = 0; x < nScreenWidth; x++) 
	{
		var fRayAngle = (fPlayerA - fFOV/2.0) + (fFOV / nScreenWidth) * x;

		var fStepSize = 0.1;									
		var fDistanceToWall = 0.0;

		var bHitWall = false;

		var fEyeX = Math.sin(fRayAngle);
		var fEyeY = Math.cos(fRayAngle);
		var fSampleX = 0.0;
		
		while (!bHitWall && fDistanceToWall < fDepth)
		{
			fDistanceToWall += fStepSize;
			var nTestX = Math.floor(fPlayerX + fEyeX * fDistanceToWall);
			var nTestY = Math.floor(fPlayerY + fEyeY * fDistanceToWall);
			
			if (nTestX < 0 || nTestX >= nMapWidth || nTestY < 0 || nTestY >= nMapHeight)
			{
				bHitWall = true;
				fDistanceToWall = fDepth;
			}
			else
			{
				if (map[nTestX * nMapWidth + nTestY] == '#')
				{
					fDistanceToWall -= fStepSize;
					nTestX = Math.floor(fPlayerX + fEyeX * fDistanceToWall);
					nTestY = Math.floor(fPlayerY + fEyeY * fDistanceToWall);
					while (map[nTestX * nMapWidth + nTestY] != '#') {
						nTestX = Math.floor(fPlayerX + fEyeX * fDistanceToWall);
						nTestY = Math.floor(fPlayerY + fEyeY * fDistanceToWall);
						fDistanceToWall += fStepSize/10;
					}
					bHitWall = true;

					var fBlockMidX = nTestX + 0.5;
					var fBlockMidY = nTestY + 0.5;

					var fTestPointX = fPlayerX + fEyeX * fDistanceToWall;
					var fTestPointY = fPlayerY + fEyeY * fDistanceToWall;

					var fTestAngle = Math.atan2((fTestPointY - fBlockMidY), (fTestPointX - fBlockMidX));

					pPlayerA.innerHTML = fTestAngle;

					if (fTestAngle >= -Math.PI * 0.25 && fTestAngle < Math.PI * 0.25)
						fSampleX = fTestPointY - nTestY;
					if (fTestAngle >= Math.PI * 0.25 && fTestAngle < Math.PI * 0.75)
						fSampleX = fTestPointX - nTestX;
					if (fTestAngle < -Math.PI * 0.25 && fTestAngle >= -Math.PI * 0.75)
						fSampleX = fTestPointX - nTestX;
					if (fTestAngle >= Math.PI * 0.75 || fTestAngle < -Math.PI * 0.75)
						fSampleX = fTestPointY - nTestY;
				}
			}
		}
		
		var nCeiling = Math.floor((nScreenHeight / 2.0) - (nScreenHeight / fDistanceToWall));
		var nFloor = nScreenHeight - nCeiling;

		var pos = (-screenAr.width+x)*4;
		var inc = screenAr.width*4;
		for (var y = 0; y < nScreenHeight; y++)
		{
			pos += inc;
			if (y <= nCeiling) {
				screenAr.data[pos] = 255;
				screenAr.data[pos+1] = 255;
				screenAr.data[pos+2] = 255;
				screenAr.data[pos+3] = 255;
			}
			else {
				if (y > nCeiling && y <= nFloor) { //Стены
					if (fDistanceToWall < fDepth) {
						var fSampleY = (y - nCeiling) / (nFloor - nCeiling);
						var a = ColorGlyph(fSampleX, fSampleY, spriteWall);
						screenAr.data[pos] =   a[0];
						screenAr.data[pos+1] = a[1];
						screenAr.data[pos+2] = a[2];
						screenAr.data[pos+3] = a[3];
					}
					else { //Дальность прорисовки
						screenAr.data[pos] = 255;
						screenAr.data[pos+1] = 255;
						screenAr.data[pos+2] = 255;
						screenAr.data[pos+3] = 255;
					}
				}
				else //Пол
				{
					screenAr.data[pos] = 0;
					screenAr.data[pos+1] = 0;
					screenAr.data[pos+2] = 0;
					screenAr.data[pos+3] = 255;
				}
			}
		}
	}
	ctx.putImageData(screenAr, 0, 0);
}
	
function drawMap() {
	var width = mapAr.width/10;
	var height = mapAr.height/10;
	for (var ny = 0; ny < height; ny++) {
		var mapY = ny*width;
		var mapArY = ny*10*width;
		for (var j = 0; j < 10; j++) {
			var mapArJ = j*width;
			for (var nx = 0; nx < width; nx++) {
				for (var i = 0; i < 10; ++i) {
					var colorR = (map[mapY + nx] == "#") ? 0: 255; 
					var colorG = (map[mapY + nx] == "#") ? 0: 255; 
					var colorB = (map[mapY + nx] == "#") ? 0: 255; 
					var colorA = 255; 
					mapAr.data[((mapArY+mapArJ + nx)*10 + i)*4] = colorR;
					mapAr.data[((mapArY+mapArJ + nx)*10 + i)*4+1] = colorG;
					mapAr.data[((mapArY+mapArJ + nx)*10 + i)*4+2] = colorB;
					mapAr.data[((mapArY+mapArJ + nx)*10 + i)*4+3] = colorA;
				}  
			}
		}
	}
	// let a = Math.floor(fPlayerX*10)*mapAr.width*4 + j*mapAr.width*4 + Math.floor(fPlayerY*10)*4 + i*4;
	let jInit = Math.floor(fPlayerX*10)*mapAr.width*4, jStep = mapAr.width*4;
	let iInit = Math.floor(fPlayerY*10)*4, iStep = 4; 
	for (var j = jInit; j < jInit + 2 * jStep; j += jStep) {
		for (var i = iInit; i < iInit + 2 * iStep; i += iStep) { 
				mapAr.data[j + i] = 255;
				mapAr.data[j + i+1] = 0;
				mapAr.data[j + i+2] = 0;
				mapAr.data[j + i+3] = 255;
		}
	}
	ctx.putImageData(mapAr, nScreenWidth - mapAr.width, 0);
}

function controlsKeys() {
	if (pressedKeys['KeyA']) {
		fPlayerA -= 0.05;
		// console.log("A");
	}
	if (pressedKeys['KeyD']) {
		fPlayerA += 0.05;
		// console.log("D");
	}
	if (pressedKeys['KeyW']) {
	   fPlayerX += Math.sin(fPlayerA) * fSpeed;
			fPlayerY += Math.cos(fPlayerA) * fSpeed;
			if (map[Math.floor(fPlayerX) * nMapWidth + Math.floor(fPlayerY)] == '#')
			{
				fPlayerX -= Math.sin(fPlayerA) * fSpeed;
				fPlayerY -= Math.cos(fPlayerA) * fSpeed;
			}
		// console.log("W");
	}
	if (pressedKeys['KeyS']) {
		fPlayerX -= Math.sin(fPlayerA) * fSpeed;
			fPlayerY -= Math.cos(fPlayerA) * fSpeed;
			if (map[Math.floor(fPlayerX) * nMapWidth + Math.floor(fPlayerY)] == '#')
			{
				fPlayerX += Math.sin(fPlayerA) * fSpeed;
				fPlayerY += Math.cos(fPlayerA) * fSpeed;
			}
		// console.log("S");
	}
}

function ColorGlyph(x, y, img) {
	var sx = Math.floor(x*img.width);
	var sy = Math.floor(y*img.height - 1);
	var pos = (sy*img.width+sx)*4;
	if (sx < 0 || sx >= img.width || sy < 0 || sy >= img.height)
		return  [255,255,255,255];
	return [img.data[pos],img.data[pos+1],img.data[pos+2],img.data[pos+3]];
}

function gameFinish() {
	ctx.font = "100px";
	ctx.fillText("WIN! Press any key", screen.width/2, screen.height/2);
	document.removeEventListener("keydown", controlKeyDown);
	document.removeEventListener("keyup", controlKeyUp);
	document.addEventListener("keydown", exitToMenu);
	//menu();
}

function exitToMenu() {
	document.removeEventListener("keydown", exitToMenu);
	menu();
}
//var spriteWall = {};
//spriteWall.data = []
//spriteWall.width = 32;
//spriteWall.height = 32;
//for (var i = 0; i < 32; i++) {
//	for (var j = 0; j < 32; j++) {
//		spriteWall.data.push(Math.floor( Math.random() * 256 ));
//		spriteWall.data.push(Math.floor( Math.random() * 256 ));
//		spriteWall.data.push(Math.floor( Math.random() * 256 ));
//		spriteWall.data.push(255);
//	}
//}
//gameLoop();

function startGame(isRandomMaze) {
	nScreenWidth = screen.width;
	nScreenHeight = screen.height;

	fFOV = Math.PI / 4.0;
	fDepth = 16.0;
	fSpeed = 0.3;

	var maze;
	if (isRandomMaze) {
		maze = mazeGeneration(15, 15)

		fPlayerX = maze.fPlayerX;
		fPlayerY = maze.fPlayerY;
		fPlayerA = maze.fPlayerA;

		nMapWidth = maze.width;
		nMapHeight = maze.height;

		map = maze.map;
	}
	else {
		fPlayerX = 14.5;
		fPlayerY = 14.5;
		fPlayerA = 3.1;

		nMapWidth = 16;
		nMapHeight = 16;

		map =   "#########@######";
		map +=  "#..............#";
		map +=  "#..............#";
		map +=  "#..............#";
		map +=  "#..............#";
		map +=  "#..............#";
		map +=  "#......##......#";
		map +=  "#......##......#";
		map +=  "#..............#";
		map +=  "#..............#";
		map +=  "#......##......#";
		map +=  "#......##......#";
		map +=  "#..............#";
		map +=  "#..............#";
		map +=  "#..............#";
		map +=  "################";
	}

	screenAr = ctx.createImageData(nScreenWidth, nScreenHeight);
	mapAr = ctx.createImageData(nMapWidth*10, nMapHeight*10);

	tp1 = new Date();
	tp2 = new Date();

	pressedKeys = { 
		"KeyW": false,
		"KeyA": false,
		"KeyS": false,
		"KeyD": false
	};

	document.addEventListener("keydown", controlKeyDown);
	document.addEventListener("keyup", controlKeyUp);
	gameLoop();
}

var menuClass = {
	"menu": ["Start default maze", "Start random maze", "Set your texture (32 x 32)"],
	"selected": 0
}

function menuKeys(key) {
	if (key.code == "KeyW") {
		if (menuClass.selected > 0) {
			menuClass.selected--;
		}
		drawMenu();
	}
	if (key.code == "KeyS") {
		if (menuClass.selected < menuClass.menu.length - 1) {
			menuClass.selected++;
		}
		drawMenu();
	}
	if (key.code == "Enter") {
		switch (menuClass.selected) {
			case 0: {
				document.removeEventListener("keydown", menuKeys);
				startGame(false);
				break;
			}
			case 1:{
				document.removeEventListener("keydown", menuKeys);
				startGame(true);
				break;
			}
			case 2: {
				input.click();
				break;
			}
		}
	}
}

function drawMenu() {
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,screen.width,screen.height);
	ctx.font = "30px";
	menuClass.menu.forEach(function(item, idx) {
		ctx.fillStyle = idx == menuClass.selected ? "red" : "black";
		ctx.fillText(item, screen.width/2, screen.height/2 + idx*30);
	});
}

function menu() {
	document.addEventListener("keydown", menuKeys);
	drawMenu();
}

function setTexture() {
	var file = this.files[0];
	var type = file.type.replace(/\/.+/, "");
	if (type != "image") {
		drawError("Loaded file is not image");
		input.value = null;
		return;
	}
	var img = document.createElement("img");
	img.addEventListener("load", ()=>{
		if (img.width != 32 || img.height != 32) {
			drawError("Image size is not 32x32");
			input.value = null;
			return;
		}
		ctx.drawImage(img, 0, 0);
		var t = ctx.getImageData(0,0,32,32);
		spriteWall = {};
		spriteWall.data = [];
		t.data.forEach(function(item) {
			spriteWall.data.push(item);
		});
		spriteWall.width = t.width;
		spriteWall.height = t.height;
		drawMenu();
	});
	img.src = URL.createObjectURL(file);
	URL.revokeObjectURL(file);
}

function drawError(errorString) {
	ctx.fillStyle = "white";
	ctx.fillRect(0,0,750,50);
	ctx.font = "40px";
	ctx.fillStyle = "black";
	ctx.fillText(errorString, 10, 10);
}

menu();