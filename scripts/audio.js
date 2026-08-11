import { clamp, lerp } from "./mathf.js";
import { deltaTime } from "./time.js";
import { addCategoryAudio, createAudioSetting } from "./settings.js";

var buttons = document.querySelectorAll('button');
buttons.forEach(button => {
  setupAudioEvents(button);
});
var areas = document.querySelectorAll('area');
areas.forEach(area => {
  setupAudioEvents(area);
});

export function setupAudioEvents(element){
  removeAudioEvents(element);

  element.addEventListener('mouseenter', onHover);
  element.addEventListener('click', onClick);
}

export function removeAudioEvents(element){
  element.removeEventListener('mouseenter', onHover);
  removeClickEvent(element);
}

export function removeClickEvent(element){
  element.removeEventListener('click', onClick);
}

function onHover(){
  playHoverAudio();
}

function onClick(){
  playSelectAudio();
}

var hoverAudio = document.getElementById("hoverAudio"); 
hoverAudio.volume = 0.6;
addCategoryAudio('ui', hoverAudio);
export function playHoverAudio(){
  playAudio(hoverAudio, true);
}

var selectAudio = document.getElementById("selectAudio"); 
selectAudio.volume = 0.7;
addCategoryAudio('ui', selectAudio);
export function playSelectAudio(){
  playAudio(selectAudio);
}

var sealClicker_Click = document.getElementById("sealclicker-click"); 
addCategoryAudio('ui', sealClicker_Click);
export function sealClicker_playClickAudio(){
  playAudio(sealClicker_Click);
}

var sealClicker_Buy = document.getElementById("sealclicker-buy"); 
addCategoryAudio('ui', sealClicker_Buy);
export function sealClicker_playBuyAudio(){
  playAudio(sealClicker_Buy, true);
}

var sealClicker_Squish = document.getElementById("sealclicker-squish"); 
sealClicker_Squish.volume = 0.1;
addCategoryAudio('ui', sealClicker_Squish);
export function sealClicker_playSquishAudio(){
  playAudio(sealClicker_Squish);
}

var smallBoom = document.getElementById("smallBoom"); 
addCategoryAudio('sfx', smallBoom);
export function playSmallBoomAudio(){
  playAudio(smallBoom);
}

var bigBoom = document.getElementById("bigBoom"); 
bigBoom.volume = 0.2;
addCategoryAudio('sfx', bigBoom);
export function playBigBoomAudio(){
  playAudio(bigBoom);
}

var breakGlass = document.getElementById("breakGlass"); 
breakGlass.volume = 0.4;
addCategoryAudio('sfx', breakGlass);
export function playBreakGlassAudio(){
  playAudio(breakGlass);
}

var airWoosh = document.getElementById("airWoosh"); 
airWoosh.volume = 1;
addCategoryAudio('sfx', airWoosh);
export function playAirWooshAudio(){
  playAudio(airWoosh);
}

function playAudio(audio, interrupt = false, pause = true){
  if(!hasBeenEnabled) return;
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
const mutedPageText = document.getElementById("muted-page"); 

var hasBeenEnabled = false;

window.addEventListener('pointerdown', (e) => {
  if(hasBeenEnabled) return;
  
  //Since autoplay is blocked at the start
  seaBackground.play();
  dragAudio.play();

  mutedPageText.style.display = 'none';
  
  document.dispatchEvent(onAutoplayEnabled);
  hasBeenEnabled = true;
});

var seaBackground = document.getElementById("seaBackground");
seaBackground.loop = true;
seaBackground.volume = 0.05;
createAudioSetting(seaBackground, 'Sea Ambient');

var dragAudio = document.getElementById("dragAudio"); 
dragAudio.loop = true;
dragAudio.volume = 0;
dragAudio.playbackRate = 2;
var dragCategoryAudio = addCategoryAudio('ui', dragAudio);

var currentValue = 0;

const MAX_VOLUME = 0.25;

var dragLerpSpeed = 12;
var dragWindowMaster = undefined;

export function setDragAudioVolume(window, value){
  if(window != dragWindowMaster) return;
  
  if(value > MAX_VOLUME) value = MAX_VOLUME;
  currentValue = clamp(0, MAX_VOLUME, lerp(currentValue, value, dragLerpSpeed * deltaTime)).toFixed(3);

  //dragAudio.volume = currentValue;
  dragCategoryAudio.changeBaseVolume(currentValue);
}

export function setDragMaster(window){
  dragWindowMaster = window;
}