//Followed this guide :D
//https://www.youtube.com/watch?v=lGokKxJ8D2c

import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

import { deltaTime } from './time.js';

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
    },
    function(xhr){
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(error){
        console.error(error);
    }
);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth / 7, window.innerHeight / 7);

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

document.addEventListener("mousedown", (event) => {
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    if (object) {
        const intersects = raycaster.intersectObject(object, true);
        if (intersects.length > 0) onMouseStartSelect();
    }
});

function onMouseStartSelect(){

}

//#endregion