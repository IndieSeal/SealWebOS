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

const videoElement = document.getElementById('sealtok-video');
videoElement.onmousedown = startDragging;

function changeVideo(){
    videoElement.src = realSealVideo2.videoURL;
    videoElement.play();
}

var initialY = 0;
var currentY = 0;
var offsetY = 0;

function startDragging(e){
    console.log("Start");

    e = e || window.event;
    e.preventDefault();

    const rect = videoElement.getBoundingClientRect();
    initialY = e.clientY;
    console.log(`Initial: ${initialY}`);

    currentY = rect.top;
    offsetY = currentY;

    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;
}

function dragElement(e){
    console.log("Move");

    e = e || window.event;
    e.preventDefault();

    offsetY = e.clientY - initialY;

    const rect = videoElement.getBoundingClientRect();

    let windowHeight = window.innerHeight;
    let maxY = windowHeight - rect.height;

    console.log(offsetY);

    videoElement.style.marginTop = `${offsetY}px`;
}

function stopDragging(){
    console.log("Stop");

    document.onmouseup = null;
    document.onmousemove = null;
}