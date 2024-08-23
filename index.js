import { gaussVertexShaderSource } from "./lib/vertexShader.js";
import { gaussFragmentShaderSource, sobelFragmentShaderSource, downscaleFragmentShaderSource, asciiFragmentShaderSource } from "./lib/fragmentShader.js";
import { blankTexture, loadImage, loadShader,loadTexture,} from "./lib/helper.js";

const charsetTexture = await loadImage('charset.png')
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


const SIGMA1 = 2.9;
const SIGMA2 = 10.0;
let kernelSize = 5;


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
kernelSize=21;
for(let i=0;i<kernelSize;i++){
    for(let j=0;j<kernelSize;j++){
        let val =gaussianKernelValues(i,j,SIGMA2) ;
        if(val<SIGMA2 * 10e-8) val=0;
        gaussKernel2[count]=val;
        gaussKernel2Normalizer += val;
        count++;
    }
}

//
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
//
//main(circleImg);

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

    const gaussVertexShader = loadShader(gl, gl.VERTEX_SHADER, gaussVertexShaderSource);
    const gaussFragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, gaussFragmentShaderSource);
    const sobelFragmentShader = loadShader(gl,gl.FRAGMENT_SHADER, sobelFragmentShaderSource);
    const downscaleFragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, downscaleFragmentShaderSource);
    const asciiFragmentShader = loadShader(gl,gl.FRAGMENT_SHADER, asciiFragmentShaderSource);

    const gaussShaderProgram = gl.createProgram();
    gl.attachShader(gaussShaderProgram, gaussVertexShader);
    gl.attachShader(gaussShaderProgram, gaussFragmentShader);
    gl.linkProgram(gaussShaderProgram);

    const sobelShaderProgram = gl.createProgram();
    gl.attachShader(sobelShaderProgram, gaussVertexShader);
    gl.attachShader(sobelShaderProgram, sobelFragmentShader);
    gl.linkProgram(sobelShaderProgram);

    const downscaleShaderProgram = gl.createProgram();
    gl.attachShader(downscaleShaderProgram, gaussVertexShader);
    gl.attachShader(downscaleShaderProgram, downscaleFragmentShader);
    gl.linkProgram(downscaleShaderProgram);

    const asciiShaderProgram = gl.createProgram();
    gl.attachShader(asciiShaderProgram, gaussVertexShader);
    gl.attachShader(asciiShaderProgram, asciiFragmentShader);
    gl.linkProgram(asciiShaderProgram);   

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(gaussShaderProgram, gl.LINK_STATUS) || !gl.getProgramParameter(sobelShaderProgram, gl.LINK_STATUS) ||  !gl.getProgramParameter(downscaleShaderProgram, gl.LINK_STATUS) || !gl.getProgramParameter(asciiShaderProgram,gl.LINK_STATUS)) {
        alert(
            `Unable to initialize the shader program: ${gl.getProgramInfoLog(
                gaussShaderProgram,
            )}`,
        );
        return null;
    }

    gl.viewport(0,0,gl.canvas.width,gl.canvas.height);
    gl.clearColor(0,0,0,0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const intermediateTexture = blankTexture(gl)

    const frameBuffer = gl.createFramebuffer()
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,intermediateTexture,0);


    const inTexture =  loadTexture(gl,texture);
    // TEXTURE AND POSITION COORDS AND BUFFER

    const positionBuffer = gl.createBuffer();
    const textureCoordBuffer = gl.createBuffer();
    const positions = [1.0,1.0, 1.0,-1.0, -1.0,1.0, -1.0,-1.0];
    const textureCoords = [1.0,1.0, 1.0,0.0, 0.0,1.0, 0.0,0.0];

    // A S C I I   S H A D E R
 /*   
    {
        gl.useProgram(asciiShaderProgram);

        const vertexPositionAttributeLocation=gl.getAttribLocation(gaussShaderProgram, "a_vertexPosition");
        const textureCoordsAttributeLocation=gl.getAttribLocation(gaussShaderProgram, "a_texcoord");

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions),gl.STATIC_DRAW);
        gl.enableVertexAttribArray(vertexPositionAttributeLocation);
        gl.vertexAttribPointer(vertexPositionAttributeLocation,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),gl.STATIC_DRAW);
        gl.enableVertexAttribArray(textureCoordsAttributeLocation);
        gl.vertexAttribPointer(textureCoordsAttributeLocation,2,gl.FLOAT,false,0,0);
        
        const textureSizeUniformLocation = gl.getUniformLocation(asciiShaderProgram, "u_textureSize");
        const inputUniformLocation = gl.getUniformLocation(asciiShaderProgram, "u_input");
        const charsetUniformLocation = gl.getUniformLocation(asciiShaderProgram, "u_charset");

        gl.uniform2f(textureSizeUniformLocation, texture.width, texture.height);
        gl.uniform1i(inputUniformLocation, 0);

        const charsetTexture2D = loadTexture(gl, charsetTexture);
        gl.uniform1i(charsetUniformLocation, 1);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, inTexture)
        
        gl.activeTexture(gl.TEXTURE1)
        gl.bindTexture(gl.TEXTURE_2D, charsetTexture2D)

        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    }
    */
//

    // G A U S S I A N   D I F F E R E N C E     S H A D E R
    //
    {
        gl.useProgram(gaussShaderProgram);

        const vertexPositionAttributeLocation=gl.getAttribLocation(gaussShaderProgram, "a_vertexPosition");
        const textureCoordsAttributeLocation=gl.getAttribLocation(gaussShaderProgram, "a_texcoord");

        const gaussianKernel1UniformLocation = gl.getUniformLocation(gaussShaderProgram, "u_gaussianKernel1");
        const gaussianKernel1WeightUniformLocation = gl.getUniformLocation(gaussShaderProgram, "u_gaussianKernel1Weight");
        const gaussianKernel2UniformLocation = gl.getUniformLocation(gaussShaderProgram, "u_gaussianKernel2");
        const gaussianKernel2WeightUniformLocation = gl.getUniformLocation(gaussShaderProgram, "u_gaussianKernel2Weight");
        const uniformTexture = gl.getUniformLocation(gaussShaderProgram,"u_texture");
        const textureSizeUniformLocation = gl.getUniformLocation(gaussShaderProgram, "u_textureSize");

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
    //
    // S O B E L     S H A D E R
//
        {
        gl.useProgram(sobelShaderProgram);

        const vertexPositionAttributeLocation=gl.getAttribLocation(sobelShaderProgram, "a_vertexPosition");
        const textureCoordsAttributeLocation=gl.getAttribLocation(sobelShaderProgram, "a_texcoord");


        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions),gl.STATIC_DRAW);
        gl.enableVertexAttribArray(vertexPositionAttributeLocation);
        gl.vertexAttribPointer(vertexPositionAttributeLocation,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),gl.STATIC_DRAW);
        gl.enableVertexAttribArray(textureCoordsAttributeLocation);
        gl.vertexAttribPointer(textureCoordsAttributeLocation,2,gl.FLOAT,false,0,0);

        const textureSizeUniformLocation = gl.getUniformLocation(sobelShaderProgram, "u_textureSize");
        const textureUniformLocation = gl.getUniformLocation(sobelShaderProgram, "u_texture");

        gl.bindTexture(gl.TEXTURE_2D, intermediateTexture);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, inTexture, 0);

        gl.uniform1i(textureUniformLocation, 0);
        gl.uniform2f(textureSizeUniformLocation, texture.width, texture.height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        //gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0 ,4);

    }
    //
    // D O W N S C A L E     S H A D E R
    {
        gl.useProgram(downscaleShaderProgram);

        const vertexPositionAttributeLocation=gl.getAttribLocation(downscaleShaderProgram, "a_vertexPosition");
        const textureCoordsAttributeLocation=gl.getAttribLocation(downscaleShaderProgram, "a_texcoord");


        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions),gl.STATIC_DRAW);
        gl.enableVertexAttribArray(vertexPositionAttributeLocation);
        gl.vertexAttribPointer(vertexPositionAttributeLocation,2,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER, textureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords),gl.STATIC_DRAW);
        gl.enableVertexAttribArray(textureCoordsAttributeLocation);
        gl.vertexAttribPointer(textureCoordsAttributeLocation,2,gl.FLOAT,false,0,0);

        const textureSizeUniformLocation = gl.getUniformLocation(downscaleShaderProgram, "u_textureSize");
        const textureUniformLocation = gl.getUniformLocation(downscaleShaderProgram, "u_texture");

        gl.bindTexture(gl.TEXTURE_2D, inTexture);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, intermediateTexture, 0);

        gl.uniform1i(textureUniformLocation, 0);
        gl.uniform2f(textureSizeUniformLocation, texture.width, texture.height);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0 ,4);
    }
    //
}


