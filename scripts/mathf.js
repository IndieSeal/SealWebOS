export function lerp(currentPosition, targetPosition, value) {
  return (1 - value) * currentPosition + value * targetPosition;
}

export function abs(value) {
    if(value < 0) return value * -1;
    else return value;
}

export function clamp(min, max, value){
    return Math.max(min, Math.min(value, max));
}

export function pingpong(min, max, value){
    if(value >= min && value <= max) return value;

    if(value > max){
        let excess = value - max;
        let newVal = min + excess;
        return newVal;
    }
    else{
        let excess = min - value;
        return max - excess;
    }
}

//will make a new script for extras if there's enough of them later

//we all say thanks to this tutorial: https://coureywong.medium.com/how-to-shuffle-an-array-of-items-in-javascript-39b9efe4b567
export function shuffle(array){
    let i = array.length, j, temp;
    while(--i > 0){
        j = Math.floor(Math.random() * (i + 1));
        temp = array[j];
        array[j] = array[i];
        array[i] = temp;
    }

    return array;
}