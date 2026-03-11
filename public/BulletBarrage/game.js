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

// Grid Size--------------------------------
const Height = 30, Width = 30;

// Game Info--------------------------------
// (Later you can swap colors for glyphs/sprites to match your metaphor.)
const COLORS = {
	bg: 0x111111,
	hud: 0x2A2A2A,

	player: 0x1E90FF,
	bullet: 0xF2F2F2,

	invader: 0x19E354, // Old Color: 0xFF5050,
	enemyBullet: 0xFF5050,

	text: 0xFFFFFF,
	textDim: 0xAAAAAA,
};

// Formation Info--------------------------------
const INV_ROWS = 4;
const INV_COLS = 10;
const INV_SPACING_X = 2;
const INV_SPACING_Y = 2;
const INV_START_X = 5;
const INV_START_Y = 4;

const HUD_Y = 0;
const TOP_MARGIN = 2;
const PLAYER_Y = Height - 2;

// Shooting info--------------------------------
const SHOT_COOLDOWN_TICKS = 4;
const BULLET_LIMIT = 10;

// Enemy shooting info--------------------------------
const ENEMY_SHOT_CHANCE = 25;
const ENEMY_BULLET_LIMIT = 6;

// Timing Info--------------------------------
const TICK_RATE = 6;        // timer ticks/sec-ish
const INV_MOVE_EVERY = 3;   // invaders move every N ticks (lower = faster)
const INV_DROP = 1;         // drop when hitting wall

// Globals----------------------------------
let mode = "menu"; // menu | play | win | lose
let timerId = null;
let tickCount = 0;
let shotCooldown = 0;

// Player
let playerX = Math.floor(Width / 2);
let bullets = []; // {x, y}

// Invaders
let invaders = []; // {x, y, alive}
let invDir = 1;    // 1 right AND -1 left
let enemyBullets = []; // {x, y}


// Main Menu Loader--------------------------------
function loadMenu() {
	mode = "menu";
	stopTimer();
	drawMenu();
}

function drawMenu() {
	// Clear
	PS.color(PS.ALL, PS.ALL, COLORS.bg);
	PS.bgColor(PS.ALL, PS.ALL, COLORS.bg);
	PS.bgAlpha(PS.ALL, PS.ALL, 255);
	PS.radius(PS.ALL, PS.ALL, 0);
	PS.glyph(PS.ALL, PS.ALL, 0);

	// Title bead art (simple little "invader" stripe)
	for (let x = 8; x <= 21; x += 1) PS.color(x, 10, 0x222222);
	PS.color(10, 10, COLORS.invader);
	PS.color(11, 10, COLORS.invader);
	PS.color(13, 10, COLORS.invader);
	PS.color(14, 10, COLORS.invader);
	PS.color(16, 10, COLORS.invader);
	PS.color(17, 10, COLORS.invader);
	PS.color(19, 10, COLORS.invader);
	PS.color(20, 10, COLORS.invader);

	// Text
	textPrinter(8, 6, "Bullet Barrage", COLORS.text);
	textPrinter(8, 16, "PRESS ANY KEY", COLORS.textDim);
	textPrinter(8, 17, "TO START GAME", COLORS.textDim);

	// Control Icons: ◀ ▶ + "SPACE"
	PS.glyph(11, 20, 0x25C0); PS.glyphColor(11, 20, COLORS.text); // ◀
	PS.glyph(13, 20, 0x25B6); PS.glyphColor(13, 20, COLORS.text); // ▶
	textPrinter(15, 20, "SPACE", COLORS.text);

	PS.statusText("Bullet Barrage");
}


// Game Loader--------------------------------
function loadGame() {
	mode = "play";
	clearGrid();

	tickCount = 0;
	playerX = Math.floor(Width / 2);
	bullets = [];
	shotCooldown = 0;

	// build invaders
	invaders = [];
	invDir = 1;
	enemyBullets = [];

	for (let r = 0; r < INV_ROWS; r += 1) {
		for (let c = 0; c < INV_COLS; c += 1) {
			invaders.push({
				x: INV_START_X + c * INV_SPACING_X,
				y: INV_START_Y + r * INV_SPACING_Y,
				alive: true
			});
		}
	}

	startTimer();
	draw();
}


// Draw----------------------------------
function draw() {
	// Background
	PS.color(PS.ALL, PS.ALL, COLORS.bg);
	PS.glyph(PS.ALL, PS.ALL, 0);
	PS.radius(PS.ALL, PS.ALL, 0);

	// HUD row
	for (let x = 0; x < Width; x += 1) {
		PS.color(x, HUD_Y, COLORS.hud);
	}

	// Invaders
	for (const inv of invaders) {
		if (inv.alive) {
			PS.color(inv.x, inv.y, COLORS.invader);
		}
	}

	// Enemy Bullets
	for (const eb of enemyBullets) {
		PS.color(eb.x, eb.y, COLORS.bg); // keep the background
		PS.glyph(eb.x, eb.y, 0x25BC);     // ▼  (note: 0x035E)
		PS.glyphColor(eb.x, eb.y, COLORS.enemyBullet);
	}

	// Bullets
	for (const b of bullets) { //if (bullet) {PS.color(bullet.x, bullet.y, COLORS.bullet);}
		PS.color(b.x, b.y, COLORS.bg); // keeps background
		PS.glyph(b.x, b.y, 0x25B2);    // ▲  (note: 0x23E4)
		PS.glyphColor(b.x, b.y, COLORS.bullet);
	}

	// Player
	PS.color(playerX, PLAYER_Y, COLORS.player);

	PS.statusText("Invaders");
}


// Helpers and stuff.. ----------------------------------
function textPrinter(x, y, text, glyphColor) {
	for (let i = 0; i < text.length; i += 1) {
		const cx = x + i;
		if (cx >= 0 && cx < Width) {
			PS.glyph(cx, y, text.charCodeAt(i));
			PS.glyphColor(cx, y, glyphColor);
		}
	}
}

function clearGrid() {
	PS.color(PS.ALL, PS.ALL, COLORS.bg);
	PS.bgColor(PS.ALL, PS.ALL, COLORS.bg);
	PS.bgAlpha(PS.ALL, PS.ALL, 255);
	PS.radius(PS.ALL, PS.ALL, 0);
	PS.glyph(PS.ALL, PS.ALL, 0);
	PS.border(PS.ALL, PS.ALL, 0);
}

function stopTimer() {
	if (timerId !== null) {
		PS.timerStop(timerId);
		timerId = null;
	}
}

function startTimer() {
	stopTimer();
	timerId = PS.timerStart(TICK_RATE, gameTick);
}

function aliveInvadersCount() {
	let n = 0;
	for (const inv of invaders) {
		if (inv.alive) n += 1;
	}
	return n;
}

function invadersEdgeHit(nextDx) {
	for (const inv of invaders) {
		if (!inv.alive) continue;
		const nx = inv.x + nextDx;
		if (nx <= 0 || nx >= Width - 1) return true;
	}
	return false;
}

function invadersReachedPlayer() {
	for (const inv of invaders) {
		if (!inv.alive) continue;
		if (inv.y >= PLAYER_Y) return true;
	}
	return false;
}

function moveInvaders() {
	const dx = invDir;

	if (invadersEdgeHit(dx)) {
		// drop and reverse
		for (const inv of invaders) {
			if (inv.alive) inv.y += INV_DROP;
		}
		invDir *= -1;
	} else {
		// normal sweep
		for (const inv of invaders) {
			if (inv.alive) inv.x += dx;
		}
	}
}

function moveBulletsAndCollide() {
	if (bullets.length === 0) return;

	// loop backwards so we can safely remove bullets
	for (let i = bullets.length - 1; i >= 0; i -= 1) {
		const b = bullets[i];

		b.y -= 1; // move up

		// offscreen
		if (b.y <= TOP_MARGIN - 1) {
			bullets.splice(i, 1);
			continue;
		}

		// collision with invader
		for (const inv of invaders) {
			if (!inv.alive) continue;

			if (inv.x === b.x && inv.y === b.y) {
				inv.alive = false;
				bullets.splice(i, 1);
				PS.audioPlay("fx_scratch", { volume: 0.2 });
				break; // bullet removed stop checking this bullet 
			}
		}
	}
}

function moveEnemyBulletsAndCollide() {
	if (enemyBullets.length === 0) return;

	for (let i = enemyBullets.length - 1; i >= 0; i -= 1) {
		const b = enemyBullets[i];

		b.y += 1; // move down

		// offscreen
		if (b.y >= Height) {
			enemyBullets.splice(i, 1);
			continue;
		}

		// hit player
		if (b.x === playerX && b.y === PLAYER_Y) {
			enemyBullets.splice(i, 1);
			endGame(false);
			return;
		}
	}
}

function enemyShooting() {
	if (enemyBullets.length >= ENEMY_BULLET_LIMIT) return;

	if (PS.random(ENEMY_SHOT_CHANCE) !== 1) return;

	// Collect alive invaders
	const alive = [];
	for (const inv of invaders) {
		if (inv.alive) alive.push(inv);
	}
	if (alive.length === 0) return;

	// Pick an random invader (alive)
	const shooter = alive[PS.random(alive.length) - 1];

	// Spawn bullet below enemy
	enemyBullets.push({ x: shooter.x, y: shooter.y + 1 });

	PS.audioPlay("fx_click", { volume: 0.12 });
}

function gameTick() {
	if (mode !== "play") return;

	tickCount += 1;
	if (shotCooldown > 0) shotCooldown -= 1;

	// bullets updates every tick
	moveBulletsAndCollide();
	enemyShooting();
	moveEnemyBulletsAndCollide();

	// invaders update slower
	if (tickCount % INV_MOVE_EVERY === 0) {
		moveInvaders();

		if (invadersReachedPlayer()) {
			draw();
			endGame(false);
			return;
		}
	}

	// win
	if (aliveInvadersCount() === 0) {
		draw();
		endGame(true);
		return;
	}

	draw();
}

function endGame(won) {
	stopTimer();
	mode = won ? "win" : "lose";

	// Overlay message (still self-contained on grid)
	const msg = won ? "YOU WIN" : "YOU LOSE";
	textPrinter(11, 14, msg, COLORS.text);
	textPrinter(10, 16, "R = RESTART", COLORS.textDim);
	textPrinter(10, 18, "ESC = MENU", COLORS.textDim);

	PS.statusText(won ? "Cleared!" : "Overrun!");
}

function playerMove(left, right) {
	if (mode !== "play") return;

	let dx = 0;
	if (left) dx = -1;
	else if (right) dx = 1;

	const nx = playerX + dx;
	if (nx < 1 || nx > Width - 2) return;

	playerX = nx;
	draw();
}

function playerShoot() {
	if (mode !== "play") return;
	if (bullets.length >= BULLET_LIMIT) return;  //limiting the bullets to prevent spamming
	if (shotCooldown > 0) return;

	bullets.push({ x: playerX, y: PLAYER_Y - 1 });
	shotCooldown = SHOT_COOLDOWN_TICKS;
	PS.audioPlay("fx_click", { volume: 0.2 });
}



// PERLENSPIEL FUNCTIONs  -------------------------------------
PS.init = function( system, options ) {
	// PS.debug( "PS.init() called\n" );

	PS.gridSize(Width, Height);
	PS.border(PS.ALL, PS.ALL, 0);

	PS.audioLoad("fx_scratch");
	PS.audioLoad("fx_click");

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
		// any key starts
		loadGame();
		return;
	}

	// ESC always returns to menu
	if (key === PS.KEY_ESCAPE) {
		loadMenu();
		return;
	}

	if (mode === "win" || mode === "lose") {
		// R restart
		if (key === 114 || key === 82) {
			loadGame();
		}
		return;
	}

	if (mode === "play") {
		// A/D keys for movement (and arrow Keys)
		if (key === 97 || key === 65 || key === PS.KEY_ARROW_LEFT) { // A or Left Arrow
			playerMove(true, false);
		}
		if (key === 100 || key === 68 || key === PS.KEY_ARROW_RIGHT) { // D or Right arrow
			playerMove(false, true);
		}

		// Space to shoot
		if (key === 32) {
			playerShoot();
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

