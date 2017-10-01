"use strict";

function droplet(x, y, velocityX, velocityY, size) {
	this.gravity = 0.0025;
	this.x = x;
	this.y = y;
	this.velocityX = velocityX;
	this.velocityY = velocityY;
	this.size = size;
	this.update = function() {
		this.velocityY -= this.gravity;
		this.x += this.velocityX;
		this.y += this.velocityY;
	};
}

function updateDroplets(droplets, bass) {
	for (var i = 0; i < droplets.length; i++) {
		var droplet = droplets[i];
		var spring = getSpring(droplet.x);
		if (spring && spring.height > droplet.y + 0.1) {
			spring.velocity -= droplet.size * 0.0005;
		}
		if (droplet === bass) {
			droplet.move();
		} else {
			droplet.update();
			if (droplet.x > 1.5 || droplet.x < -1.5 || droplet.y < -1) {
				droplets.splice(i, 1);
			}
		}
	}
}