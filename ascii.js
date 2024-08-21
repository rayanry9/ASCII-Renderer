const asciiVertexCode = `	
	#version 100

	attribute vec4 position;

	void main() {
	  gl_Position = position;
	}
`;

const asciiFragmentCode = `
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

const sobelFragmentCode = `
	precision mediump float;
	uniform vec2 resolution;
	uniform sampler2D texture;

	#define PI 3.1415926
	#define SOBEL_THRESHOLD 0.2

	void make_kernel(inout float n[9], sampler2D tex, vec2 coord)
	{
		float w = 1.0 / resolution.x;
		float h = 1.0 / resolution.y;

		n[0] = texture2D(tex, coord + vec2( -w, -h)).r;
		n[1] = texture2D(tex, coord + vec2(0.0, -h)).r;
		n[2] = texture2D(tex, coord + vec2(  w, -h)).r;
		n[3] = texture2D(tex, coord + vec2( -w, 0.0)).r;
		n[4] = texture2D(tex, coord).r;
		n[5] = texture2D(tex, coord + vec2(  w, 0.0)).r;
		n[6] = texture2D(tex, coord + vec2( -w, h)).r;
		n[7] = texture2D(tex, coord + vec2(0.0, h)).r;
		n[8] = texture2D(tex, coord + vec2(  w, h)).r;
	}

	void gaussian(in float x, in float sigma, out float y) {
		const float b = 0.0;
		float exponent = -pow((x-b), 2.0)/(2.0*pow(sigma, 2.0));
		y = exp(exponent)/(sigma*sqrt(2.0*PI));
	}

	void main()
	{
		// Normalized pixel coordinates (from 0 to 1)
		vec2 uv = gl_FragCoord.xy/resolution;
		
		float new_colour = dot(texture2D(texture, uv).rgb, vec3(0.2126, 0.7152, 0.0722));
		
		/* float gaussian_1 = gaussian(, 1);
		float gaussian_2 = gaussian(, 0.3);
		float diff = gaussian_2 - gaussian_1; */
		
		float n[9];
		  make_kernel( n, texture, uv);

		  float sobel_edge_h = 3.0*n[2] + (10.0*n[5]) + 3.0*n[8] - (3.0*n[0] + (10.0*n[3]) + 3.0*n[6]);
		float sobel_edge_v = 3.0*n[0] + (10.0*n[1]) + 3.0*n[2] - (3.0*n[6] + (10.0*n[7]) + 3.0*n[8]);
		
		float blue = 0.0;
		bool d_flag = true;
		
		if (abs(sobel_edge_v) < SOBEL_THRESHOLD) {
			gl_FragColor = vec4(0.0);
			d_flag = false;
		}
		if (abs(sobel_edge_h) < SOBEL_THRESHOLD) {
			gl_FragColor = vec4(0.0);
			d_flag = false;
		}
			
		if (d_flag) {    
			if (abs(abs(sobel_edge_h) - abs(sobel_edge_v)) > 0.25) {
				if (abs(sobel_edge_h) > abs(sobel_edge_v)) {
					gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Horizontal
				} else { 
					gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0); // Vertical
				}
			} else if (sobel_edge_h*sobel_edge_v > 0.0) {
				gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0); // '/'
			} else {
				gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0); // '\\'
			}
		}
		
		
		//gl_FragColor = vec4(abs(sobel_edge_h), abs(sobel_edge_v), blue, 1.0);
	  //gl_FragColor = vec4(0.0, 1.0, 0.0, 0.0);
	  return;
}`;

const edgeFragmentCode = `
precision mediump float;
uniform vec2 resolution;
uniform sampler2D texture;

vec4 convert(in vec4 color) {
  vec4 result = color;
  result.w = 0.0;
  if (color.x + color.y > 1.0) {
    result = vec4(0.0, 0.0, 0.0, 1.0);
  }

  return result;
}

vec4 calc_mode() {
  vec4 count = vec4(0.0, 0.0, 0.0, 0.0);

  vec2 coords = (gl_FragCoord.xy)*8.0; // not UV

  count = count + convert( 
    texture2D(texture, 
              (coords + vec2(0.0, 0.0))/(resolution.xy*8.0)
  ));

  count = count + convert(texture2D(texture, (coords + vec2(0.0, 1.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(0.0, 2.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(0.0, 3.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(0.0, 4.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(0.0, 5.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(0.0, 6.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(0.0, 7.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(1.0, 0.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(1.0, 1.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(1.0, 2.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(1.0, 3.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(1.0, 4.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(1.0, 5.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(1.0, 6.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(1.0, 7.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(2.0, 0.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(2.0, 1.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(2.0, 2.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(2.0, 3.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(2.0, 4.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(2.0, 5.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(2.0, 6.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(2.0, 7.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(3.0, 0.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(3.0, 1.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(3.0, 2.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(3.0, 3.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(3.0, 4.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(3.0, 5.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(3.0, 6.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(3.0, 7.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(4.0, 0.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(4.0, 1.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(4.0, 2.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(4.0, 3.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(4.0, 4.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(4.0, 5.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(4.0, 6.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(4.0, 7.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(5.0, 0.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(5.0, 1.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(5.0, 2.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(5.0, 3.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(5.0, 4.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(5.0, 5.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(5.0, 6.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(5.0, 7.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(6.0, 0.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(6.0, 1.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(6.0, 2.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(6.0, 3.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(6.0, 4.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(6.0, 5.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(6.0, 6.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(6.0, 7.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(7.0, 0.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(7.0, 1.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(7.0, 2.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(7.0, 3.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(7.0, 4.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(7.0, 5.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(7.0, 6.0))/(resolution.xy*8.0) ));
  count = count + convert(texture2D(texture, (coords + vec2(7.0, 7.0))/(resolution.xy*8.0) ));
  return count;
}

void main() {
  vec2 uv = gl_FragCoord.xy/resolution;
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

  vec4 count = vec4(0);
  // vec2 coords = 8.0*gl_FragCoord.xy;

  count = calc_mode();

  //gl_FragColor = vec4(count.xyz, 1.0);

  float highest = max(count.x, max(count.y, max(count.z, count.w)));

  if (highest>11.0) {
    if (count.x == highest) gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); 
    else if (count.y == highest) gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    else if (count.z == highest) gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    else if (count.w == highest) gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
  } 

  //gl_FragColor = vec4(uv.x, uv.y , 0.0, 1.0);
}`;


const aCanvas = document.getElementById("asciiCanvas");
const sCanvas = document.getElementById("sobelCanvas");
const eCanvas = document.getElementById("edgeCanvas");
const intSobel = document.getElementById("intSobel");
const {gl, program} = webGLInit(aCanvas, asciiVertexCode, asciiFragmentCode);
let obj = webGLInit(sCanvas, asciiVertexCode, sobelFragmentCode);
const sgl = obj.gl;
const sprogram = obj.program
obj = webGLInit(eCanvas, asciiVertexCode, edgeFragmentCode);
const egl = obj.gl;
const eprogram = obj.program

const webcamConstraints = {
    audio: false,
    video: {width : 1600, height: 900}
}
let video;
const vidCanvas = document.getElementById("vidcanvas");
const ctx = vidCanvas.getContext("2d");

// Wait for webcam to load
await new Promise(resolve => {
	navigator.mediaDevices
    .getUserMedia(webcamConstraints)
    .then((mediaStream)=>{
        video = document.getElementById("webcam");
        video.srcObject = mediaStream;
        video.onloadedmetadata = () =>{
            video.play();
			resolve()
        };
    })  
    .catch((err)=>{
        console.error('${err.name}: ${err.message}');
    })
});

async function initAscii() {
	const canvasSize = gl.getUniformLocation(program, "canvasSize");
	gl.uniform2f(canvasSize, aCanvas.width, aCanvas.height);

	gl.activeTexture(gl.TEXTURE0)
	const inputImg = ctx.getImageData(0, 0, vidCanvas.width, vidCanvas.height);
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

async function initSobel() {
	const resolution = sgl.getUniformLocation(sprogram, "resolution");
	sgl.uniform2f(resolution, sCanvas.width, sCanvas.height);

	sgl.activeTexture(sgl.TEXTURE0)
	const inputImg = ctx.getImageData(0, 0, vidCanvas.width, vidCanvas.height);
	loadTexture(sgl, inputImg);
}

async function initEdge() {	
	const resolution = egl.getUniformLocation(eprogram, "resolution");
	egl.uniform2f(resolution, eCanvas.width, eCanvas.height);

	let ctx2 = intSobel.getContext("2d");
	ctx2.clearRect(0, 0, intSobel.width, intSobel.height);
	ctx2.drawImage(sCanvas, 0, 0);
	const sData = ctx2.getImageData(0, 0, intSobel.width, intSobel.height);
	egl.activeTexture(egl.TEXTURE0);
	loadTexture(egl, sData);
}

await initAscii();
await initSobel();
await initEdge();
async function render() {	
	ctx.drawImage(video, 0, 0, vidCanvas.width, vidCanvas.height);

	// Update webcam texture
	const inputImg = ctx.getImageData(0, 0, vidCanvas.width, vidCanvas.height);
	gl.activeTexture(gl.TEXTURE0)
	loadTexture(gl, inputImg);
	sgl.activeTexture(sgl.TEXTURE0)
	loadTexture(sgl, inputImg);

	gl.drawArrays(gl.TRIANGLES, 0, 6);
	sgl.drawArrays(sgl.TRIANGLES, 0, 6);

	let ctx2 = intSobel.getContext("2d");
	ctx2.clearRect(0, 0, intSobel.width, intSobel.height);
	ctx2.drawImage(sCanvas, 0, 0);
	const sData = ctx2.getImageData(0, 0, intSobel.width, intSobel.height);
	egl.activeTexture(egl.TEXTURE0);
	loadTexture(egl, sData);

	egl.drawArrays(egl.TRIANGLES, 0, 6);
	requestAnimationFrame(render);
}

render()
