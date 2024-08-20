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
		
		float offset = 8.0*floor(luminance(rgba)*10.0);
		vec2 uv = vec2(
			(offset + mod(gl_FragCoord.x, 8.0)) / 80.0,
			mod(gl_FragCoord.y, 8.0) / 8.0
		);
		gl_FragColor = texture2D(uCharset, uv) * rgba;
	}
`;

const canvas = document.getElementById("canvas");
const {gl, program} = webGLInit(canvas, vertexCode, fragmentCode);

const canvasSize = gl.getUniformLocation(program, "canvasSize");
gl.uniform2f(canvasSize, canvas.width, canvas.height);

gl.activeTexture(gl.TEXTURE0)
const inputImg = await loadImage("./test.png");
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

var lastLoop = new Date();

function render() {	
	var thisLoop = new Date();
	var fps = 1000 / (thisLoop - lastLoop);
	lastLoop = thisLoop;
	console.log(fps);
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	requestAnimationFrame(render);
}

render()
