"use strict";

var triangle;
var sawtooth;
var origin = 0;
var previous = 0;
var splashed = true;

function setupAudio() {
	var context = new (window.AudioContext || window.webkitAudioContext)();
	triangle = createOscillator(context, "triangle");
	sawtooth = createOscillator(context, "sawtooth");
	return createOscillator(context, "square");
}

function updateAudio(x, y, springs, droplets) {
	triangle.osc.frequency.value = getSnapped(x);
	sawtooth.osc.frequency.value = getSnapped(x);
	var spring = getSpring(x);
	if (!spring) return;
	if (y > 0) {
		triangle.gain.gain.value = 0;
		sawtooth.gain.gain.value = 0;
		if (splashed) return;
		splashed = true;
		for (var i = 0; i < springs.length; i++) {
			if (springs[i].target === initialHeight) continue;
			splash(i * 2 / (springs.length - 1) - 1, springs[i].height, droplets);
			springs[i].target = initialHeight;
		}
		var size = Math.max(spring.height, y - origin) * 200;
		if (size > 50) { createBassball(droplets, size); }
	} else {
		splashed = false;
		triangle.gain.gain.value = -y;
		if (y > previous) {
			if (origin === 0) { origin = y; }
			sawtooth.gain.gain.value = y - origin;
			spring.target += (y - previous) * 5;
		} else if (y < previous) {
			sawtooth.gain.gain.value = 0;
			origin = 0;
		}
	}
	previous = y;
}

function createOscillator(context, type) {
	var oscillator = context.createOscillator();
	oscillator.type = type;
	var gain = context.createGain();
	gain.gain.value = 0;
	oscillator.connect(gain);
	gain.connect(context.destination);
	oscillator.start();
	return { osc: oscillator, gain: gain };
}

function splash(x, y, droplets) {
	for (var i = 0; i < Math.random() * 5; i++) {
		var size = 10 + Math.random() * 20;
		var velocity = { x: (Math.random() - 0.5) * 0.05, y: y * 0.1 };
		droplets.push(new droplet({ x: x, y: y }, velocity, size));
	}
}

function getSnapped(x) {
	return Math.floor((x + 1) * 10) * 27 + 100;
}