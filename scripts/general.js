import { SubscribeToZIndex } from "./window_global.js";
import { playAirWooshAudio, playBreakGlassAudio, playFoxyScreamAudio, setupAudioEvents } from "./audio.js";
import { clamp, instantiateBeforeEnd } from "./mathf.js";
import { getMaxX, getMaxY } from "./bounds.js";

//#region Brick You

const companionSeal = document.getElementById('companion-seal');
companionSeal.onclick = brickYou;
setupAudioEvents(companionSeal);

const brickScreenElement = document.getElementById('brick-screen');
SubscribeToZIndex((index) => brickScreenElement.style.zIndex = index + 1000);

var latestTimeout = undefined;

function brickYou(){
    if(latestTimeout != undefined) clearTimeout(latestTimeout);
    
    brickScreenElement.currentTime = 0;
    brickScreenElement.play();

    brickScreenElement.style.display = 'flex';
    latestTimeout = setTimeout(unBrickYou, 1200);

    setTimeout(playAirWooshAudio, 300);
}

const brokenPrefab = `
    <img style="width: 128px; height: 128px; pointer-events: none; position: absolute;" src="./imgs/brokensegment.png">
`;

function unBrickYou(){
    brickScreenElement.pause();
    brickScreenElement.style.display = 'none';

    playBreakGlassAudio();
    
    let brokenElement = instantiateBeforeEnd(brokenPrefab, document.body);
    SubscribeToZIndex((index) => brokenElement.style.zIndex = index + 1100);

    brokenElement.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    let maxX = getMaxX(undefined);
    brokenElement.style.left = `${clamp(0, maxX, Math.random() * maxX)}px`;

    let maxY = getMaxY(undefined);
    brokenElement.style.top = `${clamp(0, maxY, Math.random() * maxY)}px`;
}

//#endregion

//#region Jumpscare

const foxyJumpscare = document.getElementById('foxy-jumpscare');
SubscribeToZIndex((index) => foxyJumpscare.style.zIndex = index + 1001);
var latestJumpscareTimeout = undefined;
var canPlayJumpscare = false;

document.addEventListener('onAutoplayEnabled', () => { canPlayJumpscare = true; })

const specificValue = 50;

function rollChance(){
    let randomValue = Math.ceil(Math.random() * 100);
    if(randomValue == specificValue) jumpscare();
}
setInterval(rollChance, 1000);

function jumpscare(){
    if(!canPlayJumpscare) return;
    
    if(latestJumpscareTimeout != undefined) clearTimeout(latestJumpscareTimeout);

    playFoxyScreamAudio();
    
    foxyJumpscare.currentTime = 0;
    foxyJumpscare.play();

    foxyJumpscare.style.display = 'flex';
    latestJumpscareTimeout = setTimeout(unjumpscare, 1200);
}

function unjumpscare(){
    foxyJumpscare.pause();
    foxyJumpscare.style.display = 'none';
}

//#endregion