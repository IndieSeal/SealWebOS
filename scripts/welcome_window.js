var welcomeScreen = document.querySelector("#welcome");

var welcomeScreenOpen = document.querySelector("#welcomeopen");
var welcomeScreenMinimize = document.querySelector("#welcomeminimize");
var welcomeScreenClose = document.querySelector("#welcomeclose");

var appWelcome = document.getElementById("selected_appwelcome");
var background = document.getElementById("body");

var selectedIcon = undefined;

function openWindow(element) {
  element.style.display = "inline";
}

function minimizeWindow(element) {
  element.style.display = "none";
}

function closeWindow(element) {
  element.style.display = "none";
}

appWelcome.addEventListener("click", function() {
  handleIconTap(appWelcome);
});

welcomeScreenMinimize.addEventListener("click", function() {
  minimizeWindow(welcomeScreen);
});

welcomeScreenClose.addEventListener("click", function() {
  closeWindow(welcomeScreen);
});


function selectIcon(element) {
  if(element == undefined) return;

  element.classList.add("selected");
  selectedIcon = element;
} 

function unselectIcon(element) {
  if(element == undefined) return;

  element.classList.remove("selected");
  selectedIcon = undefined;
}

function handleIconTap(element){
  if(element == undefined) return;

  if(element.classList.contains("selected")){
    unselectIcon(element);
    openWindow(welcomeScreen);
  }
  else{
    selectIcon(element);
  }
}