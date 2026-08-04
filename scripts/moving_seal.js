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

var currentX = getClampedX(movingSealElement, 0);
var currentY = getClampedY(movingSealElement, 0);

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

const baseSealVelocity = 1;

const minTimeout = 1000;
const maxTimeout = 3000;

moveSeal();
function moveSeal(){
    let velocity = baseSealVelocity * deltaTime;
    
    if((startWithX || finishedY) && !finishedX){
        currentX = getClampedX(movingSealElement, lerp(currentX, targetX, velocity));
        if(abs(targetX - currentX) < 10) finishedX = true;
    }
    else if((!startWithX || finishedX) && !finishedY){
        currentY = getClampedY(movingSealElement, lerp(currentY, targetY, velocity));
        if(abs(targetY - currentY) < 10) finishedY = true;
    }

    movingSealElement.style.left = `${currentX}px`;
    movingSealElement.style.top = `${currentY}px`;

    if(finishedX && finishedY) {
        randomizeNextPosition();
        setTimeout(moveSeal, clamp(minTimeout, maxTimeout, Math.random() * maxTimeout));
    }
    else requestAnimationFrame(moveSeal);
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