const gaussFragmentShaderSource = `

precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_textureSize;
uniform float u_gaussianKernel1[25];
uniform float u_gaussianKernel2[441];
uniform float u_gaussianKernel1Weight;
uniform float u_gaussianKernel2Weight;

varying vec2 v_texcoord; 

#define GAUSS_THRESHOLD 0.6

void main()
{
    
    vec2 onePixel = vec2(1.0,1.0)/u_textureSize;

    vec4 colorSum=vec4(0.0);
    
    for( int i=-2;i< 3; i++){
        for(int j=-2; j<3;j++){
            colorSum += texture2D(u_texture, v_texcoord + onePixel * vec2(i,j)) * u_gaussianKernel1[(i+2)*5 + (j+2)];
            
        }
    }

    vec4 colorSum2=vec4(0.0);
    
    for( int i=-10;i< 11; i++){
        for(int j=-10; j<11;j++){
            colorSum2 += texture2D(u_texture, v_texcoord + onePixel * vec2(i,j)) * u_gaussianKernel2[(i+10)*21 + (j+10)];
            
        }
    }
	vec4 color = vec4((colorSum/u_gaussianKernel1Weight - colorSum2/u_gaussianKernel2Weight).rgb+(GAUSS_THRESHOLD/10.0), 1.0);

    if(color.r>0.1 || color.g>0.1 || color.b>0.1){
        color=vec4(1.0);
    }
    else {
        color=vec4(0.0);
    }

    gl_FragColor= color;

    return;    
}`;

const sobelFragmentShaderSource = `

precision mediump float;
uniform vec2 u_textureSize;
uniform sampler2D u_texture;

#define PI 3.1415926
#define SOBEL_THRESHOLD 0.15

void make_kernel(inout float n[9], sampler2D tex, vec2 coord)
{
	float w = 1.0 / u_textureSize.x;
	float h = 1.0 / u_textureSize.y;

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

void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = gl_FragCoord.xy/u_textureSize;
    
    float new_colour = dot(texture2D(u_texture, uv).rgb, vec3(0.2126, 0.7152, 0.0722));
	
    float n[9];
	  make_kernel( n, u_texture, uv);

	  float sobel_edge_h = n[2] + (2.0*n[5]) + n[8] - (n[0] + (2.0*n[3]) + n[6]);
  	float sobel_edge_v = n[0] + (2.0*n[1]) + n[2] - (n[6] + (2.0*n[7]) + n[8]);
    
    float blue = 0.0;
    bool d_flag = true;
    
    if (abs(sobel_edge_v) < SOBEL_THRESHOLD && abs(sobel_edge_h) < SOBEL_THRESHOLD) {
        gl_FragColor = vec4(0.0);
        d_flag = false;
    }
        
    if (d_flag) {    
        if (abs(abs(sobel_edge_h) - abs(sobel_edge_v)) > 0.35* 5.0) {
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

const downscaleFragmentShaderSource = `
precision mediump float;
uniform vec2 u_textureSize;
uniform sampler2D u_texture;

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
    texture2D(u_texture, 
              (coords + vec2(0.0, 0.0))/(u_textureSize.xy)
  ));

  count = count + convert(texture2D(u_texture, (coords + vec2(0.0, 1.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(0.0, 2.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(0.0, 3.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(0.0, 4.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(0.0, 5.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(0.0, 6.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(0.0, 7.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(1.0, 0.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(1.0, 1.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(1.0, 2.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(1.0, 3.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(1.0, 4.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(1.0, 5.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(1.0, 6.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(1.0, 7.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(2.0, 0.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(2.0, 1.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(2.0, 2.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(2.0, 3.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(2.0, 4.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(2.0, 5.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(2.0, 6.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(2.0, 7.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(3.0, 0.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(3.0, 1.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(3.0, 2.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(3.0, 3.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(3.0, 4.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(3.0, 5.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(3.0, 6.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(3.0, 7.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(4.0, 0.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(4.0, 1.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(4.0, 2.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(4.0, 3.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(4.0, 4.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(4.0, 5.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(4.0, 6.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(4.0, 7.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(5.0, 0.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(5.0, 1.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(5.0, 2.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(5.0, 3.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(5.0, 4.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(5.0, 5.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(5.0, 6.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(5.0, 7.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(6.0, 0.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(6.0, 1.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(6.0, 2.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(6.0, 3.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(6.0, 4.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(6.0, 5.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(6.0, 6.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(6.0, 7.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(7.0, 0.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(7.0, 1.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(7.0, 2.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(7.0, 3.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(7.0, 4.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(7.0, 5.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(7.0, 6.0))/(u_textureSize.xy) ));
  count = count + convert(texture2D(u_texture, (coords + vec2(7.0, 7.0))/(u_textureSize.xy) ));
  return count;
}

void main() {
  vec2 uv = gl_FragCoord.xy/u_textureSize;
  gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

  vec4 count = vec4(0);
  // vec2 coords = 8.0*gl_FragCoord.xy;

  count = calc_mode();

  //gl_FragColor = vec4(count.xyz, 1.0);

  float highest = max(count.x, max(count.y, max(count.z, count.w)));

  if (highest>13.0) {
    if (count.x == highest) gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); 
    else if (count.y == highest) gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
    else if (count.z == highest) gl_FragColor = vec4(1.0, 1.0, 0.0, 1.0);
    else if (count.w == highest) gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
  } 

  //gl_FragColor = vec4(uv.x, uv.y , 0.0, 1.0);
}`


const asciiFragmentShaderSource = `
	precision highp float;
	uniform vec2 u_textureSize;
	uniform sampler2D u_input;
	uniform sampler2D u_charset;

    varying vec2 v_texcoord;
	float luminance(vec4 rgba) {
		return dot(rgba.xyz, vec3(0.2126, 0.7152, 0.0722));
	}

	void main() {
		vec2 coord = gl_FragCoord.xy - mod(gl_FragCoord.xy, 8.0);
		vec4 rgba = texture2D(u_input, coord / u_textureSize);
		
		float offset = 8.0*floor(luminance(rgba)*10.0);
		vec2 uv = vec2(
			(offset + mod(gl_FragCoord.x, 8.0)) / 88.0,
			mod(gl_FragCoord.y, 8.0) / 8.0
		);
		gl_FragColor = texture2D(u_charset, uv) +0.1;
	}
`;


export { gaussFragmentShaderSource, sobelFragmentShaderSource, downscaleFragmentShaderSource, asciiFragmentShaderSource};
