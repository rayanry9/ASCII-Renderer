import {initPositionBuffer, loadShader, loadTexture, set_MVP, blankTexture} from "./helpers.js";

const vsSource = `
attribute vec4 aVertexPosition;
uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;
void main() {
  vec4 vpos = aVertexPosition;
  gl_Position = uProjectionMatrix * uModelViewMatrix * vpos;
}`;

const fs_sebol_source = `

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
  	float sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
    
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

const fs_downscale_source = `
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

  if (count.x>11.0) gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); 
  else if (count.y>11.0) gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
  else if (count.z>11.0) gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
  else if (count.w>11.0) gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);

  //gl_FragColor = vec4(uv.x, uv.y , 0.0, 1.0);
}`;

const fs_draw_Source = `

precision mediump float;
uniform vec2 resolution;
uniform sampler2D texture;

void main() {
  vec2 uv = (gl_FragCoord.xy)/(resolution);
  //vec2 uv = gl_FragCoord.xy/resolution;
  
  gl_FragColor = texture2D(texture, uv);
  //gl_FragColor = vec4(1.0);
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
  const sebolShader = loadShader(gl, gl.FRAGMENT_SHADER, fs_sebol_source);
  const downscaleShader = loadShader(gl, gl.FRAGMENT_SHADER, fs_downscale_source);
  const drawShader = loadShader(gl, gl.FRAGMENT_SHADER, fs_draw_Source);
  
  const SebolProgram = gl.createProgram();
  gl.attachShader(SebolProgram, vertexShader);
  gl.attachShader(SebolProgram, sebolShader);
  gl.linkProgram(SebolProgram);
  
  const downscaleProgram = gl.createProgram();
  gl.attachShader(downscaleProgram, vertexShader);
  gl.attachShader(downscaleProgram, downscaleShader);
  gl.linkProgram(downscaleProgram);

  const drawProgram = gl.createProgram();
  gl.attachShader(drawProgram, vertexShader);
  gl.attachShader(drawProgram, drawShader);
  gl.linkProgram(drawProgram);

  // If creating the shader program failed, alert

  if (!gl.getProgramParameter(SebolProgram, gl.LINK_STATUS) || !gl.getProgramParameter(drawProgram, gl.LINK_STATUS || !gl.getProgramParameter(downscaleProgram, gl.LINK_STATUS))) {
    alert(
      `Unable to initialize the shader program: ${gl.getProgramInfoLog(
        SebolProgram,
      )}`,
    );
    return null;
  }
  
  const sebolProgramInfo = {
  program: SebolProgram,
	attribLocations: {
	  vertexPosition: gl.getAttribLocation(SebolProgram, "aVertexPosition"),
	},
	uniformLocations: {
	  projectionMatrix: gl.getUniformLocation(SebolProgram, "uProjectionMatrix"),
	  modelViewMatrix: gl.getUniformLocation(SebolProgram, "uModelViewMatrix"),
	  resolution: gl.getUniformLocation(SebolProgram, "resolution"),
      texture: gl.getUniformLocation(SebolProgram, "texture")
	},
  };

  const downscaleProgramInfo = {
    program: downscaleProgram,
	attribLocations: {
	  vertexPosition: gl.getAttribLocation(downscaleProgram, "aVertexPosition"),
	},
	uniformLocations: {
	  projectionMatrix: gl.getUniformLocation(downscaleProgram, "uProjectionMatrix"),
	  modelViewMatrix: gl.getUniformLocation(downscaleProgram, "uModelViewMatrix"),
	  resolution: gl.getUniformLocation(downscaleProgram, "resolution"),
      texture: gl.getUniformLocation(downscaleProgram, "texture")
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
  
  const sebol_texture = await blankTexture(gl, 640, 480);
  const sebol_framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, sebol_framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, sebol_texture, 0);

  const downscale_texture = await blankTexture(gl, 80, 60);
  const downscale_frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, downscale_frameBuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, downscale_texture, 0);

  const PositionBuffer = initPositionBuffer(gl);
  
  let buffers = {position: PositionBuffer, texture: in_texture};
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, sebol_framebuffer);
  gl.bindTexture(gl.TEXTURE_2D, in_texture);
  drawIntermediate(gl, sebolProgramInfo, buffers);

  buffers = {position: PositionBuffer, texture: sebol_texture};

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, sebol_texture);
  drawDownscaled(gl, downscaleProgramInfo, buffers);

  // buffers = {position: PositionBuffer, texture: downscale_texture};

  //  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  //  gl.bindTexture(gl.TEXTURE_2D, downscale_texture);
  //  drawScreen(gl, drawProgramInfo, buffers);
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
	[80,60]
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

function drawDownscaled(gl, programInfo, buffers) {
  gl.useProgram(programInfo.program)
  gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
  gl.clearDepth(1.0); // Clear everything
  gl.enable(gl.DEPTH_TEST); // Enable depth testing
  gl.depthFunc(gl.LEQUAL); // Near things obscure far things
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
  set_MVP(gl, programInfo, buffers);
  
  gl.uniform2fv(
  	programInfo.uniformLocations.resolution,
	[80,60]
  )
  
  {
    const offset = 0;
    const vertexCount = 4;
    gl.drawArrays(gl.TRIANGLE_STRIP, offset, vertexCount);
  }
}

await main();