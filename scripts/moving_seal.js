document.addEventListener('mousemove', onMouseMove);

var cursorX = 0;
var cursorY = 0;

function onMouseMove(e){
    cursorX = e.clientX;
    cursorY = e.clientY;
    console.log(`X: ${cursorX}, Y: ${cursorY}`);
}