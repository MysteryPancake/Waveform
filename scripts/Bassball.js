"use strict";

var square;
var bassball;
var previousPosition = { x: 0, y: 0 };

function setupBassball(oscillator) {
	square = oscillator;
}

function createBassball(droplets, size) {
	bassball = new droplet({ x: 0, y: 0 }, { x: 0, y: 0 }, size);
	droplets.push(bassball);
}

function updateBassball(x, y, droplets) {
	if (!bassball) return;
	bassball.position.x = x;
	bassball.position.y = y;
	if (y > 0) {
		square.gain.gain.value = bassball.size * 0.005;
		var difference = Math.abs(x - previousPosition.x) + Math.abs(y - previousPosition.y);
		square.osc.frequency.value = getSnapped(x) * 0.25 + difference * 1000;
		if (difference > 0.1) {
			drip(x, y, droplets);
			bassball.size -= 1;
			if (bassball.size <= 0) {
				dropBassball();
			}
		}
	} else {
		dropBassball();
	}
	previousPosition = { x: x, y: y };
}

function dropBassball() {
	square.gain.gain.value = 0;
	bassball = undefined;
	iOSFix();
}

function iOSFix() {
	if (context.state === "suspended") {
		context.resume();
	}
}

function drip(x, y, droplets) {
	var size = 10 + Math.random() * 10;
	var velocity = (Math.random() - 0.5) * 0.01;
	var position = x + (Math.random() - 0.5) * 0.1;
	droplets.push(new droplet({ x: position, y: y }, { x: velocity, y: 0 }, size));
}