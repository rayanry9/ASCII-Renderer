const vertexCode = `	
	#version 100

	attribute vec4 position;

	void main() {
	  gl_Position = position;
	}
`;

const fragmentCode = `
	#version 100
	precision highp float;
	uniform vec2 resolution;
	uniform sampler2D uInput;
	uniform sampler2D uEdge;
	uniform sampler2D uCharset;


	float luminance(vec4 rgba) {
		return dot(rgba.xyz, vec3(0.2126, 0.7152, 0.0722));
	}

	void main() {
		vec2 coord = gl_FragCoord.xy - mod(gl_FragCoord.xy, 8.0);
		vec4 rgba = texture2D(uInput, coord / resolution);
		
		float offset1 = 8.0*floor(luminance(rgba)*11.0);
		vec2 uv1 = vec2(
			(offset1 + mod(gl_FragCoord.x, 8.0)) / 88.0,
			0.5 + mod(gl_FragCoord.y, 8.0) / 16.0
		);

		vec2 coord2 = gl_FragCoord.xy - mod(gl_FragCoord.xy, 8.0) + vec2(4.0, 4.0);
		vec4 edge = texture2D(uEdge, coord2 / resolution);
		float offset2 = 8.0 * (edge.r + 2.0*edge.g + 4.0*edge.b);
		vec2 uv2 = vec2(
			(offset2 + mod(gl_FragCoord.x, 8.0)) / 88.0,
			mod(gl_FragCoord.y, 8.0) / 16.0
		);

		vec4 t1 = texture2D(uCharset, uv1) * rgba;
		vec4 t2 = texture2D(uCharset, uv2) * rgba;

		gl_FragColor = texture2D(uCharset, uv1) * rgba;
		if (offset2 > 0.9) {
			gl_FragColor = texture2D(uCharset, uv2) * rgba;
		}
	}
`;

const canvasOut = document.getElementById("asciiCanvas");
const canvasIn = document.getElementById("vidCanvas");
const ctx = canvasIn.getContext("2d");

const canvasSrc = document.getElementById("edgeCanvas");
const canvasIn2 = document.getElementById("intEdge");
const ctx2 = canvasIn2.getContext("2d");

const {gl, program} = webGLInit(canvasOut, vertexCode, fragmentCode);

export async function init() {
	const canvasSize = gl.getUniformLocation(program, "resolution");
	gl.uniform2f(canvasSize, canvasOut.width, canvasOut.height);

	gl.activeTexture(gl.TEXTURE0)
	const inputImg = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
	loadTexture(gl, inputImg);
	const uInput = gl.getUniformLocation(program, "uInput");
	gl.uniform1i(uInput, 0);

	ctx2.clearRect(0, 0, canvasIn2.width, canvasIn2.height);
	ctx2.drawImage(canvasSrc, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0+1);
	const edgeImg = ctx2.getImageData(0, 0, canvasIn2.width, canvasIn2.height);
	loadTexture(gl, edgeImg);
	const uEdge = gl.getUniformLocation(program, "uEdge");
	gl.uniform1i(uEdge, 1);	

	gl.activeTexture(gl.TEXTURE0+2)
	const charsetImg = await loadImage("./charset.png");
	loadTexture(gl, charsetImg);
	const uCharset = gl.getUniformLocation(program, "uCharset");
	gl.uniform1i(uCharset, 2);
}

export function render() {
	const inputImg = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
	gl.activeTexture(gl.TEXTURE0)
	loadTexture(gl, inputImg);

	ctx2.clearRect(0, 0, canvasIn2.width, canvasIn2.height);
	ctx2.drawImage(canvasSrc, 0, 0);
	
	gl.activeTexture(gl.TEXTURE0+1);
	const edgeImg = ctx2.getImageData(0, 0, canvasIn2.width, canvasIn2.height);
	loadTexture(gl, edgeImg);
	const uEdge = gl.getUniformLocation(program, "uEdge");
	gl.uniform1i(uEdge, 1);	

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}
