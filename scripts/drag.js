import { setDragAudioVolume, startDragAudio, stopDragAudio } from "./audio.js";

// Make the DIV element draggable:
dragElement(document.getElementById("welcome"));

// Step 1: Define a function called `dragElement` that makes an HTML element draggable.
function dragElement(element) {
  // Step 2: Set up variables to keep track of the element's position.
  var initialX = 0;
  var initialY = 0;
  var currentX = 0;
  var currentY = 0;
  var cursorX = 0;
  var cursorY = 0;
  
  // Step 3: Check if there is a special header element associated with the draggable element.
  if (document.getElementById(element.id + "_header")) {
    // Step 4: If present, assign the `dragMouseDown` function to the header's `onmousedown` event.
    // This allows you to drag the window around by its header.
    document.getElementById(element.id + "_header").onmousedown = startDragging;
  } else {
    // Step 5: If not present, assign the function directly to the draggable element's `onmousedown` event.
    // This allows you to drag the window by holding down anywhere on the window.
    element.onmousedown = startDragging;
  }

  moveWindowFunction();
  var dragging = false;
  
  // Step 6: Define the `startDragging` function to capture the initial mouse position and set up event listeners.
  function startDragging(e) {
    e = e || window.event;
    e.preventDefault();
    // Step 7: Get the mouse cursor position at startup.

    const rect = element.getBoundingClientRect();
    initialX = e.clientX - rect.left;
    initialY = e.clientY - rect.top;
    
    // Step 8: Set up event listeners for mouse movement (`elementDrag`) and mouse button release (`closeDragElement`).
    document.onmouseup = stopDragging;
    document.onmousemove = dragElement;

    startDragAudio();

    dragging = true;
  }

  var curVolume = 1;

  // Step 9: Define the `elementDrag` function to calculate the new position of the element based on mouse movement.
  function dragElement(e) {
    e = e || window.event;
    e.preventDefault();
    // Step 10: Calculate the new cursor position.
    cursorX = e.clientX - initialX;
    cursorY = e.clientY - initialY;
  }

  // Step 12: Define the `stopDragging` function to stop tracking mouse movement by removing the event listeners.
  function stopDragging() {
    document.onmouseup = null;
    document.onmousemove = null;

    stopDragAudio();

    dragging = false;
  }

  function moveWindowFunction() {
    currentX = lerp(currentX, cursorX, .075);
    currentY = lerp(currentY, cursorY, .075);
    
    // Step 11: Update the element's new position by modifying its `top` and `left` CSS properties.
    element.style.left = (currentX) + "px";
    element.style.top = (currentY) + "px";

    //Later on add a volume modification based on how fast you're moving the window

    requestAnimationFrame(moveWindowFunction);
  }
}

function lerp(currentPosition, targetPosition, clamp) {
  return (1 - clamp) * currentPosition + clamp * targetPosition;
}