import { setDragAudioVolume, startDragAudio, stopDragAudio } from "./audio.js";
import { abs, lerp } from "./mathf.js";

// So, why did I do it this way? Cause who the heck would like to be duplicating scripts and changing names when you can have a class that manages it, like come on!
// i use c# so this feels hella familiar

class DraggableWindow{
  initialX = 0;
  initialY = 0;
  currentX = 0;
  currentY = 0;
  cursorX = 0;
  cursorY = 0;

  hasInitialDrag = false;
  dragging = false;

  constructor(id){
    this.myId = id;
    this.element = document.getElementById(id);
    this.header = document.getElementById(id + "_header");

    this.setup();
  }
  
  setup = () => {
    if(this.element == null) {
      console.log("There's no window with that ID");
      return;
    }
    if(this.header == null){
      console.log("There's no window header!")
    }

    this.header.onmousedown = this.startDragging;

    this.moveWindowFunction();
  }

  startDragging = (e) => {
    e = e || window.event;
    e.preventDefault();

    const rect = this.element.getBoundingClientRect();
    this.initialX = e.clientX - rect.left;
    this.initialY = e.clientY - rect.top;

    this.currentX = rect.left;
    this.currentY = rect.top;
    this.cursorX = this.currentX;
    this.cursorY = this.currentY;
    
    document.onmouseup = this.stopDragging;
    document.onmousemove = this.dragElement;

    startDragAudio();

    this.dragging = true;
    this.hasInitialDrag = true;
  }

  dragElement = (e) => {
    e = e || window.event;
    e.preventDefault();

    this.cursorX = e.clientX - this.initialX;
    this.cursorY = e.clientY - this.initialY;
  }

  stopDragging = () => {
    document.onmouseup = null;
    document.onmousemove = null;

    stopDragAudio();

    this.dragging = false;
  }

  moveWindowFunction = () => {
    requestAnimationFrame(this.moveWindowFunction);

    if(!this.hasInitialDrag) return;
    
    this.currentX = lerp(this.currentX, this.cursorX, .075);
    this.currentY = lerp(this.currentY, this.cursorY, .075);

    var xVolume = abs(this.currentX/this.cursorX) / 2;
    var yVolume = abs(this.currentY/this.cursorY) / 2;

    setDragAudioVolume(abs(lerp(1, 0, xVolume + yVolume)) * 5);
    
    this.element.style.left = (this.currentX) + "px";
    this.element.style.top = (this.currentY) + "px";
  }
}

var welcomeWindow = new DraggableWindow("welcome");