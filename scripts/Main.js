"use strict";

var gl;
var shaders;
var springs = [];
var droplets = [];
var springCount = 100;
var initialHeight = 0.05;
var requestFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(e) { return window.setTimeout(e, 1000 / 60); };

function setup() {
	gl = document.getElementById("canvas").getContext("webgl");
	gl.clearColor(0, 0.1, 0.2, 1);
	for (var i = 0; i < springCount; i++) {
		springs.push(new spring(initialHeight));
	}
	shaders = setupShaders(gl, getVerts, getColors, getPoints, getSizes);
	window.addEventListener("resize", resize);
	window.addEventListener("orientationchange", resize);
	resize();
	if ("ontouchstart" in window) {
		window.addEventListener("touchstart", iOSFix);
		window.addEventListener("touchmove", touchMove);
		window.addEventListener("touchend", dropBassball);
	} else {
		setupBassball(setupAudio());
		window.addEventListener("mousemove", mouseMove);
		window.addEventListener("mouseup", dropBassball);
	}
	requestFrame(draw);
}

function resize() {
	gl.canvas.width = window.innerWidth;
	gl.canvas.height = window.innerHeight;
}

function iOSFix() {
	setupBassball(setupAudio());
	window.removeEventListener("touchstart", iOSFix);
}

function move(e, x, y) {
	updateAudio(x, y, springs, droplets);
	updateBassball(x, y, droplets);
	e.preventDefault();
}

function touchMove(e) {
	var x = 2 * (e.targetTouches[0].pageX / gl.canvas.width) - 1;
	var y = -2 * (e.targetTouches[0].pageY / gl.canvas.height) + 1;
	move(e, x, y);
}

function mouseMove(e) {
	var x = 2 * (e.pageX / gl.canvas.width) - 1;
	var y = -2 * (e.pageY / gl.canvas.height) + 1;
	move(e, x, y);
}

function getVerts() {
	var vertices = [];
	var scale = 2 / (springs.length - 1);
	for (var i = 0; i < springs.length; i++) {
		var x = i * scale - 1;
		vertices.push(x, springs[i].height, x, -1);
	}
	return new Float32Array(vertices);
}

function getColors() {
	var colors = [];
	for (var i = 0; i < springs.length; i++) {
		colors.push(0.5, 0.2, 0.1, 0, 0.1, 0.2);
	}
	return new Float32Array(colors);
}

function getPoints() {
	var points = [];
	for (var i = 0; i < droplets.length; i++) {
		points.push(droplets[i].x, droplets[i].y);
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

function getSpring(x) {
	return springs[Math.floor(springs.length * (x + 1) * 0.5)];
}

function draw() {
	updateSprings(springs, 10, 0.025);
	updateDroplets(droplets, bassball);
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT);
	if (droplets.length > 0) {
		gl.useProgram(shaders.droplet.program);
		gl.bindBuffer(gl.ARRAY_BUFFER, shaders.droplet.buffers.position);
		gl.bufferData(gl.ARRAY_BUFFER, getPoints(), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(shaders.droplet.attribs.position, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, shaders.droplet.buffers.size);
		gl.bufferData(gl.ARRAY_BUFFER, getSizes(), gl.DYNAMIC_DRAW);
		gl.vertexAttribPointer(shaders.droplet.attribs.size, 1, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.POINTS, 0, droplets.length);
	}
	gl.useProgram(shaders.wave.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, shaders.wave.buffers.position);
	gl.bufferData(gl.ARRAY_BUFFER, getVerts(), gl.DYNAMIC_DRAW);
	gl.vertexAttribPointer(shaders.wave.attribs.position, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, shaders.wave.buffers.color);
	gl.vertexAttribPointer(shaders.wave.attribs.color, 3, gl.FLOAT, false, 0, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, springs.length * 2);
	requestFrame(draw);
}