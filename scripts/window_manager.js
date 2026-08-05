import { setupAudioEvents } from "./audio.js";
import { createDraggableElement, getDraggableElement } from "./drag.js"
import { TASKBAR_SUFFIX, OPEN_SUFFIX, MINIMIZE_SUFFIX, CLOSE_SUFFIX, TASKBAR_ONTOP_SUFFIX, biggestZIndex, IncreaseZIndex } from "./window_global.js";

var selectedIcon = undefined;
export var selectedWindow = undefined;

const taskbar = document.getElementById("taskbar");
const desktopApps = document.getElementById("desktopApps");

var allWindows = [];

function changeSelectedWindow(newWindow){
  if(selectedWindow != undefined){
    selectedWindow.taskbar_ontop.classList.remove("selected");
  }

  selectedWindow = newWindow;

  selectedWindow.taskbar_ontop.style.display = "inline";
  selectedWindow.taskbar_ontop.classList.add("selected");
}

function minimizeWindow(minWindow){
  if(selectedWindow == minWindow){
    selectedWindow.taskbar_ontop.classList.remove("selected");

    let higuestWindow = undefined;
    allWindows.forEach(window => {
      if(window == selectedWindow || !window.isWindowOpen()) return;
      if(higuestWindow == undefined || higuestWindow.latestZIndex < window.latestZIndex){
        higuestWindow = window;
      }
    });

    if(higuestWindow != undefined) changeSelectedWindow(higuestWindow);
  }
}

function onIconClicked(myWindow){
  allWindows.forEach(window => {
    if(window == myWindow) return;
    window.unselectIcon();
  });
}

class Window{
  draggableElement = undefined;
  latestZIndex = 0;
  
  constructor(id, openByDefault, movableWindow, appName, iconPath){
    this.myId = id;

    this.window = document.querySelector("#" + id);

    this.appName = appName;
    this.iconPath = iconPath;

    this.windowHeaderPrefab = `
      <div class="windows_header" id="${this.myId}_header">
          <!-- Window/App Details -->
          <div style="display: flex; justify-content: flex-start; align-items: center; gap: 6px;">
              <img class="icon" src="${this.iconPath}">
              <b>${this.appName}</b>
          </div>

          <!-- Minimize/Close -->
          <div style="display: flex; justify-content: flex-end; align-items: center;">
              <button class="minimize-button" id="${this.myId}_minimize">-</button>
              <button class="close-button" id="${this.myId}_close">X</button>
          </div>
      </div>
    `;

    this.taskbarPrefab = `
      <div class="element" id="${this.myId}_taskbar">
        <img src="${this.iconPath}">
        <div class="taskbar_ontop" id="${this.myId}_ontop"></div>
      </div>
    `;

    this.desktopPrefab = `
      <div id="${this.myId}_open" class="desktop_app_icon">
        <img src="${this.iconPath}">
        <p style="margin-top: 5px;">${this.appName}</p>
      </div>
    `;

    this.window.insertAdjacentHTML('afterbegin', this.windowHeaderPrefab);
    taskbar.insertAdjacentHTML('beforeend', this.taskbarPrefab);
    desktopApps.insertAdjacentHTML('beforeend', this.desktopPrefab);

    this.taskbar = document.getElementById(id + TASKBAR_SUFFIX);
    this.taskbar_ontop = document.getElementById(id + TASKBAR_ONTOP_SUFFIX);

    this.openIcon = document.getElementById(id + OPEN_SUFFIX);
    this.windowMinimizer = document.getElementById(id + MINIMIZE_SUFFIX);
    this.windowCloser = document.getElementById(id + CLOSE_SUFFIX);

    setupAudioEvents(this.windowMinimizer);
    setupAudioEvents(this.windowCloser);

    this.draggableElement = createDraggableElement(id, movableWindow);
    document.addEventListener('onStartDrag', (e) => {
      let myWindow = getWindow(e.detail.windowID);
      changeSelectedWindow(myWindow);
    });

    this.onWindowOpen = new CustomEvent("onWindowOpen", {
      detail: {
        windowID: this.myId,
      },
    });

    this.onWindowClose = new CustomEvent("onWindowClose", {
      detail: {
        windowID: this.myId,
      },
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
    this.latestZIndex = biggestZIndex;

    changeSelectedWindow(this);
    document.dispatchEvent(this.onWindowOpen);
  }

  minimizeWindowFunc = () => {
    this.window.classList.add("close");

    minimizeWindow(this);
  }

  closeWindowFunc = () => {
    this.window.classList.add("close");
    this.taskbar.style.display = "none";

    document.dispatchEvent(this.onWindowClose);
  }

  selectIcon = () => {
    if(this.openIcon == undefined) return;

    onIconClicked(this.window);
    
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

  isWindowOpen(){
    return !this.window.classList.contains("close");
  }

  handleWindowTap = () => {
    IncreaseZIndex();

    this.window.style.zIndex = biggestZIndex;
    this.latestZIndex = biggestZIndex;

    this.unselectIcon(selectedIcon);
  }

  toggleWindow = () => {
    if(this.latestZIndex == biggestZIndex && this.isWindowOpen()) this.minimizeWindowFunc();
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

var welcomeWindow = new Window("welcome", true, true, 'Introduction', './imgs/AppIcons/AboutMe.png');
var sealtokWindow = new Window("sealtok", false, true, 'SealTok', './imgs/AppIcons/Sealtok.png');
var sealClickerWindow = new Window("sealclicker", false, false, 'Seal Clicker', './imgs/AppIcons/SealClicker.png');
var movingSealWindow = new Window("movingsealwindow", false, true, 'Moving Seals', './imgs/AppIcons/SealClicker.png');