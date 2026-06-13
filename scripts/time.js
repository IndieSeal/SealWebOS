function updateTime(){
    var sealTime = new Date().toLocaleString();
    var timeText = document.querySelector("#timeElement");
    timeText.innerHTML = sealTime;
}
setInterval(updateTime, 1000);