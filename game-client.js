//////////////
// index.js //
//////////////
var running = false;
var speed = 512;
var aliens = [];
var missiles = [];
var ship = [];

document.getElementById('start').addEventListener('click', function () {
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
var currentLevel = 0;
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

//////////////////
// client logic //
//////////////////

//socket connection
const socket = new WebSocket('ws://localhost:8082');

socket.onopen = function (event) {
	console.log("Websocket connection established.");
}

socket.onmessage = function (event) {
	//console.log(event.data);
	var data = JSON.parse(event.data);
	switch (data.type) {
		case 'update':
			updateStats(data);
			break;
	}
}

function sendJSON(json) {
	socket.send(JSON.stringify(json));
}

//key press listening
document.addEventListener('keydown', (e) => {
	e = e || window.event;
	switch (e.keyCode) {
		//move left
		case KEY_LEFT:
		case KEY_J:
		//move right
		case KEY_RIGHT:
		case KEY_L:
		//shoot
		case KEY_SPACE:
			sendJSON({
				type: 'keypress',
				key: e.keyCode,
			});
	}
	debug && console.log("Keyboard key pressed.");
});

//game loop
function gameLoop() {
	//init game on server
	sendJSON({
		type: 'game',
		value: 'start',
	});

	//start client loop
	var loop2 = setInterval(function () {
		//update data from server
		sendJSON({
			type: 'game',
			value: 'update',
		});

		//draw
		drawSpace();
		drawAliens();
		drawMissiles();
		drawShip();
	}, speed / 2);
}

// on reset button click
function resetGame() {
	//stop game on server
	sendJSON({
		type: 'game',
		value: 'reset',
	});

	running = false
	for (var i = 0; i < 1000; i++) {
		window.clearInterval(i);
	}
	infoUpdater();

	//remove data
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

function updateStats(data) {
	ship = data.ship;
	aliens = data.aliens;
	missiles = data.missiles;
	currentLevel = data.level;
	score = data.score;
}