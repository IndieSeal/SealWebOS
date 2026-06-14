function updateTime(){
    var sealTime = new Date().toLocaleString('en-GB');
    var timeText = document.querySelector("#timeElement");
    timeText.innerHTML = sealTime;
}
setInterval(updateTime, 1000);