//Followed this guide :D
//https://www.youtube.com/watch?v=lGokKxJ8D2c

import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

import { sealClicker_playSquishAudio } from './audio.js';
import { deltaTime } from './time.js';
import { SubscribeToZIndex } from "./window_global.js";
import { clamp, instantiateBeforeEnd, lerp } from "./mathf.js";
import { getClampedX, getClampedY, getMaxX, getMaxY, getMinY } from "./bounds.js";

//#region 3D Model

const modelSize = 7; // Smaller is bigger
const rotationSpeed = 4;
let objToRender = 'seal';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let object = undefined;

const loader = new GLTFLoader();

loader.load(
    `models/${objToRender}/scene.gltf`,
    function(gltf){
        object = gltf.scene;
        scene.add(object);

        SubscribeToZIndex((index) => { renderer.domElement.style.zIndex = index + 2000});
    },
    function(xhr){ },
    function(error){
        console.error(error);
    }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth / modelSize, window.innerHeight / modelSize);

renderer.domElement.style.left = `calc(90% - 100px)`;
renderer.domElement.style.top = `calc(90% - 80px)`;

const container = document.getElementById('container3D');
container.appendChild(renderer.domElement);
camera.position.z = 250;

//instantiateBeforeEnd(`<div style="display: flex; width: 100px; height: 100px;">hola</div>`, renderer.domElement);

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

animate();
function animate(){
    requestAnimationFrame(animate);
    if(object) object.rotation.y += (speed * rotationSpeed * deltaTime) * directionX;
    renderer.render(scene, camera);
}

//#endregion

//#region Raycasting

// Had to use AI :[ (ONLY FOR THE RAYCASTING, LET ME MAKE THAT CLEAR)
// I couldn't find any good sources for raycasting

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

document.addEventListener('mousemove', (event) => {
    if(isRaycastHittingObject(event)) document.documentElement.classList.add('overSomething');
    else document.documentElement.classList.remove('overSomething');
});

document.addEventListener('mousedown', (event) => {
    if(isRaycastHittingObject(event)) onMouseStartSelect(event);
});

function isRaycastHittingObject(event){
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (object) {
        const intersects = raycaster.intersectObject(object, true);
        if (intersects.length > 0) return true;
    }

    return false;
}

const loweringSpeed = 3;
const forceMultiplier = 0.02;

var cursorX = 0;
var cursorY = 0;
var previousCursorX = 0;
var previousCursorY = 0;

var currentX = 0;
var currentY = 0;

var grabXOffset = 0;
var grabYOffset = 0;

var speed = 0;
var directionX = 0;
var directionY = 0;

var isSelectingSeal = false;
var firstSelect = false;

function onMouseStartSelect(event){
    isSelectingSeal = true;
    firstSelect = true;

    document.addEventListener('mouseup', onMouseEndSelect);
    document.addEventListener('mousemove', onMouseMoved);

    const rect = renderer.domElement.getBoundingClientRect();

    cursorX = event.clientX;
    cursorY = event.clientY;

    grabXOffset = cursorX - rect.left;
    grabYOffset = cursorY - rect.top;

    delayedDrag(event.clientX, event.clientY);

    speed = 0;
    directionX = 0;
    directionY = 0;

    document.documentElement.classList.add('forceGrab');
}

function onMouseMoved(event){
    cursorX = event.clientX;
    cursorY = event.clientY;
    
    currentX = cursorX - grabXOffset;
    currentY = cursorY - grabYOffset;
    
    renderer.domElement.style.left = `${currentX}px`;
    renderer.domElement.style.top = `${currentY}px`;

    requestAnimationFrame(() => delayedDrag(cursorX, cursorY));

    directionX = cursorX - previousCursorX;
    directionY = cursorY - previousCursorY;

    let force = Math.sqrt((directionX * directionX) + (directionY * directionY));
    speed = force * forceMultiplier;
}

function delayedDrag(x, y){
    previousCursorX = x;
    previousCursorY = y;
}

function onMouseEndSelect(event){
    document.removeEventListener('mouseup', onMouseEndSelect);
    document.removeEventListener('mousemove', onMouseMoved);

    isSelectingSeal = false;

    document.documentElement.classList.remove('forceGrab');
}

//#endregion

//#region Movement

var hitMaxX = false;
var hitMaxY = false;

moveSeal();
function moveSeal(){
    requestAnimationFrame(moveSeal);

    speed = lerp(speed, 0, loweringSpeed * deltaTime);
    if(!firstSelect || isSelectingSeal) return;

    if(currentX < 0 || currentX > getMaxX(renderer.domElement)) {
    }
    if(currentY < getMinY() || currentY > getMaxY(renderer.domElement)) {
        sealClicker_playSquishAudio();
    }
    currentX = getClampedX(renderer.domElement, currentX + (speed * directionX));
    currentY = getClampedY(renderer.domElement, currentY + (speed * directionY));
    if(currentX == 0 || currentX == getMaxX(renderer.domElement)) {
        if(!hitMaxX) sealClicker_playSquishAudio();

        directionX *= -1;
        hitMaxX = true;
    }
    else hitMaxX = false;
    
    if(currentY == getMinY() || currentY == getMaxY(renderer.domElement)) {
        if(!hitMaxY) sealClicker_playSquishAudio();

        directionY *= -1;
        hitMaxY = true;
    }
    else hitMaxY = false;
    
    renderer.domElement.style.left = `${currentX}px`;
    renderer.domElement.style.top = `${currentY}px`;
}

//#endregion