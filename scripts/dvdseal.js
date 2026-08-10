//Followed this guide :D
//https://www.youtube.com/watch?v=lGokKxJ8D2c

import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

import { deltaTime } from './time.js';
import { SubscribeToZIndex } from "./window_global.js";

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
    function(xhr){
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(error){
        console.error(error);
    }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth / modelSize, window.innerHeight / modelSize);

document.getElementById('container3D').appendChild(renderer.domElement);
camera.position.z = 250;

const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(500, 500, 500);
topLight.castShadow = true;
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 5);
scene.add(ambientLight);

animate();
function animate(){
    requestAnimationFrame(animate);

    if(object) object.rotation.y += rotationSpeed * deltaTime;
    renderer.render(scene, camera);
}

//#region Raycasting

// Had to use AI :[
// I couldn't find any good sources for raycasting

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

var isSelectingSeal = false;

document.addEventListener("mousedown", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (object) {
        const intersects = raycaster.intersectObject(object, true);
        if (intersects.length > 0) onMouseStartSelect(event);
    }
});

var previousCursorX = 0;
var previousCursorY = 0;

var grabXOffset = 0;
var grabYOffset = 0;

function onMouseStartSelect(event){
    isSelectingSeal = true;

    document.addEventListener('mouseup', onMouseEndSelect);
    document.addEventListener('mousemove', onMouseMoved);

    const rect = renderer.domElement.getBoundingClientRect();
    grabXOffset = event.clientX - rect.left;
    grabYOffset = event.clientY - rect.top;

    delayedDrag(event.clientX, event.clientY);
}

function onMouseMoved(event){
    let cursorX = event.clientX;
    let cursorY = event.clientY;
    
    renderer.domElement.style.left = `${cursorX - grabXOffset}px`;
    renderer.domElement.style.top = `${cursorY - grabYOffset}px`;

    requestAnimationFrame(() => delayedDrag(cursorX, cursorY));

    let xDifference = cursorX - previousCursorX;
    let yDifference = cursorY - previousCursorY;

    let force = Math.sqrt((xDifference * xDifference) + (yDifference * yDifference));
    console.log(force);
}

function delayedDrag(x, y){
    previousCursorX = x;
    previousCursorY = y;
}

function onMouseEndSelect(event){
    document.removeEventListener('mouseup', onMouseEndSelect);
    document.removeEventListener('mousemove', onMouseMoved);
}

//#endregion