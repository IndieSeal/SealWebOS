import { setupEvents } from "./audio.js";

var selectedIcon = undefined;

var topBar = document.getElementById("top")
var biggestIndex = 1;

initializeWindow("welcome");

function initializeWindow(elementName){
  var window = document.querySelector("#" + elementName);
  var taskbar = document.getElementById(elementName + "_taskbar");

  var windowOpener = document.getElementById(elementName + "_open");
  var windowMinimizer = document.getElementById(elementName + "_minimize");
  var windowCloser = document.getElementById(elementName + "_close");

  window.addEventListener("mousedown", () =>
    handleWindowTap(window)
  )

  setupEvents(windowOpener);
  setupEvents(taskbar);
  taskbar.addEventListener("click", function(){
    openWindowFunc(window, taskbar);
  });

  windowOpener.addEventListener("click", function() {
    handleIconTap(windowOpener, window, taskbar);
  });

  windowMinimizer.addEventListener("click", function() {
    minimizeWindowFunc(window);
  });

  windowCloser.addEventListener("click", function() {
    closeWindowFunc(window, taskbar);
  });
}

function openWindowFunc(window, taskbar) {
  window.style.display = "inline";
  window.classList.remove("close");

  taskbar.style.display = "flex";

  handleWindowTap(window);
}

function minimizeWindowFunc(window) {
  window.style.display = "none";
}

function closeWindowFunc(window, taskbar) {
  window.classList.add("close");

  taskbar.style.display = "none";
}

function selectIcon(icon) {
  if(icon == undefined) return;

  icon.classList.add("selected");
  selectedIcon = icon;
} 

function unselectIcon(icon) {
  if(icon == undefined) return;

  icon.classList.remove("selected");
  selectedIcon = undefined;
}

function handleIconTap(icon, window, taskbar){
  if(icon == undefined) return;

  if(icon.classList.contains("selected")){
    unselectIcon(icon);
    openWindowFunc(window, taskbar);
  }
  else{
    selectIcon(icon);
  }
}

function handleWindowTap(window) {
  biggestIndex++;
  window.style.zIndex = biggestIndex;

  topBar.style.zIndex = biggestIndex + 1;
  
  unselectIcon(selectedIcon);
}

function toggleWindow(window){

}