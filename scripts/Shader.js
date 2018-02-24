"use strict";

var shaderSource = {
	Droplet: {
		Vertex: "\n\t\t\tattribute mediump vec4 Position;\n\t\t\tattribute lowp float Size;\n\t\t\tvoid main(void) {\n\t\t\t\tgl_Position = Position;\n\t\t\t\tgl_PointSize = Size;\n\t\t\t}\n\t\t",
		Fragment: "\n\t\t\t#extension GL_OES_standard_derivatives : enable\n\t\t\tvoid main(void) {\n\t\t\t\tlowp vec2 cxy = 2.0 * gl_PointCoord - 1.0;\n\t\t\t\tlowp float radius = dot(cxy, cxy);\n\t\t\t\tconst lowp vec3 ambient = vec3(0.5, 0.2, 0.1);\n\t\t\t\tconst lowp vec3 diffuse = vec3(1, 0.5, 0.2);\n\t\t\t\tlowp vec3 normal = vec3(cxy, sqrt(1.0 - radius));\n\t\t\t\tlowp vec3 direction = normalize(vec3(0, -1, -0.5));\n\t\t\t\tlowp float color = max(dot(normal, direction), 0.0);\n\t\t\t\tlowp float delta = fwidth(radius);\n\t\t\t\tlowp float alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, radius);\n\t\t\t\tgl_FragColor = vec4(ambient + diffuse * color, alpha);\n\t\t\t}\n\t\t"
	},
	Wave: {
		Vertex: "\n\t\t\tattribute mediump vec4 Position;\n\t\t\tattribute lowp vec4 SourceColor;\n\t\t\tvarying mediump vec4 Height;\n\t\t\tvarying lowp vec4 DestinationColor;\n\t\t\tvoid main(void) {\n\t\t\t\tHeight = Position / 10.0;\n\t\t\t\tDestinationColor = SourceColor;\n\t\t\t\tgl_Position = Position;\n\t\t\t}\n\t\t",
		Fragment: "\n\t\t\tvarying mediump vec4 Height;\n\t\t\tvarying lowp vec4 DestinationColor;\n\t\t\tvoid main(void) {\n\t\t\t\tlowp vec4 color = DestinationColor;\n\t\t\t\tif (DestinationColor.r > (0.5 - Height.y)) {\n\t\t\t\t\tcolor = mix(vec4(1, 0.5, 0.2, 1), DestinationColor, (0.5 - DestinationColor.r) / Height.y);\n\t\t\t\t}\n\t\t\t\tgl_FragColor = color;\n\t\t\t}\n\t\t"
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

function shader(gl, name) {
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
	var wave = shader(gl, "Wave");
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
	var droplet = shader(gl, "Droplet");
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
