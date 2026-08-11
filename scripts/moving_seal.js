import { playBigBoomAudio, playPlaceObjectAudio, playSmallBoomAudio, setupAudioEvents } from "./audio.js";
import { getClampedX, getClampedY, getMaxX, getMaxY, navbarRect } from "./bounds.js";
import { lerp, distance, randomBool, abs, clamp, destroyAfter, pingpong, instantiateBeforeEnd } from "./mathf.js";
import { deltaTime } from "./time.js";
import { biggestZIndex, IncreaseZIndex, SubscribeToZIndex, UnsubscribeToZIndex } from "./window_global.js";

class PaintInstance{
    destroying = false;

    constructor(buildWindow, index, element, imageElement){
        this.buildWindow = buildWindow;
        this.index = index;
        
        this.element = element;
        this.imageElement = imageElement;

        this.element.onclick = this.tryDestroy;
    }
    
    tryDestroy = () => {
        this.destroy(false);
    }

    destroy(force){
        if(!this.buildWindow.tryDeleteInstance(this, force)) return false;

        this.destroying = true;
        this.element.onclick = null;
        
        this.imageElement.remove();
        let explodeElement = instantiateBeforeEnd(explosionPrefab, this.element);
        
        destroyAfter(this.element, 500);
        destroyAfter(explodeElement, 500);

        return true;
    }
}

const baseSealVelocity = 150;

const minArrivalTimeout = 1000;
const maxArrivalTimeout = 3000;

const minPauseTimeout = 200;
const maxPauseTimeout = 800;

// IF YOU'RE GONNA MAKE THEM DRAGGABLE, REMBEMBER THAT POINTER EVENTS IS SET TO NONE IN THE PREFAB, you should thank yourself future me, if this ever happens
class MovingSeal extends PaintInstance{
    currentX = 0;
    currentY = 0;
    targetX = 0;
    targetY = 0;

    startWithX = false;
    finishedX = false;
    finishedY = false;

    animationDelay = clamp(300, 700, Math.random() * 900);
    animationFrame = 0;

    constructor(buildWindow, index, element, imageElement, sealType = 1, x = undefined, y = undefined){
        super(buildWindow, index, element, imageElement);
        
        this.sealType = sealType;
        SubscribeToZIndex(this.onZIndexIncreased);

        this.currentX = getClampedX(this.element, x == undefined ? (Math.random() * getMaxX(this.element)) : x);
        this.currentY = getClampedY(this.element, y == undefined ? (Math.random() * getMaxX(this.element)) : y);

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
            this.imageElement.src = direction ? `./imgs/MovingSeal/Seal${this.sealType}_right${this.animationFrame}.png` : `./imgs/MovingSeal/Seal${this.sealType}_left${this.animationFrame}.png`;

            this.currentX = getClampedX(this.element, this.currentX + (velocity * (direction ? 1 : -1)));
            if(abs(this.targetX - this.currentX) < 10) {
                this.finishedX = true;
                pause = true;
            }
        }
        else if((!this.startWithX || this.finishedX) && !this.finishedY){
            direction = (this.currentY - this.targetY) < 0;
            this.imageElement.src = direction ? `./imgs/MovingSeal/Seal${this.sealType}_right${this.animationFrame}.png` : `./imgs/MovingSeal/Seal${this.sealType}_left${this.animationFrame}.png`;
            
            this.currentY = getClampedY(this.element, this.currentY + (velocity * (direction ? 1 : -1)));
            if(abs(this.targetY - this.currentY) < 10){
                this.finishedY = true;
                pause = true;
            }
        }

        this.element.style.left = `${this.currentX}px`;
        this.element.style.top = `${this.currentY}px`;

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
        this.element.style.zIndex = index + 5;
    }

    randomizeNextPosition = () => {
        this.targetX = getClampedX(this.element, Math.random() * getMaxX(this.element));
        this.targetY = getClampedY(this.element, Math.random() * getMaxY(this.element));

        this.startWithX = randomBool();
        this.finishedX = false;
        this.finishedY = false;
    }

    destroy(force){
        if(!super.destroy(force)) return false;

        UnsubscribeToZIndex(this.onZIndexIncreased);
        
        return true;
    }
}

//#region Paint Options

//#region Classes

export class PaintOption{
    instanceIndex = 0;
    
    constructor(buildingWindow, id, src, sizeX = 64, sizeY = 64, offsetX = -64, offsetY = -64){        
        this.buildWindow = buildingWindow;
        
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
                    <img style="image-rendering: pixelated;" src="${this.src}">
                </div>
            </button>
        `;

        this.ghostInstance = instantiateBeforeEnd(this.placeablePrefab, document.body);
        document.addEventListener('mousemove', this.updateGhost)
        this.ghostInstance.classList.add('ghost');
        this.destroyGhost();
        
        this.boxElement = instantiateBeforeEnd(this.boxPrefab, this.buildWindow.paintOptions);
        this.boxElement.style.pointerEvents = 'auto';

        this.boxElement.onclick = () => this.buildWindow.setPaintOption(this);
        setupAudioEvents(this.boxElement);

        this.buildWindow.paintOptionList.push(this);
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

    onPlace(x, y, createDefault = true){
        this.instanceIndex++;

        let instance = instantiateBeforeEnd(this.placeablePrefab, document.body);
        instance.style.left = `${x}px`;
        instance.style.top = `${y}px`;

        let imageElement = instance.querySelector('img');

        if(createDefault) this.buildWindow.paintInstanceList.push(new PaintInstance(this.buildWindow, this.instanceIndex, instance, imageElement));

        playPlaceObjectAudio();
        
        return [instance, imageElement];
    }
}

class SealOption extends PaintOption{
    constructor(uniqueSeal, buildingWindow, id, src, sizeX = 64, sizeY = 64, offsetX = -32, offsetY = -32){
        super(buildingWindow, id, src, sizeX, sizeY, offsetX, offsetY);

        this.uniqueSeal = uniqueSeal;
    }
    
    onPlace(x, y){
        var [element, image] = super.onPlace(x, y, false);
        this.buildWindow.paintInstanceList.push(new MovingSeal(this.buildWindow, this.buildWindow.index++, element, image, this.uniqueSeal, x, y));
    }
}

//#endregion

const EBrushState = {
    NONE: "none",
    PAINT: "paint",
    ERASER: "eraser"
};

const explosionPrefab = `
    <img style="pointer-events: none;" src="https://i.giphy.com/pKWCBvHevLcMU.webp">
`;

var buildWindows = [];
export class BuildingWindow{
    paintOptionList = [];
    currentOption = undefined;

    currentBrushState = EBrushState.NONE;
    
    paintInstanceList = [];
    index = 0;
    
    constructor(id){
        buildWindows.push(this);

        this.myId = id;
        this.paintOptions = document.getElementById(`${this.myId}-options`);
        this.disableText = document.getElementById(`${this.myId}-text`);

        this.spawnSealButton = document.getElementById(`${this.myId}_spawn`);
        this.spawnSealButton.style.pointerEvents = 'auto';
        this.spawnSealButton.onclick = this.setPaintMode;

        this.eraserSealButton = document.getElementById(`${this.myId}_eraser`);
        this.eraserSealButton.style.pointerEvents = 'auto';
        this.eraserSealButton.onclick = this.setEraserMode;

        this.nukeSealButton = document.getElementById(`${this.myId}_nuke`);
        this.nukeSealButton.style.pointerEvents = 'auto';
        this.nukeSealButton.onclick = this.nukeInstances;
    }

    setup = (paintOptions) => {
        this.paintOptionList = paintOptions;

        this.setPaintOption(this.paintOptionList[0], false);

        this.tryDisableInteraction();
    }

    setPaintOption = (paintOption, showGhost = true) => {
        if(this.currentOption != undefined) {
            this.currentOption.boxElement.classList.remove('active');
            this.currentOption.destroyGhost();
        }
        
        this.currentOption = paintOption;
        this.currentOption.boxElement.classList.add('active');
        if(this.currentBrushState == EBrushState.PAINT && showGhost) this.currentOption.createGhost();
    }

    setPaintMode = () => {
        this.changeBrush(this);

        if(this.currentBrushState != EBrushState.PAINT){
            this.currentBrushState = EBrushState.PAINT;

            document.addEventListener('mousedown', this.spawnPaintOption);
            document.documentElement.classList.add('brush');

            this.spawnSealButton.classList.add('active');

            this.currentOption.createGhost();

            this.disableText.style.display = 'flex';
        }
        else this.currentBrushState = EBrushState.NONE;
    }
    setEraserMode = () =>{
        this.changeBrush(this);

        if(this.currentBrushState != EBrushState.ERASER){
            this.currentBrushState = EBrushState.ERASER;
            document.documentElement.classList.add('eraser');
            this.eraserSealButton.classList.add('active');

            this.paintInstanceList.forEach(instance => instance.element.style.pointerEvents = 'auto');

            this.disableText.style.display = 'flex';
        }
        else this.currentBrushState = EBrushState.NONE;
    }

    setNone = () => {
        this.changeBrush(undefined);
        this.currentBrushState = EBrushState.NONE;
    }

    changeBrush = (originWindow) => {
        //Set brush to none if it's from another window
        if(originWindow != undefined && originWindow.myId == this.myId){
            buildWindows.forEach(wind => {
                if(wind.myId == originWindow.myId) return;

                wind.setNone();
            });
        }
        
        document.removeEventListener('mousedown', this.spawnPaintOption);
        document.documentElement.classList.remove('brush');
        document.documentElement.classList.remove('eraser');
        document.body.style.pointerEvents = 'auto';

        this.disableText.style.display = 'none';

        this.currentOption.destroyGhost();
        
        this.spawnSealButton.classList.remove('active');
        this.eraserSealButton.classList.remove('active');

        if(this.paintInstanceList.length != 0) this.paintInstanceList.forEach(instance => instance.element.style.pointerEvents = 'none');
    }

    nukeInstances = () => {
        if(this.paintInstanceList.length == 0) return;

        playBigBoomAudio();
        this.paintInstanceList.forEach(instance => instance.destroy(true));
    }

    spawnPaintOption = (e) => {
        e = e || window.event;
        e.preventDefault();

        if(this.currentBrushState != EBrushState.PAINT || this.isOtherHittingValidElement(e)) return;

        this.currentOption.tryPlace(e.clientX, e.clientY);
    }

    isHittingValidElement = (e) => {
        let hittingValidElement = false;
        this.paintOptionList.forEach(option => {
            if(e.target.id == option.boxElement.id) hittingValidElement = true;
        });

        if(e.target.id == this.spawnSealButton.id || e.target.id == this.eraserSealButton.id || e.target.id == this.nukeSealButton.id) hittingValidElement = true;
        return hittingValidElement;
    }

    isOtherHittingValidElement = (e) => {
        let hitting = false;
        buildWindows.forEach(wind => {
            if(wind.isHittingValidElement(e)) hitting = true;
        });

        return hitting;
    }

    tryDeleteInstance = (paintInstance, force = false) => {
        if(this.currentBrushState != EBrushState.ERASER && !force) return false;
        
        if(!force) playSmallBoomAudio();

        this.paintInstanceList = this.paintInstanceList.filter(instance => instance.index != paintInstance.index);

        return true;
    }

    tryDisableInteraction = () => {
        requestAnimationFrame(this.tryDisableInteraction);
        if(this.currentBrushState == EBrushState.NONE) return;

        document.body.style.pointerEvents = 'none';
    }
}

//#endregion

var sealBuildWindow = new BuildingWindow('movingSeal');
var sealOption1 = new SealOption(1, sealBuildWindow, "paint-greyseal", './imgs/MovingSeal/Seal1_right0.png');
var sealOption2 = new SealOption(2, sealBuildWindow, "paint-polarseal", './imgs/MovingSeal/Seal2_right0.png');
sealBuildWindow.setup([sealOption1, sealOption2]);

export function isPainting(){
    let isActive = false;

    buildWindows.forEach(wind => {
        if(wind.currentBrushState != EBrushState.NONE) isActive = true;
    });

    return isActive;
}