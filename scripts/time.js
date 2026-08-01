import { clamp } from "./mathf.js";

function updateTime(){
    var sealTime = new Date().toLocaleString('en-GB');
    var timeText = document.querySelector("#timeElement");
    timeText.innerHTML = sealTime;
}
setInterval(updateTime, 1000);

export var deltaTime = 0;

var lastTime = 0;

requestAnimationFrame(setDeltaTime);
function setDeltaTime(time){
    requestAnimationFrame(setDeltaTime);

    deltaTime = clamp(0, 0.1, (time - lastTime) / 1000);
    lastTime = time;
}