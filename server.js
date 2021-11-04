const express = require('express');
const app = express();
const port = {
	app: 8080,
	socket: 8082,
};

app.get('/', (req, res) => {
	const path = require('path');
	res.sendFile(path.join(__dirname, '/index.html'));
});

//setup server
app.use(express.static(`${__dirname}`));

app.listen(port.app, () => {
	console.log(`App listening at http://localhost:${port.app}`);
})