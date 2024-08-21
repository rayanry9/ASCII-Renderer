import { vertexShaderSource } from "./lib/vertexShader.js";
import { fragmentShaderSource,fs_draw_Source } from "./lib/fragmentShader.js";
import { loadShader,set_MVP,initPositionBuffer,loadTexture,blankTexture,loadImage } from "./lib/helper.js";
const webcamConstraints = {
    audio: false,
    video: {width : 1600, height: 900}
}
let video
const canvas = document.querySelector("#glcanvas");
const canvasvid = document.getElementById("vidcanvas");
const ctx = canvasvid.getContext("2d");

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

    const in_texture =  loadTexture(gl,texture);

    const int_texture =  blankTexture(gl);
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
