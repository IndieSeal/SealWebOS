import { playBigBoomAudio, playPlaceObjectAudio, playSmallBoomAudio, setupAudioEvents } from "./audio.js";
import { getClampedX, getClampedY, getMaxX, getMaxY, navbarRect } from "./bounds.js";
import { lerp, distance, randomBool, abs, clamp, destroyAfter, pingpong, instantiateBeforeEnd } from "./mathf.js";
import { deltaTime } from "./time.js";
import { biggestZIndex, IncreaseZIndex, SubscribeToZIndex, UnsubscribeToZIndex } from "./window_global.js";
import { getWindow } from "./window_manager.js";

class PaintInstance{
    destroying = false;

    constructor(buildWindow, paintOption, index, element, imageElement){
        this.buildWindow = buildWindow;
        this.paintOption = paintOption;
        
        this.index = index;
        
        this.element = element;
        this.imageElement = imageElement;

        this.saveData = undefined;

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
        
        let index = this.buildWindow.paintInstanceList.indexOf(this);
        this.buildWindow.paintInstanceList.splice(index, 1);
        
        this.paintOption.removeInstancesData(this);

        destroyAfter(this.element, 500);
        destroyAfter(explodeElement, 500);

        return true;
    }
}

class PaintInstanceSaveData{
    constructor(x, y, doDefault){
        this.x = x;
        this.y = y;
        this.doDefault = doDefault;
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

    constructor(buildWindow, paintOption, index, element, imageElement, sealType = 1, x = undefined, y = undefined){
        super(buildWindow, paintOption, index, element, imageElement);
        
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

    // This will change the CSS animations, so I have to make the CSS scale be done here in the JS
    curScale = 1;
    curRotation = 0;

    instanceDatas = [];
    
    constructor(buildingWindow, id, src, sizeX = 64, sizeY = 64, offsetX = -64, offsetY = -64, scalable = true, rotatable = false, autoLoadData = true){        
        this.buildWindow = buildingWindow;
        
        this.myId = id;
        this.instanceDataId = `${this.myId}_instanceData`;

        this.src = src;

        this.sizeX = sizeX;
        this.sizeY = sizeY;
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        this.canBeScaled = scalable;
        this.canBeRotated = rotatable;

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

        if(autoLoadData) this.loadInstancesData();
    }

    loadInstancesData = () => {
        let listJson = localStorage.getItem(this.instanceDataId);
        let list = JSON.parse(listJson);
    
        if(list != null){
            list.forEach(saveData => {
                this.onPlace(saveData.x, saveData.y, saveData.doDefault);
            });
        }
    }

    saveInstancesData = (pInstance) => {
        this.instanceDatas.push(pInstance.saveData);
        localStorage.setItem(this.instanceDataId, JSON.stringify(this.instanceDatas));
    }

    removeInstancesData = (pInstance) => {
        let saveIndex = this.instanceDatas.indexOf(pInstance.saveData);
        this.instanceDatas.splice(saveIndex, 1);
        localStorage.setItem(this.instanceDataId, JSON.stringify(this.instanceDatas));
    }

    createGhost = () => {
        this.ghostInstance.style.display = 'inline';

        let rotString = this.canBeRotated ? `rotate(${this.curRotation}deg)` : "";
        let scaleString = this.canBeScaled ? `scale(${this.curScale})` : "";
        this.ghostInstance.style.transform = `${rotString} ${scaleString}`;
    }
    
    destroyGhost = () => {
        this.ghostInstance.style.display = 'none';
    }

    updateGhost = (e) => {
        this.ghostInstance.style.left = `${e.clientX + this.offsetX}px`;
        this.ghostInstance.style.top = `${e.clientY + this.offsetY}px`;

        this.ghostInstance.style.zIndex = biggestZIndex + 200;
    }

    tryPlace = (e, x, y) => {
        if(this.buildWindow.window.draggableElement.isOverClossables(e)) return;
        
        this.onPlace(x + this.offsetX, y + this.offsetY);
    }

    onPlace(x, y, createDefault = true){
        this.instanceIndex++;

        let instance = instantiateBeforeEnd(this.placeablePrefab, document.body);
        instance.style.left = `${x}px`;
        instance.style.top = `${y}px`;

        let rotString = this.canBeRotated ? `rotate(${this.curRotation}deg)` : "";
        let scaleString = this.canBeScaled ? `scale(${this.curScale})` : "";
        instance.style.transform = `${rotString} ${scaleString}`;

        let imageElement = instance.querySelector('img');

        let cInstance = new PaintInstance(this.buildWindow, this, this.instanceIndex, instance, imageElement);
        cInstance.saveData = new PaintInstanceSaveData(x, y, createDefault);
        this.saveInstancesData(cInstance);

        if(createDefault) this.buildWindow.paintInstanceList.push(cInstance);

        playPlaceObjectAudio();
        
        return [instance, imageElement];
    }
}

class SealOption extends PaintOption{
    constructor(uniqueSeal, buildingWindow, id, src, sizeX = 64, sizeY = 64, offsetX = -32, offsetY = -32){
        super(buildingWindow, id, src, sizeX, sizeY, offsetX, offsetY, false, false, false);

        this.uniqueSeal = uniqueSeal;
        this.loadInstancesData();        
    }
    
    onPlace(x, y){
        console.log(`I'm being placed, im the following seal: ${this.uniqueSeal}`);
        var [element, image] = super.onPlace(x, y, false);
        this.buildWindow.paintInstanceList.push(new MovingSeal(this.buildWindow, this, this.buildWindow.index++, element, image, this.uniqueSeal, x, y));
    }
}

//#endregion

const EBrushState = {
    NONE: "none",
    PAINT: "paint",
    ERASER: "eraser"
};

export const explosionPrefab = `
    <img style="pointer-events: none;" src="https://i.giphy.com/pKWCBvHevLcMU.webp">
`;

var buildWindows = [];
export class BuildingWindow{
    paintOptionList = [];
    currentOption = undefined;

    currentBrushState = EBrushState.NONE;
    
    paintInstanceList = [];
    index = 0;
    
    constructor(id, window){
        buildWindows.push(this);

        this.myId = id;
        this.window = window;

        document.addEventListener('onWindowMinimize', (e) => {
            if(e.detail.windowID == this.window.myId){
                this.setNone();
            }
        });
        document.addEventListener('onWindowClose', (e) => {
            if(e.detail.windowID == this.window.myId){
                this.setNone();
            }
        });
        
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

        if(showGhost) this.forceSetPaint();
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

    forceSetPaint = () => {
        this.currentBrushState = EBrushState.NONE;
        this.setPaintMode();
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

        this.currentOption.tryPlace(e, e.clientX, e.clientY);
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

var sealBuildWindow = new BuildingWindow('movingSeal', getWindow('movingsealwindow'));
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