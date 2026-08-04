import { getClampedX, getClampedY, getMaxX, getMaxY, navbarRect } from "./bounds.js";
import { lerp, distance } from "./mathf.js";
import { deltaTime } from "./time.js";
import { IncreaseZIndex, SubscribeToZIndex } from "./window_global.js";

const movingSealElement = document.getElementById('movingSeal');
const movingSealImageElement = document.getElementById('movingSeal-image');

SubscribeToZIndex(onZIndexIncreased);
document.addEventListener('mousemove', onMouseMove);

var cursorX = 0;
var cursorY = 0;

var currentX = 0;
var currentY = 0;

function onMouseMove(e){
    cursorX = e.clientX;
    cursorY = e.clientY;
}

const baseSealVelocity = 150;

moveSeal();
function moveSeal(){
    requestAnimationFrame(moveSeal)

    currentX += baseSealVelocity * deltaTime;
    currentY += baseSealVelocity * deltaTime;
    
    currentX = getClampedX(movingSealElement, currentX);
    currentY = getClampedY(movingSealElement, currentY);

    movingSealElement.style.left = `${currentX}px`;
    movingSealElement.style.top = `${currentY}px`;
}

function onZIndexIncreased(index){
    movingSealElement.style.zIndex = index + 5;
}