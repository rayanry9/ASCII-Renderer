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


const canvasOut = document.getElementById("edgeCanvas");
const canvasSrc = document.getElementById("sobelCanvas");
const canvasIn = document.getElementById("intSobel");
const ctx = canvasIn.getContext("2d");

const {gl, program} = webGLInit(canvasOut, vertexCode, fragmentCode);

export async function init() {
	const resolution = gl.getUniformLocation(program, "resolution");
	gl.uniform2f(resolution, canvasOut.width, canvasOut.height);

	ctx.clearRect(0, 0, canvasIn.width, canvasIn.height);
	ctx.drawImage(canvasSrc, 0, 0);
	
	const inputImg = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
	gl.activeTexture(gl.TEXTURE0);
	loadTexture(gl, inputImg);	
}

export function render() {
	ctx.clearRect(0, 0, canvasIn.width, canvasIn.height);
	ctx.drawImage(canvasSrc, 0, 0);
	
	const inputImg = ctx.getImageData(0, 0, canvasIn.width, canvasIn.height);
	gl.activeTexture(gl.TEXTURE0);
	loadTexture(gl, inputImg);	
	
	gl.drawArrays(gl.TRIANGLES, 0, 6);
}
