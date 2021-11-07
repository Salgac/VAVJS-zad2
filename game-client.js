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

const header = document.getElementsByTagName('h1')[0];

const reset = document.createElement("button")
const scoreInfo = document.createElement("h4")
const music = document.createElement("button")
const space = document.getElementById("space")
const highscoreInfo = document.createElement("h4")
const globalHighscoreInfo = document.createElement("h4")

const keyLeft = document.createElement("button")
const keyRight = document.createElement("button")
const keyShoot = document.createElement("button")

const promptDiv = document.createElement("div");
const promptHeader = document.createElement("h3");

const adminDiv = document.createElement("div");

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
var highScore = localStorage.getItem('highscore');
highScore == null ? highScore = 0 : highScore;
var globalHighScore = { score: 0, level: 0 };
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

	//add key buttons
	keyLeft.innerHTML = "<-";
	keyRight.innerHTML = "->";
	keyShoot.innerHTML = "Shoot!";

	space.appendChild(document.createElement('br'));
	space.appendChild(keyLeft);
	space.appendChild(keyRight);
	space.appendChild(keyShoot);

	//add score and level info
	space.appendChild(scoreInfo)
	space.appendChild(highscoreInfo)
	space.appendChild(globalHighscoreInfo)
	infoUpdater()

	//add login/register prompt
	setupPrompt();

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
		scoreInfo.innerHTML = "Score: " + score + ", Level: " + currentLevel;
		highscoreInfo.innerHTML = "Your Highscore: " + highScore;
		globalHighscoreInfo.innerHTML = "Global Highscore: " + globalHighScore.score + ", Level: " + globalHighScore.level;
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

	//stop game
	running = false;
	for (var i = 0; i < 1000; i++) {
		window.clearInterval(i);
	}
	infoUpdater();
}

// win override
win = function () {
	fillBackground("green")
	running = false;
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

var user = '[N/A]';
var isAdmin = false;

//socket connection
const socket = new WebSocket('ws://localhost:8082');
var sessionId;

socket.onopen = function (event) {
	console.log("Websocket connection established.");
}

socket.onmessage = function (event) {
	//console.log(event.data);
	var data = JSON.parse(event.data);
	switch (data.type) {
		case 'session':
			sessionId = data.session;
			globalHighScore = data.highScore;
			break;
		case 'sessionList':
			sessionList = data.list;
			regenerateSessionView();
			break;
		case 'update':
			updateStats(data);
			break;
		case 'reset':
			resetGame();
			break;
		case 'auth':
			switch (data.value) {
				case 'login':
					onLogin(data.data);
					break;
				case 'error':
					alert(`Auth error. Reason: ${data.reason}`);
					break;
			}
			break;
		case 'score':
			globalHighScore = data.highScore;
			break;
		case 'admin':
			if (!isAdmin)
				addAdminTable();
			updateAdminTable(data.data);
			break;
	}
}

function sendJSON(json) {
	json.session = sessionId;
	json.user = user;
	socket.send(JSON.stringify(json));
}

function sendKeyPress(keyCode) {
	sendJSON({
		type: 'keypress',
		key: keyCode,
	});
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
			sendKeyPress(e.keyCode);
	}
	debug && console.log("Keyboard key pressed.");
});

keyLeft.addEventListener('click', () => sendKeyPress(KEY_LEFT));
keyRight.addEventListener('click', () => sendKeyPress(KEY_RIGHT));
keyShoot.addEventListener('click', () => sendKeyPress(KEY_SPACE));


function drawGame() {
	drawSpace();
	drawAliens();
	drawMissiles();
	drawShip();
}

//game loop
function gameLoop() {
	//init game on server
	sendJSON({
		type: 'game',
		value: 'start',
	});
	running = true;

	//start client loop
	var loop2 = setInterval(function () {
		//update data from server
		sendJSON({
			type: 'game',
			value: 'update',
		});

		//draw
		if (running) {
			drawGame();
		}
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

	//clear values
	aliens = [];
	ship = [];
	missiles = [];
	level = 1;
	currentLevel = 1;
	speed = 512;
	score = 0;

	regenerateSessionView();

	debug && console.log("Game reset.");
}

function updateStats(data) {
	if (data.special != '') {
		switch (data.special) {
			case 'loose':
				loose();
				setHighscore(data.score, data.level);
				break;
			case 'win':
				win();
				break;
		}
	} else {
		running = true;
	}

	ship = data.ship;
	aliens = data.aliens;
	missiles = data.missiles;
	currentLevel = data.level;
	score = data.score;

	globalHighScore = data.highScore;
}

function setHighscore(score, level) {
	if (score > highScore) {
		highScore = score;
		localStorage.setItem('highscore', highScore);

		//send new score to server
		sendJSON({
			type: 'score',
			highScore: {
				score: score,
				level: level,
			},
		});
	}
}

//sessions
const sessionDiv = document.createElement("div");
const sessionHeader = document.createElement("h3");
const sessionUl = document.createElement("ul");
sessionHeader.innerHTML = "Active sessions";
sessionDiv.appendChild(sessionHeader);

var sessionList = [];

function regenerateSessionView() {
	//remove previous if any
	while (sessionUl.firstChild) {
		sessionUl.firstChild.remove();
	}

	//generate list
	sessionList.forEach(session => {
		var li = document.createElement("li");
		var a = document.createElement("a");

		if (session != sessionId) {
			a.innerHTML = session;
			a.setAttribute("style", "text-decoration: underline;");
			a.setAttribute("href", "#");
			a.onclick = () => {
				watchLoop(session);
				a.innerHTML = `${session} - currently watching - Stop`;
				a.onclick = () => {
					clearInterval(watchInterval);
					running = false;
					regenerateSessionView();
					drawSpace();
				}
			}
		}
		else {
			a.innerHTML = `${session} - current session`;
		}

		li.appendChild(a);
		sessionUl.appendChild(li);
	})
	sessionDiv.appendChild(sessionUl);
	document.body.appendChild(sessionDiv);
}

var watchInterval;
function watchLoop(sessionId) {
	watchInterval = setInterval(function () {
		//update data from server
		sendJSON({
			type: 'watch',
			id: sessionId,
		});

		//draw
		if (running) {
			drawGame();
		}
	}, speed / 2);
}

//login/register
function setupPrompt() {
	promptHeader.innerHTML = "Login / Register";
	promptDiv.appendChild(promptHeader);

	var loginButton = document.createElement("button");
	var registerButton = document.createElement("button");
	loginButton.innerHTML = "Login";
	registerButton.innerHTML = "Register";

	loginButton.onclick = () => {
		showForm('login');
	}
	registerButton.onclick = () => {
		showForm('register');
	}

	promptDiv.appendChild(loginButton);
	promptDiv.appendChild(registerButton);
	document.body.appendChild(promptDiv);
}

function showForm(type) {
	deleteForm();

	var form = document.createElement('form');
	var login = createInput('text', "Login");
	var pass = createInput('password', "Password");
	var submit = document.createElement("button");
	submit.innerHTML = "Submit";

	form.appendChild(login);
	form.appendChild(pass);

	if (type == "register") {
		var passAgain = createInput('password', 'Repeat Password');
		var email = createInput('text', 'Email');
		var firstname = createInput('text', 'First Name');
		var lastname = createInput('text', 'Last Name');

		form.appendChild(passAgain);
		form.appendChild(email);
		form.appendChild(firstname);
		form.appendChild(lastname);

		submit.onclick = () => {
			if (pass.value != passAgain.value) { return };
			sendJSON({
				type: 'auth',
				value: 'register',
				data: {
					login: login.value,
					pass: pass.value,
					email: email.value,
					firstname: firstname.value,
					lastname: lastname.value,

				},
			});
			deleteForm();
		}
	}
	else {
		submit.onclick = () => {
			sendJSON({
				type: 'auth',
				value: 'login',
				data: {
					login: login.value,
					pass: pass.value,
				},
			});
			deleteForm();
		}
	}
	form.appendChild(submit);
	promptDiv.appendChild(form);
}

function deleteForm() {
	var c = promptDiv.lastChild;
	if (c.nodeName == "FORM") c.remove();
}

function createInput(type, placeholder) {
	var input = document.createElement('input');
	input.setAttribute("type", type);
	input.setAttribute("placeholder", placeholder);
	return input;
}

function onLogin(data) {
	user = data.login;
	highScore = data.highScore.score;

	promptDiv.remove();
	header.innerHTML = `Vesmirna hra - ${user}`;
}

var userList;
var gameList;

function addAdminTable() {
	isAdmin = true;

	var adminHeader = document.createElement("h3");
	adminHeader.innerHTML = "Admin Table";

	var userHeader = document.createElement("h4");
	userHeader.innerHTML = "Users:";
	var gameHeader = document.createElement("h4");
	gameHeader.innerHTML = "Games:";

	userList = document.createElement("ol");
	gameList = document.createElement("ul");
	adminDiv.appendChild(adminHeader);

	adminDiv.appendChild(userHeader);
	adminDiv.appendChild(userList);
	adminDiv.appendChild(gameHeader);
	adminDiv.appendChild(gameList);

	document.body.appendChild(adminDiv);
}

function updateAdminTable(data) {
	//reset data
	while (userList.firstChild) {
		userList.firstChild.remove();
	}
	while (gameList.firstChild) {
		gameList.firstChild.remove();
	}

	//populate lists
	for (const [username, obj] of Object.entries(data.users)) {
		var li = document.createElement("li");
		li.innerHTML = `${username} - Session: ${obj.session}, HighScore: ${obj.highScore.score}`;
		userList.appendChild(li);
	}

	for (const [game, obj] of Object.entries(data.games)) {
		var li = document.createElement("li");
		li.innerHTML = `${game} - ${JSON.stringify(obj)}`;
		gameList.appendChild(li);
	}
}