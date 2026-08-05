import { getClampedX, getClampedY, getMaxX, getMaxY, navbarRect } from "./bounds.js";
import { lerp, distance, randomBool, abs, clamp } from "./mathf.js";
import { deltaTime } from "./time.js";
import { IncreaseZIndex, SubscribeToZIndex } from "./window_global.js";

const baseSealVelocity = 150;

const minArrivalTimeout = 1000;
const maxArrivalTimeout = 3000;

const minPauseTimeout = 200;
const maxPauseTimeout = 800;

// IF YOU'RE GONNA MAKE THEM DRAGGABLE, REMBEMBER THAT POINTER EVENTS IS SET TO NONE IN THE PREFAB, you should thank yourself future me, if this ever happens
class MovingSeal{
    currentX = 0;
    currentY = 0;
    targetX = 0;
    targetY = 0;

    startWithX = false;
    finishedX = false;
    finishedY = false;

    constructor(index){
        this.myId = `movingSeal${index}`;
        this.myImageId = `movingSeal${index}-image`;

        let movingSealPrefab = `
            <div id="${this.myId}" style="pointer-events: none; position: absolute; width: 64px; height: 64px;">
                <img id="${this.myImageId}" style="image-rendering: pixelated;" src="./imgs/MovingSeal/Seal1_right.png">
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', movingSealPrefab);
        
        this.movingSealElement = document.getElementById(this.myId);
        this.movingSealImageElement = document.getElementById(this.myImageId);

        SubscribeToZIndex(this.onZIndexIncreased);

        this.currentX = getClampedX(this.movingSealElement, Math.random() * getMaxX(this.movingSealElement));
        this.currentY = getClampedY(this.movingSealElement, Math.random() * getMaxX(this.movingSealElement));

        this.randomizeNextPosition();
        this.moveSeal();
    }

    moveSeal = () => {
        let velocity = baseSealVelocity * deltaTime;
        
        // false: negative axis, true: positive axis, got it?
        let direction = false;
        let pause = false;

        if((this.startWithX || this.finishedY) && !this.finishedX){
            direction = (this.currentX - this.targetX) < 0;
            this.movingSealImageElement.src = direction ? `./imgs/MovingSeal/Seal1_right.png` : `./imgs/MovingSeal/Seal1_left.png`;

            console.log(`Moving direction: ${direction ? "right" : "left"}`);
            
            this.currentX = getClampedX(this.movingSealElement, this.currentX + (velocity * (direction ? 1 : -1)));
            if(abs(this.targetX - this.currentX) < 10) {
                this.finishedX = true;
                pause = true;
            }
        }
        else if((!this.startWithX || this.finishedX) && !this.finishedY){
            direction = (this.currentY - this.targetY) < 0;
            this.movingSealImageElement.src = direction ? `./imgs/MovingSeal/Seal1_right.png` : `./imgs/MovingSeal/Seal1_left.png`;
            
            console.log(`Moving direction: ${direction ? "down" : "up"}`);

            this.currentY = getClampedY(this.movingSealElement, this.currentY + (velocity * (direction ? 1 : -1)));
            if(abs(this.targetY - this.currentY) < 10){
                this.finishedY = true;
                pause = true;
            }
        }

        this.movingSealElement.style.left = `${this.currentX}px`;
        this.movingSealElement.style.top = `${this.currentY}px`;

        if(this.finishedX && this.finishedY) {
            this.randomizeNextPosition();
            setTimeout(this.moveSeal, clamp(minArrivalTimeout, maxArrivalTimeout, Math.random() * maxArrivalTimeout));
        }
        else if(!pause) requestAnimationFrame(this.moveSeal);
        else{
            pause = false;
            setTimeout(this.moveSeal, clamp(minPauseTimeout, maxPauseTimeout, Math.random() * maxPauseTimeout));
        }
    }

    onZIndexIncreased = (index) => {
        this.movingSealElement.style.zIndex = index + 5;
    }

    randomizeNextPosition = () => {
        this.targetX = getClampedX(this.movingSealElement, Math.random() * getMaxX(this.movingSealElement));
        this.targetY = getClampedY(this.movingSealElement, Math.random() * getMaxY(this.movingSealElement));

        this.startWithX = randomBool();
        this.finishedX = false;
        this.finishedY = false;
    }
}

for (let index = 0; index < 10; index++) {
    let seal = new MovingSeal(index);
}