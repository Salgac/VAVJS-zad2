//////////////
// index.js //
//////////////

function initSpace() {
	var space = document.getElementById('space').querySelector('table');
	space.innerHTML = '';
	var p = 0;
	for (var i = 0; i < 11; i++) {
		var tr = document.createElement('tr');
		for (var j = 0; j < 11; j++) {
			var td = document.createElement('td');
			td.id = 'p' + p;
			td.innerHTML = p;
			tr.appendChild(td);
			p++;
		}
		space.appendChild(tr);
	}
}
initSpace();

function drawSpace() {
	var i = 0;
	for (i = 0; i < 99; i++) {
		document.getElementById('p' + i).style.background = '#202020';
	}
}

var aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
function drawAliens() {
	var i = 0;
	for (i = 0; i < aliens.length; i++) {
		document.querySelector('#p' + aliens[i]).style.background = 'green';
	}
}

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

var ship = [104, 114, 115, 116];
function drawShip() {
	var i = 0;
	for (i = 99; i < 121; i++) {
		document.getElementById('p' + i).style.background = '#202020';
	}
	for (i = 0; i < ship.length; i++) {
		document.getElementById('p' + ship[i]).style.background = 'white';
	}
}

var missiles = [];
function drawMissiles() {
	var i = 0;
	var list = [];
	for (i = 0; i < missiles.length; i++) {
		list.push('#p' + missiles[i]);
	}
	document.getElementById('cssmissile').innerHTML = list.join(',') + '{background: red !important;}';
}

function moveMissiles() {
	var i = 0;
	for (i = 0; i < missiles.length; i++) {
		missiles[i] -= 11;
		if (missiles[i] < 0) missiles.splice(i, 1);
	}
}


function checkKey(e) {
	e = e || window.event;
	if (e.keyCode == '37') {
		if (ship[0] > 100) {
			var i = 0;
			for (i = 0; i < ship.length; i++) {
				ship[i]--;
			}
		}
	}
	else if (e.keyCode == '39' && ship[0] < 108) {
		var i = 0;
		for (i = 0; i < ship.length; i++) {
			ship[i]++;
		}
	}
	else if (e.keyCode == '32') {
		missiles.push(ship[0] - 11);
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

function loose() {
	var i = 0;
	for (i = 0; i < 121; i++) {
		document.getElementById('p' + i).style.background = 'red';
	}
	running = false;
}

function win() {
	var i = 0;
	for (i = 0; i < 121; i++) {
		document.getElementById('p' + i).style.background = 'green';
	}
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
function gameLoop() {
	console.log('gameloop');

	running = true;
	document.addEventListener('keydown', checkKey);

	var a = 0;
	var loop1 = setInterval(function () {
		moveAliens();
		moveMissiles();
		checkCollisionsMA();
		if (a % 4 == 3) lowerAliens();
		if (RaketaKolidujeSVotrelcom()) {
			clearInterval(loop2);
			clearInterval(loop1);
			document.removeEventListener('keydown', checkKey);
			missiles = [];
			drawMissiles();
			loose();
		}
		a++;
	}, speed);
	var loop2 = setInterval(function () {
		drawSpace();
		drawAliens();
		drawMissiles();
		drawShip();
		if (aliens.length === 0) {
			clearInterval(loop2);
			clearInterval(loop1);
			document.removeEventListener('keydown', checkKey);
			missiles = [];
			drawMissiles();
			win();
			setTimeout(function () {
				nextLevel();
			}, 1000);
		}
	}, speed / 2);
}

document.getElementById('start').addEventListener('keydown', function (e) {
	e.preventDefault();
	e.stopPropagation();
});
document.getElementById('start').addEventListener('click', function () {
	/*
	*/
	if (!running) gameLoop();
});

////////////
// mod.js //
////////////


const PIXEL_COUNT = 11
const PIXEL_SIZE = 42

const canvas = document.createElement("canvas")
var ctx = canvas.getContext("2d")

const reset = document.createElement("button")
const scoreInfo = document.createElement("h4")
const levelInfo = document.createElement("h4")
const music = document.createElement("button")
const space = document.getElementById("space")

//key codes
const KEY_LEFT = 37
const KEY_RIGHT = 39
const KEY_J = 74
const KEY_L = 76
const KEY_SPACE = 32

//debugger
var debug = false

//music
var musicPlaying = false
const musicUrl = "https://www.dropbox.com/s/9y42z48bjk16g2a/Asteroids_loop.mp3?dl=1"
var musicPlayer

//images
const shipUrl = "https://www.dropbox.com/s/wyqs469puxc7vqy/ship.png?dl=1"
const alienUrl = "https://www.dropbox.com/s/9og7y8fargf4280/alien.png?dl=1"
const missileUrl = "https://www.dropbox.com/s/xxn8fev3bshhchw/missile.png?dl=1"

const shipImg = new Image()
shipImg.src = shipUrl
const alienImg = new Image()
alienImg.src = alienUrl
const missileImg = new Image()
missileImg.src = missileUrl

//score and level
var currentLevel = level;
var score = 0
const SCORE_MULTIPLIER = 10

initCanvas()

// canvas initiation function
function initCanvas() {
	//append canvas
	canvas.width = canvas.height = PIXEL_COUNT * PIXEL_SIZE
	space.appendChild(canvas)
	fillBackground("#202020")

	//add reset button
	reset.innerHTML = "Reset"
	reset.addEventListener("click", resetGame)
	document.body.appendChild(reset)

	//add music button
	musicPlayer = new Audio(musicUrl)
	music.innerHTML = "Music"
	music.addEventListener("click", playMusic)
	document.body.appendChild(music)

	//add score and level info
	space.appendChild(scoreInfo)
	space.appendChild(levelInfo)
	infoUpdater()

	//setup debugging
	if (window.location.search == '?debug') {
		debug = true
		console.log("Debugging mode turned ON.")
	}

	//remove table
	var table = document.getElementsByTagName("table")[0]
	table.remove()
}

// function called on reset button click
function resetGame() {
	//stop game
	running = false
	for (var i = 0; i < 1000; i++) {
		window.clearInterval(i);
	}
	infoUpdater();

	//remove data
	document.removeEventListener('keydown', checkKey);
	drawSpace();

	//set original values
	aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
	direction = 1;
	ship = [104, 114, 115, 116];
	missiles = [];
	level = 1;
	currentLevel = 1;
	speed = 512;
	score = 0;

	debug && console.log("Game reset.");
}

// 
function infoUpdater() {
	setInterval(function () {
		scoreInfo.innerHTML = "Score: " + score;
		levelInfo.innerHTML = "Level: " + currentLevel;
	}, 1000)
}

// function called on music button click
function playMusic() {
	if (musicPlaying) {
		musicPlayer.pause()
		musicPlaying = false
		debug && console.log("Music is now turned OFF.");
	} else {
		musicPlayer.play()
		musicPlaying = true
		debug && console.log("Music is now turned ON.");
	}
}

// draw on background function
function fillBackground(backgroundColor) {
	for (var i = 0; i < PIXEL_COUNT; i++) {
		for (var j = 0; j < PIXEL_COUNT; j++) {
			ctx.fillStyle = backgroundColor
			ctx.strokeStyle = "black"

			//rectangle
			ctx.beginPath()
			ctx.rect(i * PIXEL_SIZE, j * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE)
			ctx.fill()
			ctx.stroke()
		}
	}
	textBackground()
}

function textBackground() {
	for (var i = 0; i < PIXEL_COUNT; i++) {
		for (var j = 0; j < PIXEL_COUNT; j++) {
			//text
			ctx.font = "16.5px Times New Roman"
			ctx.textAlign = "center"
			ctx.fillStyle = "white"
			ctx.fillText(i + j * PIXEL_COUNT, i * PIXEL_SIZE + PIXEL_SIZE / 2, j * PIXEL_SIZE + PIXEL_SIZE / 2 + 5)
		}
	}

}

function fillAt(image, field) {
	//get coords
	var x = field % PIXEL_COUNT
	var y = Math.floor(field / PIXEL_COUNT)

	//image
	ctx.drawImage(image, x * PIXEL_SIZE, y * PIXEL_SIZE)
}

// checkCollisionsMA override
var checkMA = checkCollisionsMA
checkCollisionsMA = function () {
	//get number of aliens shot
	var alienCount = aliens.length
	checkMA();
	var casualties = alienCount - aliens.length

	if (casualties != 0) {
		score += casualties * SCORE_MULTIPLIER
		debug && console.log("Aliens shot: " + casualties);
	}
}

// checkKey function override
checkKey = function (e) {
	e = e || window.event;
	switch (e.keyCode) {
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
	debug && console.log("Keyboard key pressed.");
}

// loose override
loose = function () {
	fillBackground("red")
	running = false
}

// win override
win = function () {
	fillBackground("green")
	currentLevel++;
}

// drawSpace override
drawSpace = function () {
	fillBackground("#202020")
}

// drawAliens override
drawAliens = function () {
	for (var i = 0; i < aliens.length; i++) {
		fillAt(alienImg, aliens[i])
	}
}

// drawMissiles override
drawMissiles = function () {
	for (var i = 0; i < missiles.length; i++) {
		fillAt(missileImg, missiles[i])
	}
}

// drawShit override
drawShip = function () {
	for (var i = 0; i < ship.length; i++) {
		fillAt(shipImg, ship[i])
	}
	textBackground()
}