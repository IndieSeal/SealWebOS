import { SubscribeToZIndex } from "./window_global.js";

const navbar = document.getElementById("navbar");
export const navbarRect = navbar.getBoundingClientRect();

SubscribeToZIndex(onZIndexIncreased);

function onZIndexIncreased(index){
    navbar.style.zIndex = index + 110;
}

export function getMaxX(element){
    const rect = element.getBoundingClientRect();

    let windowWidth = window.innerWidth;
    return windowWidth - rect.width;
}

export function getMaxY(element){
    const rect = element.getBoundingClientRect();

    let windowHeight = window.innerHeight;
    return windowHeight - rect.height;
}

export function getClampedX(element, currentX){
    return Math.max(0, Math.min(currentX, getMaxX(element)));
}

export function getClampedY(element, currentY){
    return Math.max(navbarRect.bottom, Math.min(currentY, getMaxY(element)));
}