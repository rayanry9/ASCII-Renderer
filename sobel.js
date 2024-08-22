const vertexCode = `	
	#version 100

	attribute vec4 position;

	void main() {
	  gl_Position = position;
	}
`;

const fragmentCode = `
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

const canvasOut = document.getElementById("sobelCanvas");
const canvasIn = document.getElementById("vidCanvas");
const ctx = canvasIn.getContext('2d');
const {gl, program} = webGLInit(canvasOut, vertexCode, fragmentCode);

export async function init() {	
	const resolution = gl.getUniformLocation(program, "resolution");
	gl.uniform2f(resolution, canvasOut.width, canvasOut.height);

	gl.activeTexture(gl.TEXTURE0)
	const inputImg = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
	loadTexture(gl, inputImg);
}

export function render() {
	gl.activeTexture(gl.TEXTURE0)
	const inputImg = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
	loadTexture(gl, inputImg);
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}
