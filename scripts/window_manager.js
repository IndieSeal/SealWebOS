import { setupAudioEvents } from "./audio.js";
import { createDraggableWindow, getDraggableWindow } from "./drag.js"
import { TASKBAR_SUFFIX, OPEN_SUFFIX, MINIMIZE_SUFFIX, CLOSE_SUFFIX } from "./window_global.js";

var selectedIcon = undefined;

var topBar = document.getElementById("top")
var biggestIndex = 1;

var allWindows = [];

class Window{
  draggableWindow = undefined;
  latestZIndex = 0;
  
  constructor(id){
    this.myId = id;

    this.window = document.querySelector("#" + id);
    this.taskbar = document.getElementById(id + TASKBAR_SUFFIX);

    this.openIcon = document.getElementById(id + OPEN_SUFFIX);
    this.windowMinimizer = document.getElementById(id + MINIMIZE_SUFFIX);
    this.windowCloser = document.getElementById(id + CLOSE_SUFFIX);

    this.draggableWindow = createDraggableWindow(id);

    this.setup();
  }

  setup = () => {
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
    this.windowMinimizer.inert = this.draggableWindow.dragging;
    this.windowCloser.inert = this.draggableWindow.dragging;

    requestAnimationFrame(this.checkIfDragging);
  }

  openWindowFunc = () => {
    this.window.style.display = "inline";
    this.window.classList.remove("close");

    this.taskbar.style.display = "flex";

    this.handleWindowTap();
    this.latestZIndex = biggestIndex;
  }

  minimizeWindowFunc = () => {
    this.window.classList.add("close");
    //this.window.style.display = "none";
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

var welcomeWindow = new Window("welcome");