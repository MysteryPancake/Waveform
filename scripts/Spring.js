"use strict";

function Spring(height) {
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
		for (var k = 0; k < springs.length; k++) {
			if (k > 0) {
				leftDeltas[k] = spread * (springs[k].height - springs[k - 1].height);
				springs[k - 1].velocity += leftDeltas[k];
			}
			if (k < springs.length - 1) {
				rightDeltas[k] = spread * (springs[k].height - springs[k + 1].height);
				springs[k + 1].velocity += rightDeltas[k];
			}
		}
		for (var l = 0; l < springs.length; l++) {
			if (l > 0) {
				springs[l - 1].height += leftDeltas[l];
			}
			if (l < springs.length - 1) {
				springs[l + 1].height += rightDeltas[l];
			}
		}
	}
}
