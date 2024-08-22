const fragmentShaderSource = `

precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_textureSize;
uniform float u_gaussianKernel1[441];
uniform float u_gaussianKernel2[441];
uniform float u_gaussianKernel1Weight;
uniform float u_gaussianKernel2Weight;

varying vec2 v_texcoord; 

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
/*    
    vec4 colorSum2 = 
        texture2D(u_texture, v_texcoord + onePixel*vec2(-2,2))* u_gaussianKernel2[0] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(-1,2))* u_gaussianKernel2[1] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(0,2))* u_gaussianKernel2[2] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(1,2))* u_gaussianKernel2[3] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(2,2))* u_gaussianKernel2[4] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(-2,1))* u_gaussianKernel2[5] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(-1,1))* u_gaussianKernel2[6] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(0,1))* u_gaussianKernel2[7] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(1,1))* u_gaussianKernel2[8] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(2,1))* u_gaussianKernel2[9] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(-2,0))* u_gaussianKernel2[10] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(-1,0))* u_gaussianKernel2[11] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(0,0))* u_gaussianKernel2[12] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(1,0))* u_gaussianKernel2[13] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(2,0))* u_gaussianKernel2[14] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(-2,-1))* u_gaussianKernel2[15] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(-1,-1))* u_gaussianKernel2[16] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(0,-1))* u_gaussianKernel2[17] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(1,-1))* u_gaussianKernel2[18] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(2,-1))* u_gaussianKernel2[19] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(-2,2))* u_gaussianKernel2[20] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(-1,2))* u_gaussianKernel2[21] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(0,2))* u_gaussianKernel2[22] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(1,2))* u_gaussianKernel2[23] +
        texture2D(u_texture, v_texcoord + onePixel*vec2(2,2))* u_gaussianKernel2[24]; 

 */ 

	vec4 color = vec4((colorSum/u_gaussianKernel1Weight - colorSum2/u_gaussianKernel2Weight).rgb+0.04, 1.0);

    if(color.r>0.1 || color.g>0.1 || color.b>0.1){
        color=vec4(1.0);
    }
    else {
        color=vec4(0.0);
    }

    gl_FragColor= color;

    return;    
}`;


export { fragmentShaderSource};
