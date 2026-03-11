/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-22 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these two lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

const Height = 30, Width = 30;

//Levels Info--------------------------------
const LEGEND = {
	"#": {base: "wall", 		solid: true},
	".": {base: "floor", 		solid: false},
	"=": {base: "objective", 	solid: false, 	objective: true},

	"g": {base: "presurePlateGreen", 	solid: false},
	"y": {base: "presurePlateYellow", 	solid: false},

	"1": {base: "doorGreen", 	solid: true},
	"2": {base: "doorYellow", 	solid: true},

	//Spawns
	"+": {base: "floor", 	spawn: "player"},
	"G": {base: "floor", 	spawn: "boxGreen"},
	"Y": {base: "floor", 	spawn: "boxYellow"},

	//I'll add more if I need...
}

const TERRAIN_COLOR = {
  wall: 0x777777, //0x111111
  floor: 0xEBEBEB, //White: 0xFFFFFF  Gray: 0xDBD9D9

  presurePlateGreen: 0x137D1E, 	// Old color: 0x137D1E,
  presurePlateYellow: 0xA7B01A, // Old Color: 0xA7B01A, 

  doorGreen: 0x137D1E,
  doorYellow: 0xA7B01A,
};

const ENTITY_COLOR = {
  player: 0x1E90FF,  //F5B727
  boxGreen: 0x137D1E, 	// Old color: 0x27F53C
  boxYellow: 0xA7B01A, 			// Old Color: 0xEBFF00
};

const levels = [

	[ // 1st Level
	 "##############################",
	 "###########...+...############",
	 "###########.......############",
	 "###########...G...############",
	 "###########.......############",
	 "###########.......############",
	 "###########.......############",
	 "###########.....g.############",
	 "############1111##############",
	 "############1111##############",
	 "#.................##.........#",
	 "#.................11.........#",
	 "#..Y..............11.........#",
	 "#.................11.........#",
	 "#.................##.........#",
	 "####################.........#", //middle 30x30
	 "####################.........#", //middle 30x30
	 "#............................#",
	 "#............................#",
	 "#............................#",
	 "#.........................y..#",
	 "#............................#",
	 "#............................#",
	 "#######2222###################",
	 "#######2222###################",
	 "#...........................##",
	 "#...........................2=",
	 "#...........................2=",
	 "#...........................##",
	 "##############################"],

	[ // 2nd Level 
	 "##############################",
	 "#...........................g#",
	 "#............................#",
	 "#............................#",
	 "#....+.......................#",
	 "#............................#",
	 "#............................#",
	 "#............................#",
	 "######...###########1111######",
	 "######...###########1111######",
	 "#.............##.............#",
	 "#.............##.............#",
	 "#.............##.............#",
	 "#.....G.......##.............#",
	 "#.............##.............#",
	 "#.............##.............#",
	 "#..........y..##.............#",
	 "#####2222#######......Y......#",
	 "#####2222#######.............#",
	 "#.............##.............#",
	 "#.............##.............#",
	 "#.............################",
	 "#.............################",
	 "#............................#",
	 "#...........................##",
	 "#...........................2=",
	 "#...........................2=",
	 "#...........................##",
	 "#............................#",
	 "##############################"],

	 [ // 2nd Level 
	 "##############################",
	 "##############################",
	 "##..........................##",
	 "##.#.##.#####....G........+.##",
	 "##............#.............##",
	 "####.##.#####...............##",
	 "####.##.#####...............##",
	 "####.##.#######.............##",
	 "####.##.....................##",
	 "####g##.#######.............##",
	 "#######.....................##",
	 "####################1111######",
	 "####################1111######",
	 "###.........................##",
	 "###.........................##",
	 "###.............#.#.........##",
	 "###.............#.#.........##",
	 "###.............#.#....Y....##",
	 "##..............#.#.........##",
	 "##.##############.#######.####",
	 "##..........................##",
	 "##.#############222#####222###",
	 "##.##.......................##",
	 "##.##.......................##",
	 "##.##.......................##",
	 "##.##.......................##",
	 "##.##.......................##",
	 "##y##.......................##",
	 "########2222##################",
	 "########====##################"],
];

// splits my strings into separate characters
const parsedLevels = levels.map(
	function (level) {
		return level.map(function (row) {
			return row.split("")
		})
	}
);

// Globals----------------------------------
let mode = "menu";
let levelIndex = 0;
let levelMap = [];

let playerX = 1, playerY = 1;
let boxesGreen = [];
let boxesYellow = [];

let doorGreen = [];
let doorYellow = [];


// Main Menu Loader--------------------------------
function loadMenu() {
	mode = "menu";

	drawMenu();
}

function drawMenu() {
	PS.color(PS.ALL, PS.ALL, 0xEBEBEB); // Clear everything to white
	PS.bgColor(PS.ALL, PS.ALL, 0xEBEBEB);
	PS.bgAlpha(PS.ALL, PS.ALL, 255);
	PS.radius(PS.ALL, PS.ALL, 0);
	PS.glyph(PS.ALL, PS.ALL, 0); // Clear all Text

	PS.statusText("Press Num keys from 1-2 to load a level");

	function textPrinter(x, y, text, glyphColor) {
		for (let i = 0; i < text.length; i += 1) {
		const textCursor = x + i;
		PS.glyph(textCursor, y, text.charCodeAt(i));
		PS.glyphColor(textCursor, y, glyphColor);
		}
	}

	textPrinter(2, 2, "LEVEL SELECT", 0x000000);

	textPrinter(1, 6, "1 = Level 1",   0x0000FF);	
	textPrinter(1, 8, "2 = Level 2",  0x0000FF);
	textPrinter(1,10, "3 = Level 3",	0x0000FF);

	textPrinter(3, 13, "ESC = MENU", 0x555555);
}

// Level Loader--------------------------------
function loadLevel(index) {
	levelIndex = index;
	mode = "play";

	PS.statusText("WASD = move|ESC = Main Menu|R = Restart");
  
	doorGreen = [];
	doorYellow = [];

	levelMap = parsedLevels[index].map(
		function (row) {
			return row.slice();
		});

	boxesGreen = Array.from({ length: Height }, () => Array(Width).fill(false));
	boxesYellow = Array.from({ length: Height }, () => Array(Width).fill(false));

	for (let y = 0; y < Height; y += 1) {
		for (let x = 0; x < Width; x += 1) {
			const ch = levelMap[y][x];

			if (ch === "1") doorGreen.push({ x, y });
			if (ch === "2") doorYellow.push({ x, y });

			if (ch === "+") {
				playerX = x; playerY = y;
				levelMap[y][x] = ".";
			} else if (ch === "G") {
				boxesGreen[y][x] = true;
				levelMap[y][x] = ".";
			} else if (ch === "Y") {
				boxesYellow[y][x] = true;
				levelMap[y][x] = ".";
			}
		}
	}

	updateDoors();
	draw();
}

// Draw----------------------------------
function draw() {
	//PS.color(PS.ALL, PS.ALL, 0xCAF6FC); //Clear all to light Blue
	PS.glyph(PS.ALL, PS.ALL, 0); // Clear all text

  	for (let y = 0; y < Height; y += 1) {
		for (let x = 0; x < Width; x += 1) {

    		const ch = levelMap[y][x];
			const tile = LEGEND[ch] || LEGEND["."];

			const tileColor = TERRAIN_COLOR[tile.base] ?? TERRAIN_COLOR.floor;
			//PS.color(x, y, tileColor);

			PS.bgColor(x, y, tileColor);
			PS.bgAlpha(x, y, 255);
			PS.radius(x, y, 0);

			if (ch === "g" || ch === "y") {
				PS.color(x, y, TERRAIN_COLOR.floor);
				PS.radius(x, y, 50);
			}
			else {
				PS.color(x, y, tileColor);
			}
			
			//if (boxesGreen[y][x]) PS.color(x, y, ENTITY_COLOR.boxGreen);
      		//if (boxesYellow[y][x]) PS.color(x, y, ENTITY_COLOR.boxYellow);

			if (boxesGreen[y][x]) {
				//PS.glyph(x, y, "●"); //■
				PS.color(x, y, ENTITY_COLOR.boxGreen);
				PS.radius(x, y, 50);
			}
			if (boxesYellow[y][x]) {
				//PS.glyph(x, y, "●");
				PS.color(x, y, ENTITY_COLOR.boxYellow);
				PS.radius(x, y, 50);
			}
		}
	}
	PS.color(playerX, playerY, ENTITY_COLOR.player);
	PS.radius(playerX, playerY, 0);
}

//Helpers and stuff----------------------------------
function playerMove(up, down, left, right) {
	if (mode !== "play") return;

	let dx = 0, dy = 0;
	if (up) dy = -1;
	else if (down) dy = 1;
	else if (left) dx = -1;
	else if (right) dx = 1;

	const nx = playerX + dx;
	const ny = playerY + dy;

	if (isSolid(nx, ny)) return;

	// If there's a box, try to push it
	if (hasBox(nx, ny)) {
		const bx = nx + dx;
		const by = ny + dy;

		if (isSolid(bx, by) || hasBox(bx, by)) return;

		// move whichever box is there
		if (boxesGreen[ny][nx]) { boxesGreen[ny][nx] = false; boxesGreen[by][bx] = true; }
		else if (boxesYellow[ny][nx]) { boxesYellow[ny][nx] = false; boxesYellow[by][bx] = true; }
	}

	playerX = nx;
	playerY = ny;

	updateDoors();
  	draw();
	checkObjectiveAndAdvance();
}

function updateDoors() {
	let greenPressed = false;
	let yellowPressed = false;

	// checkss if matching box sits on it:
	for (let y = 0; y < Height; y += 1) {
		for (let x = 0; x < Width; x += 1) {
		if (levelMap[y][x] === "g" && boxesGreen[y][x]) greenPressed = true;
		if (levelMap[y][x] === "y" && boxesYellow[y][x]) yellowPressed = true;
		}
	}

  	// open/close correspondig  doors color:
  	for (const d of doorGreen) levelMap[d.y][d.x] = greenPressed ? "." : "1";
  	for (const d of doorYellow) levelMap[d.y][d.x] = yellowPressed ? "." : "2";
}

function checkObjectiveAndAdvance() {
	if (levelMap[playerY][playerX] !== "=") return;

	if (levelIndex >= levels.length - 1) {
		loadMenu();
		return;
	}

	loadLevel(levelIndex + 1);
}

function inBounds(x, y) {
  	return x >= 0 && x < Width && y >= 0 && y < Height;
}

function isSolid(x, y) {
	if (!inBounds(x, y)) {
		return true;
	} 

  const tile = LEGEND[levelMap[y][x]] || LEGEND["#"];
  	return tile.solid === true;
}

function hasBox(x, y) {
  	return boxesGreen[y][x] || boxesYellow[y][x];
}


// PERLENSPIEL FUNCTIONs  -------------------------------------
PS.init = function( system, options ) {
	// PS.debug( "PS.init() called\n" );

	PS.gridSize(Width, Height);
	PS.border(PS.ALL, PS.ALL, 0); //Removes the grid

	loadMenu();
};

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	// Uncomment the following code line
	// to inspect x/y parameters:

	// PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	// Add code here for mouse clicks/touches
	// over a bead.
};

/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	if (mode === "menu") {
		if (key == 49) {
			loadLevel(0);
		} else if (key == 50) {
			loadLevel(1);
		} else if (key == 51) {
			loadLevel(2);
		}

	} else if (mode === "play") {
		if (key == PS.KEY_ESCAPE) {
			loadMenu();
		} 
		
		if (key == 114 || key == 82) {
			loadLevel(levelIndex);
		}

		if (key == 119 || key == 87) { // W key
			playerMove(true, false, false, false);
		} if (key == 115 || key == 83) { // S key
			playerMove(false, true, false, false);
		} if (key == 97 || key == 65) { // A key
			playerMove(false, false, true, false);
		} if (key == 100 || key == 68) { // D key
			playerMove(false, false, false, true);
		}
	}

};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};

