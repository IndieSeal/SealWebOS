import { setupAudioEvents } from "./audio.js";
import { createDraggableElement, getDraggableElement } from "./drag.js"
import { TASKBAR_SUFFIX, OPEN_SUFFIX, MINIMIZE_SUFFIX, CLOSE_SUFFIX, TASKBAR_ONTOP_SUFFIX } from "./window_global.js";

var selectedIcon = undefined;
var selectedWindow = undefined;

const topBar = document.getElementById("top")
var biggestIndex = 1;

var allWindows = [];

function changeSelectedWindow(newWindow){
  if(selectedWindow != undefined){
    selectedWindow.taskbar_ontop.classList.remove("selected");
  }

  selectedWindow = newWindow;

  selectedWindow.taskbar_ontop.style.display = "inline";
  selectedWindow.taskbar_ontop.classList.add("selected");
}

function minimizeWindow(window){
  if(selectedWindow == window){
    selectedWindow.taskbar_ontop.classList.remove("selected");

    selectedWindow = undefined;
  }
}

class Window{
  draggableElement = undefined;
  latestZIndex = 0;
  
  constructor(id, openByDefault){
    this.myId = id;

    this.window = document.querySelector("#" + id);
    this.taskbar = document.getElementById(id + TASKBAR_SUFFIX);
    this.taskbar_ontop = document.getElementById(id + TASKBAR_ONTOP_SUFFIX);

    this.openIcon = document.getElementById(id + OPEN_SUFFIX);
    this.windowMinimizer = document.getElementById(id + MINIMIZE_SUFFIX);
    this.windowCloser = document.getElementById(id + CLOSE_SUFFIX);

    this.draggableElement = createDraggableElement(id);
    document.addEventListener('onStartDrag', (e) => {
      let myWindow = getWindow(e.detail.windowID);
      changeSelectedWindow(myWindow);
    });

    this.setup();

    if(openByDefault == true) this.openWindowFunc();
  }

  setup = () => {
    allWindows.push(this);
    
    this.checkIfDragging();

    this.window.addEventListener("mousedown", this.handleWindowTap);
    this.taskbar.addEventListener("click", this.toggleWindow);
    
    this.openIcon.addEventListener("click", this.handleIconTap);
    this.windowMinimizer.addEventListener("click", this.minimizeWindowFunc);
    this.windowCloser.addEventListener("click", this.closeWindowFunc);

    setupAudioEvents(this.openIcon);
    setupAudioEvents(this.taskbar);
  }

  checkIfDragging = () => {
    //Make buttons unavailable (close and minimize)
    this.windowMinimizer.inert = this.draggableElement.dragging;
    this.windowCloser.inert = this.draggableElement.dragging;

    requestAnimationFrame(this.checkIfDragging);
  }

  openWindowFunc = () => {
    this.window.style.display = "inline";
    this.window.classList.remove("close");

    this.taskbar.style.display = "flex";

    this.handleWindowTap();
    this.latestZIndex = biggestIndex;

    changeSelectedWindow(this);
  }

  minimizeWindowFunc = () => {
    this.window.classList.add("close");

    minimizeWindow(this);
  }

  closeWindowFunc = () => {
    this.window.classList.add("close");
    this.taskbar.style.display = "none";
  }

  selectIcon = () => {
    if(this.openIcon == undefined) return;

    this.openIcon.classList.add("selected");
    selectedIcon = this.openIcon;
  } 

  unselectIcon = () => {
    if(this.openIcon == undefined) return;

    this.openIcon.classList.remove("selected");
    selectedIcon = undefined;
  }

  handleIconTap = () => {
    if(this.openIcon == undefined) return;

    if(this.openIcon.classList.contains("selected")){
      this.unselectIcon();
      this.openWindowFunc();
    }
    else this.selectIcon();
  }

  handleWindowTap = () => {
    biggestIndex++;

    this.window.style.zIndex = biggestIndex;
    this.latestZIndex = biggestIndex;

    topBar.style.zIndex = biggestIndex + 1;
    this.unselectIcon(selectedIcon);
  }

  toggleWindow = () => {
    if(this.latestZIndex == biggestIndex && !this.window.classList.contains("close")) this.minimizeWindowFunc();
    else this.openWindowFunc();
  }
}

export function getWindow(id){
  for(let i = 0; i < allWindows.length; i++){
    let myWindow = allWindows[i];
    if(id == myWindow.myId) return myWindow;
  }

  return undefined;
}

var welcomeWindow = new Window("welcome", true);
var welcomeWindow = new Window("sealclicker", false);