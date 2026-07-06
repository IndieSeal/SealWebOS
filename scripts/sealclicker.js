import { pingpong } from "./mathf.js";

const sealDisplay = document.getElementById("sealclicker-sealdisplay");
const imagesInFolder = 10;
var latestIndex = 0;

function setNewRandomImage(){
    let rand = Math.random() * imagesInFolder;
    let randomIndex = Math.ceil(rand);
    if(randomIndex == latestIndex) randomIndex = pingpong(1, imagesInFolder, randomIndex + 1);
    
    let image = `./imgs/SealClicker/Seal${randomIndex}.jpg`;
    sealDisplay.src = image;
    latestIndex = randomIndex;
}

sealDisplay.addEventListener("click", setNewRandomImage)

setNewRandomImage();