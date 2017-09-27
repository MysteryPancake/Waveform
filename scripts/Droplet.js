"use strict";

function droplet(position, velocity, size) {
	this.gravity = 0.0025;
	this.position = position;
	this.velocity = velocity;
	this.size = size;
	this.update = function() {
		this.velocity.y -= this.gravity;
		position.x += velocity.x;
		position.y += velocity.y;
	};
}

function updateDroplets(droplets, bass) {
	for (var i = 0; i < droplets.length; i++) {
		var droplet = droplets[i];
		var spring = getSpring(droplet.position.x);
		if (spring && spring.height > droplet.position.y + 0.1) {
			spring.velocity -= droplet.size * 0.0005;
		}
		if (droplet === bass) continue;
		droplet.update();
		if (droplet.position.x > 1 || droplet.position.x < -1|| droplet.position.y < -1) {
			droplets.splice(i, 1);
		}
	}
}