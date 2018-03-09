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
	triangle.osc.frequency.setValueAtTime(getSnapped(x), triangle.context.currentTime);
	sawtooth.osc.frequency.setValueAtTime(getSnapped(x), sawtooth.context.currentTime);
	if (y > 0) {
		triangle.gain.gain.setValueAtTime(0, triangle.context.currentTime);
		sawtooth.gain.gain.setValueAtTime(0, sawtooth.context.currentTime);
		if (splashed) return;
		splashed = true;
		for (var i = 0; i < springs.length; i++) {
			if (springs[i].target === initialHeight) continue;
			splash(i * 2 / (springs.length - 1) - 1, springs[i].height, droplets);
			springs[i].target = initialHeight;
		}
		var spring = getSpring(x);
		var size = Math.max(spring && spring.height || 0, y - origin) * 200;
		if (size > 50) {
			createBassball(x, y, size, droplets);
		}
	} else {
		splashed = false;
		triangle.gain.gain.setValueAtTime(-y, triangle.context.currentTime);
		if (y > previous) {
			if (origin === 0) { origin = y; }
			sawtooth.gain.gain.setValueAtTime(y - origin, sawtooth.context.currentTime);
			var spring = getSpring(x);
			if (spring) {
				spring.target += (y - previous) * 5;
			}
		} else if (y < previous) {
			sawtooth.gain.gain.setValueAtTime(0, sawtooth.context.currentTime);
			origin = 0;
		}
	}
	previous = y;
}

function createOscillator(context, type) {
	var oscillator = context.createOscillator();
	oscillator.type = type;
	var gain = context.createGain();
	gain.gain.setValueAtTime(0, context.currentTime);
	oscillator.connect(gain);
	gain.connect(context.destination);
	oscillator.start();
	return { context: context, osc: oscillator, gain: gain };
}

function splash(x, y, droplets) {
	for (var i = 0; i < Math.random() * 5; i++) {
		var velocity = (Math.random() - 0.5) * 0.05;
		var size = 10 + Math.random() * 20;
		droplets.push(new droplet(x, y, velocity, y * 0.1, size));
	}
}

function getSnapped(x) {
	return 256 + (x + 1) * 256;
}
