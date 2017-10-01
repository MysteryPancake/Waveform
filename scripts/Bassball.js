"use strict";

var square;
var bassball;

function setupBassball(oscillator) {
	square = oscillator;
}

function createBassball(x, y, size, droplets) {
	bassball = new droplet(x, y, 0, 0, size);
	bassball.previousX = x;
	bassball.previousY = y;
	bassball.move = function() {
		this.velocityX = (this.previousX - this.x) * 0.2;
		this.velocityY = (this.previousY - this.y) * 0.2;
		this.x += this.velocityX;
		this.y += this.velocityY;
	};
	droplets.push(bassball);
}

function updateBassball(x, y, droplets) {
	if (!bassball) return;
	if (y > 0) {
		square.gain.gain.value = bassball.size * 0.005;
		var distance = Math.abs(bassball.previousX - x) + Math.abs(bassball.previousY - y);
		square.osc.frequency.value = getSnapped(x) * 0.25 + distance * 1000;
		if (distance > 0.1) {
			drip(bassball.x, bassball.y, droplets);
			bassball.size -= 1;
			if (bassball.size <= 0) {
				dropBassball();
			}
		}
	} else {
		dropBassball();
	}
	bassball.previousX = x;
	bassball.previousY = y;
}

function dropBassball() {
	square.gain.gain.value = 0;
	bassball = undefined;
}

function drip(x, y, droplets) {
	var position = x + (Math.random() - 0.5) * 0.1;
	var velocity = (Math.random() - 0.5) * 0.01;
	var size = 10 + Math.random() * 10;
	droplets.push(new droplet(position, y, velocity, 0, size));
}