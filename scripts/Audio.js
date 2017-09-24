"use strict";

var square;
var triangle;
var sawtooth;
var origin = 0;
var previous = 0;
var splashed = true;
var initialHeight = 0;

function setupAudio(window, splash, height) {
	var context = new (window.AudioContext || window.webkitAudioContext)();
	triangle = createOscillator(context, "triangle");
	sawtooth = createOscillator(context, "sawtooth");
	square = createOscillator(context, "square");
	initialHeight = height;
}

function updateAudio(x, y, bass, splash, springs, getSpring) {
	triangle.osc.frequency.value = getSnapped(x);
	sawtooth.osc.frequency.value = getSnapped(x);
	var springCount = springs.length;
	var spring = getSpring(x);
	if (!spring) return;
	if (y > 0) {
		triangle.gain.gain.value = 0;
		sawtooth.gain.gain.value = 0;
		if (splashed) return;
		splashed = true;
		for (var i = 0; i < springCount; i++) {
			if (springs[i].target === initialHeight) continue;
			splash(i * 2 / (springCount - 1) - 1, springs[i].height);
			springs[i].target = initialHeight;
		}
		var size = Math.max(spring.height, y - origin) * 200;
		if (size > 50) { bass(size); }
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

var previousPosition = {x: 0, y: 0};

function updateSquare(x, y, drip, bass, drop) {
	if (y > 0) {
		square.gain.gain.value = bass.size * 0.005;
		var difference = Math.abs(x - previousPosition.x) + Math.abs(y - previousPosition.y);
		square.osc.frequency.value = getSnapped(x) * 0.25 + difference * 1000;
		if (difference > 0.1) {
			drip(x, y);
			bass.size -= 1;
			if (bass.size <= 0) {
				drop();
			}
		}
	} else {
		drop();
	}
	previousPosition = {x: x, y: y};
}

function getSnapped(x) {
	return Math.floor((x + 1) * 10) * 27 + 100;
}