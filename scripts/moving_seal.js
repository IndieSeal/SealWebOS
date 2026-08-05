import { getClampedX, getClampedY, getMaxX, getMaxY, navbarRect } from "./bounds.js";
import { lerp, distance, randomBool, abs, clamp } from "./mathf.js";
import { deltaTime } from "./time.js";
import { IncreaseZIndex, SubscribeToZIndex } from "./window_global.js";

const movingSealElement = document.getElementById('movingSeal');
const movingSealImageElement = document.getElementById('movingSeal-image');

SubscribeToZIndex(onZIndexIncreased);
document.addEventListener('mousemove', onMouseMove);

var cursorX = 0;
var cursorY = 0;

var currentX = getClampedX(movingSealElement, Math.random() * getMaxX(movingSealElement));
var currentY = getClampedY(movingSealElement, Math.random() * getMaxX(movingSealElement));

var targetX = 0;
var targetY = 0;

var startWithX = false;

var finishedX = false;
var finishedY = false;

randomizeNextPosition();

function onMouseMove(e){
    cursorX = e.clientX;
    cursorY = e.clientY;
}

const baseSealVelocity = 150;

const minArrivalTimeout = 1000;
const maxArrivalTimeout = 3000;

const minPauseTimeout = 200;
const maxPauseTimeout = 800;

moveSeal();
function moveSeal(){
    let velocity = baseSealVelocity * deltaTime;
    
    // false: negative axis, true: positive axis, got it?
    let direction = false;
    let pause = false;

    if((startWithX || finishedY) && !finishedX){
        direction = (currentX - targetX) < 0;
        movingSealImageElement.src = direction ? `./imgs/MovingSeal/Seal1_right.png` : `./imgs/MovingSeal/Seal1_left.png`;

        console.log(`Moving direction: ${direction ? "right" : "left"}`);
        
        currentX = getClampedX(movingSealElement, currentX + (velocity * (direction ? 1 : -1)));
        if(abs(targetX - currentX) < 10) {
            finishedX = true;
            pause = true;
        }
    }
    else if((!startWithX || finishedX) && !finishedY){
        direction = (currentY - targetY) < 0;
        movingSealImageElement.src = direction ? `./imgs/MovingSeal/Seal1_right.png` : `./imgs/MovingSeal/Seal1_left.png`;
        
        console.log(`Moving direction: ${direction ? "down" : "up"}`);

        currentY = getClampedY(movingSealElement, currentY + (velocity * (direction ? 1 : -1)));
        if(abs(targetY - currentY) < 10){
            finishedY = true;
            pause = true;
        }
    }

    movingSealElement.style.left = `${currentX}px`;
    movingSealElement.style.top = `${currentY}px`;

    if(finishedX && finishedY) {
        randomizeNextPosition();
        setTimeout(moveSeal, clamp(minArrivalTimeout, maxArrivalTimeout, Math.random() * maxArrivalTimeout));
    }
    else if(!pause) requestAnimationFrame(moveSeal);
    else{
        pause = false;
        setTimeout(moveSeal, clamp(minPauseTimeout, maxPauseTimeout, Math.random() * maxPauseTimeout));
    }
}

function onZIndexIncreased(index){
    movingSealElement.style.zIndex = index + 5;
}

function randomizeNextPosition(){
    targetX = getClampedX(movingSealElement, Math.random() * getMaxX(movingSealElement));
    targetY = getClampedY(movingSealElement, Math.random() * getMaxY(movingSealElement));

    startWithX = randomBool();
    finishedX = false;
    finishedY = false;
}