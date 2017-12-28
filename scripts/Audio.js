"use strict";

var context;
var triangle;
var sawtooth;
var origin = 0;
var previous = 0;
var splashed = true;

function setupAudio() {
	context = new (window.AudioContext || window.webkitAudioContext)();
	triangle = createOscillator("triangle");
	sawtooth = createOscillator("sawtooth");
	return createOscillator("square");
}

function updateAudio(x, y, springs, droplets) {
	triangle.osc.frequency.setTargetAtTime(getSnapped(x), context.currentTime, 0.2);
	sawtooth.osc.frequency.setTargetAtTime(getSnapped(x), context.currentTime, 0.2);
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
		var spring = getSpring(x);
		var size = Math.max(spring && spring.height || 0, y - origin) * 200;
		if (size > 50) {
			createBassball(x, y, size, droplets);
		}
	} else {
		splashed = false;
		triangle.gain.gain.value = -y;
		if (y > previous) {
			if (origin === 0) { origin = y; }
			sawtooth.gain.gain.value = y - origin;
			var spring = getSpring(x);
			if (spring) {
				spring.target += (y - previous) * 5;
			}
		} else if (y < previous) {
			sawtooth.gain.gain.value = 0;
			origin = 0;
		}
	}
	previous = y;
}

function createOscillator(type) {
	var oscillator = context.createOscillator();
	oscillator.type = type;
	var gain = context.createGain();
	gain.gain.setTargetAtTime(0, context.currentTime, 0.2);
	oscillator.connect(gain);
	gain.connect(context.destination);
	oscillator.start();
	return { osc: oscillator, gain: gain };
}

function splash(x, y, droplets) {
	for (var i = 0; i < Math.random() * 5; i++) {
		var velocity = (Math.random() - 0.5) * 0.05;
		var size = 10 + Math.random() * 20;
		droplets.push(new droplet(x, y, velocity, y * 0.1, size));
	}
}

function getSnapped(x) {
	return Math.floor((x + 1) * 10) * 27 + 100;
}
