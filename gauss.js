const vertexCode = `	
	#version 100

	attribute vec4 position;

	void main() {
	  gl_Position = position;
	}
`;

const fragmentCode = `

precision mediump float;
uniform sampler2D u_texture;
uniform vec2 u_textureSize;
uniform vec2 resolution;
uniform float u_gaussianKernel1[441];
uniform float u_gaussianKernel2[441];
uniform float u_gaussianKernel1Weight;
uniform float u_gaussianKernel2Weight;

#define GAUSS_THRESHOLD 1.1
void main()
{
	vec2 v_texcoord = gl_FragCoord.xy / resolution;
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

function gaussianKernelValues(x, y, sigma){
    return Math.pow(Math.E,- ((x*x+y*y)/(2*sigma*sigma)))/(2*Math.PI*sigma*sigma);
}


const SIGMA1 = 1.0;
const SIGMA2 = 0.7;
const kernelSize = 21;

const canvasOut = document.getElementById("gaussCanvas");
const canvasIn = document.getElementById("vidCanvas");
const ctx = canvasIn.getContext('2d');
const {gl, program} = webGLInit(canvasOut, vertexCode, fragmentCode);

export async function init() {	
	let gaussKernel1=[];
	let gaussKernel1Normalizer=0.0;
	let count=0;

	for(let i=0;i<kernelSize;i++){
		for(let j=0;j<kernelSize;j++){
			let val =gaussianKernelValues(i,j,SIGMA1) ;
			if(val<SIGMA1 * 10e-8) val=0;
			gaussKernel1[count]=val;
			gaussKernel1Normalizer += val;
			count++;
		}
	}

	console.log(gaussKernel1)

	let gaussKernel2=[];
	let gaussKernel2Normalizer=0.0;
	count=0;
	for(let i=0;i<kernelSize;i++){
		for(let j=0;j<kernelSize;j++){
			let val =gaussianKernelValues(i,j,SIGMA2) ;
			if(val<SIGMA2 * 10e-8) val=0;
			gaussKernel2[count]=val;
			gaussKernel2Normalizer += val;
			count++;
		}
	}

	const kernel1 = gl.getUniformLocation(program, "u_gaussianKernel1");
	gl.uniform1fv(kernel1, gaussKernel1);
	const kernel1weight = gl.getUniformLocation(program, "u_gaussianKernel1Weight");
	gl.uniform1f(kernel1weight, gaussKernel1Normalizer);

	const kernel2 = gl.getUniformLocation(program, "u_gaussianKernel2");
	gl.uniform1fv(kernel2, gaussKernel2);
	const kernel2weight = gl.getUniformLocation(program, "u_gaussianKernel2Weight");
	gl.uniform1f(kernel2weight, gaussKernel2Normalizer);

	const textureSize = gl.getUniformLocation(program, "u_textureSize");
	gl.uniform2f(textureSize, canvasIn.width, canvasIn.height);

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
