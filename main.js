import * as ascii from "./ascii.js";
import * as gauss from "./gauss.js";
import * as sobel from "./sobel.js";
import * as edge from "./edge.js";

const webcamConstraints = {
    audio: false,
    video: {width : 1600, height: 900}
}
let video;

// Wait for webcam to load
await new Promise(resolve => {
	navigator.mediaDevices
    .getUserMedia(webcamConstraints)
    .then((mediaStream)=>{
        video = document.getElementById("webcam");
        video.srcObject = mediaStream;
        video.onloadedmetadata = () =>{
            video.play();
			resolve()
        };
    })  
    .catch((err)=>{
        console.error('${err.name}: ${err.message}');
    })
});

await gauss.init();
await sobel.init();
await edge.init();
await ascii.init();


const vidCanvas = document.getElementById("vidCanvas");
const ctx = vidCanvas.getContext("2d");

function render() {
	ctx.drawImage(video, 0, 0, vidCanvas.width, vidCanvas.height);
	gauss.render();
	sobel.render();
	edge.render();
	ascii.render();
	requestAnimationFrame(render);
}

render();
