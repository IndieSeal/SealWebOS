// had to make a different script for constants used by multiple scripts, as if I put them in window_manager.js then drag.js tries to access
// then it wouldn't initialize? Kinda weird, but god thank the random people on Stack Overflow that have had the same problems LOL

export const TASKBAR_SUFFIX = "_taskbar";
export const TASKBAR_ONTOP_SUFFIX = "_ontop";
export const OPEN_SUFFIX = "_open";

export const MINIMIZE_SUFFIX = "_minimize";
export const CLOSE_SUFFIX = "_close";

export var biggestZIndex = 10;
export function IncreaseZIndex(){
    biggestZIndex++;

    zIndexSubscribers.forEach(sub => sub(biggestZIndex));
}

var zIndexSubscribers = [];
export function SubscribeToZIndex(callback){
    callback(biggestZIndex);
    zIndexSubscribers.push(callback);
}

export function UnsubscribeToZIndex(callback){
    zIndexSubscribers = zIndexSubscribers.filter(item => item != callback);
}