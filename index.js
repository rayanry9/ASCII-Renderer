import {initPositionBuffer, loadShader, loadTexture, set_MVP, blankTexture} from "./helpers.js";

const vsSource = `
attribute vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
  vec4 vpos = aVertexPosition;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vpos;
}`;

const fsSource = `

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

	float sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
    if (sobel_edge_h < 0.2) sobel_edge_h = 0.0;
  	float sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
    
    float blue = 0.0;
    bool d_flag = true;
    
    if (sobel_edge_v < SOBEL_THRESHOLD) {
        sobel_edge_v = 0.0;
        d_flag = false;
    } else if (sobel_edge_h < SOBEL_THRESHOLD) {
        sobel_edge_h = 0.0;
        d_flag = false;
    }
        
    if (d_flag) {    
        if (abs(sobel_edge_h - sobel_edge_v) > 0.25) {
            if (abs(sobel_edge_h) > abs(sobel_edge_v)) {
                sobel_edge_v = 0.0;
                sobel_edge_h = 1.0;
            } else { 
                sobel_edge_h = 0.0;
                sobel_edge_v = 1.0;
            }
        } else if (sobel_edge_h*sobel_edge_v > 0.0) {
            sobel_edge_h = 1.0;
            sobel_edge_v = 1.0;
        } else {
            sobel_edge_h = -1.0;
            sobel_edge_v = -1.0;
            blue = 1.0;
        }
    }
    
    
	gl_FragColor = vec4( abs(sobel_edge_h), abs(sobel_edge_v), blue, 1.0);
    return;    
}`;

const fs_draw_Source = `

precision mediump float;
uniform vec2 resolution;
uniform sampler2D texture;

void main() {
  vec2 uv = gl_FragCoord.xy/resolution;
  gl_FragColor = vec4(texture2D(texture, uv));
}`;


//
// start here
//
async function main() {
  const canvas = document.querySelector("#glcanvas");
  // Initialize the GL context
  const gl = canvas.getContext("webgl");
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const drawShader = loadShader(gl, gl.FRAGMENT_SHADER, fs_draw_Source);
  
  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);
  
  const drawProgram = gl.createProgram();
  gl.attachShader(drawProgram, vertexShader);
  gl.attachShader(drawProgram, drawShader);
  gl.linkProgram(drawProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS) || !gl.getProgramParameter(drawProgram, gl.LINK_STATUS)) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        shaderProgram,
      )}`,
    );
    return null;
  }
  
  const programInfo = {
  program: shaderProgram,
	attribLocations: {
	  vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
	},
	uniformLocations: {
	  projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
	  modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
	  resolution: gl.getUniformLocation(shaderProgram, "resolution"),
      texture: gl.getUniformLocation(shaderProgram, "texture")
	},
  };

  const drawProgramInfo = {
    program: drawProgram,
	attribLocations: {
	  vertexPosition: gl.getAttribLocation(drawProgram, "aVertexPosition"),
	},
	uniformLocations: {
	  projectionMatrix: gl.getUniformLocation(drawProgram, "uProjectionMatrix"),
	  modelViewMatrix: gl.getUniformLocation(drawProgram, "uModelViewMatrix"),
	  resolution: gl.getUniformLocation(drawProgram, "resolution"),
      texture: gl.getUniformLocation(drawProgram, "texture")
	},
  };

  const in_texture = await loadTexture(gl);
  
  const int_texture = await blankTexture(gl);
  const int_frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, int_frameBuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, int_texture, 0);

  const PositionBuffer = initPositionBuffer(gl);
  
  let buffers = {position: PositionBuffer, texture: in_texture};
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, int_frameBuffer);
  gl.bindTexture(gl.TEXTURE_2D, in_texture);
  drawIntermediate(gl, drawProgramInfo, buffers);
  
  buffers = {position: PositionBuffer, texture: int_texture};

 // Draw the scene
 gl.bindFramebuffer(gl.FRAMEBUFFER, null);
 gl.bindTexture(gl.TEXTURE_2D, int_texture);
 drawScreen(gl, programInfo, buffers);
}

function drawScreen(gl, programInfo, buffers) {
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
  set_MVP(gl, programInfo, buffers);
  
  gl.uniform2fv(
  	programInfo.uniformLocations.resolution,
	[640,480]
  )
  
  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

function drawIntermediate(gl, programInfo, buffers) {
  gl.useProgram(programInfo.program)
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
  set_MVP(gl, programInfo, buffers);
  
  gl.uniform2fv(
  	programInfo.uniformLocations.resolution,
	[640,480]
  )
  
  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

await main();