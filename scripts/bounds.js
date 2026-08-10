import { SubscribeToZIndex } from "./window_global.js";

const navbar = document.getElementById("navbar");
export const navbarRect = navbar.getBoundingClientRect();

SubscribeToZIndex(onZIndexIncreased);

function onZIndexIncreased(index){
    navbar.style.zIndex = index + 110;
}

export function getMaxX(element){
    let windowWidth = window.innerWidth;
    if(element == undefined) return windowWidth;

    const rect = element.getBoundingClientRect();
    return windowWidth - rect.width;
}

export function getMinY(){
    let windowHeight = navbarRect.bottom;
    return windowHeight;
}

export function getMaxY(element){
    let windowHeight = window.innerHeight;
    if(element == undefined) return windowHeight;
    
    const rect = element.getBoundingClientRect();
    return windowHeight - rect.height;
}

export function getClampedX(element, currentX){
    return Math.max(0, Math.min(currentX, getMaxX(element)));
}

export function getClampedY(element, currentY){
    return Math.max(getMinY(), Math.min(currentY, getMaxY(element)));
}