"use strict";

function droplet(position, velocity, size) {
	this.gravity = 0.003;
	this.position = position;
	this.velocity = velocity;
	this.size = size;
	this.update = function() {
		this.velocity.y -= this.gravity;
		position.x += velocity.x;
		position.y += velocity.y;
	};
}