"use strict";

var gl;
var square;
var triangle;
var sawtooth;
var originY = 0;
var previousY = 0;
var splashed = true;
var initialHeight = 0;
var previous = {x: 0, y: 0};

function setupAudio(webgl, window, splash, height) {
	gl = webgl;
	initialHeight = height;
	var context = new (window.AudioContext || window.webkitAudioContext)();
	triangle = createOscillator(context, "triangle");
	sawtooth = createOscillator(context, "sawtooth");
	square = createOscillator(context, "square");
}

function updateAudio(x, y, sphere, splash, springs) {
	var springCount = springs.length;
	triangle.osc.frequency.value = x * 0.5;
	sawtooth.osc.frequency.value = x * 0.5;
	if (y > gl.canvas.height * 0.5) {
		triangle.gain.gain.value = 2 * (y / gl.canvas.height) - 1;
		if (y < previousY) {
			if (originY === 0) { originY = y; }
			sawtooth.gain.gain.value = 1 - (2 * (y / originY) - 1);
			var spring = x / gl.canvas.width * springCount;
			springs[Math.floor(spring)].target = (previousY - y) * 0.1;
			splashed = false;
		} else {
			originY = 0;
		}
	} else {
		triangle.gain.gain.value = 0;
		sawtooth.gain.gain.value = 0;
		if (splashed) return;
		for (var i = 0; i < springCount; i++) {
			if (springs[i].target === initialHeight) continue;
			springs[i].target = initialHeight;
			var x = i * 2 / (springCount - 1) - 1;
			var y = springs[i].height;
			splash(x, y);
		}
		sphere((originY - y) * 0.2);
		var x = 2 * (x / gl.canvas.width) - 1;
		var y = -2 * (y / gl.canvas.height) + 1;
		splash(x, y);
		splashed = true;
	}
	previousY = y;
}

function createOscillator(context, type) {
	var oscillator = context.createOscillator();
	oscillator.type = type;
	oscillator.frequency.value = 200;
	var gain = context.createGain();
	gain.gain.value = 0;
	oscillator.connect(gain);
	gain.connect(context.destination);
	oscillator.start();
	return { osc: oscillator, gain: gain };
}

function updateSquare(x, y, remove) {
	if (y > gl.canvas.height * 0.5) {
		square.gain.gain.value = 0;
		remove();
	} else {
		square.gain.gain.value = 1;
		var difference = Math.abs(x - previous.x) + Math.abs(y - previous.y);
		square.osc.frequency.value = x * 0.05 + difference;
	}
	previous = {x: x, y: y};
}