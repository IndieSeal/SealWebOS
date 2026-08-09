import { playBigBoomAudio, playSmallBoomAudio, setupAudioEvents } from "./audio.js";
import { getClampedX, getClampedY, getMaxX, getMaxY, navbarRect } from "./bounds.js";
import { lerp, distance, randomBool, abs, clamp, destroyAfter, pingpong, instantiateBeforeEnd } from "./mathf.js";
import { deltaTime } from "./time.js";
import { biggestZIndex, IncreaseZIndex, SubscribeToZIndex, UnsubscribeToZIndex } from "./window_global.js";

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

    destroying = false;

    animationDelay = clamp(300, 700, Math.random() * 900);
    animationFrame = 0;

    constructor(index, sealType = 1, x = undefined, y = undefined){
        this.index = index;
        this.sealType = sealType;
        
        this.myId = `movingSeal${index}`;
        this.myImageId = `movingSeal${index}-image`;

        let movingSealPrefab = `
            <div id="${this.myId}" style="pointer-events: none; position: absolute; width: 64px; height: 64px;">
                <img id="${this.myImageId}" style="image-rendering: pixelated;" src="./imgs/MovingSeal/Seal1_right.png">
            </div>
        `;

        instantiateBeforeEnd(movingSealPrefab, document.body);
        
        this.movingSealElement = document.getElementById(this.myId);
        this.movingSealImageElement = document.getElementById(this.myImageId);
        this.explodeElement = undefined;

        this.movingSealElement.onclick = this.tryDestroy;

        SubscribeToZIndex(this.onZIndexIncreased);

        this.currentX = getClampedX(this.movingSealElement, x == undefined ? (Math.random() * getMaxX(this.movingSealElement)) : x);
        this.currentY = getClampedY(this.movingSealElement, y == undefined ? (Math.random() * getMaxX(this.movingSealElement)) : y);

        this.randomizeNextPosition();
        this.moveSeal();
        this.animateSeal();
    }

    moveSeal = () => {
        if(this.destroying) return;
        
        let velocity = baseSealVelocity * deltaTime;
        
        // false: negative axis, true: positive axis, got it?
        let direction = false;
        let pause = false;

        if((this.startWithX || this.finishedY) && !this.finishedX){
            direction = (this.currentX - this.targetX) < 0;
            this.movingSealImageElement.src = direction ? `./imgs/MovingSeal/Seal${this.sealType}_right${this.animationFrame}.png` : `./imgs/MovingSeal/Seal${this.sealType}_left${this.animationFrame}.png`;

            this.currentX = getClampedX(this.movingSealElement, this.currentX + (velocity * (direction ? 1 : -1)));
            if(abs(this.targetX - this.currentX) < 10) {
                this.finishedX = true;
                pause = true;
            }
        }
        else if((!this.startWithX || this.finishedX) && !this.finishedY){
            direction = (this.currentY - this.targetY) < 0;
            this.movingSealImageElement.src = direction ? `./imgs/MovingSeal/Seal${this.sealType}_right${this.animationFrame}.png` : `./imgs/MovingSeal/Seal${this.sealType}_left${this.animationFrame}.png`;
            
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

    animateSeal = () => {
        if(this.destroying) return;
        
        this.animationFrame = pingpong(-1, 1, this.animationFrame + 1);
        
        setTimeout(this.animateSeal, this.animationDelay);
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

    tryDestroy = () => {
        this.destroy(false);
    }

    destroy = (force) => {
        if(!tryDeleteSeal(this, force)) return;

        this.destroying = true;
        this.movingSealElement.onclick = null;
        
        UnsubscribeToZIndex(this.onZIndexIncreased);
        
        this.movingSealImageElement.remove();
        destroyAfter(this.movingSealElement, 500);
        destroyAfter(this.explodeElement, 500);
    }
}

const paintOptions = document.getElementById('seal-options');

class PaintInstance{
    destroying = false;

    constructor(index, element, imageElement){
        this.index = index;
        
        this.element = element;
        this.imageElement = imageElement;

        this.element.onclick = this.tryDestroy;
    }
    
    tryDestroy = () => {
        this.destroy(false);
    }

    destroy = (force) => {
        if(!tryDeleteInstance(this, force)) return;

        this.destroying = true;
        this.element.onclick = null;
        
        this.imageElement.remove();
        let explodeElement = instantiateBeforeEnd(explosionPrefab, this.element);
        
        destroyAfter(this.element, 500);
        destroyAfter(explodeElement, 500);
    }
}

//#region Paint Options

//#region Classes

class PaintOption{
    instanceIndex = 0;
    
    constructor(id, src, sizeX = 64, sizeY = 64, offsetX = -64, offsetY = -64){        
        this.myId = id;
        this.src = src;

        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.placeablePrefab = `
            <div class="placeable" style="width: ${sizeX}px; height: ${sizeY}px;">
                <img style="image-rendering: pixelated;" src="${this.src}">
            </div>
        `;
        
        this.boxPrefab = `
            <button id="${this.myId}" class="brush-option_box">
                <div class="innerBox">
                    <img src="${this.src}">
                </div>
            </button>
        `;

        this.ghostInstance = instantiateBeforeEnd(this.placeablePrefab, document.body);
        document.addEventListener('mousemove', this.updateGhost)
        this.ghostInstance.classList.add('ghost');
        this.destroyGhost();
        
        this.boxElement = instantiateBeforeEnd(this.boxPrefab, paintOptions);
        this.boxElement.style.pointerEvents = 'auto';

        this.boxElement.onclick = () => setPaintOption(this);
        setupAudioEvents(this.boxElement);

        paintOptionList.push(this);
    }

    createGhost = () => {
        this.ghostInstance.style.display = 'inline';
    }
    
    destroyGhost = () => {
        this.ghostInstance.style.display = 'none';
    }

    updateGhost = (e) => {
        this.ghostInstance.style.left = `${e.clientX + this.offsetX}px`;
        this.ghostInstance.style.top = `${e.clientY + this.offsetY}px`;

        this.ghostInstance.style.zIndex = biggestZIndex + 200;
    }

    tryPlace = (x, y) => {
        this.onPlace(x + this.offsetX, y + this.offsetY);
    }

    onPlace(x, y){
        this.instanceIndex++;

        var instance = instantiateBeforeEnd(this.placeablePrefab, document.body);
        instance.style.left = `${x}px`;
        instance.style.top = `${y}px`;

        var imageElement = instance.querySelector('img');

        paintInstanceList.push(new PaintInstance(this.instanceIndex, instance, imageElement));
    }
}

class SealOption extends PaintOption{
    constructor(uniqueSeal, id, src, sizeX = 64, sizeY = 64, offsetX = -32, offsetY = -32){
        super(id, src, sizeX, sizeY, offsetX, offsetY);

        this.uniqueSeal = uniqueSeal;
    }
    
    /*onPlace(x, y){
        super.onPlace(x, y);
        paintInstanceList.push(new MovingSeal(index++, this.uniqueSeal, x, y));
    }*/
}

//#endregion

var paintOptionList = [];
var sealOption1 = new SealOption(1, "paint-greyseal", './imgs/MovingSeal/Seal1_right0.png');
var sealOption2 = new SealOption(2, "paint-polarseal", './imgs/MovingSeal/Seal2_right0.png');
var currentOption = undefined;

setPaintOption(sealOption1, false);
function setPaintOption(paintOption, showGhost = true){
    if(currentOption != undefined) {
        currentOption.boxElement.classList.remove('active');
        currentOption.destroyGhost();
    }
    
    currentOption = paintOption;
    currentOption.boxElement.classList.add('active');
    if(showGhost) currentOption.createGhost();
}

//why no actual enums tho D: https://www.geeksforgeeks.org/javascript/enums-in-javascript/
const EBrushState = {
    NONE: "none",
    PAINT: "paint",
    ERASER: "eraser"
};
var currentBrushState = EBrushState.NONE;

const spawnSealButton = document.getElementById('movingSeal_spawn');
spawnSealButton.style.pointerEvents = 'auto';
spawnSealButton.onclick = setPaintMode;

const eraserSealButton = document.getElementById('movingSeal_eraser');
eraserSealButton.style.pointerEvents = 'auto';
eraserSealButton.onclick = setEraserMode;

const nukeSealButton = document.getElementById('movingSeal_nuke');
nukeSealButton.style.pointerEvents = 'auto';
nukeSealButton.onclick = nukeInstances;

const explosionPrefab = `
    <img style="pointer-events: none;" src="https://i.giphy.com/pKWCBvHevLcMU.webp">
`;

function setPaintMode(){
    changeBrush();

    if(currentBrushState != EBrushState.PAINT){
        currentBrushState = EBrushState.PAINT;

        document.addEventListener('mousedown', spawnPaintOption);
        document.documentElement.classList.add('brush');

        spawnSealButton.classList.add('active');

        currentOption.createGhost();
    }
    else currentBrushState = EBrushState.NONE;
}
function setEraserMode(){
    changeBrush();

    if(currentBrushState != EBrushState.ERASER){
        currentBrushState = EBrushState.ERASER;
        document.documentElement.classList.add('eraser');
        eraserSealButton.classList.add('active');

        paintInstanceList.forEach(instance => instance.element.style.pointerEvents = 'auto');
    }
    else currentBrushState = EBrushState.NONE;
}

function changeBrush(){
    document.removeEventListener('mousedown', spawnPaintOption);
    document.documentElement.classList.remove('brush');
    document.documentElement.classList.remove('eraser');
    document.body.style.pointerEvents = 'auto';

    currentOption.destroyGhost();
    
    spawnSealButton.classList.remove('active');
    eraserSealButton.classList.remove('active');

    if(paintInstanceList.length != 0) paintInstanceList.forEach(instance => instance.element.style.pointerEvents = 'none');
}

var paintInstanceList = [];
var index = 0;
function spawnPaintOption(e){
    e = e || window.event;
    e.preventDefault();

    let hittingValidElement = false;
    paintOptionList.forEach(option => {
        if(e.target.id == option.boxElement.id) hittingValidElement = true;
    });

    if(currentBrushState != EBrushState.PAINT || hittingValidElement || e.target.id == spawnSealButton.id || e.target.id == eraserSealButton.id || e.target.id == nukeSealButton.id) return;

    currentOption.tryPlace(e.clientX, e.clientY);
}

function tryDeleteInstance(paintInstance, force = false){
    if(currentBrushState != EBrushState.ERASER && !force) return false;
    
    if(!force) playSmallBoomAudio();

    paintInstanceList = paintInstanceList.filter(instance => instance.index != paintInstance.index);

    return true;
}

function nukeInstances(){
    if(paintInstanceList.length == 0) return;

    playBigBoomAudio();
    paintInstanceList.forEach(instance => instance.destroy(true));
}

tryDisableInteraction();
function tryDisableInteraction(){
    requestAnimationFrame(tryDisableInteraction);
    if(currentBrushState == EBrushState.NONE) return;

    document.body.style.pointerEvents = 'none';
}

//#endregion