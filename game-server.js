//////////////
// index.js //
//////////////

var aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
var ship = [104, 114, 115, 116];
var missiles = [];

var direction = 1;
function moveAliens() {
	var i = 0;
	for (i = 0; i < aliens.length; i++) {
		aliens[i] = aliens[i] + direction;
	}
	direction *= -1;
}
function lowerAliens() {
	var i = 0;
	for (i = 0; i < aliens.length; i++) {
		aliens[i] += 11;
	}
}

function moveMissiles() {
	var i = 0;
	for (i = 0; i < missiles.length; i++) {
		missiles[i] -= 11;
		if (missiles[i] < 0) missiles.splice(i, 1);
	}
}

function checkCollisionsMA() {
	for (var i = 0; i < missiles.length; i++) {
		if (aliens.includes(missiles[i])) {
			var alienIndex = aliens.indexOf(missiles[i]);
			aliens.splice(alienIndex, 1);
			missiles.splice(i, 1);
		}
	}
}

function RaketaKolidujeSVotrelcom() {
	for (var i = 0; i < aliens.length; i++) {
		if (aliens[i] > 98) {
			return true;
		}
	}
	return false;
}

var level = 1;
var speed = 512;
function nextLevel() {
	level++;
	console.log('level: ' + level);
	if (level == 1) aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
	if (level == 2) aliens = [1, 3, 5, 7, 9, 13, 15, 17, 19, 23, 25, 27, 29, 31];
	if (level == 3) aliens = [1, 5, 9, 23, 27, 31];
	if (level == 4) aliens = [45, 53];
	if (level > 4) {
		level = 1;
		aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
		speed = speed / 2;
	}
	gameLoop();
}

var running = false;
var loop;
var event = '';
function gameLoop() {
	console.log('gameloop');

	running = true;
	event = '';

	var a = 0;
	loop = setInterval(function () {
		moveAliens();
		moveMissiles();
		checkCollisionsMA();
		if (a % 4 == 3) lowerAliens();
		if (RaketaKolidujeSVotrelcom()) {
			clearInterval(loop);
			missiles = [];
			running = false;
			event = 'loose';
		}
		if (aliens.length === 0) {
			clearInterval(loop);
			missiles = [];
			event = 'win';
			setTimeout(function () {
				nextLevel();
			}, 1000);
		}
		a++;
	}, speed);
}

////////////
// mod.js //
////////////

//key codes
const KEY_LEFT = 37
const KEY_RIGHT = 39
const KEY_J = 74
const KEY_L = 76
const KEY_SPACE = 32

//score and level
var currentLevel = level;
var score = 0
const SCORE_MULTIPLIER = 10

// checkCollisionsMA override
var checkMA = checkCollisionsMA
checkCollisionsMA = function () {
	//get number of aliens shot
	var alienCount = aliens.length
	checkMA();
	var casualties = alienCount - aliens.length

	if (casualties != 0) {
		score += casualties * SCORE_MULTIPLIER
	}
}

// on reset button click
function resetGame() {
	//stop game
	running = false
	clearInterval(loop);

	//set original values
	aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
	direction = 1;
	ship = [104, 114, 115, 116];
	missiles = [];
	level = 1;
	currentLevel = 1;
	speed = 512;
	score = 0;

	console.log("Game reset.");
}

//////////////////
// server logic //
//////////////////

handleKeyEvent = function (keyCode) {
	//console.log(keyCode);
	if (!running) return;
	switch (keyCode) {
		//move left
		case KEY_LEFT:
		case KEY_J:
			if (ship[0] > 100) {
				var i = 0;
				for (i = 0; i < ship.length; i++) {
					ship[i]--;
				}
			}
			break;
		//move right
		case KEY_RIGHT:
		case KEY_L:
			if (ship[0] < 108) {
				var i = 0;
				for (i = 0; i < ship.length; i++) {
					ship[i]++;
				}
			}
			break;
		//shoot
		case KEY_SPACE:
			missiles.push(ship[0] - 11);
			break;
	}
}

//exports
module.exports = {
	handleKeyEvent: function (keyCode) { handleKeyEvent(keyCode) },
	startGame: function () { resetGame(); gameLoop() },
	resetGame: function () { resetGame() },
	getData: function () {
		return {
			type: 'update',
			ship: ship,
			aliens: aliens,
			missiles: missiles,
			level: currentLevel,
			score: score,
			special: event,
		}
	},
}
