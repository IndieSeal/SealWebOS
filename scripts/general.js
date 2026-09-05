import { SubscribeToZIndex } from "./window_global.js";
import { playAirWooshAudio, playBiteAudio, playBreakGlassAudio, playFoxyScreamAudio, setupAudioEvents } from "./audio.js";
import { clamp, instantiateBeforeEnd } from "./mathf.js";
import { getMaxX, getMaxY } from "./bounds.js";
import { ToggleSetting } from "./settings.js";
import { explosionPrefab } from "./moving_seal.js";

//#region Brick You

export const companionSeal = document.getElementById('companion-seal');
export const companionSealImage = companionSeal.querySelector('img');
companionSeal.onclick = brickYou;
setupAudioEvents(companionSeal);

const brickScreenElement = document.getElementById('brick-screen');
brickScreenElement.load();

SubscribeToZIndex((index) => brickScreenElement.style.zIndex = index + 1000);

var latestTimeout = undefined;
var shatteredScreens = [];

function brickYou(){
    if(latestTimeout != undefined) clearTimeout(latestTimeout);
    
    brickScreenElement.style.display = 'flex';

    brickScreenElement.currentTime = 0;
    brickScreenElement.play();

    setTimeout(playAirWooshAudio, 300);
    latestTimeout = setTimeout(unBrickYou, 1200);
}

const brokenPrefab = `
    <img style="width: 128px; height: 128px; pointer-events: none; position: absolute;" src="./imgs/brokensegment.png">
`;

function unBrickYou(){
    brickScreenElement.pause();
    brickScreenElement.style.display = 'none';

    playBreakGlassAudio();
    
    let brokenElement = instantiateBeforeEnd(brokenPrefab, document.body);
    shatteredScreens.push(brokenElement);

    SubscribeToZIndex((index) => brokenElement.style.zIndex = index + 1100);
    brokenElement.style.transform = `rotate(${Math.random() * 360}deg)`;
    
    let maxX = getMaxX(undefined);
    brokenElement.style.left = `${clamp(0, maxX, Math.random() * maxX)}px`;

    let maxY = getMaxY(undefined);
    brokenElement.style.top = `${clamp(0, maxY, Math.random() * maxY)}px`;
}

export function fixYou(){
    playBiteAudio();

    companionSealImage.classList.add('bite');
    
    //Could be cool for a CSS animation for them to dissapear!
    shatteredScreens.forEach(element => element.remove());
    shatteredScreens = [];

    setTimeout(finishFixYou, 1000);
}

function finishFixYou(){
    companionSealImage.classList.remove('bite');
} 

//#endregion

//#region Jumpscare

const foxyJumpscare = document.getElementById('foxy-jumpscare');
SubscribeToZIndex((index) => foxyJumpscare.style.zIndex = index + 1001);
var latestJumpscareTimeout = undefined;
var canPlayJumpscare = false;
var isJumpscareEnabled = false;

const jumpscareSetting = new ToggleSetting('1 in 1000 for a Jumpscare', 'Options', isJumpscareEnabled, (val) => {
    isJumpscareEnabled = val;
});

document.addEventListener('onAutoplayEnabled', () => { canPlayJumpscare = true; })

const specificValue = 376;

function rollChance(){
    let randomValue = Math.ceil(Math.random() * 1000);
    if(randomValue == specificValue) jumpscare();
}
setInterval(rollChance, 1000);

function jumpscare(){
    if(!isJumpscareEnabled || !canPlayJumpscare) return;
    
    if(latestJumpscareTimeout != undefined) clearTimeout(latestJumpscareTimeout);

    playFoxyScreamAudio();

    foxyJumpscare.style.display = 'flex';

    foxyJumpscare.currentTime = 0;
    foxyJumpscare.play();

    latestJumpscareTimeout = setTimeout(unjumpscare, 750);
}

function unjumpscare(){
    foxyJumpscare.pause();
    foxyJumpscare.style.display = 'none';
}

//#endregion