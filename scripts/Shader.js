"use strict";

var shaderSource = {
	Droplet: {
		Vertex: "attribute mediump vec4 Position;\nattribute lowp float Size;\nvoid main(void) {\n\tgl_Position = Position;\n\tgl_PointSize = Size;\n}",
		Fragment: "#extension GL_OES_standard_derivatives : enable\nvoid main(void) {\n\tlowp vec2 cxy = 2.0 * gl_PointCoord - 1.0;\n\tlowp float radius = dot(cxy, cxy);\n\tconst lowp vec3 ambient = vec3(0.5, 0.2, 0.1);\n\tconst lowp vec3 diffuse = vec3(1, 0.5, 0.2);\n\tlowp vec3 normal = vec3(cxy, sqrt(1.0 - radius));\n\tlowp vec3 direction = normalize(vec3(0, -1, -0.5));\n\tlowp float color = max(dot(normal, direction), 0.0);\n\tlowp float delta = fwidth(radius);\n\tlowp float alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, radius);\n\tgl_FragColor = vec4(ambient + diffuse * color, alpha);\n}"
	},
	Wave: {
		Vertex: "attribute mediump vec4 Position;\nattribute lowp vec4 SourceColor;\nvarying mediump vec4 Height;\nvarying lowp vec4 DestinationColor;\nvoid main(void) {\n\tHeight = Position / 10.0;\n\tDestinationColor = SourceColor;\n\tgl_Position = Position;\n}",
		Fragment: "varying mediump vec4 Height;\nvarying lowp vec4 DestinationColor;\nvoid main(void) {\n\tlowp vec4 color = DestinationColor;\n\tif (DestinationColor.r > (0.5 - Height.y)) {\n\t\tcolor = mix(vec4(1, 0.5, 0.2, 1), DestinationColor, (0.5 - DestinationColor.r) / Height.y);\n\t}\n\tgl_FragColor = color;\n}"
	}
};

function getBuffer(gl, func, hint) {
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, func(), hint);
	return buffer;
}

function compile(gl, name, type, str) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, shaderSource[name][str]);
	gl.compileShader(shader);
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!success) {
		window.alert("Couldn't compile shader " + name + str + "! " + gl.getShaderInfoLog(shader));
	}
	return shader;
}

function createShader(gl, name) {
	var vertex = compile(gl, name, gl.VERTEX_SHADER, "Vertex");
	var fragment = compile(gl, name, gl.FRAGMENT_SHADER, "Fragment");
	var program = gl.createProgram();
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		window.alert("Couldn't link shader " + name + "! " + gl.getProgramInfoLog(program));
	}
	return program;
}

function setupShaders(gl, verts, colors, points, sizes) {
	var wave = createShader(gl, "Wave");
	var waveShader = {
		program: wave,
		buffers: {
			position: getBuffer(gl, verts, gl.DYNAMIC_DRAW),
			color: getBuffer(gl, colors, gl.STATIC_DRAW)
		},
		attribs: {
			position: gl.getAttribLocation(wave, "Position"),
			color: gl.getAttribLocation(wave, "SourceColor")
		}
	};
	gl.enableVertexAttribArray(waveShader.attribs.position);
	gl.enableVertexAttribArray(waveShader.attribs.color);
	var droplet = createShader(gl, "Droplet");
	var dropletShader = {
		program: droplet,
		buffers: {
			position: getBuffer(gl, points, gl.DYNAMIC_DRAW),
			size: getBuffer(gl, sizes, gl.DYNAMIC_DRAW)
		},
		attribs: {
			position: gl.getAttribLocation(droplet, "Position"),
			size: gl.getAttribLocation(droplet, "Size")
		}
	};
	gl.enableVertexAttribArray(dropletShader.attribs.position);
	gl.enableVertexAttribArray(dropletShader.attribs.size);
	return { wave: waveShader, droplet: dropletShader };
}
