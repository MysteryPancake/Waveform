"use strict";

var shaders = {
	Droplet: {
		Vertex: `
			attribute mediump vec4 Position;
			attribute lowp float Size;
			void main(void) {
				gl_Position = Position;
				gl_PointSize = Size;
			}
		`,
		Fragment: `
			void main(void) {
				lowp vec2 circCoord = 2.0 * gl_PointCoord - 1.0;
				if (dot(circCoord, circCoord) > 1.0) discard;
				lowp vec3 lightDir = normalize(vec3(0, -1, -0.5));
				const lowp vec3 ambient = vec3(0.5, 0.2, 0.1);
				const lowp vec3 lightDiffuse = vec3(1, 0.5, 0.2);
				lowp vec3 normal = vec3(circCoord, sqrt(1.0 - dot(circCoord, circCoord)));
				lowp float color = max(dot(normal, lightDir), 0.0);
				gl_FragColor = vec4(ambient + lightDiffuse * color, 1);
			}
		`
	},
	Wave: {
		Vertex: `
			attribute mediump vec4 Position;
			attribute lowp vec4 SourceColor;
			varying mediump vec4 Height;
			varying lowp vec4 DestinationColor;
			void main(void) {
				Height = Position / 10.0;
				DestinationColor = SourceColor;
				gl_Position = Position;
			}
		`,
		Fragment: `
			varying mediump vec4 Height;
			varying lowp vec4 DestinationColor;
			void main(void) {
				lowp vec4 color = DestinationColor;
				if (DestinationColor.r > (0.5 - Height.y))
				color = mix(vec4(1, 0.5, 0.2, 1), DestinationColor, (0.5 - DestinationColor.r) / Height.y);
				gl_FragColor = color;
			}
		`
	}
};

function compile(gl, name, type, str) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, shaders[name][str]);
	gl.compileShader(shader);
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!success) {
		alert(`Couldn't compile shader ${name}${str}! ${gl.getShaderInfoLog(shader)}`);
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
		alert(`Couldn't link shader ${name}! ${gl.getProgramInfoLog(shader)}`);
	}
	return program;
}