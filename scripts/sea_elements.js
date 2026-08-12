import { getClampedX, getClampedY, getMaxX, getMaxY, navbarRect } from "./bounds.js";
import { deltaTime } from "./time.js";
import { playSquishGrabAudio } from "./audio.js";
import { instantiateBeforeEnd, isPositionInsideRect, randomBool } from "./mathf.js";
import { biggestZIndex } from "./window_global.js";
import { companionSeal, companionSealImage, fixYou } from "./general.js";
import { isPainting } from "./moving_seal.js";

const fishHolder = document.getElementById('fish_holder');

class Fish{
    initialX = 0;
    initialY = 0;
    
    currentX = -500;
    currentY = 0;

    cursorX = 0;
    cursorY = 0;

    beforeX = 0;
    beforeY = 0;

    dragging = false;
    isResetting = false;

    regularZIndex = 0;
    
    speed = 300;
    
    constructor(src, minX = 56, maxX = 112){
        this.fishElement = instantiateBeforeEnd(`<img id="examplefish" class="sea_fish" src="${src}"></img>`, fishHolder);
        this.fishElement.onmousedown = this.startDragging;

        this.minX = minX;
        this.maxX = maxX;

        this.regularZIndex = this.fishElement.style.zIndex;

        this.resetPosition();
        this.moveFish();
    }

    moveFish = () => {
        requestAnimationFrame(this.moveFish);
        if(this.dragging) return;

        this.currentX -= this.speed * deltaTime;
        if(this.currentX < -128) this.resetPosition();

        this.updatePosition();
    }

    updatePosition = () => {
        this.fishElement.style.left = `${this.currentX}px`;
        this.fishElement.style.top = `${this.currentY}px`;
    }

    resetPosition = () => {
        if(this.isResetting) return;

        this.currentX = -500;
        
        this.isResetting = true;
        setTimeout(() => {
            this.currentX = getMaxX(this.fishElement) + this.fishElement.getBoundingClientRect().width;
            this.currentY = Math.random() * (fishHolder.getBoundingClientRect().height / 4) * (randomBool() ? 1 : -1);
            this.currentY += 100;

            let randomSize = (Math.random() * (this.maxX - this.minX)) + this.minX;
            this.fishElement.style.width = `${randomSize}px`;
            this.fishElement.style.height = `${randomSize}px`;
            
            this.isResetting = false;
        }, Math.ceil(Math.random() * 5000));
    }

    startDragging = (e) => {
        if(isPainting()) return;
        
        e = e || window.event;
        e.preventDefault();

        const rect = this.fishElement.getBoundingClientRect();

        this.beforeX = this.fishElement.offsetLeft;
        this.beforeY = this.fishElement.offsetTop;
        
        document.body.appendChild(this.fishElement);

        this.initialX = e.clientX - rect.left;
        this.initialY = e.clientY - rect.top;

        this.currentX = rect.left;
        this.currentY = rect.top;
        this.cursorX = this.currentX;
        this.cursorY = this.currentY;

        document.onmousemove = this.dragElement;
        document.onmouseup = this.stopDragging;

        this.dragging = true;
        this.fishElement.style.zIndex = biggestZIndex + 1300;

        playSquishGrabAudio();
        this.updatePosition();
    }

    dragElement = (e) => {
        e = e || window.event;
        e.preventDefault();

        this.cursorX = e.clientX - this.initialX;
        this.cursorY = e.clientY - this.initialY;

        this.currentX = getClampedX(this.element, this.cursorX);
        this.currentY = getClampedY(this.element, this.cursorY, false);

        this.updatePosition();
    }

    stopDragging = (e) => {
        document.onmouseup = null;
        document.onmousemove = null;

        fishHolder.appendChild(this.fishElement);

        this.currentX = this.beforeX;
        this.currentY = this.beforeY;

        this.dragging = false;
        this.updatePosition();

        if(isPositionInsideRect(e.clientX, e.clientY, companionSealImage.getBoundingClientRect())) {
            this.resetPosition();
            fixYou();
        }
    }
}

new Fish('./imgs/Fish_1.svg');
new Fish('./imgs/Fish_1.svg');
new Fish('./imgs/Fish_1.svg');
new Fish('./imgs/Fish_1.svg');

new Fish('./imgs/Fish_3.svg', 16, 32);
new Fish('./imgs/Fish_3.svg', 16, 32);
new Fish('./imgs/Fish_3.svg', 16, 32);
new Fish('./imgs/Fish_3.svg', 16, 32);