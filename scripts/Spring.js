"use strict";

function spring(height) {
	this.velocity = 0;
	this.tension = 0.025;
	this.dampening = 0.025;
	this.height = height;
	this.target = height;
	this.update = function() {
		var acceleration = -this.tension * (this.height - this.target) - (this.dampening * this.velocity);
		this.velocity += acceleration;
		this.height += this.velocity;
	};
}