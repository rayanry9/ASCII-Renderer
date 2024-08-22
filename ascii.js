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
	uniform vec2 canvasSize;
	uniform vec2 iResolution;
	uniform sampler2D uInput;
	uniform sampler2D uCharset;


	float luminance(vec4 rgba) {
		return dot(rgba.xyz, vec3(0.2126, 0.7152, 0.0722));
	}

	void main() {
		vec2 coord = gl_FragCoord.xy - mod(gl_FragCoord.xy, 8.0);
		vec4 rgba = texture2D(uInput, coord / canvasSize);
		
		float offset = 8.0*floor(luminance(rgba)*11.0);
		vec2 uv = vec2(
			(offset + mod(gl_FragCoord.x, 8.0)) / 88.0,
			mod(gl_FragCoord.y, 8.0) / 8.0
		);
		gl_FragColor = texture2D(uCharset, uv) * rgba;
	}
`;

const canvasOut = document.getElementById("asciiCanvas");
const canvasIn = document.getElementById("vidCanvas");
const ctx = canvasIn.getContext("2d");
const {gl, program} = webGLInit(canvasOut, vertexCode, fragmentCode);

export async function init() {
	const canvasSize = gl.getUniformLocation(program, "canvasSize");
	gl.uniform2f(canvasSize, canvasOut.width, canvasOut.height);

	gl.activeTexture(gl.TEXTURE0)
	const inputImg = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
	loadTexture(gl, inputImg);
	const uInput = gl.getUniformLocation(program, "uInput");
	gl.uniform1i(uInput, 0);

	const iResolution = gl.getUniformLocation(program, "iResolution");
	gl.uniform2f(iResolution, inputImg.naturalWidth, inputImg.naturalHeight);

	gl.activeTexture(gl.TEXTURE0+1)
	const charsetImg = await loadImage("./charset.png");
	loadTexture(gl, charsetImg);
	const uCharset = gl.getUniformLocation(program, "uCharset");
	gl.uniform1i(uCharset, 1);
}

export function render() {
	const inputImg = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
	gl.activeTexture(gl.TEXTURE0)
	loadTexture(gl, inputImg);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
}
