"use strict";

var square;
var triangle;
var sawtooth;
var originY = 0;
var previousY = 0;
var splashed = true;
var initialHeight = 0;
var previous = {x: 0, y: 0};

function setupAudio(window, splash, height) {
	initialHeight = height;
	var context = new (window.AudioContext || window.webkitAudioContext)();
	triangle = createOscillator(context, "triangle");
	sawtooth = createOscillator(context, "sawtooth");
	square = createOscillator(context, "square");
}

function updateAudio(x, y, bass, splash, springs) {
	var springCount = springs.length;
	triangle.osc.frequency.value = octaveSnapped(x);
	sawtooth.osc.frequency.value = octaveSnapped(x);
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
		var size = (y - originY) * 200;
		if (size > 20) { bass(size); }
	} else {
		splashed = false;
		triangle.gain.gain.value = -y;
		if (y > previousY) {
			if (originY === 0) { originY = y; }
			sawtooth.gain.gain.value = y - originY;
			var spring = Math.floor(springCount * (x + 1) * 0.5);
			springs[spring].target += (y - previousY) * 5;
		} else if (y < previousY) {
			originY = 0;
		}
	}
	previousY = y;
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

function updateSquare(x, y, bass, remove, drip) {
	if (y > 0) {
		square.gain.gain.value = bass.size * 0.005;
		var difference = Math.abs(x - previous.x) + Math.abs(y - previous.y);
		square.osc.frequency.value = octaveSnapped(x) * 0.25 + difference * 1000;
		if (difference > 0.1) {
			drip(x, y);
			bass.size -= 1;
			if (bass.size <= 0) {
				square.gain.gain.value = 0;
				remove(x);
			}
		}
	} else {
		square.gain.gain.value = 0;
		remove(x);
	}
	previous = {x: x, y: y};
}

function octaveSnapped(x) {
	return Math.floor((x + 1) * 10) * 27 + 100;
}