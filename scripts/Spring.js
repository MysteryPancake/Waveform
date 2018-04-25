"use strict";

function spring(height) {
	this.height = height;
	this.target = height;
	this.velocity = 0;
	this.update = function(tension, dampening) {
		this.velocity += tension * (this.target - this.height) - (this.velocity * dampening);
		this.height += this.velocity;
	};
}

function updateSprings(springs, passes, spread) {
	for (var i = 0; i < springs.length; i++) {
		springs[i].update(0.025, 0.025);
	}
	var leftDeltas = [];
	var rightDeltas = [];
	for (var j = 0; j < passes; j++) {
		for (var i = 0; i < springs.length; i++) {
			if (i > 0) {
				leftDeltas[i] = spread * (springs[i].height - springs[i - 1].height);
				springs[i - 1].velocity += leftDeltas[i];
			}
			if (i < springs.length - 1) {
				rightDeltas[i] = spread * (springs[i].height - springs[i + 1].height);
				springs[i + 1].velocity += rightDeltas[i];
			}
		}
		for (var i = 0; i < springs.length; i++) {
			if (i > 0) {
				springs[i - 1].height += leftDeltas[i];
			}
			if (i < springs.length - 1) {
				springs[i + 1].height += rightDeltas[i];
			}
		}
	}
}
