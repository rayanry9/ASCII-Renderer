import { vertexShaderSource } from "./lib/vertexShader.js";
import { fragmentShaderSource } from "./lib/fragmentShader.js";
import { loadShader,loadTexture,} from "./lib/helper.js";
const webcamConstraints = {
    audio: false,
    video: {width : 1600, height: 900}
}
let video
const canvas = document.querySelector("#glcanvas");
const canvasvid = document.getElementById("vidcanvas");
const ctx = canvasvid.getContext("2d");


function gaussianKernelValues(x,y,sigma){
    return Math.pow(Math.E,- ((x*x+y*y)/(2*sigma*sigma)))/(2*Math.PI*sigma*sigma);
}


let SIGMA = 4;
const kernelSize = 21;


let gaussKernel1=[];
let gaussKernel1Normalizer=0.0;
let count=0;

for(let i=0;i<kernelSize;i++){
    for(let j=0;j<kernelSize;j++){
        let val =gaussianKernelValues(i,j,SIGMA) ;
        if(val<SIGMA * 10e-8) val=0;
        gaussKernel1[count]=val;
        gaussKernel1Normalizer += val;
        count++;
    }
}

console.log(gaussKernel1)
SIGMA = 1;

let gaussKernel2=[];
let gaussKernel2Normalizer=0.0;
count=0;
for(let i=0;i<kernelSize;i++){
    for(let j=0;j<kernelSize;j++){
        let val =gaussianKernelValues(i,j,SIGMA) ;
        if(val<SIGMA * 10e-8) val=0;
        gaussKernel2[count]=val;
        gaussKernel2Normalizer += val;
        count++;
    }
}


/*let gaussKernel1 = [
     -1, -1, -1,
     -1,  8, -1,
     -1, -1, -1
 ];
 */

/*
gaussKernelSubValue00= gaussianKernelValues(0,0,SIGMA);
gaussKernelSubValue10 = gaussianKernelValues(1,0,SIGMA);
gaussKernelSubValue20 = gaussianKernelValues(2,0,SIGMA);
gaussKernelSubValue11 = gaussianKernelValues(1,1,SIGMA);
gaussKernelSubValue12 = gaussianKernelValues(1,2,SIGMA);
gaussKernelSubValue22 = gaussianKernelValues(2,2,SIGMA);

let gaussKernel2Normalizer = gaussKernelSubValue00 + gaussKernelSubValue10 * 4+ gaussKernelSubValue20 *4 + gaussKernelSubValue11 *4 + gaussKernelSubValue12 * 8 + gaussKernelSubValue22 * 4;

let gaussKernel2 = [
    gaussKernelSubValue22,gaussKernelSubValue12,gaussKernelSubValue20,gaussKernelSubValue12,gaussKernelSubValue22,
    gaussKernelSubValue12, gaussKernelSubValue11,gaussKernelSubValue10, gaussKernelSubValue11,gaussKernelSubValue12,
    gaussKernelSubValue20,gaussKernelSubValue10, gaussKernelSubValue00,gaussKernelSubValue10,gaussKernelSubValue20,
    gaussKernelSubValue12,gaussKernelSubValue11,gaussKernelSubValue10,gaussKernelSubValue11,gaussKernelSubValue12,
    gaussKernelSubValue22,gaussKernelSubValue12,gaussKernelSubValue20,gaussKernelSubValue12,gaussKernelSubValue22
];
*/


navigator.mediaDevices
    .getUserMedia(webcamConstraints)
    .then((mediaStream)=>{
        video = document.getElementById("webcam");
        video.srcObject = mediaStream;
        video.onloadedmetadata = () =>{

            video.play();
            const updateCanvas = (now, metadata) => {

                ctx.drawImage(video, 0, 0, canvasvid.width, canvasvid.height);

                main(ctx.getImageData(0,0,canvasvid.width,canvasvid.height))
                video.requestVideoFrameCallback(updateCanvas);

            };  

            video.requestVideoFrameCallback(updateCanvas);  
        };

    })  
    .catch((err)=>{
        console.error('${err.name}: ${err.message}');
    })

function main(texture) {
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

    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                shaderProgram,
            )}`,
        );
        return null;
    }

    gl.useProgram(shaderProgram);
    gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const inTexture =  loadTexture(gl,texture);


    const vertexPositionAttributeLocation=gl.getAttribLocation(shaderProgram, "a_vertexPosition");
    const textureCoordsAttributeLocation=gl.getAttribLocation(shaderProgram, "a_texcoord");
    const gaussianKernel1UniformLocation = gl.getUniformLocation(shaderProgram, "u_gaussianKernel1");
    const gaussianKernel1WeightUniformLocation = gl.getUniformLocation(shaderProgram, "u_gaussianKernel1Weight");
    const gaussianKernel2UniformLocation = gl.getUniformLocation(shaderProgram, "u_gaussianKernel2");
    const gaussianKernel2WeightUniformLocation = gl.getUniformLocation(shaderProgram, "u_gaussianKernel2Weight");
    const uniformTexture = gl.getUniformLocation(shaderProgram,"u_texture");
    const textureSizeUniformLocation = gl.getUniformLocation(shaderProgram, "u_textureSize");

    const positionBuffer = gl.createBuffer();
    const textureCoordBuffer = gl.createBuffer();
    const positions = [1.0,1.0,1.0,-1.0,-1.0,1.0,-1.1,-1.1];
    const textureCoords = [1.0,1.0,1.0,0.0,0.0,1.0,0.0,0.0];

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);
    gl.vertexAttribPointer(vertexPositionAttributeLocation,2,gl.FLOAT,false,0,0);

    gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(textureCoordsAttributeLocation);
    gl.vertexAttribPointer(textureCoordsAttributeLocation,2,gl.FLOAT,false,0,0);


    gl.uniform1fv(gaussianKernel1UniformLocation,gaussKernel1);
    gl.uniform1fv(gaussianKernel2UniformLocation,gaussKernel2);
    gl.uniform1f(gaussianKernel1WeightUniformLocation, gaussKernel1Normalizer);
    gl.uniform1f(gaussianKernel2WeightUniformLocation, gaussKernel2Normalizer);
    gl.uniform1i(uniformTexture, 0);
    gl.uniform2f(textureSizeUniformLocation, texture.width, texture.height);

    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

}


