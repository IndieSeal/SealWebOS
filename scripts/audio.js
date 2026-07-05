import { clamp, lerp } from "./mathf.js";

var buttons = document.querySelectorAll('button');
buttons.forEach(button => {
  setupAudioEvents(button);
});
var areas = document.querySelectorAll('area');
areas.forEach(area => {
  setupAudioEvents(area);
});

export function setupAudioEvents(element){
  element.addEventListener("mouseenter", () => {
    playHoverAudio();
  });

  element.addEventListener("click", () => {
    playSelectAudio();
  });
}

var hoverAudio = document.getElementById("hoverAudio"); 
export function playHoverAudio(){
  stopAudio(hoverAudio);
  hoverAudio.play();
}

var selectAudio = document.getElementById("selectAudio"); 
export function playSelectAudio(){
  stopAudio(selectAudio);
  selectAudio.play();
}

function stopAudio(audio){
  audio.pause();
  audio.currentTime = 0;
}

//https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Using_Web_Audio_API
//For some reason there's a gap when looping when using the Audio class, this significantly improves it, but it is not a fix

var seaBackground = document.getElementById("seaBackground");
seaBackground.loop = true;
seaBackground.volume = 0.05;
seaBackground.play();

const audioContext = new AudioContext();

var dragAudio = document.getElementById("dragAudio"); 
const track = audioContext.createMediaElementSource(dragAudio);
track.connect(audioContext.destination);

dragAudio.loop = true;
dragAudio.volume = 0;
dragAudio.playbackRate = 2;
dragAudio.play();

var currentValue = 0;

const MAX_VOLUME = 0.6;

export function setDragAudioVolume(value){
  currentValue = clamp(0, MAX_VOLUME, (lerp(currentValue, value, 0.045))).toFixed(3);

  if(currentValue < 0.012) currentValue = 0;
  dragAudio.volume = currentValue;
}

export function stopDragAudio(){
  currentValue = 0;
}