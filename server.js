const express = require('express');
const ws = require('ws');

const Game = require('./game-server');
class User {
	constructor(data) {
		this.email = data.email;
		this.login = data.login;
		this.pass = data.pass;
		this.firstname = data.firstname;
		this.lastname = data.lastname;

		this.highScore = {
			score: 0,
			level: 0,
		};
	}
}
var highScore = {
	score: 0,
	level: 0,
}

const app = express();
const port = {
	app: 8080,
	socket: 8082,
};
const socketServer = new ws.Server({ port: port.socket });

//game hashmap
var games = {};
function key(obj) {
	return obj.getId();
}
var lastId = -1;

//user hashmap
var users = {};

//ws list
var sockets = [];

// GET / -> render static index.html
app.get('/', (req, res) => {
	const path = require('path');
	res.sendFile(path.join(__dirname, '/index.html'));
});

// setup WS
socketServer.on('connection', (ws) => {
	console.log('New connection');
	sockets.push(ws);

	//create new game session
	var newSessionId = ++lastId;
	var newGame = new Game(newSessionId);

	games[key(newGame)] = newGame;
	ws.send(JSON.stringify({
		type: 'session',
		session: newSessionId,
		highScore: highScore,
	}))

	//send running sessions data
	onSessionUpdate();

	//listener
	ws.on('message', (message) => onReceived(ws, message.toString()));

	ws.on('close', () => {
		delete games[newSessionId]
		sockets.pop(ws);
		onSessionUpdate();
	});
})

function onReceived(ws, message) {
	message = JSON.parse(message);
	var game = games[message.session];

	switch (message.type) {
		case 'keypress':
			game.handleKeyEvent(message.key);
			break;
		case 'game':
			switch (message.value) {
				case 'start':
					game.startGame();
					break;
				case 'reset':
					game.resetGame();
					break;
				case 'update':
					var data = game.getData();
					data.highScore = highScore;
					ws.send(JSON.stringify(data));
					break;
			}
			break;
		case 'watch':
			var wg = games[message.id];
			if (wg != undefined)
				ws.send(JSON.stringify(wg.getData()));
			else
				ws.send(JSON.stringify({ type: 'reset' }));
			break;
		case 'auth':
			switch (message.value) {
				case 'register':
					var newUser = new User(message.data);
					if (isUnique(newUser.login))
						users[newUser.login] = newUser;
					else {
						ws.send(JSON.stringify({
							type: 'auth',
							value: 'error',
							reason: 'Login name already in use.',
						}));
						break;
					}
				case 'login':
					var user = users[message.data.login];
					if (user != null && user.pass === message.data.pass) {
						//login succesfull
						ws.send(JSON.stringify({
							type: 'auth',
							value: 'login',
							data: {
								login: user.login,
								highScore: user.highScore,
							}
						}));
					} else {
						//error
						ws.send(JSON.stringify({
							type: 'auth',
							value: 'error',
							reason: 'Login or password are not correct.',
						}));
					}
					break;
			}
			break;
		case 'score':
			if (message.user != '[N/A]') {
				users[message.user].highScore = message.highScore;
			}
			//update global score
			if (message.highScore.score > highScore.score) {
				highScore = message.highScore;
				onHighScoreUpdate();
			}
			break;
	}
}

function isUnique(login) {
	return users[login] == undefined;
}

function onSessionUpdate() {
	sockets.forEach((ws) =>
		ws.send(JSON.stringify({
			type: 'sessionList',
			list: Object.keys(games),
		})));
}

function onHighScoreUpdate() {
	sockets.forEach((ws) =>
		ws.send(JSON.stringify({
			type: 'score',
			highScore: highScore,
		})));
}

//setup servers
app.use(express.static(`${__dirname}`));

app.listen(port.app, () => {
	console.log(`App listening at http://localhost:${port.app}`);
})
