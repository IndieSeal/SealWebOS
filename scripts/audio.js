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

//https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
//For some reason there's a gap when looping when using the Audio class

const audioContext = new AudioContext();

var dragAudio = document.getElementById("dragAudio"); 
const track = audioContext.createMediaElementSource(dragAudio);
track.connect(audioContext.destination);

dragAudio.loop = true;
dragAudio.volume = 0.3;
dragAudio.playbackRate = 2;

export function startDragAudio(){
  dragAudio.play();
}

export function setDragAudioVolume(value){
  dragAudio.volume = value * 0.5;
}

export function stopDragAudio(){
  dragAudio.pause();
}