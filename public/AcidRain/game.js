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

const Width = 16, Height = 16;

//Levels --------------------------------------------
const LEGEND = {
	"#": {base: "wallGray", color: 0x777777},
	".": {base: "empty"},
	"G": {base: "wallGreen", color: 0x3B6318},
	"B": {base: "wallBrown", color: 0x7D4B29}, 
	"L": {base: "wallVeryLightGray", color: 0xFFFFFF},//White: 0xFFFFFF  Gray: 0xDBD9D9
	"Y": {base: "wallYellow", color: 0xE5E827},
}

const levels = [

	[ // 1st Level (Standard Floor)
	 "................", 
	 "................",
	 "................",
	 "................",
	 "................",
	 "................",
	 "................",
	 "................", //middle
	 "................",
	 "................",
	 "################",
	 "################",
	 "################",
	 "################",
	 "################",
	 "################"],

	[ // 2nd Level (Tree)
	 "................", 
	 "................",
	 "................",
	 "................",
	 "......GGG.......",
	 ".....GGGGGG.....",
	 "....GGGGGGGG....",
	 "....GGGGGGGG....",  //middle
	 "....GGGBGGGG....",
	 ".....GGGBG......",
	 "......BBBB......",
	 "......BBBB......",
	 "......BBBB......",
	 "......BBBB......",
	 "......BBBB......",
	 "......BBBB......"],
	
	[ // 3rd Level (Mountain)
	 "................",
	 "...YY...........",
	 "..YYYY..........",
	 "..YYYY..........",
	 "...YY...........",
	 "........LL......", 
	 ".......LLLL.....",
	 "......LLLLLL....", //middle
	 ".....#LLL#L#L...",
	 "...#L#L##L###L..",
	 "..#############.",
	 ".##############.",
	 "################",
	 "################",
	 "################",
	 "################"],
];

// splits my strings into separate characters
const parsedLevels = levels.map(
	function (level) {
		return level.map(function (row) {
			return row.split("")
		})
	}
);

let mode = "menu";
let levelIndex = 0;

// Main Menu Loader--------------------------------
function loadMenu() {
	mode = "menu";

	raining = false;
	drops = [];
	spawnWait = 0;

	drawMenu();
}

function drawMenu() {
  PS.color(PS.ALL, PS.ALL, 0xEBEBEB); // Clear everything to white
  PS.glyph(PS.ALL, PS.ALL, 0); // Clear all Text

  PS.statusText("Press Num keys from 1-3 to load a level");

  function textPrinter(x, y, text, glyphColor) {
    for (let i = 0; i < text.length; i += 1) {
      const textCursor = x + i;
      PS.glyph(textCursor, y, text.charCodeAt(i));
      PS.glyphColor(textCursor, y, glyphColor);
    }
  }

  textPrinter(2, 2, "LEVEL SELECT", 0x000000);

  textPrinter(1, 6, "1 = FLOOR",   0x0000FF);	
  textPrinter(1, 8, "2 = TREE",    0x0000FF);
  textPrinter(1,10, "3 = MOUNTAIN",0x0000FF);

  textPrinter(3, 13, "ESC = MENU", 0x555555);
}

// Level Loader--------------------------------
function loadLevel(levelIndex) {

  mode = "play";

  raining = false;
  drops = [];
  spawnWait = 0;

  levelMap = parsedLevels[levelIndex].map(
	function (row) {
		return row.slice();
	});

  draw();
}

let raining = false, rainX = 0, rainY = 0, drops = [], spawnWait = 0;
let levelMap = [];

function destructible(ch) {
	return ch !== ".";
}

function setTile(x, y, ch) {
	levelMap[y][x] = ch;
}

// Draw----------------------------------
function draw() {
	PS.color(PS.ALL, PS.ALL, 0xCAF6FC); //Clear all to light Blue
	PS.glyph(PS.ALL, PS.ALL, 0); // Clear all text

  	for (let y = 0; y < Height; y += 1) {
		for (let x = 0; x < Width; x += 1) {
    		const ch = levelMap[y][x];
			const tile = LEGEND[ch];

			if (tile.color !== undefined)
				PS.color(x, y, tile.color);
		}
	}

	for (const p of drops) {
		PS.color(p.x, p.y, 0x0DDE00); // color Acid Rain
	}
}

// Tick----------------------------------
function tick() {
	if (mode !== "play") {
		return;
	}

	//only applies delay when it is raining
  	if (raining) {
    	if (spawnWait-- <= 0) { 
			drops.push({ x: rainX, y: rainY }); 
			spawnWait = 2; 
		}
  	} else spawnWait = 0;

  	for (let i = drops.length - 1; i >= 0; i -= 1) {
    	const p = drops[i];
		const nextYPosition = p.y + 1;
		
    	if (nextYPosition >= Height) { 
			drops.splice(i, 1); 
			continue; 
		}

		//collisoon checker and "destroyer"
		const belowDrop = levelMap[nextYPosition][p.x];
    	if (destructible(belowDrop)) {
			setTile(p.x, nextYPosition, ".");
			drops.splice(i, 1); 
			continue; 
		}

    	p.y = nextYPosition;
  	}

	draw();
}

//------------------------------------------------------------------------------------


//Perlenspiel Functions----------------------------------
PS.init = function( system, options ) {

	//PS.debug( "TEST PS.init() called\n" );

	PS.gridSize(Width, Height);

	PS.border(PS.ALL, PS.ALL, 0); //Removes the grid


	PS.statusText( "Game" );

	PS.timerStart(2, tick);
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

	//PS.debug( "PS.touch() @ " + x + ", " + y + "\n" );

	if (mode !== "play") {
		return;
	}

	raining = true;
	rainX = x;
	rainY = y;

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

	//PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	raining = false;

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

	//PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	rainX = x;
	rainY = y;

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

	//PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

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

	//PS.debug( "PS.exitGrid() called\n" );

	raining = false;

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

	//PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// "ESC" --> return to menu
	if (key === PS.KEY_ESCAPE || key === 27) {
		loadMenu();
		return;
	}

	if (mode !== "menu") {
		return;
	} else if (key >= 49 && key <= 57) {
		const index = key - 49; // '1'->0, '2'->1, etc.
		
		if (index >= 0 && index < levels.length) {
		loadLevel(index);
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

	//PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

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

