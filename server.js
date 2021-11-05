const express = require('express');
const ws = require('ws');

const Game = require('./game-server');

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
					ws.send(JSON.stringify(game.getData()));
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
	}
}

function onSessionUpdate() {
	sockets.forEach((ws) =>
		ws.send(JSON.stringify({
			type: 'sessionList',
			list: Object.keys(games),
		})));
}

//setup servers
app.use(express.static(`${__dirname}`));

app.listen(port.app, () => {
	console.log(`App listening at http://localhost:${port.app}`);
})
