import { clamp, lerp } from "./mathf.js";
import { deltaTime } from "./time.js";

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
  playAudio(hoverAudio);
}

var selectAudio = document.getElementById("selectAudio"); 
export function playSelectAudio(){
  playAudio(selectAudio);
}

var sealClicker_Click = document.getElementById("sealclicker-click"); 
export function sealClicker_playClickAudio(){
  playAudio(sealClicker_Click);
}

var sealClicker_Buy = document.getElementById("sealclicker-buy"); 
export function sealClicker_playBuyAudio(){
  playAudio(sealClicker_Buy, true);
}

var sealClicker_Squish = document.getElementById("sealclicker-squish"); 
export function sealClicker_playSquishAudio(){
  playAudio(sealClicker_Squish);
}

function playAudio(audio, interrupt = false, pause = true){
  if(interrupt || (pause && audio.currentTime > 0.1)) stopAudio(audio);
  
  audio.preservesPitch = false;

  audio.playbackRate = 0.9 + (Math.random() * 0.3);
  audio.play();
}

function stopAudio(audio){
  audio.pause();
  audio.currentTime = 0;
}

const onAutoplayEnabled = new CustomEvent("onAutoplayEnabled");
var hasBeenEnabled = false;

window.addEventListener('pointerdown', (e) => {
  if(hasBeenEnabled) return;
  
  //Since autoplay is blocked at the start
  seaBackground.play();
  dragAudio.play();

  document.dispatchEvent(onAutoplayEnabled);
  hasBeenEnabled = true;
});

var seaBackground = document.getElementById("seaBackground");
seaBackground.loop = true;
seaBackground.volume = 0.05;

var dragAudio = document.getElementById("dragAudio"); 
dragAudio.loop = true;
dragAudio.volume = 0;
dragAudio.playbackRate = 2;

var currentValue = 0;

const MAX_VOLUME = 0.25;

var dragLerpSpeed = 12;
var dragWindowMaster = undefined;

export function setDragAudioVolume(window, value){
  if(window != dragWindowMaster) return;
  
  if(value > MAX_VOLUME) value = MAX_VOLUME;
  currentValue = clamp(0, MAX_VOLUME, lerp(currentValue, value, dragLerpSpeed * deltaTime)).toFixed(3);

  dragAudio.volume = currentValue;
}

export function setDragMaster(window){
  dragWindowMaster = window;
}