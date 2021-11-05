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

// GET / -> render static index.html
app.get('/', (req, res) => {
	const path = require('path');
	res.sendFile(path.join(__dirname, '/index.html'));
});

// setup WS
socketServer.on('connection', (ws) => {
	console.log('New connection');

	//create new game session
	var newSessionId = ++lastId;
	var newGame = new Game(newSessionId);

	games[key(newGame)] = newGame;
	ws.send(JSON.stringify({
		type: 'session',
		session: newSessionId,
	}))

	//listener
	ws.on('message', (message) => onReceived(ws, message.toString()));
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
	}
}

//setup servers
app.use(express.static(`${__dirname}`));

app.listen(port.app, () => {
	console.log(`App listening at http://localhost:${port.app}`);
})
