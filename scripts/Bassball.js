"use strict";

var square;
var bassball;
var previousX = 0;
var previousY = 0;

function setupBassball(oscillator) {
	square = oscillator;
}

function createBassball(x, y, size, droplets) {
	bassball = new droplet(x, y, 0, 0, size);
	previousX = x;
	previousY = y;
	bassball.move = function() {
		this.velocityX = (previousX - this.x) * 0.2;
		this.velocityY = (previousY - this.y) * 0.2;
		this.x += this.velocityX;
		this.y += this.velocityY;
	};
	droplets.push(bassball);
}

function updateBassball(x, y, droplets) {
	if (!bassball) return;
	if (y > 0) {
		square.gain.gain.setValueAtTime(bassball.size * 0.001, square.context.currentTime);
		var distance = Math.abs(previousX - x) + Math.abs(previousY - y);
		square.osc.frequency.setValueAtTime(getSnapped(x) * 0.25 + distance * 1000, square.context.currentTime);
		if (distance > 0.1) {
			drip(bassball.x, bassball.y, droplets);
			bassball.size--;
			if (bassball.size < 1) {
				dropBassball();
			}
		}
	} else {
		dropBassball();
	}
	previousX = x;
	previousY = y;
}

function dropBassball() {
	square.gain.gain.setValueAtTime(0, square.context.currentTime);
	bassball = undefined;
}

function drip(x, y, droplets) {
	var position = x + (Math.random() - 0.5) * 0.1;
	var velocity = (Math.random() - 0.5) * 0.01;
	var size = 10 + Math.random() * 10;
	droplets.push(new droplet(position, y, velocity, 0, size));
}
