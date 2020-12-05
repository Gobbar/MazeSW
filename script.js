var nScreenWidth = 750;
var nScreenHeight = 500;
var nMapWidth = 16;
var nMapHeight = 16;

var fPlayerX = 13.5;
var fPlayerY = 13.5;
var fPlayerA = 3.1;
var fFOV = 3.14159 / 4.0;
var fDepth = 16.0;
var fSpeed = 0.16;

var map =   "#########.......";
map +=      "#...............";
map +=      "#.......########";
map +=      "#..............#";
map +=      "#......##......#";
map +=      "#......##......#";
map +=      "#..............#";
map +=      "###............#";
map +=      "##.............#";
map +=      "#......####..###";
map +=      "#......#.......#";
map +=      "#......#.......#";
map +=      "#..............#";
map +=      "#......#########";
map +=      "#..............#";
map +=      "################";


//var map =   "################";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "#..............#";
//map +=      "################";

var tp1 = new Date();
var tp2 = new Date();

var screen = document.getElementById("canv");
var ctx = screen.getContext('2d');
var pPlayerX = document.getElementById("fPlayerX");
var pPlayerY = document.getElementById("fPlayerY");
var pPlayerA = document.getElementById("fPlayerA");
var FPS = document.getElementById("FPS");


/**/
function ColorGlyph(x, y, img) {
    var sx = Math.ceil(x*img.width);
    var sy = Math.ceil(y*img.height - 1);
    var pos = (sy*32+sx)*4;
    if (sx <0 || sx >= img.width || sy < 0 || sy >= img.height) {
        return "white";
    }
    //debugger;
    var a = "rgba(" + img[pos]+","+img[pos+1]+","+img[pos+2]+","+img[pos+3] +")";
    //var a = "rgba(" + img[sx][sy][0]+","+img[sx][sy][1]+","+img[sx][sy][2]+","+img[sx][sy][3] +")";
    //console.log(a);
    return a;
}
function ColorGlyphAr(x, y, img, nFloor, nCeiling) {
    var sx = Math.ceil(x*img.width);
    var sy = Math.ceil(y*img.height - 1);
    var pos = (sy*32+sx)*4;
    var ar = [];
    if (sx <0 || sx >= img.width || sy < 0 || sy >= img.height) {
        return "white";
    }
    //debugger;
    var a = "rgba(" + img[pos]+","+img[pos+1]+","+img[pos+2]+","+img[pos+3] +")";
    //var a = "rgba(" + img[sx][sy][0]+","+img[sx][sy][1]+","+img[sx][sy][2]+","+img[sx][sy][3] +")";
    //console.log(a);
    return a;
}

var pressedKeys = { 
    "KeyW": false,
    "KeyA": false,
    "KeyS": false,
    "KeyD": false
};
document.addEventListener("keydown", function(key) {
    if (pressedKeys[key.code] !== "underfined") {
        pressedKeys[key.code] = true;
    }
});
document.addEventListener("keyup", function(key) {
    if (pressedKeys[key.code] !== "underfined") {
        pressedKeys[key.code] = false;
    }
});
var x_width = 1;

function gameLoop() {
    tp2 = new Date();
    fElapsedTime = Math.abs(tp2 - tp1);
    tp1 = tp2;
    ctx.fillRect(0,0,screen.width, screen.height);
    
    controlsKeys();
    
    for (var x = 0; x < nScreenWidth; x+=x_width) {
        var fRayAngle = (fPlayerA - fFOV/2.0) + (x / nScreenWidth) * fFOV;

        // Find distance to wall
        var fStepSize = 0.1;		  // Increment size for ray casting, decrease to increase										
        var fDistanceToWall = 0.0; //                                      resolution

        var bHitWall = false;		// Set when ray hits wall block
        var bBoundary = false;		// Set when ray hits boundary between two wall blocks

        var fEyeX = Math.sin(fRayAngle); // Unit vector for ray in player space
        var fEyeY = Math.cos(fRayAngle);
        var fSampleX = 0;
        
        // Incrementally cast ray from player, along ray angle, testing for 
        // intersection with a block
        while (!bHitWall && fDistanceToWall < fDepth)
        {
            fDistanceToWall += fStepSize;
            var nTestX = Math.ceil(fPlayerX + fEyeX * fDistanceToWall);
            var nTestY = Math.ceil(fPlayerY + fEyeY * fDistanceToWall);
            
            // Test if ray is out of bounds
            if (nTestX < 0 || nTestX >= nMapWidth || nTestY < 0 || nTestY >= nMapHeight)
            {
                bHitWall = true;			// Just set distance to maximum depth
                fDistanceToWall = fDepth;
            }
            else
            {
                // Ray is inbounds so test to see if the ray cell is a wall block
                if (map[nTestX * nMapWidth + nTestY] == '#')
                {
                    fDistanceToWall -= fStepSize;
					nTestX = Math.ceil(fPlayerX + fEyeX * fDistanceToWall);
					nTestY = Math.ceil(fPlayerY + fEyeY * fDistanceToWall);
					while (map[nTestX * nMapWidth + nTestY] != '#') {
						nTestX = Math.ceil(fPlayerX + fEyeX * fDistanceToWall);
						nTestY = Math.ceil(fPlayerY + fEyeY * fDistanceToWall);
						fDistanceToWall += fStepSize/10;
					}
                    // Ray has hit wall
                    bHitWall = true;

                    var fBlockMidX = nTestX + 0.5;
					var fBlockMidY = nTestY + 0.5;

					var fTestPointX = fPlayerX + fEyeX * fDistanceToWall;
					var fTestPointY = fPlayerY + fEyeY * fDistanceToWall;

					var fTestAngle = Math.atan2((fTestPointY - fBlockMidY), (fTestPointX - fBlockMidX));
                    pPlayerA.innerHTML = fTestAngle;
					if (fTestAngle >= -3.14159 * 0.25 && fTestAngle < 3.14159 * 0.25)
						fSampleX = fTestPointY - nTestY;
					if (fTestAngle >= 3.14159 * 0.25 && fTestAngle < 3.14159 * 0.75)
						fSampleX = fTestPointX - nTestX;
					if (fTestAngle < -3.14159 * 0.25 && fTestAngle >= -3.14159 * 0.75)
						fSampleX = fTestPointX - nTestX;
					if (fTestAngle >= 3.14159 * 0.75 && fTestAngle < -3.14159 * 0.75)
                        fSampleX = fTestPointY - nTestY;
                    
                //// To highlight tile boundaries, cast a ray from each corner
                //// of the tile, to the player. The more coincident this ray
                //// is to the rendering ray, the closer we are to a tile 
                //// boundary, which we'll shade to add detail to the walls
                //var p = [];
                //
				//// Test each corner of hit tile, storing the distance from
				//// the player, and the calculated dot product of the two rays
				//for (var tx = 0; tx < 2; tx++)
				//    for (var ty = 0; ty < 2; ty++)
				//    {
				//    	// Angle of corner to eye
				//    	var vy = nTestY + ty - fPlayerY;
				//    	var vx = nTestX + tx - fPlayerX;
				//    	var d = Math.sqrt(vx*vx + vy*vy); 
				//    	var dot = (fEyeX * vx / d) + (fEyeY * vy / d);
				//    	p.push([d, dot]);
				//    }

				    // Sort Pairs from closest to farthest
				    
                    //sort(p.begin(), p.end(), [](const pair<float, float> &left, const pair<float, float> &right) {return left.first < right.first; });
                //p.sort(function (left, right) {
                //    if (left[0] < right[0]) {
                //       return -1;
                //    }
                //    if (left[0] > right[0]) {
                //       return -1;
                //    }
                //    if (left[0] == right[0]) {
                //       return 0;
                //    }
                //});
                    
				    // First two/three are closest (we will never see all four)
				//var fBound = 0.01;
				//if (Math.acos(p[0][1]) < fBound) bBoundary = true;
				//if (Math.acos(p[1][1]) < fBound) bBoundary = true;
				//if (Math.acos(p[2][1]) < fBound) bBoundary = true;
				}
            }
        }
		
        // Calculate distance to ceiling and floor
        var nCeiling = Math.ceil((nScreenHeight/2.0) - nScreenHeight / (fDistanceToWall));
        var nFloor = nScreenHeight - nCeiling;

        //Shader walls based on distance
        var nShade = 'white';
        if (fDistanceToWall <= fDepth / 4.0)			
           nShade = "#4d4d4d";	// Very close	
        else 
           if (fDistanceToWall < fDepth / 3.0)		
               nShade = "#808080";
        else 
           if (fDistanceToWall < fDepth / 2.0)		
               nShade = "#999999";
        else 
           if (fDistanceToWall < fDepth)				
               nShade = "#b3b3b3";
        else											
           nShade = 'white';		// Too far away
        
    //if (bBoundary)
    //    nShade = '#333333'; // Black it out
		//Потолок
        ctx.fillStyle = "white";
        ctx.fillRect(x, 0, 1, nCeiling);
        //Стены
        var ar = [];
        var fSampleY = 0;
        //for (var y = nCeiling; y < nFloor; y++) {
        //    var fSampleY = (y - nCeiling) / (nFloor - nCeiling);
        //    ar.push(ColorGlyph(fSampleX, fSampleY, spriteWall));
        //    //debugger;
        //}
        ar = ColorGlyphAr(fSampleX, fSampleY, spriteWall, nFloor, nCeiling);
        var i = 0;
        var pos = nCeiling;
        //debugger;
        for (var y = 0; y < ar.length; y++) {
            if (ar[y] != ar[i]) {
                ctx.fillStyle = ar[i];
                ctx.fillRect(x, pos, 1, nFloor - pos + y);
                pos += y;
                i = y-1;
            }
        }
		//ctx.fillStyle = nShade;
		//ctx.fillRect(x, nCeiling, 1, nFloor - nCeiling);
        //debugger;

        //Пол
        ctx.fillStyle = "black";
		ctx.fillRect(x, nFloor+1, 1, nScreenHeight - nFloor);
	}
        

		// Display Stats
		//swprintf_s(screen, 40, L"X=%3.2f, Y=%3.2f, A=%3.2f FPS=%3.2f ", fPlayerX, fPlayerY, fPlayerA, 1.0f/fElapsedTime);

		// Display Map
		//for (int nx = 0; nx < nMapWidth; nx++)
		//	for (int ny = 0; ny < nMapWidth; ny++)
		//	{
		//		screen[(ny+1)*nScreenWidth + nx] = map[ny * nMapWidth + nx];
		//	}
		//screen[((int)fPlayerX+1) * nScreenWidth + (int)fPlayerY] = 'P';
        //
		//// Display Frame
		//screen[nScreenWidth * nScreenHeight - 1] = '\0';
		//WriteConsoleOutputCharacter(hConsole, screen, nScreenWidth * nScreenHeight, { 0,0 }, &dwBytesWritten);
    //break;
    
    //ctx.drawImage(spriteWall, 0, 0);
    pPlayerX.innerHTML = fPlayerX;
    pPlayerY.innerHTML = fPlayerY;
    //pPlayerA.innerHTML = fPlayerA;
    FPS.innerHTML = 1000/fElapsedTime;
    setTimeout(gameLoop, 10);
}
var spriteWall = [];
spriteWall.width = 32;
spriteWall.height = 32;
// for (var i = 0; i < 32; i++) {
//     spriteWall.push([]);
//     for (var j = 0; j < 32; j++) {
//         var r = Math.ceil(Math.random() * 256);
//         var g = Math.ceil(Math.random() * 256);
//         var b = Math.ceil(Math.random() * 256);
//         var a = Math.ceil(Math.random() * 256);
//         spriteWall[i].push([r, g, b, a]);
//     }
// }
for (var i = 0; i < 32; i++) {
    for (var j = 0; j < 32; j++) {
        spriteWall.push( Math.ceil( Math.random() * 256 ) );
        spriteWall.push( Math.ceil( Math.random() * 256 ) );
        spriteWall.push( Math.ceil( Math.random() * 256 ) );
        spriteWall.push( Math.ceil( Math.random() * 256 ) );
    }
}
//console.log(JSON.stringify(spriteWall));
gameLoop();

//var spriteWall = new Image(32, 32);
//spriteWall.crossOrigin="";
//spriteWall.onload = function() {
//    ctx.drawImage(spriteWall, 0, 0);
//    spriteWall = ctx.getImageData(0,0,32,32);
//    gameLoop();
//}
//spriteWall.src = "cat.png";


//{
//    ctx.drawImage(document.getElementById("spriteWall"),0,0);
//    spriteWall = ctx.getImageData(0,0,32,32);
//    gameLoop();
//}

    
//readTextFile("cat.txt");
    
    
    
function controlsKeys() {
    if (pressedKeys['KeyA']) {
        fPlayerA -= 0.022;
        console.log("A");
    }
    if (pressedKeys['KeyD']) {
       fPlayerA += 0.022;
        console.log("D");
   }
    if (pressedKeys['KeyW']) {
       fPlayerX += Math.sin(fPlayerA) * fSpeed;
			fPlayerY += Math.cos(fPlayerA) * fSpeed;
			if (map[Math.ceil(fPlayerX) * nMapWidth + Math.ceil(fPlayerY)] == '#')
			{
				fPlayerX -= Math.sin(fPlayerA) * fSpeed;
				fPlayerY -= Math.cos(fPlayerA) * fSpeed;
			}
        console.log("W");
   }
    if (pressedKeys['KeyS']) {
       fPlayerX -= Math.sin(fPlayerA) * fSpeed;
			fPlayerY -= Math.cos(fPlayerA) * fSpeed;
			if (map[Math.ceil(fPlayerX) * nMapWidth + Math.ceil(fPlayerY)] == '#')
			{
				fPlayerX += Math.sin(fPlayerA) * fSpeed;
				fPlayerY += Math.cos(fPlayerA) * fSpeed;
			}
        console.log("S");
    }
}


