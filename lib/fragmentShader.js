const gaussFragmentShaderSource = `

precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_textureSize;
uniform float u_gaussianKernel1[441];
uniform float u_gaussianKernel2[441];
uniform float u_gaussianKernel1Weight;
uniform float u_gaussianKernel2Weight;

varying vec2 v_texcoord; 

#define GAUSS_THRESHOLD 0.75
void main()
{
    
    vec2 onePixel = vec2(1.0,1.0)/u_textureSize;

    vec4 colorSum=vec4(0.0);
    
    for( int i=-10;i< 11; i++){
        for(int j=-10; j<11;j++){
            colorSum += texture2D(u_texture, v_texcoord + onePixel * vec2(i,j)) * u_gaussianKernel1[(i+10)*21 + (j+10)];
            
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
#define SOBEL_THRESHOLD 0.2

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
    
    if (abs(sobel_edge_v) < SOBEL_THRESHOLD) {
        gl_FragColor = vec4(0.0);
        d_flag = false;
    }
    if (abs(sobel_edge_h) < SOBEL_THRESHOLD) {
        gl_FragColor = vec4(0.0);
        d_flag = false;
    }
        
    if (d_flag) {    
        if (abs(abs(sobel_edge_h) - abs(sobel_edge_v)) > 0.35) {
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

export { gaussFragmentShaderSource, sobelFragmentShaderSource};
