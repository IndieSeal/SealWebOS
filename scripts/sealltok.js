import { abs, clamp, lerp, shuffle } from "./mathf.js";
import { deltaTime } from "./time.js";
import { getWindow, selectedWindow } from "./window_manager.js";

//List that will contain the videos you've scrolled in order so you can go back to them! :D
var allVideos = [];

class Video{
    constructor(url, title, description, leftOffset = '50%', topOffset = '50%'){
        this.videoURL = url;
        this.videoTitle = title;
        this.videoDescription = description;
        this.leftOffset = leftOffset;
        this.topOffset = topOffset;

        allVideos.push(this);
    }
}

var realSealVideo1 = new Video('https://cdn.pixabay.com/video/2024/03/22/205259-926528122_medium.mp4', "Cute seal hanging out in beach", "I found this cute seal on the beach the other day, look at this cutie patootie.");
var realSealVideo2 = new Video('https://cdn.pixabay.com/video/2021/11/03/94465-643067851_tiny.mp4', "Aquarium seal", "Is it just me, or does it look like it's meditating? haha, it's so cuteee, SO CUTE, RAAH.");
var realSealVideo3 = new Video('https://cdn.pixabay.com/video/2021/11/03/94464-643067850_tiny.mp4', "Resting seal", "Maybe it's dreaming about eating penguins and squids!", '70%');
var realSealVideo4 = new Video('https://cdn.pixabay.com/video/2022/11/08/138259-769141554_tiny.mp4', 'Pool lessons', "They seem to be resting, must have had a pretty tiring swimming lesson D:");
var realSealVideo5 = new Video('https://upload.wikimedia.org/wikipedia/commons/7/70/Harbor_seal_2024_10_19_02.webm', 'Confused seal', "I don't think it knows it's out of the water haha.");
var realSealVideo6 = new Video('https://upload.wikimedia.org/wikipedia/commons/d/d2/Steller_sea_lions_%28Eumetopias_jubatus%29_in_Alaska.webm', 'Seal Group', "They're all just resting, look at them!!!<br>They're probably so chonky because of how many penguins they ate.")
var realSealVideo7 = new Video('https://cdn.pixabay.com/video/2025/07/06/289882_tiny.mp4', 'Hunting time', "Looks like they're about to dive into the water for some fresh fish!", '30%');
var realSealVideo8 = new Video('https://cdn.pixabay.com/video/2024/06/29/218667_tiny.mp4', 'Sleepy Seal', "He's just really sleepy isn't he?<br>LET HIM RESTTTT!!");
var realSealVideo9 = new Video('https://cdn.pixabay.com/video/2025/06/09/284556_tiny.mp4', 'Seal reunion', "Are they here to play Pocket Monster Go or something? Is there a raid no one told me about?");
var realSealVideo10 = new Video('https://cdn.pixabay.com/video/2025/04/21/273311_tiny.mp4', 'Scuba diving seal encounter', "While scuba diving, I found this group of seals, and this one got real close to me haha.");
var realSealVideo11 = new Video('https://cdn.pixabay.com/video/2025/02/26/261048_tiny.mp4', 'Kissing practice?', "Is it just me or does it look like it's trying to practice kissing, or maybe it's got the itches.<br>We'll never know.");
var realSealVideo12 = new Video('https://upload.wikimedia.org/wikipedia/commons/1/13/Harbor_seals_%28Phoca_vitulina%29.webm', 'Swimming seals', "They're just swimming around in the aquarium.<br>They kinda look like the chonky seal plushies lol.");

allVideos = shuffle(allVideos);

const videosElement = document.getElementById('sealtok-videos');

const videoContainerElement = document.getElementById('sealtok-videoContainer');
const videoContainerElementExtra = document.getElementById('sealtok-videoExtraContainer');
const videoElement = document.getElementById('sealtok-video');
const videoElementExtra = document.getElementById('sealtok-videoExtra');

videoElement.volume = 0.25;

const videoNameElement = document.getElementById('sealtok-videoName');
const videoDescriptionElement = document.getElementById('sealtok-videoDescription');

const videoPauseElement = document.getElementById('sealtok-pause');

videoContainerElement.onmousedown = startDragging;
videoContainerElement.onwheel = scrollVideo;
videoContainerElement.onclick = pauseVideo;

var initialY = 0;
var currentY = 0;
var offsetY = 0;
const offsetForNew = 500;

var reset = false;
var resetDirection = false;
var scrolling = false;

var isDragging = false;
var showFirstExtra = false;

var scrolledVideosIndex = 0;
changeVideo();

document.addEventListener('onWindowOpen', (e) => {
    if(e.detail.windowID == 'sealtok') videoElement.play();
});

document.addEventListener('onWindowClose', (e) => {
    if(e.detail.windowID == 'sealtok') videoElement.pause();
});

function changeVideo(){    
    let currentVideo = allVideos[scrolledVideosIndex];

    videoElement.src = `${currentVideo.videoURL}`;
    videoElement.load();

    videoElement.style.objectPosition = `${currentVideo.leftOffset} ${currentVideo.topOffset}`;
    
    videoNameElement.innerHTML = `${currentVideo.videoTitle}`;
    videoDescriptionElement.innerHTML = `${currentVideo.videoDescription}`;
}

function changeExtraVideo(direction){
    let currentVideo = allVideos[scrolledVideosIndex + (!direction ? 1 : -1)];
    
    if(currentVideo == undefined) {
        videoElementExtra.src = `https://cdn.pixabay.com/video/2020/09/26/50913-462202515_medium.mp4`;
        videoElementExtra.load();
        videoElementExtra.pause();

        videoElement.style.objectPosition = `50% 50%`;

        return;
    }
    if(currentVideo.videoURL == videoElementExtra.src) return;
    
    videoElementExtra.src = `${currentVideo.videoURL}`;
    videoElementExtra.load();
    videoElementExtra.pause();

    videoElementExtra.style.objectPosition = `${currentVideo.leftOffset} ${currentVideo.topOffset}`;
}

function pauseVideo(){
    if(currentY != 0) return;
    
    if(!videoElement.paused) {
        videoPauseElement.classList.add('paused');
        videoElement.pause();
    }
    else {
        videoPauseElement.classList.remove('paused');
        videoElement.play();
    }
}

function scrollVideo(e){
    if(e.deltaY < 0) scrollDown();
    else scrollUp();
}

function startDragging(e){
    e = e || window.event;
    e.preventDefault();

    isDragging = true;
    showFirstExtra = true;
    
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
    if(offsetY > 0 && (showFirstExtra || !resetDirection)){
        resetDirection = true;
        changeExtraVideo(resetDirection);

        showFirstExtra = false;
    }
    else if(offsetY < 0 && (showFirstExtra || resetDirection)){
        resetDirection = false;
        changeExtraVideo(resetDirection);

        showFirstExtra = false;
    }
}

function stopDragging(){
    isDragging = false;
    reset = false;

    if(offsetY < -offsetForNew) scrollUp();
    else if(offsetY > offsetForNew) scrollDown();
    else{
        offsetY = 0;
        reset = true;
    }

    document.onmouseup = null;
    document.onmousemove = null;
}

function scrollUp(){
    reset = false;
    resetDirection = true;

    videoPauseElement.classList.remove('paused');
    changeExtraVideo(!resetDirection);

    scrolling = true;

    offsetY = -700;
}

function scrollDown(){
    reset = false;
    resetDirection = false;

    videoPauseElement.classList.remove('paused');
    changeExtraVideo(!resetDirection);
    
    scrolling = true;

    offsetY = 700;
}

var dragVelocity = 6;

moveElementFunction();
function moveElementFunction(){
    requestAnimationFrame(moveElementFunction);

    currentY = lerp(currentY, offsetY, dragVelocity * deltaTime);
    videoContainerElement.style.marginTop = `${currentY}px`;

    if(!isDragging && scrolling && abs(currentY) >= abs(offsetY) - 15){
        currentY = 0;
        offsetY = 0;

        reset = false;
        scrolling = false;

        scrolledVideosIndex = clamp(0, allVideos.length - 1, scrolledVideosIndex + (resetDirection ? 1 : -1));
        
        videosElement.append(videoContainerElementExtra);
        videoContainerElement.style.marginTop = `0px`;
        videoContainerElementExtra.style.marginTop = "0px";

        changeVideo();
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