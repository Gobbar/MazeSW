var nScreenWidth = 750;
var nScreenHeight = 500;
var nMapWidth = 16;
var nMapHeight = 16;

var fPlayerX = 13.5;
var fPlayerY = 13.5;
var fPlayerA = 3.1;
var fFOV = 3.14159 / 4.0;
var fDepth = 16.0;
var fSpeed = 0.3;

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

//document.onkeydown = function(key) {
//    switch (key.keyCode) {
//        case "KeyW": console.log("W");
//    }
//}
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
var x_width = 10;
var y_height = 1;
function gameLoop() {
    tp2 = new Date();
    fElapsedTime = Math.abs(tp2 - tp1);
    tp1 = tp2;
    ctx.fillRect(0,0,screen.width, screen.height);
    
    if (pressedKeys['KeyA']) {
        fPlayerA -= 0.05;
        console.log("A");
    }
    if (pressedKeys['KeyD']) {
       fPlayerA += 0.05;
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
    
    
    
    for (var x = 0; x < nScreenWidth; x+=x_width) {
        var fRayAngle = (fPlayerA - fFOV/2.0) + (x / nScreenWidth) * fFOV;

        // Find distance to wall
        var fStepSize = 0.1;		  // Increment size for ray casting, decrease to increase										
        var fDistanceToWall = 0.0; //                                      resolution

        var bHitWall = false;		// Set when ray hits wall block
        var bBoundary = false;		// Set when ray hits boundary between two wall blocks

        var fEyeX = Math.sin(fRayAngle); // Unit vector for ray in player space
        var fEyeY = Math.cos(fRayAngle);
        
        
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
                    // Ray has hit wall
                    bHitWall = true;

                    // To highlight tile boundaries, cast a ray from each corner
                    // of the tile, to the player. The more coincident this ray
                    // is to the rendering ray, the closer we are to a tile 
                    // boundary, which we'll shade to add detail to the walls
                    var p = [];

				    // Test each corner of hit tile, storing the distance from
				    // the player, and the calculated dot product of the two rays
				    for (var tx = 0; tx < 2; tx++)
				        for (var ty = 0; ty < 2; ty++)
				        {
				        	// Angle of corner to eye
				        	var vy = nTestY + ty - fPlayerY;
				        	var vx = nTestX + tx - fPlayerX;
				        	var d = Math.sqrt(vx*vx + vy*vy); 
				        	var dot = (fEyeX * vx / d) + (fEyeY * vy / d);
				        	p.push([d, dot]);
				        }

				    // Sort Pairs from closest to farthest
				    
                    //sort(p.begin(), p.end(), [](const pair<float, float> &left, const pair<float, float> &right) {return left.first < right.first; });
                    p.sort(function (left, right) {
                        if (left[0] < right[0]) {
                           return -1;
                        }
                        if (left[0] > right[0]) {
                           return -1;
                        }
                        if (left[0] == right[0]) {
                           return 0;
                        }
                    });
                    
				    // First two/three are closest (we will never see all four)
				    var fBound = 0.01;
				    if (Math.acos(p[0][1]) < fBound) bBoundary = true;
				    if (Math.acos(p[1][1]) < fBound) bBoundary = true;
				    if (Math.acos(p[2][1]) < fBound) bBoundary = true;
				}
            }
        }
		
        // Calculate distance to ceiling and floor
        var nCeiling = Math.ceil((nScreenHeight/2.0) - nScreenHeight / (fDistanceToWall));
        var nFloor = nScreenHeight - nCeiling;

        // Shader walls based on distance
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
        
        if (bBoundary)
            nShade = '#333333'; // Black it out
			
			for (var y = 0; y < nScreenHeight; y+=y_height)
			{
				// Each Row
				if(y <= nCeiling) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(x, y, x_width, y*nScreenWidth);
                    //ctx.fillRect(y, x, y*nScreenWidth, x_width); //----------------------------
					//ctx.fillRect(y*nScreenWidth, x, 1, x_width);
                    //screen[y*nScreenWidth + x] = ' ';
                }
				else if(y > nCeiling && y <= nFloor) {
                    ctx.fillStyle = nShade;
                    ctx.fillRect(x, y, x_width, y*nScreenWidth); //----------------------------
					//ctx.fillRect(y, x, y*nScreenWidth, x_width);
                    //ctx.fillRect(y*nScreenWidth, x, 1, x_width);
                    //screen[y*nScreenWidth + x] = nShade;
                }
				else // Floor
				{				
					// Shade floor based on distance
					var b = 1.0 - ((y -nScreenHeight/2.0) / (nScreenHeight / 2.0));
					if (b < 0.25)		nShade = 'brown';
					else if (b < 0.5)	nShade = 'red';
					else if (b < 0.75)	nShade = 'orange';
					else if (b < 0.9)	nShade = 'yellow';
					else				nShade = 'white';
					ctx.fillStyle = nShade;
                    ctx.fillRect(x, y, x_width, y*nScreenWidth); //----------------------------
                    //ctx.fillRect(y*nScreenWidth, x, 1, x_width);
                    //ctx.fillRect(y, x, y*nScreenWidth, x_width);
                    //screen[y*nScreenWidth + x] = nShade;
				}
			}
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
    
    
    pPlayerX.innerHTML = fPlayerX;
    pPlayerY.innerHTML = fPlayerY;
    pPlayerA.innerHTML = fPlayerA;
    FPS.innerHTML = 1000/fElapsedTime;
    setTimeout(gameLoop, 50);
}
gameLoop();

//ctx.fillRect(10,0, 10, 10);
    
    
    
    
    
    
    
    