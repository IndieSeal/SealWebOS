var buttons = document.querySelectorAll('button');
buttons.forEach(button => {
  setupEvents(button);
});
var areas = document.querySelectorAll('area');
areas.forEach(area => {
  setupEvents(area);
});

export function setupEvents(element){
  element.addEventListener("mouseenter", () => {
    playHoverAudio();
  });

  element.addEventListener("click", () => {
    playSelectAudio();
  });
}

var hoverAudio = document.getElementById("hoverAudio"); 
export function playHoverAudio(){
  hoverAudio.play();
}

var selectAudio = document.getElementById("selectAudio"); 
export function playSelectAudio(){
  selectAudio.play();
}

var dragAudio = document.getElementById("dragAudio"); 
dragAudio.loop = true;
dragAudio.volume = 0.3;

export function startDragAudio(){
  dragAudio.play();
}
export function stopDragAudio(){
  dragAudio.pause();
}