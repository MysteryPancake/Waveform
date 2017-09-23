"use strict";

var gl;
var sphere;
var waveShader;
var dropletShader;
var springs = [];
var droplets = [];
var springCount = 100;
var initialHeight = 0.05;
var requestFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(e) { return setTimeout(e, 1000 / 60); };

function getBuffer(func, hint) {
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, func(), hint);
	return buffer;
}

function setup() {
	gl = document.getElementById("canvas").getContext("webgl");
	gl.clearColor(0, 0.1, 0.2, 1);
	setupAudio(gl, window, splash, initialHeight);
	for (var i = 0; i < springCount; i++) {
		springs.push(new spring(initialHeight));
	}
	var wave = shader(gl, "Wave");
	waveShader = {
		program: wave,
		buffers: {
			position: getBuffer(getVerts, gl.DYNAMIC_DRAW),
			color: getBuffer(getColors, gl.STATIC_DRAW)
		},
		attribs: {
			position: gl.getAttribLocation(wave, "Position"),
			color: gl.getAttribLocation(wave, "SourceColor")
		}
	};
	gl.enableVertexAttribArray(waveShader.attribs.position);
	gl.enableVertexAttribArray(waveShader.attribs.color);
	var droplet = shader(gl, "Droplet");
	dropletShader = {
		program: droplet,
		buffers: {
			position: getBuffer(getPoints, gl.DYNAMIC_DRAW),
			size: getBuffer(getSizes, gl.DYNAMIC_DRAW)
		},
		attribs: {
			position: gl.getAttribLocation(droplet, "Position"),
			size: gl.getAttribLocation(droplet, "Size")
		}
	};
	gl.enableVertexAttribArray(dropletShader.attribs.position);
	gl.enableVertexAttribArray(dropletShader.attribs.size);
	window.addEventListener("resize", resize);
	window.addEventListener("orientationchange", resize);
	resize();
	window.addEventListener("touchmove", touchMove);
	window.addEventListener("mousemove", mouseMove);
	requestFrame(draw);
}

function resize() {
	gl.canvas.width = window.innerWidth;
	gl.canvas.height = window.innerHeight;
}

function touchMove(e) {
	updateAudio(e.targetTouches[0].pageX, e.targetTouches[0].pageY, createSphere, splash, springs);
	updateSphere(e);
	e.preventDefault();
}

function mouseMove(e) {
	updateAudio(e.pageX, e.pageY, createSphere, splash, springs);
	updateSphere(e);
	e.preventDefault();
}

function splash(x, y) {
	for (var i = 0; i < Math.random() * 5; i++) {
		var size = 10 + Math.random() * 20;
		var velocity = {x: (Math.random() - 0.5) * 0.05, y: y * 0.1};
		droplets.push(new droplet({x: x, y: y}, velocity, size));
	}
}

function updateSphere(e) {
	if (!sphere) return;
	var x = 2 * (e.pageX / gl.canvas.width) - 1;
	var y = -2 * (e.pageY / gl.canvas.height) + 1;
	sphere.position.x = x;
	sphere.position.y = y;
	updateSquare(e.pageX, e.pageY, removeSphere);
}

function createSphere(size) {
	sphere = new droplet({x: 0, y: 0}, {x: 0, y: 0}, size);
	droplets.push(sphere);
}

function removeSphere() {
	sphere = undefined;
}

function getVerts() {
	var vertices = [];
	var scale = 2 / (springCount - 1);
	for (var i = 0; i < springCount; i++) {
		var x = i * scale - 1;
		vertices.push(x, springs[i].height, x, -1);
	}
	return new Float32Array(vertices);
}

function getColors() {
	var vertices = [];
	for (var i = 0; i < springCount; i++) {
		vertices.push(0.5, 0.2, 0.1, 0, 0.1, 0.2);
	}
	return new Float32Array(vertices);
}

function getPoints() {
	var points = [];
	for (var i = 0; i < droplets.length; i++) {
		points.push(droplets[i].position.x, droplets[i].position.y);
	}
	return new Float32Array(points);
}

function getSizes() {
	var sizes = [];
	for (var i = 0; i < droplets.length; i++) {
		sizes.push(droplets[i].size);
	}
	return new Float32Array(sizes);
}

function updateDroplets() {
	for (var i = 0; i < droplets.length; i++) {
		var droplet = droplets[i];
		if (droplet === sphere) continue;
		droplet.update();
		if (droplet.position.x > 1 || droplet.position.x < -1|| droplet.position.y < -1) {
			droplets.splice(i, 1);
		}
	}
}

function updateSprings(passes, spread) {
	for (var i = 0; i < springCount; i++) {
		springs[i].update();
	}
	var leftDeltas = [];
	var rightDeltas = [];
	for (var j = 0; j < passes; j++) {
		for (var i = 0; i < springCount; i++) {
			if (i > 0) {
				leftDeltas[i] = spread * (springs[i].height - springs[i - 1].height);
				springs[i - 1].velocity += leftDeltas[i];
			}
			if (i < springCount - 1) {
				rightDeltas[i] = spread * (springs[i].height - springs[i + 1].height);
				springs[i + 1].velocity += rightDeltas[i];
			}
		}
		for (var i = 0; i < springCount; i++) {
			if (i > 0) {
				springs[i - 1].height += leftDeltas[i];
			}
			if (i < springCount - 1) {
				springs[i + 1].height += rightDeltas[i];
			}
		}
	}
}

function draw() {
	updateDroplets();
	updateSprings(10, 0.025);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT);
	if (droplets.length > 0) {
		gl.useProgram(dropletShader.program);
		gl.bindBuffer(gl.ARRAY_BUFFER, dropletShader.buffers.position);
		gl.bufferData(gl.ARRAY_BUFFER, getPoints(), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(dropletShader.attribs.position, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, dropletShader.buffers.size);
		gl.bufferData(gl.ARRAY_BUFFER, getSizes(), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(dropletShader.attribs.size, 1, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.POINTS, 0, droplets.length);
	}
	gl.useProgram(waveShader.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, waveShader.buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER, getVerts(), gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(waveShader.attribs.position, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, waveShader.buffers.color);
	gl.vertexAttribPointer(waveShader.attribs.color, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, springCount * 2);
	requestFrame(draw);
}