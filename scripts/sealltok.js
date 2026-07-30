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
var realSealVideo3 = new Video('https://cdn.pixabay.com/video/2021/11/03/94464-643067850_tiny.mp4', "Resting seal", "Maybe it's dreaming about eating penguins and squids!");
var realSealVideo4 = new Video('https://cdn.pixabay.com/video/2022/11/08/138259-769141554_tiny.mp4', 'Pool Lessons', "He's resting :D");

const videosElement = document.getElementById('sealtok-videos');

const videoContainerElement = document.getElementById('sealtok-videoContainer');
const videoContainerElementExtra = document.getElementById('sealtok-videoExtraContainer');
const videoElement = document.getElementById('sealtok-video');
const videoElementExtra = document.getElementById('sealtok-videoExtra');

videoContainerElement.onmousedown = startDragging;
videoContainerElement.onclick = pauseVideo;

videoContainerElement.onwheel = scrollVideo;

var initialY = 0;
var currentY = 0;
var offsetY = 0;
const offsetForNew = 500;

var reset = false;
var resetDirection = false;

function pauseVideo(){
    if(currentY != 0) return;
    
    if(!videoElement.paused) videoElement.pause();
    else videoElement.play();
}

function startDragging(e){
    e = e || window.event;
    e.preventDefault();

    const rect = videoContainerElement.getBoundingClientRect();
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
}

function scrollVideo(e){
    if(e.deltaY > 0) scrollDown();
    else scrollUp();
}

function stopDragging(){
    reset = false;

    if(offsetY < -offsetForNew){
        scrollUp();
    }
    else if(offsetY > offsetForNew){
        scrollDown();
    }
    else{
        if(offsetY > 0){
            resetDirection = true;
        }
        else if(offsetY < 0){
            resetDirection = false;
        }

        offsetY = 0;
        reset = true;
    }

    document.onmouseup = null;
    document.onmousemove = null;
}

function scrollUp(){
    reset = false;

    offsetY = -700;
}

function scrollDown(){
    reset = false;

    offsetY = 700;
}

var dragVelocity = 6;

moveElementFunction();
function moveElementFunction(){
    requestAnimationFrame(moveElementFunction);

    currentY = lerp(currentY, offsetY, dragVelocity * deltaTime);
    videoContainerElement.style.marginTop = `${currentY}px`;

    if(abs(currentY) >= abs(offsetY) - 25){
        console.log("finished");
        currentY = offsetY;
        offsetY = 0;

        reset = false;
        videosElement.append(videoContainerElementExtra);
        videoContainerElement.style.marginTop = `0px`;
        videoContainerElementExtra.style.marginTop = "0px";
    }

    if(offsetY > 0 || (reset && resetDirection)){
        videosElement.prepend(videoContainerElementExtra);
        videoContainerElementExtra.style.marginTop = `${currentY-700}px`;
        videoContainerElement.style.marginTop = `0px`;
    }
    else if(offsetY < 0 || (reset && !resetDirection)){
        videosElement.append(videoContainerElementExtra);
        videoContainerElementExtra.style.marginTop = "0px";
    }
}