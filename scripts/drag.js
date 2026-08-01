import { setDragAudioVolume, setDragMaster } from "./audio.js";
import { abs, clamp, lerp } from "./mathf.js";
import { deltaTime } from "./time.js";
import { MINIMIZE_SUFFIX, CLOSE_SUFFIX } from "./window_global.js";

// So, why did I do it this way? Cause who the heck would like to be duplicating scripts and changing names when you can have a class that manages it, like come on!
// i use c# so this feels hella familiar
const topBar = document.getElementById("top")

class DraggableElement{
  initialX = 0;
  initialY = 0;
  currentX = 0;
  currentY = 0;
  cursorX = 0;
  cursorY = 0;
  previousCursorX = 0;
  previousCursorY = 0;

  hasInitialDrag = false;
  dragging = false;

  constructor(id, movableWindow){
    this.myId = id;
    this.isWindowMovable = movableWindow;
    
    this.element = document.getElementById(id);
    this.header = document.getElementById(id + "_header");

    this.dragVelocity = 10;

    if(!this.isWindowMovable){
      this.unsetup();
      return;
    }

    //YES, EVENTS DO EXIST IN JS https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent || https://www.geeksforgeeks.org/javascript/javascript-custom-events/
    this.onStartDragEvent = new CustomEvent("onStartDrag", {
      detail: {
        windowID: this.myId,
      },
    });
    
    this.setup();
  }
  
  setup = () => {
    if(this.element == null) {
      console.log("There's no window with that ID");
      return;
    }
    if(this.header == null){
      console.log("There's no window header!");
      return;
    }

    this.header.onmousedown = this.startDragging;
    this.moveElementFunction();
  }

  unsetup = () => {
    this.header.style.pointerEvents = "none";
  }

  startDragging = (e) => {
    if(e.target.id == this.myId + MINIMIZE_SUFFIX || e.target.id == this.myId + CLOSE_SUFFIX) return;

    e = e || window.event;
    e.preventDefault();

    const rect = this.element.getBoundingClientRect();
    this.initialX = e.clientX - rect.left;
    this.initialY = e.clientY - rect.top;

    this.currentX = rect.left;
    this.currentY = rect.top;
    this.cursorX = this.currentX;
    this.cursorY = this.currentY;

    setDragMaster(this);
    
    document.onmouseup = this.stopDragging;
    document.onmousemove = this.dragElement;

    document.dispatchEvent(this.onStartDragEvent);

    this.header.classList.add('active');

    this.dragging = true;
    this.hasInitialDrag = true;
  }

  dragElement = (e) => {
    e = e || window.event;
    e.preventDefault();

    requestAnimationFrame(() => this.delayedDrag(this.cursorX, this.cursorY));

    this.cursorX = e.clientX - this.initialX;
    this.cursorY = e.clientY - this.initialY;

    const navbarRect = topBar.getBoundingClientRect();

    let maxX = this.getMaxX();
    let maxY = this.getMaxY();
    
    this.cursorX = Math.max(0, Math.min(this.cursorX, maxX));
    this.cursorY = Math.max(navbarRect.bottom, Math.min(this.cursorY, maxY));
  }

  delayedDrag = (x, y) => {
    this.previousCursorX = x;
    this.previousCursorY = y;
  }

  getMaxX = () => {
    const rect = this.element.getBoundingClientRect();
    const navbarRect = topBar.getBoundingClientRect();

    let windowWidth = window.innerWidth;
    return windowWidth - rect.width;
  }

  getMaxY = () => {
    const rect = this.element.getBoundingClientRect();
    const navbarRect = topBar.getBoundingClientRect();

    let windowHeight = window.innerHeight;
    return windowHeight - rect.height;
  }

  stopDragging = () => {
    document.onmouseup = null;
    document.onmousemove = null;

    this.previousCursorX = this.cursorX;
    this.previousCursorY = this.cursorY;

    this.header.classList.remove('active');
    
    this.dragging = false;
  }

  moveElementFunction = () => {
    requestAnimationFrame(this.moveElementFunction);

    if(!this.hasInitialDrag) return;
    
    if(abs(this.cursorX - this.currentX) > 1) this.currentX = lerp(this.currentX, this.cursorX, this.dragVelocity * deltaTime);
    else if(!this.dragging) this.currentX = this.cursorX;

    if(abs(this.cursorY - this.currentY) > 1) this.currentY = lerp(this.currentY, this.cursorY, this.dragVelocity * deltaTime);
    else if(!this.dragging) this.currentY = this.cursorY;

    var xVolume = 0;
    var yVolume = 0;

    if(this.cursorX != this.currentX && this.cursorX != 0 && this.cursorX != this.getMaxX()){
      let xDifference = this.cursorX - this.previousCursorX;
      xVolume = xDifference * xDifference;
    }

    if(this.cursorY != this.currentY && this.cursorY != 0 && this.cursorY != this.getMaxY()){
      let yDifference = this.cursorY - this.previousCursorY;
      yVolume = yDifference * yDifference;
    }

    let volume = 0;
    if(xVolume != 0 || yVolume != 0) volume = clamp(0, 1, Math.sqrt((xVolume + yVolume) * deltaTime));
        
    setDragAudioVolume(this, lerp(0, 1, volume));
    
    this.element.style.left = `${this.currentX}px`;
    this.element.style.top = `${this.currentY}px`;
  }
}

var allWindows = [];
export function createDraggableElement(id, movableWindow){
  let myWindow = new DraggableElement(id, movableWindow);
  allWindows.push(myWindow);

  return myWindow;
}

export function getDraggableElement(id){
  for(let i = 0; i < allWindows.length; i++){
    let dragWindow = allWindows[i];
    if(id == dragWindow.myId) return dragWindow;
  }

  return undefined;
}