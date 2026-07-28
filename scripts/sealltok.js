import { abs, clamp, lerp } from "./mathf.js";
import { deltaTime } from "./time.js";

class Video{
    constructor(url, title, description){
        this.videoURL = url;
        this.videoTitle = title;
        this.videoDescription = description;
    }
}

//List that will contain the videos you've scrolled in order so you can go back to them! :D
var scrolledVideos = [];

var realSealVideo1 = new Video('https://cdn.pixabay.com/video/2024/03/22/205259-926528122_medium.mp4', "Cute seal hanging out in beach", "I found this cute seal on the beach the other day, look at this cutie patootie.");
var realSealVideo2 = new Video('https://cdn.pixabay.com/video/2021/11/03/94465-643067851_tiny.mp4', "Aquarium seal", "Is it just me, or does it look like it's meditating? haha, it's so cuteee, SO CUTE, RAAH.");
var realSealVideo2 = new Video('https://cdn.pixabay.com/video/2021/11/03/94464-643067850_tiny.mp4', "Resting seal", "Maybe it's dreaming about eating penguins and squids!");

const videoElementTop = document.getElementById('sealtok-videoTop');
const videoElementMiddle = document.getElementById('sealtok-videoMiddle');
const videoElementBottom = document.getElementById('sealtok-videoBottom');

videoElementTop.onmousedown = startDragging;

function changeVideo(){
    videoElementTop.src = realSealVideo2.videoURL;
    videoElementTop.play();
}

var initialY = 0;
var currentY = 0;
var offsetY = 0;
const offsetForNew = 500;

function startDragging(e){
    e = e || window.event;
    e.preventDefault();

    const rect = videoElementTop.getBoundingClientRect();
    initialY = e.clientY;

    offsetY = e.clientY - initialY;
    currentY = offsetY;

    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
}

function dragElement(e){
    e = e || window.event;
    e.preventDefault();

    offsetY = e.clientY - initialY;

    const rect = videoElement.getBoundingClientRect();

    let windowHeight = window.innerHeight;
    let maxY = windowHeight - rect.height;
}

function stopDragging(){
    if(offsetY < -offsetForNew){
        offsetY = -700;
    }
    else if(offsetY > offsetForNew){
        offsetY = 700;
    }
    else offsetY = 0;
    
    document.onmouseup = null;
    document.onmousemove = null;
}

var dragVelocity = 6;

moveElementFunction();
function moveElementFunction(){
    requestAnimationFrame(moveElementFunction);

    currentY = lerp(currentY, offsetY, dragVelocity * deltaTime);
    console.log(`Current Y: ${currentY}`);

    videoElementTop.style.marginTop = (currentY) + "px";
}