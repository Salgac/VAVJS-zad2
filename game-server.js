//key codes
const KEY_LEFT = 37,
	KEY_RIGHT = 39,
	KEY_J = 74,
	KEY_L = 76,
	KEY_SPACE = 32;
const SCORE_MULTIPLIER = 10;

module.exports = class Game {
	constructor(id) {
		console.log("new Game instance");

		this.sessionId = id;

		this.aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
		this.ship = [104, 114, 115, 116];
		this.missiles = [];
		this.direction = 1;
		this.level = 1;
		this.speed = 512;
		this.running = false;
		this.loop;
		this.event = '';

		//score and level
		this.currentLevel = this.level;
		this.score = 0
	}
	//////////////
	// index.js //
	//////////////

	moveAliens() {
		var i = 0;
		for (i = 0; i < this.aliens.length; i++) {
			this.aliens[i] = this.aliens[i] + this.direction;
		}
		this.direction *= -1;
	}

	lowerAliens() {
		var i = 0;
		for (i = 0; i < this.aliens.length; i++) {
			this.aliens[i] += 11;
		}
	}

	moveMissiles() {
		var i = 0;
		for (i = 0; i < this.missiles.length; i++) {
			this.missiles[i] -= 11;
			if (this.missiles[i] < 0) this.missiles.splice(i, 1);
		}
	}

	checkMA() {
		for (var i = 0; i < this.missiles.length; i++) {
			if (this.aliens.includes(this.missiles[i])) {
				var alienIndex = this.aliens.indexOf(this.missiles[i]);
				this.aliens.splice(alienIndex, 1);
				this.missiles.splice(i, 1);
			}
		}
	}

	RaketaKolidujeSVotrelcom() {
		for (var i = 0; i < this.aliens.length; i++) {
			if (this.aliens[i] > 98) {
				return true;
			}
		}
		return false;
	}

	nextLevel() {
		this.level++;
		this.currentLevel++;
		console.log('level: ' + this.level);
		if (this.level == 1) this.aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
		if (this.level == 2) this.aliens = [1, 3, 5, 7, 9, 13, 15, 17, 19, 23, 25, 27, 29, 31];
		if (this.level == 3) this.aliens = [1, 5, 9, 23, 27, 31];
		if (this.level == 4) this.aliens = [45, 53];
		if (this.level > 4) {
			this.level = 1;
			this.aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
			this.speed = this.speed / 2;
		}
		this.gameLoop();
	}

	gameLoop() {
		console.log('gameloop');

		this.running = true;
		this.event = '';

		var a = 0;
		this.loop = setInterval(() => {
			this.moveAliens();
			this.moveMissiles();
			this.checkCollisionsMA();

			if (a % 4 == 3) this.lowerAliens();

			if (this.RaketaKolidujeSVotrelcom()) {
				clearInterval(this.loop);
				this.missiles = [];
				this.running = false;
				this.event = 'loose';
			}

			if (this.aliens.length === 0) {
				clearInterval(this.loop);
				this.missiles = [];
				this.event = 'win';
				setTimeout(() => {
					this.nextLevel();
				}, 1000);
			}
			a++;
		}, this.speed);
	}

	////////////
	// mod.js //
	////////////

	// checkCollisionsMA override
	checkCollisionsMA() {
		//get number of aliens shot
		var alienCount = this.aliens.length
		this.checkMA();
		var casualties = alienCount - this.aliens.length

		if (casualties != 0) {
			this.score += casualties * SCORE_MULTIPLIER
		}
	}

	// on reset button click
	resetGame() {
		//stop game
		this.running = false
		clearInterval(this.loop);

		//set original values
		this.aliens = [1, 3, 5, 7, 9, 23, 25, 27, 29, 31];
		this.direction = 1;
		this.ship = [104, 114, 115, 116];
		this.missiles = [];
		this.level = 1;
		this.currentLevel = 1;
		this.speed = 512;
		this.score = 0;

		console.log("Game reset.");
	}

	//////////////////
	// server logic //
	//////////////////

	handleKeyEvent(keyCode) {
		//console.log(keyCode);
		if (!this.running) return;
		switch (keyCode) {
			//move left
			case KEY_LEFT:
			case KEY_J:
				if (this.ship[0] > 100) {
					var i = 0;
					for (i = 0; i < this.ship.length; i++) {
						this.ship[i]--;
					}
				}
				break;
			//move right
			case KEY_RIGHT:
			case KEY_L:
				if (this.ship[0] < 108) {
					var i = 0;
					for (i = 0; i < this.ship.length; i++) {
						this.ship[i]++;
					}
				}
				break;
			//shoot
			case KEY_SPACE:
				this.missiles.push(this.ship[0] - 11);
				break;
		}
	}


	startGame() { this.resetGame(); this.gameLoop() }
	getData() {
		return {
			type: 'update',
			ship: this.ship,
			aliens: this.aliens,
			missiles: this.missiles,
			level: this.currentLevel,
			score: this.score,
			special: this.event,
		}
	}

	getId() {
		return this.sessionId;
	}
}
